const express = require('express');
const router = express.Router();
const { getEnvironments, updateEnvironment } = require('../controllers/environmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.use(protect);

router.route('/')
  .get(getEnvironments);

router.route('/:id')
  .put(authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN, ROLES.DEVELOPER), updateEnvironment);

module.exports = router;
