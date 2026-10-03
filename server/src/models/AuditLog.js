const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    action: {
      type: String,
      required: true
    },
    entity: {
      type: String,
      required: true,
      enum: ['Service', 'Team', 'API', 'Dependency', 'Environment', 'Deployment', 'User', 'Auth', 'System']
    },
    entityId: {
      type: String,
      default: null
    },
    entityName: {
      type: String,
      default: ''
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ user: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
