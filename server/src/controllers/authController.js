const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ROLES } = require('../config/constants');
const { logAudit } = require('../utils/auditLogger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'devhub_super_secret_jwt_key_998877665544332211', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, team, title } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    // Default first user or requested role if valid, else DEVELOPER
    const assignedRole = role && Object.values(ROLES).includes(role) ? role : ROLES.DEVELOPER;

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      team: team || null,
      title: title || 'Software Engineer',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    });

    const token = generateToken(user._id);

    await logAudit({
      user,
      action: 'USER_REGISTER',
      entity: 'Auth',
      entityId: user._id,
      entityName: user.name,
      newValue: { email: user.email, role: user.role }
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
        title: user.title,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password').populate('team');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    if (user.status === 'Suspended' || user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated or suspended.' });
    }

    const token = generateToken(user._id);

    await logAudit({
      req,
      user,
      action: 'USER_LOGIN',
      entity: 'Auth',
      entityId: user._id,
      entityName: user.name
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
        title: user.title,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('team');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, title, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (title) user.title = title;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Demo quick switch login
// @route   POST /api/auth/demo-login
// @access  Public
exports.demoLogin = async (req, res, next) => {
  try {
    const { role = 'ADMIN' } = req.body;
    const user = await User.findOne({ role }).populate('team');

    if (!user) {
      return res.status(404).json({ success: false, message: `Demo user for role ${role} not found. Please run seed script.` });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team,
        title: user.title,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};
