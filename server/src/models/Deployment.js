const mongoose = require('mongoose');
const { ENVIRONMENTS, DEPLOYMENT_STATUS } = require('../config/constants');

const deploymentSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required']
    },
    environment: {
      type: String,
      enum: ENVIRONMENTS,
      required: [true, 'Environment is required']
    },
    version: {
      type: String,
      required: [true, 'Version is required'],
      trim: true
    },
    status: {
      type: String,
      enum: DEPLOYMENT_STATUS,
      default: 'Successful'
    },
    deployedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    commitHash: {
      type: String,
      trim: true,
      default: () => Math.random().toString(16).substring(2, 9)
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

deploymentSchema.index({ service: 1, environment: 1, createdAt: -1 });

module.exports = mongoose.model('Deployment', deploymentSchema);
