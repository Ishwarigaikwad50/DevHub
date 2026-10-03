const mongoose = require('mongoose');
const { DEPENDENCY_TYPES } = require('../config/constants');

const dependencySchema = new mongoose.Schema(
  {
    sourceService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Source service is required']
    },
    targetService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Target service is required']
    },
    dependencyType: {
      type: String,
      enum: DEPENDENCY_TYPES,
      default: 'REST API'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate dependencies between same source and target
dependencySchema.index({ sourceService: 1, targetService: 1 }, { unique: true });

// Prevent a service from depending on itself
dependencySchema.pre('validate', function () {
  if (this.sourceService && this.targetService && this.sourceService.toString() === this.targetService.toString()) {
    throw new Error('A service cannot depend on itself');
  }
});

module.exports = mongoose.model('Dependency', dependencySchema);
