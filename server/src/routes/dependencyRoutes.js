const express = require('express');
const router = express.Router();
const {
  getDependencies,
  getDependencyGraph,
  createDependency,
  deleteDependency
} = require('../controllers/dependencyController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.use(protect);

router.get('/graph', getDependencyGraph);

router.route('/')
  .get(getDependencies)
  .post(authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN, ROLES.DEVELOPER), createDependency);

router.route('/:id')
  .delete(authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN, ROLES.DEVELOPER), deleteDependency);

module.exports = router;
