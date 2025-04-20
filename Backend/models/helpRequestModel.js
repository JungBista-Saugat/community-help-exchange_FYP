const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  emergencyLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  pointsDeducted: { type: Number, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'open' },
});

helpRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);