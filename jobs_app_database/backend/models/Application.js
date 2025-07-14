const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  // PUBLIC_INTERFACE
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: String,
  resumeUrl: String,
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'declined', 'accepted'],
    default: 'pending'
  },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema);
