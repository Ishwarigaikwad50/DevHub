const Service = require('../models/Service');
const Api = require('../models/Api');
const Environment = require('../models/Environment');
const Dependency = require('../models/Dependency');
const Deployment = require('../models/Deployment');
const HealthCheck = require('../models/HealthCheck');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../utils/auditLogger');
const { ENVIRONMENTS } = require('../config/constants');

// @desc    Get all services with filtering, search, sorting, pagination
// @route   GET /api/services
// @access  Private
exports.getServices = async (req, res, next) => {
  try {
    const {
      search,
      team,
      status,
      criticality,
      serviceType,
      language,
      technology,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search, 'i')] } },
        { language: { $regex: search, $options: 'i' } }
      ];
    }

    if (team) query.ownerTeam = team;
    if (status) query.status = status;
    if (criticality) query.criticality = criticality;
    if (serviceType) query.serviceType = serviceType;
    if (language) query.language = new RegExp(language, 'i');
    if (technology) query.technologies = { $in: [new RegExp(technology, 'i')] };

    const sortOptions = {};
    if (sortBy === 'name') sortOptions.name = sortOrder === 'desc' ? -1 : 1;
    else if (sortBy === 'recentlyUpdated' || sortBy === 'updatedAt') sortOptions.updatedAt = sortOrder === 'asc' ? 1 : -1;
    else if (sortBy === 'criticality') sortOptions.criticality = sortOrder === 'desc' ? -1 : 1;
    else if (sortBy === 'status') sortOptions.status = sortOrder === 'desc' ? -1 : 1;
    else sortOptions.name = 1;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .populate('ownerTeam', 'name key contactEmail')
      .populate('primaryOwner', 'name email avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Attach quick stats (API count, dependency counts)
    const enrichedServices = await Promise.all(
      services.map(async (svc) => {
        const [apiCount, upstreamCount, downstreamCount] = await Promise.all([
          Api.countDocuments({ service: svc._id }),
          Dependency.countDocuments({ sourceService: svc._id }),
          Dependency.countDocuments({ targetService: svc._id })
        ]);
        const obj = svc.toObject();
        obj.stats = {
          apiCount,
          upstreamCount,
          downstreamCount
        };
        return obj;
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      services: enrichedServices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service by id or key
// @route   GET /api/services/:id
// @access  Private
exports.getService = async (req, res, next) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: req.params.id } : { key: req.params.id };

    const service = await Service.findOne(query)
      .populate('ownerTeam', 'name key lead contactEmail slackChannel')
      .populate('primaryOwner', 'name email avatar title')
      .populate('createdBy', 'name email');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({
      success: true,
      service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Admin, Team Admin, Developer)
exports.createService = async (req, res, next) => {
  try {
    const {
      name,
      key,
      description,
      serviceType,
      ownerTeam,
      primaryOwner,
      repositoryUrl,
      documentationUrl,
      technologies,
      language,
      status,
      criticality,
      tags
    } = req.body;

    const formattedKey = (key || name.toLowerCase().replace(/\s+/g, '-')).replace(/[^a-z0-9-]/g, '');

    const existingKey = await Service.findOne({ key: formattedKey });
    if (existingKey) {
      return res.status(409).json({ success: false, message: `Service key '${formattedKey}' already exists. Please choose a unique key.` });
    }

    const techArray = Array.isArray(technologies)
      ? technologies
      : (technologies ? technologies.split(',').map(t => t.trim()) : []);

    const tagsArray = Array.isArray(tags)
      ? tags
      : (tags ? tags.split(',').map(t => t.trim()) : []);

    const service = await Service.create({
      name,
      key: formattedKey,
      description,
      serviceType: serviceType || 'Backend Service',
      ownerTeam,
      primaryOwner: primaryOwner || req.user._id,
      repositoryUrl: repositoryUrl || '',
      documentationUrl: documentationUrl || '',
      technologies: techArray,
      language: language || (techArray[0] || 'JavaScript'),
      status: status || 'Healthy',
      criticality: criticality || 'Tier 2 - High',
      tags: tagsArray,
      createdBy: req.user._id
    });

    // Auto-create standard environments for this service
    for (const envName of ENVIRONMENTS) {
      await Environment.create({
        name: envName,
        service: service._id,
        baseUrl: `https://${service.key}.${envName.toLowerCase()}.internal.devhub.io`,
        healthCheckUrl: `https://${service.key}.${envName.toLowerCase()}.internal.devhub.io/health`,
        version: '1.0.0',
        deploymentStatus: 'Healthy'
      });
    }

    await logAudit({
      req,
      action: 'SERVICE_CREATE',
      entity: 'Service',
      entityId: service._id,
      entityName: service.name,
      newValue: { name: service.name, key: service.key, team: service.ownerTeam },
      notify: true,
      notificationTitle: `Service Registered: ${service.name}`,
      notificationType: 'SERVICE_UPDATE'
    });

    res.status(201).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (RBAC)
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const oldValue = {
      name: service.name,
      description: service.description,
      ownerTeam: service.ownerTeam,
      primaryOwner: service.primaryOwner,
      status: service.status,
      criticality: service.criticality,
      serviceType: service.serviceType,
      technologies: service.technologies
    };

    const {
      name,
      description,
      serviceType,
      ownerTeam,
      primaryOwner,
      repositoryUrl,
      documentationUrl,
      technologies,
      language,
      status,
      criticality,
      tags
    } = req.body;

    if (name) service.name = name;
    if (description) service.description = description;
    if (serviceType) service.serviceType = serviceType;
    if (ownerTeam) service.ownerTeam = ownerTeam;
    if (primaryOwner !== undefined) service.primaryOwner = primaryOwner || null;
    if (repositoryUrl !== undefined) service.repositoryUrl = repositoryUrl;
    if (documentationUrl !== undefined) service.documentationUrl = documentationUrl;
    if (language) service.language = language;
    if (status) service.status = status;
    if (criticality) service.criticality = criticality;

    if (technologies !== undefined) {
      service.technologies = Array.isArray(technologies)
        ? technologies
        : technologies.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (tags !== undefined) {
      service.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    await service.save();

    await logAudit({
      req,
      action: 'SERVICE_UPDATE',
      entity: 'Service',
      entityId: service._id,
      entityName: service.name,
      oldValue,
      newValue: {
        name: service.name,
        description: service.description,
        ownerTeam: service.ownerTeam,
        primaryOwner: service.primaryOwner,
        status: service.status,
        criticality: service.criticality,
        serviceType: service.serviceType,
        technologies: service.technologies
      },
      notify: oldValue.status !== service.status,
      notificationTitle: `Service Status Changed: ${service.name}`,
      notificationMessage: `${service.name} status updated from ${oldValue.status} to ${service.status}`,
      notificationType: 'HEALTH_ALERT'
    });

    res.status(200).json({ success: true, service });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin only)
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Cascade delete related records
    await Promise.all([
      Api.deleteMany({ service: service._id }),
      Environment.deleteMany({ service: service._id }),
      Dependency.deleteMany({ $or: [{ sourceService: service._id }, { targetService: service._id }] }),
      Deployment.deleteMany({ service: service._id }),
      HealthCheck.deleteMany({ service: service._id })
    ]);

    await Service.findByIdAndDelete(service._id);

    await logAudit({
      req,
      action: 'SERVICE_DELETE',
      entity: 'Service',
      entityId: service._id,
      entityName: service.name
    });

    res.status(200).json({ success: true, message: 'Service and associated entities deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service APIs
// @route   GET /api/services/:id/apis
// @access  Private
exports.getServiceApis = async (req, res, next) => {
  try {
    const apis = await Api.find({ service: req.params.id }).sort({ method: 1, endpoint: 1 });
    res.status(200).json({ success: true, apis });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service environments
// @route   GET /api/services/:id/environments
// @access  Private
exports.getServiceEnvironments = async (req, res, next) => {
  try {
    const environments = await Environment.find({ service: req.params.id })
      .populate('lastDeploymentId')
      .sort({ name: 1 });
    res.status(200).json({ success: true, environments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service dependencies (upstream & downstream)
// @route   GET /api/services/:id/dependencies
// @access  Private
exports.getServiceDependencies = async (req, res, next) => {
  try {
    const serviceId = req.params.id;

    const [upstream, downstream] = await Promise.all([
      // Upstream: services that this service depends on
      Dependency.find({ sourceService: serviceId })
        .populate({
          path: 'targetService',
          select: 'name key status criticality serviceType ownerTeam',
          populate: { path: 'ownerTeam', select: 'name' }
        }),
      // Downstream: services that depend on this service
      Dependency.find({ targetService: serviceId })
        .populate({
          path: 'sourceService',
          select: 'name key status criticality serviceType ownerTeam',
          populate: { path: 'ownerTeam', select: 'name' }
        })
    ]);

    res.status(200).json({
      success: true,
      upstream, // What this service calls
      downstream // What calls this service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service deployments
// @route   GET /api/services/:id/deployments
// @access  Private
exports.getServiceDeployments = async (req, res, next) => {
  try {
    const deployments = await Deployment.find({ service: req.params.id })
      .populate('deployedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({ success: true, deployments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service health history
// @route   GET /api/services/:id/health
// @access  Private
exports.getServiceHealth = async (req, res, next) => {
  try {
    const checks = await HealthCheck.find({ service: req.params.id })
      .sort({ checkedAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, checks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service activity/audit log
// @route   GET /api/services/:id/activity
// @access  Private
exports.getServiceActivity = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({
      entity: 'Service',
      entityId: req.params.id
    })
      .populate('user', 'name email avatar')
      .sort({ timestamp: -1 })
      .limit(30);

    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};
