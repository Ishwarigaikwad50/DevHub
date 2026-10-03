const express = require('express');
const router = express.Router();
const { getDeployments, createDeployment, updateDeployment } = require('../controllers/deploymentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.use(protect);

router.route('/')
  .get(getDeployments)
  .post(authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN, ROLES.DEVELOPER), createDeployment);

router.route('/:id')
  .put(authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN, ROLES.DEVELOPER), updateDeployment);

module.exports = router;
