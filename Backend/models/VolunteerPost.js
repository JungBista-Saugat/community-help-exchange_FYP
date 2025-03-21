const mongoose = require('mongoose');

const volunteerPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  requiredSkills: [String],
  pointsAwarded: { type: Number, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('VolunteerPost', volunteerPostSchema);