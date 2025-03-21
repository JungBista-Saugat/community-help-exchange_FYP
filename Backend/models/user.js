const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  points: { type: Number, default: 7 },
  completedProfile: { type: Boolean, default: false },
  skills: [String],
  interests: [String]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);