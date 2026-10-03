const Deployment = require('../models/Deployment');
const Environment = require('../models/Environment');
const Service = require('../models/Service');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get deployments
// @route   GET /api/deployments
// @access  Private
exports.getDeployments = async (req, res, next) => {
  try {
    const { service, environment, status, limit = 50 } = req.query;
    const query = {};

    if (service) query.service = service;
    if (environment) query.environment = environment;
    if (status) query.status = status;

    const deployments = await Deployment.find(query)
      .populate({
        path: 'service',
        select: 'name key status ownerTeam',
        populate: { path: 'ownerTeam', select: 'name key' }
      })
      .populate('deployedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: deployments.length,
      deployments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger/Record new deployment
// @route   POST /api/deployments
// @access  Private (Admin, Team Admin, Developer)
exports.createDeployment = async (req, res, next) => {
  try {
    const { service, environment, version, notes, commitHash, status = 'Successful' } = req.body;

    if (!service || !environment || !version) {
      return res.status(400).json({ success: false, message: 'Service, environment, and version are required.' });
    }

    const svc = await Service.findById(service);
    if (!svc) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const deployment = await Deployment.create({
      service,
      environment,
      version,
      status,
      deployedBy: req.user._id,
      commitHash: commitHash || Math.random().toString(16).substring(2, 9),
      notes: notes || `Deployment of ${version} to ${environment}`,
      startedAt: new Date(),
      completedAt: status === 'Successful' ? new Date() : null
    });

    // Update Environment record
    await Environment.findOneAndUpdate(
      { service, name: environment },
      {
        version,
        lastDeployedAt: new Date(),
        lastDeploymentId: deployment._id,
        deploymentStatus: status === 'Successful' ? 'Healthy' : status === 'Failed' ? 'Degraded' : 'Unknown'
      },
      { upsert: true }
    );

    await logAudit({
      req,
      action: 'DEPLOYMENT_TRIGGER',
      entity: 'Deployment',
      entityId: deployment._id,
      entityName: `${svc.name} (${version} to ${environment})`,
      newValue: { service: svc.name, version, environment, status },
      notify: true,
      notificationTitle: `Deployment ${status}: ${svc.name} (${version})`,
      notificationMessage: `${req.user.name} deployed version ${version} of ${svc.name} to ${environment} [${status}]`,
      notificationType: 'DEPLOYMENT_STATUS'
    });

    const populated = await Deployment.findById(deployment._id)
      .populate('service', 'name key status')
      .populate('deployedBy', 'name email avatar');

    res.status(201).json({ success: true, deployment: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update deployment status
// @route   PUT /api/deployments/:id
// @access  Private (Admin, Team Admin, Developer)
exports.updateDeployment = async (req, res, next) => {
  try {
    const deployment = await Deployment.findById(req.params.id).populate('service');
    if (!deployment) {
      return res.status(404).json({ success: false, message: 'Deployment not found' });
    }

    const { status, notes } = req.body;
    if (status) {
      deployment.status = status;
      if (status === 'Successful' || status === 'Failed' || status === 'Rolled Back') {
        deployment.completedAt = new Date();
      }
    }
    if (notes !== undefined) deployment.notes = notes;

    await deployment.save();

    res.status(200).json({ success: true, deployment });
  } catch (error) {
    next(error);
  }
};
