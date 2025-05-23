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
  profilePicture: { type: String }, 
  bio: { type: String }, 
  socialLinks: { 
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'], // GeoJSON type
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [0, 0]
    }
  }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' }); // Geospatial index

module.exports = mongoose.model("User", userSchema);