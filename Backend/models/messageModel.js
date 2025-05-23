// filepath: d:\community-help-exchange_FYP\Backend\models\messageModel.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);