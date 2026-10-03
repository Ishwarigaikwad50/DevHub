const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      unique: true,
      maxlength: 100
    },
    key: {
      type: String,
      required: [true, 'Team key is required'],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Team key must be lowercase letters, numbers, and hyphens only']
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    contactEmail: {
      type: String,
      trim: true,
      default: ''
    },
    slackChannel: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Team', teamSchema);
