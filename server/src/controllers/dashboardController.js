const Service = require('../models/Service');
const Team = require('../models/Team');
const Api = require('../models/Api');
const Deployment = require('../models/Deployment');
const Dependency = require('../models/Dependency');
const AuditLog = require('../models/AuditLog');
const HealthCheck = require('../models/HealthCheck');
const { SERVICE_STATUS } = require('../config/constants');

// @desc    Get dashboard metrics, charts, and activity
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async (req, res, next) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Parallel counts
    const [
      totalServices,
      healthyServices,
      degradedServices,
      downServices,
      maintenanceServices,
      totalTeams,
      totalApis,
      totalDeployments,
      recentDeploymentsCount,
      totalDependencies
    ] = await Promise.all([
      Service.countDocuments(),
      Service.countDocuments({ status: SERVICE_STATUS.HEALTHY }),
      Service.countDocuments({ status: SERVICE_STATUS.DEGRADED }),
      Service.countDocuments({ status: SERVICE_STATUS.DOWN }),
      Service.countDocuments({ status: SERVICE_STATUS.MAINTENANCE }),
      Team.countDocuments(),
      Api.countDocuments(),
      Deployment.countDocuments(),
      Deployment.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      Dependency.countDocuments()
    ]);

    // Breakdown: Services by Status
    const servicesByStatus = [
      { name: 'Healthy', value: healthyServices, color: '#10b981' },
      { name: 'Degraded', value: degradedServices, color: '#f59e0b' },
      { name: 'Down', value: downServices, color: '#ef4444' },
      { name: 'Maintenance', value: maintenanceServices, color: '#6b7280' }
    ];

    // Breakdown: Services by Technology
    const allServices = await Service.find().select('technologies language ownerTeam status').populate('ownerTeam', 'name');
    const techCounts = {};
    const teamCounts = {};

    allServices.forEach(s => {
      // Tech count
      (s.technologies || []).forEach(t => {
        techCounts[t] = (techCounts[t] || 0) + 1;
      });
      // Fallback to language if no tech
      if (!s.technologies?.length && s.language) {
        techCounts[s.language] = (techCounts[s.language] || 0) + 1;
      }
      // Team count
      const teamName = s.ownerTeam ? s.ownerTeam.name : 'Unassigned';
      teamCounts[teamName] = (teamCounts[teamName] || 0) + 1;
    });

    const servicesByTech = Object.keys(techCounts)
      .map(k => ({ name: k, count: techCounts[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const servicesByTeam = Object.keys(teamCounts)
      .map(k => ({ name: k, count: teamCounts[k] }))
      .sort((a, b) => b.count - a.count);

    // Deployments timeline (last 7 days grouped by date)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const deploymentsLast7Days = await Deployment.find({ createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: 1 });

    const timelineMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      timelineMap[dateStr] = { date: dateStr, successful: 0, failed: 0, total: 0 };
    }

    deploymentsLast7Days.forEach(dep => {
      const dateStr = dep.createdAt.toISOString().split('T')[0];
      if (timelineMap[dateStr]) {
        timelineMap[dateStr].total += 1;
        if (dep.status === 'Successful') timelineMap[dateStr].successful += 1;
        else if (dep.status === 'Failed') timelineMap[dateStr].failed += 1;
      }
    });

    const deploymentsTimeline = Object.values(timelineMap);

    // Recent activity
    const recentActivity = await AuditLog.find()
      .populate('user', 'name avatar email')
      .sort({ timestamp: -1 })
      .limit(10);

    // Recent deployments
    const recentDeployments = await Deployment.find()
      .populate('service', 'name key status')
      .populate('deployedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(6);

    // Critical attention list (Down or Degraded)
    const attentionServices = await Service.find({
      status: { $in: [SERVICE_STATUS.DEGRADED, SERVICE_STATUS.DOWN] }
    })
      .populate('ownerTeam', 'name key')
      .populate('primaryOwner', 'name email avatar')
      .limit(6);

    res.status(200).json({
      success: true,
      metrics: {
        totalServices,
        healthyServices,
        degradedServices,
        downServices,
        maintenanceServices,
        totalTeams,
        totalApis,
        totalDeployments,
        recentDeploymentsCount,
        totalDependencies,
        healthPercentage: totalServices > 0 ? Math.round((healthyServices / totalServices) * 100) : 100
      },
      charts: {
        servicesByStatus,
        servicesByTech,
        servicesByTeam,
        deploymentsTimeline
      },
      recentActivity,
      recentDeployments,
      attentionServices
    });
  } catch (error) {
    next(error);
  }
};
