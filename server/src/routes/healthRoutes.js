const express = require('express');
const router = express.Router();
const {
  runServiceHealthCheck,
  runAllHealthChecks,
  getHealthSummary
} = require('../controllers/healthController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.use(protect);

router.get('/summary', getHealthSummary);
router.post('/check/:serviceId', authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN, ROLES.DEVELOPER), runServiceHealthCheck);
router.post('/check-all', authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN, ROLES.DEVELOPER), runAllHealthChecks);

module.exports = router;
