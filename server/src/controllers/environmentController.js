const Environment = require('../models/Environment');
const Service = require('../models/Service');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all environments across organization (grouped or flat)
// @route   GET /api/environments
// @access  Private
exports.getEnvironments = async (req, res, next) => {
  try {
    const { name, status } = req.query;
    const query = {};
    if (name) query.name = name;
    if (status) query.deploymentStatus = status;

    const environments = await Environment.find(query)
      .populate({
        path: 'service',
        select: 'name key status criticality ownerTeam',
        populate: { path: 'ownerTeam', select: 'name key' }
      })
      .populate('lastDeploymentId')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: environments.length,
      environments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an environment configuration
// @route   PUT /api/environments/:id
// @access  Private (Admin, Team Admin, Developer)
exports.updateEnvironment = async (req, res, next) => {
  try {
    const env = await Environment.findById(req.params.id).populate('service');
    if (!env) {
      return res.status(404).json({ success: false, message: 'Environment not found' });
    }

    const oldValue = { baseUrl: env.baseUrl, healthCheckUrl: env.healthCheckUrl, version: env.version, deploymentStatus: env.deploymentStatus };

    const { baseUrl, healthCheckUrl, version, deploymentStatus } = req.body;
    if (baseUrl !== undefined) env.baseUrl = baseUrl;
    if (healthCheckUrl !== undefined) env.healthCheckUrl = healthCheckUrl;
    if (version !== undefined) env.version = version;
    if (deploymentStatus !== undefined) env.deploymentStatus = deploymentStatus;

    await env.save();

    await logAudit({
      req,
      action: 'ENVIRONMENT_UPDATE',
      entity: 'Environment',
      entityId: env._id,
      entityName: `${env.service.name} (${env.name})`,
      oldValue,
      newValue: { baseUrl: env.baseUrl, healthCheckUrl: env.healthCheckUrl, version: env.version, deploymentStatus: env.deploymentStatus }
    });

    res.status(200).json({ success: true, environment: env });
  } catch (error) {
    next(error);
  }
};
