const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.use(protect);

router.get('/', authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN, ROLES.DEVELOPER, ROLES.VIEWER), getAuditLogs);

module.exports = router;
