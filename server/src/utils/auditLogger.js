const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

/**
 * Record an audit log entry and optionally trigger notifications
 */
const logAudit = async ({
  req,
  user,
  action,
  entity,
  entityId,
  entityName,
  oldValue = null,
  newValue = null,
  notify = false,
  notificationTitle = '',
  notificationMessage = '',
  notificationType = 'SYSTEM'
}) => {
  try {
    const actorUser = user || (req && req.user ? req.user : null);
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '') : '';
    const userAgent = req ? req.headers['user-agent'] || '' : '';

    const logEntry = await AuditLog.create({
      user: actorUser ? actorUser._id : null,
      action,
      entity,
      entityId: entityId ? entityId.toString() : null,
      entityName: entityName || '',
      oldValue,
      newValue,
      ipAddress,
      userAgent,
      timestamp: new Date()
    });

    if (notify && notificationTitle) {
      await Notification.create({
        recipient: null, // Broadcast to all team members / devs
        title: notificationTitle,
        message: notificationMessage || `${action} on ${entity} ${entityName || ''}`,
        type: notificationType,
        relatedEntity: entity,
        relatedEntityId: entityId ? entityId.toString() : null
      });
    }

    return logEntry;
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

module.exports = { logAudit };
