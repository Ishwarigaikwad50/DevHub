const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(authorize(ROLES.ADMIN), createUser);

router.route('/:id')
  .get(getUser)
  .put(authorize(ROLES.ADMIN), updateUser)
  .delete(authorize(ROLES.ADMIN), deleteUser);

module.exports = router;
