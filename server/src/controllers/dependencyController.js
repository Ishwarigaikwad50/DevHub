const Dependency = require('../models/Dependency');
const Service = require('../models/Service');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all service dependencies
// @route   GET /api/dependencies
// @access  Private
exports.getDependencies = async (req, res, next) => {
  try {
    const { source, target, type } = req.query;
    const query = {};

    if (source) query.sourceService = source;
    if (target) query.targetService = target;
    if (type) query.dependencyType = type;

    const dependencies = await Dependency.find(query)
      .populate({
        path: 'sourceService',
        select: 'name key status criticality serviceType ownerTeam',
        populate: { path: 'ownerTeam', select: 'name key' }
      })
      .populate({
        path: 'targetService',
        select: 'name key status criticality serviceType ownerTeam',
        populate: { path: 'ownerTeam', select: 'name key' }
      })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: dependencies.length,
      dependencies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete graph structure ready for React Flow
// @route   GET /api/dependencies/graph
// @access  Private
exports.getDependencyGraph = async (req, res, next) => {
  try {
    const services = await Service.find().populate('ownerTeam', 'name key').lean();
    const dependencies = await Dependency.find()
      .populate('sourceService', 'name key status')
      .populate('targetService', 'name key status')
      .lean();

    // Map services to React Flow nodes with smart layout coordinates
    const nodes = services.map((svc, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      return {
        id: svc._id.toString(),
        type: 'serviceNode',
        data: {
          id: svc._id.toString(),
          name: svc.name,
          key: svc.key,
          status: svc.status,
          criticality: svc.criticality,
          serviceType: svc.serviceType,
          teamName: svc.ownerTeam ? svc.ownerTeam.name : 'Unassigned',
          language: svc.language,
          technologies: svc.technologies
        },
        position: {
          x: 100 + col * 320,
          y: 80 + row * 200
        }
      };
    });

    // Map dependencies to React Flow edges
    const edges = dependencies
      .filter(dep => dep.sourceService && dep.targetService)
      .map((dep, idx) => ({
        id: `e-${dep.sourceService._id}-${dep.targetService._id}-${idx}`,
        source: dep.sourceService._id.toString(),
        target: dep.targetService._id.toString(),
        animated: dep.dependencyType === 'Message Queue' || dep.dependencyType === 'REST API',
        label: dep.dependencyType,
        data: {
          dependencyId: dep._id,
          type: dep.dependencyType,
          description: dep.description
        },
        style: {
          stroke: dep.dependencyType === 'Database' ? '#8b5cf6' : dep.dependencyType === 'Message Queue' ? '#f59e0b' : '#3b82f6',
          strokeWidth: 2
        }
      }));

    res.status(200).json({
      success: true,
      nodes,
      edges,
      stats: {
        totalServices: services.length,
        totalDependencies: dependencies.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new dependency
// @route   POST /api/dependencies
// @access  Private (Admin, Team Admin, Developer)
exports.createDependency = async (req, res, next) => {
  try {
    const { sourceService, targetService, dependencyType, description } = req.body;

    if (!sourceService || !targetService) {
      return res.status(400).json({ success: false, message: 'Both source and target services are required.' });
    }

    if (sourceService.toString() === targetService.toString()) {
      return res.status(400).json({ success: false, message: 'A service cannot depend on itself.' });
    }

    const [sourceSvc, targetSvc] = await Promise.all([
      Service.findById(sourceService),
      Service.findById(targetService)
    ]);

    if (!sourceSvc || !targetSvc) {
      return res.status(404).json({ success: false, message: 'One or both specified services do not exist.' });
    }

    const existing = await Dependency.findOne({ sourceService, targetService });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Dependency from '${sourceSvc.name}' to '${targetSvc.name}' already exists.`
      });
    }

    const dependency = await Dependency.create({
      sourceService,
      targetService,
      dependencyType: dependencyType || 'REST API',
      description: description || '',
      createdBy: req.user._id
    });

    await logAudit({
      req,
      action: 'DEPENDENCY_ADD',
      entity: 'Dependency',
      entityId: dependency._id,
      entityName: `${sourceSvc.name} -> ${targetSvc.name}`,
      newValue: { source: sourceSvc.name, target: targetSvc.name, type: dependency.dependencyType },
      notify: true,
      notificationTitle: `New Dependency Added`,
      notificationMessage: `${sourceSvc.name} now depends on ${targetSvc.name} (${dependency.dependencyType})`,
      notificationType: 'DEPENDENCY_CHANGE'
    });

    const populated = await Dependency.findById(dependency._id)
      .populate('sourceService', 'name key status')
      .populate('targetService', 'name key status');

    res.status(201).json({ success: true, dependency: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete dependency
// @route   DELETE /api/dependencies/:id
// @access  Private (Admin, Team Admin, Developer)
exports.deleteDependency = async (req, res, next) => {
  try {
    const dependency = await Dependency.findById(req.params.id)
      .populate('sourceService', 'name')
      .populate('targetService', 'name');

    if (!dependency) {
      return res.status(404).json({ success: false, message: 'Dependency not found' });
    }

    const depName = `${dependency.sourceService?.name || 'Unknown'} -> ${dependency.targetService?.name || 'Unknown'}`;

    await Dependency.findByIdAndDelete(req.params.id);

    await logAudit({
      req,
      action: 'DEPENDENCY_REMOVE',
      entity: 'Dependency',
      entityId: req.params.id,
      entityName: depName,
      notify: true,
      notificationTitle: `Dependency Removed`,
      notificationMessage: `Removed dependency: ${depName}`,
      notificationType: 'DEPENDENCY_CHANGE'
    });

    res.status(200).json({ success: true, message: 'Dependency removed successfully' });
  } catch (error) {
    next(error);
  }
};
