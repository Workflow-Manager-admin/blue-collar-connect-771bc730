const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  // PUBLIC_INTERFACE
  title: { type: String, required: true },
  description: String,
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  location: String,
  salary: String,
  requirements: [String],
  benefits: [String],
  poster: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  deadline: Date,
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }]
});

module.exports = mongoose.model('Job', JobSchema);
