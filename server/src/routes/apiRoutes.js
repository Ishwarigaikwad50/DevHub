const express = require('express');
const router = express.Router();
const { getApis, getApi, createApi, updateApi, deleteApi } = require('../controllers/apiController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.use(protect);

router.route('/')
  .get(getApis)
  .post(authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN, ROLES.DEVELOPER), createApi);

router.route('/:id')
  .get(getApi)
  .put(authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN, ROLES.DEVELOPER), updateApi)
  .delete(authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN, ROLES.DEVELOPER), deleteApi);

module.exports = router;
