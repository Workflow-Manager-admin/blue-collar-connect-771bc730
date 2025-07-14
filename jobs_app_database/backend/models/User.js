const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // PUBLIC_INTERFACE
  // Account Credentials
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true
  },
  password: {
    type: String, required: true
  },
  role: {
    type: String,
    enum: ['worker', 'employer'],
    default: 'worker'
  },
  // PUBLIC_INTERFACE
  // Profile Information for Workers
  name: String,
  phone: String,
  avatarUrl: String,
  bio: String,
  location: String,
  skills: [String],
  experience: [{
    company: String,
    position: String,
    from: Date,
    to: Date,
    description: String
  }],
  // PUBLIC_INTERFACE
  // Additional Info for Employers
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  createdAt: {
    type: Date, default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
