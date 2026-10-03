require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const initHealthCheckScheduler = require('./jobs/healthCheckScheduler');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(` DevHub Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(` REST API Base URL: http://localhost:${PORT}/api`);
    // Initialize background health checker
    initHealthCheckScheduler();
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
});
