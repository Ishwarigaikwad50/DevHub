const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const apiRoutes = require('./routes/apiRoutes');
const environmentRoutes = require('./routes/environmentRoutes');
const dependencyRoutes = require('./routes/dependencyRoutes');
const deploymentRoutes = require('./routes/deploymentRoutes');
const healthRoutes = require('./routes/healthRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

// Security and utility middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// DevHub system ping
app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'DevHub API is online', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/apis', apiRoutes);
app.use('/api/environments', environmentRoutes);
app.use('/api/dependencies', dependencyRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error handling
app.use(errorHandler);

module.exports = app;
