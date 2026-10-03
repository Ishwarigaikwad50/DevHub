const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null means broadcast to all users
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['HEALTH_ALERT', 'DEPLOYMENT_STATUS', 'ASSIGNMENT', 'DEPENDENCY_CHANGE', 'SERVICE_UPDATE', 'SYSTEM'],
      default: 'SYSTEM'
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    relatedEntity: {
      type: String,
      default: null
    },
    relatedEntityId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
