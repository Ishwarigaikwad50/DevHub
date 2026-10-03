const axios = require('axios');
const Service = require('../models/Service');
const Environment = require('../models/Environment');
const HealthCheck = require('../models/HealthCheck');
const { logAudit } = require('../utils/auditLogger');
const { SERVICE_STATUS } = require('../config/constants');

/**
 * Ping an endpoint or simulate a realistic microservice health probe
 */
const performHealthProbe = async (service, url, environment = 'Production') => {
  const startTime = Date.now();
  let httpStatus = 200;
  let isSuccess = true;
  let errorMessage = null;
  let status = SERVICE_STATUS.HEALTHY;

  // Real HTTP ping with a 3-second timeout if valid public URL, else simulate realistic probe
  const isValidPublicUrl = url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('.internal.');

  if (isValidPublicUrl) {
    try {
      const res = await axios.get(url, { timeout: 3500 });
      httpStatus = res.status;
      isSuccess = res.status >= 200 && res.status < 400;
      if (!isSuccess) {
        status = res.status >= 500 ? SERVICE_STATUS.DOWN : SERVICE_STATUS.DEGRADED;
      }
    } catch (err) {
      isSuccess = false;
      httpStatus = err.response ? err.response.status : 503;
      errorMessage = err.message || 'Connection timeout or network failure';
      status = httpStatus >= 500 ? SERVICE_STATUS.DOWN : SERVICE_STATUS.DEGRADED;
    }
  } else {
    // Realistic simulated probe with slight jitter based on service status
    const isCurrentlyDown = service.status === SERVICE_STATUS.DOWN;
    const isDegraded = service.status === SERVICE_STATUS.DEGRADED;

    if (isCurrentlyDown) {
      httpStatus = 503;
      isSuccess = false;
      errorMessage = 'Service unavailable: database connection pool exhausted';
      status = SERVICE_STATUS.DOWN;
    } else if (isDegraded) {
      httpStatus = 429;
      isSuccess = false;
      errorMessage = 'Degraded performance: high CPU usage > 92%';
      status = SERVICE_STATUS.DEGRADED;
    } else {
      httpStatus = 200;
      isSuccess = true;
      status = SERVICE_STATUS.HEALTHY;
    }
  }

  const responseTimeMs = Math.max(12, Math.floor(Date.now() - startTime + Math.random() * 85 + 25));

  const check = await HealthCheck.create({
    service: service._id,
    environment,
    url: url || `https://${service.key}.internal.devhub.io/health`,
    httpStatus,
    responseTimeMs,
    status,
    checkedAt: new Date(),
    isSuccess,
    errorMessage
  });

  return check;
};

// @desc    Run health check for a single service
// @route   POST /api/health/check/:serviceId
// @access  Private
exports.runServiceHealthCheck = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const prodEnv = await Environment.findOne({ service: service._id, name: 'Production' });
    const checkUrl = prodEnv?.healthCheckUrl || `https://${service.key}.production.internal.devhub.io/health`;

    const check = await performHealthProbe(service, checkUrl, 'Production');

    // Update service status if changed
    if (check.status !== service.status) {
      const oldStatus = service.status;
      service.status = check.status;
      await service.save();

      await logAudit({
        req,
        action: 'HEALTH_STATUS_CHANGE',
        entity: 'Service',
        entityId: service._id,
        entityName: service.name,
        oldValue: { status: oldStatus },
        newValue: { status: check.status },
        notify: check.status !== 'Healthy',
        notificationTitle: `Health Alert: ${service.name} is ${check.status}`,
        notificationMessage: `${service.name} health probe resulted in ${check.status} (${check.httpStatus} - ${check.responseTimeMs}ms)`,
        notificationType: 'HEALTH_ALERT'
      });
    }

    res.status(200).json({
      success: true,
      check,
      serviceStatus: service.status
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run health checks on all registered services
// @route   POST /api/health/check-all
// @access  Private (Admin, Team Admin, Developer)
exports.runAllHealthChecks = async (req, res, next) => {
  try {
    const services = await Service.find();
    const results = [];

    for (const svc of services) {
      const prodEnv = await Environment.findOne({ service: svc._id, name: 'Production' });
      const checkUrl = prodEnv?.healthCheckUrl || `https://${svc.key}.production.internal.devhub.io/health`;
      const check = await performHealthProbe(svc, checkUrl, 'Production');
      results.push({
        serviceId: svc._id,
        serviceName: svc.name,
        status: check.status,
        responseTimeMs: check.responseTimeMs,
        httpStatus: check.httpStatus
      });
    }

    res.status(200).json({
      success: true,
      message: `Executed health checks across ${services.length} services`,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall health metrics summary
// @route   GET /api/health/summary
// @access  Private
exports.getHealthSummary = async (req, res, next) => {
  try {
    const [totalServices, healthyServices, degradedServices, downServices, maintenanceServices] = await Promise.all([
      Service.countDocuments(),
      Service.countDocuments({ status: SERVICE_STATUS.HEALTHY }),
      Service.countDocuments({ status: SERVICE_STATUS.DEGRADED }),
      Service.countDocuments({ status: SERVICE_STATUS.DOWN }),
      Service.countDocuments({ status: SERVICE_STATUS.MAINTENANCE })
    ]);

    const recentChecks = await HealthCheck.find()
      .populate('service', 'name key status ownerTeam')
      .sort({ checkedAt: -1 })
      .limit(20);

    // Calculate average latency
    const recentLatencyDocs = await HealthCheck.find().sort({ checkedAt: -1 }).limit(100);
    const avgResponseTime = recentLatencyDocs.length > 0
      ? Math.round(recentLatencyDocs.reduce((sum, item) => sum + (item.responseTimeMs || 0), 0) / recentLatencyDocs.length)
      : 45;

    const uptimePercentage = totalServices > 0
      ? Math.round(((healthyServices + degradedServices * 0.5) / totalServices) * 1000) / 10
      : 100;

    res.status(200).json({
      success: true,
      summary: {
        totalServices,
        healthyServices,
        degradedServices,
        downServices,
        maintenanceServices,
        uptimePercentage,
        avgResponseTimeMs: avgResponseTime
      },
      recentChecks
    });
  } catch (error) {
    next(error);
  }
};

module.exports.performHealthProbe = performHealthProbe;
