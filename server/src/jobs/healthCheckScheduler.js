const cron = require('node-cron');
const Service = require('../models/Service');
const Environment = require('../models/Environment');
const { performHealthProbe } = require('../controllers/healthController');

const initHealthCheckScheduler = () => {
  if (process.env.ENABLE_BACKGROUND_HEALTH_CHECKS !== 'true') {
    console.log('Background health check scheduler is disabled.');
    return;
  }

  const cronPattern = process.env.HEALTH_CHECK_INTERVAL_CRON || '*/5 * * * *';
  console.log(`Initializing background health check scheduler with cron: "${cronPattern}"`);

  cron.schedule(cronPattern, async () => {
    try {
      console.log(`[HealthCheckScheduler] Running automated health check cycle: ${new Date().toISOString()}`);
      const services = await Service.find();

      for (const service of services) {
        try {
          const prodEnv = await Environment.findOne({ service: service._id, name: 'Production' });
          const url = prodEnv?.healthCheckUrl || `https://${service.key}.production.internal.devhub.io/health`;
          await performHealthProbe(service, url, 'Production');
        } catch (err) {
          console.error(`[HealthCheckScheduler] Error checking service ${service.name}:`, err.message);
        }
      }
      console.log(`[HealthCheckScheduler] Completed cycle for ${services.length} services.`);
    } catch (error) {
      console.error('[HealthCheckScheduler] Scheduler error:', error.message);
    }
  });
};

module.exports = initHealthCheckScheduler;
