const { ROLES } = require('../config/constants');
const Service = require('../models/Service');
const Team = require('../models/Team');

/**
 * Restrict to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to perform this action. Required: [${roles.join(', ')}]`
      });
    }

    next();
  };
};

/**
 * Check if the user is authorized to modify a specific service
 * ADMIN: Yes
 * TEAM_ADMIN: Yes, if service belongs to their team
 * DEVELOPER: Yes, if service is owned by them or created by them
 * VIEWER: No
 */
const checkServiceOwnership = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (user.role === ROLES.ADMIN) {
      return next();
    }

    if (user.role === ROLES.VIEWER) {
      return res.status(403).json({
        success: false,
        message: 'Viewers have read-only permissions.'
      });
    }

    const serviceId = req.params.id || req.body.service || req.body.serviceId;
    if (!serviceId) {
      return next();
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    req.targetService = service;

    if (user.role === ROLES.TEAM_ADMIN) {
      if (user.team && service.ownerTeam && service.ownerTeam.toString() === user.team._id?.toString()) {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Team Admins can only modify services owned by their team.'
      });
    }

    if (user.role === ROLES.DEVELOPER) {
      const isPrimaryOwner = service.primaryOwner && service.primaryOwner.toString() === user._id.toString();
      const isCreator = service.createdBy && service.createdBy.toString() === user._id.toString();
      const isTeamMember = user.team && service.ownerTeam && service.ownerTeam.toString() === user.team._id?.toString();

      if (isPrimaryOwner || isCreator || isTeamMember) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'You are not an owner or team member of this service.'
      });
    }

    return res.status(403).json({ success: false, message: 'Forbidden' });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can modify a team
 */
const checkTeamOwnership = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (user.role === ROLES.ADMIN) {
      return next();
    }

    if (user.role === ROLES.TEAM_ADMIN) {
      const teamId = req.params.id || req.body.teamId;
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ success: false, message: 'Team not found' });
      }

      const isLead = team.lead && team.lead.toString() === user._id.toString();
      const isUserTeam = user.team && user.team._id?.toString() === team._id.toString();

      if (isLead || isUserTeam) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Team Admins can only manage their own team.'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Only Admins and Team Leads can manage teams.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorize,
  checkServiceOwnership,
  checkTeamOwnership
};
