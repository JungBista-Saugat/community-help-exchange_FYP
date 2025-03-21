const mongoose = require('mongoose');

const pointsTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['earned', 'spent'], required: true },
  description: { type: String, required: true },
  relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'VolunteerPost' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PointsTransaction', pointsTransactionSchema);