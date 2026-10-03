const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs with search, action, entity filtering and pagination
// @route   GET /api/audit-logs
// @access  Private
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, entity, user, search, limit = 50, page = 1 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (entity) query.entity = entity;
    if (user) query.user = user;
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { entityName: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email avatar role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      logs
    });
  } catch (error) {
    next(error);
  }
};
