const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['help_offer', 'help_accepted', 'help_completed', 'volunteer_approved', 'volunteer_rejected'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HelpRequest'
  },
  relatedVolunteerPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VolunteerPost'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema); 