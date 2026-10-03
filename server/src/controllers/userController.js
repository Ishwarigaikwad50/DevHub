const User = require('../models/User');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res, next) => {
  try {
    const { role, team, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (team) query.team = team;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).populate('team', 'name key').sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('team');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, team, title } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Devhub@2026',
      role: role || 'DEVELOPER',
      team: team || null,
      title: title || 'Software Engineer',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    });

    await logAudit({
      req,
      action: 'USER_CREATE',
      entity: 'User',
      entityId: user._id,
      entityName: user.name,
      newValue: { name: user.name, email: user.email, role: user.role }
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, team, title, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldValue = { name: user.name, role: user.role, team: user.team, status: user.status };

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (team !== undefined) user.team = team || null;
    if (title) user.title = title;
    if (status) user.status = status;

    await user.save();

    await logAudit({
      req,
      action: 'USER_UPDATE',
      entity: 'User',
      entityId: user._id,
      entityName: user.name,
      oldValue,
      newValue: { name: user.name, role: user.role, team: user.team, status: user.status }
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    await logAudit({
      req,
      action: 'USER_DELETE',
      entity: 'User',
      entityId: user._id,
      entityName: user.name
    });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
