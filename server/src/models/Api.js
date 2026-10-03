const mongoose = require('mongoose');
const { HTTP_METHODS } = require('../config/constants');

const apiSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'API name is required'],
      trim: true
    },
    endpoint: {
      type: String,
      required: [true, 'Endpoint is required'],
      trim: true
    },
    method: {
      type: String,
      enum: HTTP_METHODS,
      required: [true, 'HTTP method is required'],
      uppercase: true
    },
    version: {
      type: String,
      default: 'v1',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    authRequired: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['Active', 'Deprecated', 'Beta', 'Draft'],
      default: 'Active'
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Owning service is required']
    },
    exampleRequest: {
      type: String,
      default: '{\n  \n}'
    },
    exampleResponse: {
      type: String,
      default: '{\n  "status": "success"\n}'
    }
  },
  {
    timestamps: true
  }
);

apiSchema.index({ endpoint: 1, method: 1, service: 1 }, { unique: true });

module.exports = mongoose.model('Api', apiSchema);
