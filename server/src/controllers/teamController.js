const Team = require('../models/Team');
const Service = require('../models/Service');
const Api = require('../models/Api');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
exports.getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate('lead', 'name email title avatar')
      .populate('members', 'name email title avatar role')
      .sort({ name: 1 });

    // Attach service counts
    const teamsWithCounts = await Promise.all(
      teams.map(async (team) => {
        const serviceCount = await Service.countDocuments({ ownerTeam: team._id });
        const teamObj = team.toObject();
        teamObj.serviceCount = serviceCount;
        return teamObj;
      })
    );

    res.status(200).json({
      success: true,
      count: teamsWithCounts.length,
      teams: teamsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single team by id or key
// @route   GET /api/teams/:id
// @access  Private
exports.getTeam = async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { key: req.params.id };

    const team = await Team.findOne(query)
      .populate('lead', 'name email title avatar')
      .populate('members', 'name email title avatar role');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Get team services
    const services = await Service.find({ ownerTeam: team._id })
      .populate('primaryOwner', 'name email avatar')
      .sort({ name: 1 });

    // Get team APIs (APIs of services owned by this team)
    const serviceIds = services.map(s => s._id);
    const apis = await Api.find({ service: { $in: serviceIds } }).populate('service', 'name key status');

    // Recent activity for this team's services & team entity
    const activity = await AuditLog.find({
      $or: [
        { entity: 'Team', entityId: team._id.toString() },
        { entity: 'Service', entityId: { $in: serviceIds.map(id => id.toString()) } }
      ]
    })
      .populate('user', 'name avatar email')
      .sort({ timestamp: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      team,
      services,
      apis,
      activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new team
// @route   POST /api/teams
// @access  Private (Admin / Team Lead)
exports.createTeam = async (req, res, next) => {
  try {
    const { name, key, description, lead, members, contactEmail, slackChannel } = req.body;

    const formattedKey = (key || name.toLowerCase().replace(/\s+/g, '-')).replace(/[^a-z0-9-]/g, '');

    const team = await Team.create({
      name,
      key: formattedKey,
      description,
      lead: lead || null,
      members: members || [],
      contactEmail,
      slackChannel
    });

    await logAudit({
      req,
      action: 'TEAM_CREATE',
      entity: 'Team',
      entityId: team._id,
      entityName: team.name,
      newValue: { name: team.name, key: team.key },
      notify: true,
      notificationTitle: `New Team Created: ${team.name}`,
      notificationType: 'SYSTEM'
    });

    res.status(201).json({ success: true, team });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin / Team Lead)
exports.updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const oldValue = { name: team.name, description: team.description, lead: team.lead, contactEmail: team.contactEmail };

    const { name, description, lead, members, contactEmail, slackChannel } = req.body;
    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (lead !== undefined) team.lead = lead || null;
    if (members !== undefined) team.members = members;
    if (contactEmail !== undefined) team.contactEmail = contactEmail;
    if (slackChannel !== undefined) team.slackChannel = slackChannel;

    await team.save();

    await logAudit({
      req,
      action: 'TEAM_UPDATE',
      entity: 'Team',
      entityId: team._id,
      entityName: team.name,
      oldValue,
      newValue: { name: team.name, description: team.description, lead: team.lead, contactEmail: team.contactEmail }
    });

    res.status(200).json({ success: true, team });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin only)
exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Check if services depend on this team
    const serviceCount = await Service.countDocuments({ ownerTeam: team._id });
    if (serviceCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete team with ${serviceCount} active services. Reassign services first.`
      });
    }

    await Team.findByIdAndDelete(req.params.id);

    await logAudit({
      req,
      action: 'TEAM_DELETE',
      entity: 'Team',
      entityId: team._id,
      entityName: team.name
    });

    res.status(200).json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};
