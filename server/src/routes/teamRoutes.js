const express = require('express');
const router = express.Router();
const { getTeams, getTeam, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const { protect } = require('../middleware/auth');
const { authorize, checkTeamOwnership } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.use(protect);

router.route('/')
  .get(getTeams)
  .post(authorize(ROLES.ADMIN, ROLES.TEAM_ADMIN), createTeam);

router.route('/:id')
  .get(getTeam)
  .put(checkTeamOwnership, updateTeam)
  .delete(authorize(ROLES.ADMIN), deleteTeam);

module.exports = router;
