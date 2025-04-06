const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Academic', 'Technical', 'General']
  },
  emergencyLevel: {
    type: String,
    required: true,
    enum: ['high', 'medium', 'low'], 
    default: 'medium'
  },
  pointsDeducted: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    default: 'open',
    enum: ['open', 'assigned', 'completed', 'canceled']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: Date,
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HelpRequest', helpRequestSchema);