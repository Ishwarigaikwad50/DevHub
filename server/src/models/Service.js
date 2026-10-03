const mongoose = require('mongoose');
const { SERVICE_STATUS, CRITICALITY, SERVICE_TYPES } = require('../config/constants');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: 120
    },
    key: {
      type: String,
      required: [true, 'Unique service key is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Service key must consist of lowercase alphanumeric characters and hyphens']
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true
    },
    serviceType: {
      type: String,
      enum: SERVICE_TYPES,
      default: 'Backend Service'
    },
    ownerTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Owner team is required']
    },
    primaryOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    repositoryUrl: {
      type: String,
      trim: true,
      default: ''
    },
    documentationUrl: {
      type: String,
      trim: true,
      default: ''
    },
    technologies: [
      {
        type: String,
        trim: true
      }
    ],
    language: {
      type: String,
      trim: true,
      default: 'JavaScript'
    },
    status: {
      type: String,
      enum: Object.values(SERVICE_STATUS),
      default: SERVICE_STATUS.HEALTHY
    },
    criticality: {
      type: String,
      enum: Object.values(CRITICALITY),
      default: CRITICALITY.TIER_2
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    autoIndex: true
  }
);

// Search indexes using standard B-tree and text index with language_override: 'none'
serviceSchema.index({ status: 1 });
serviceSchema.index({ ownerTeam: 1 });
serviceSchema.index({ criticality: 1 });
serviceSchema.index(
  { name: 'text', key: 'text', description: 'text' },
  { language_override: 'none', default_language: 'none' }
);

module.exports = mongoose.model('Service', serviceSchema);
