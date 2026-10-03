const mongoose = require('mongoose');
const { SERVICE_STATUS } = require('../config/constants');

const healthCheckSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    environment: {
      type: String,
      default: 'Production'
    },
    url: {
      type: String,
      required: true
    },
    httpStatus: {
      type: Number,
      default: 200
    },
    responseTimeMs: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(SERVICE_STATUS),
      default: SERVICE_STATUS.HEALTHY
    },
    checkedAt: {
      type: Date,
      default: Date.now
    },
    isSuccess: {
      type: Boolean,
      default: true
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

healthCheckSchema.index({ service: 1, checkedAt: -1 });

module.exports = mongoose.model('HealthCheck', healthCheckSchema);
