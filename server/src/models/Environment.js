const mongoose = require('mongoose');
const { ENVIRONMENTS } = require('../config/constants');

const environmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ENVIRONMENTS,
      required: [true, 'Environment name is required']
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required']
    },
    baseUrl: {
      type: String,
      trim: true,
      default: ''
    },
    healthCheckUrl: {
      type: String,
      trim: true,
      default: ''
    },
    version: {
      type: String,
      default: '1.0.0',
      trim: true
    },
    deploymentStatus: {
      type: String,
      enum: ['Healthy', 'Degraded', 'Down', 'Unknown'],
      default: 'Healthy'
    },
    lastDeployedAt: {
      type: Date,
      default: Date.now
    },
    lastDeploymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deployment',
      default: null
    }
  },
  {
    timestamps: true
  }
);

environmentSchema.index({ service: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Environment', environmentSchema);
