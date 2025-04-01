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
  interests: [String],
  // Additional fields
  profilePicture: { type: String }, // URL to profile picture
  bio: { type: String }, // Short biography
  socialLinks: { // Social media links
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);