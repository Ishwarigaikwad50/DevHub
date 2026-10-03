const Notification = require('../models/Notification');

// @desc    Get notifications for the current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch broadcast (recipient: null) and targeted notifications
    const notifications = await Notification.find({
      $or: [{ recipient: null }, { recipient: userId }]
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const formatted = notifications.map((n) => {
      const isRead = n.readBy && n.readBy.some((id) => id.toString() === userId.toString());
      const obj = n.toObject();
      obj.isRead = isRead;
      return obj;
    });

    const unreadCount = formatted.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      notifications: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
      await notification.save();
    }

    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      {
        $or: [{ recipient: null }, { recipient: userId }],
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
