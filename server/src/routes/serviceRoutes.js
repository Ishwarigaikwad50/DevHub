const express = require('express');
const router = express.Router();
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServiceApis,
  getServiceEnvironments,
  getServiceDependencies,
  getServiceDeployments,
  getServiceHealth,
  getServiceActivity
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');
const { authorize, checkServiceOwnership } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.use(protect);

router.route('/')
  .get(getServices)
  .post(authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN, ROLES.DEVELOPER), createService);

router.route('/:id')
  .get(getService)
  .put(checkServiceOwnership, updateService)
  .delete(authorize(ROLES.ADMIN), deleteService);

router.get('/:id/apis', getServiceApis);
router.get('/:id/environments', getServiceEnvironments);
router.get('/:id/dependencies', getServiceDependencies);
router.get('/:id/deployments', getServiceDeployments);
router.get('/:id/health', getServiceHealth);
router.get('/:id/activity', getServiceActivity);

module.exports = router;
