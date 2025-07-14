const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  // PUBLIC_INTERFACE
  name: { type: String, required: true, unique: true },
  description: String,
  website: String,
  logoUrl: String,
  address: String,
  phone: String,
  email: String,
  jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', CompanySchema);
