const express = require('express');
const Company = require('../models/Company');
const { authenticateJWT } = require('../middleware/authenticate');
const router = express.Router();

/**
 * @route   GET /api/companies/
 * @desc    List all companies
 */
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().populate('jobs', 'title');
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/companies/:id
 * @desc    Get company profile/details
 */
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('jobs', 'title');
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/companies/
 * @desc    Create a new company (employer only)
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can create companies.' });
    }
    const { name, description, website, logoUrl, address, phone, email } = req.body;
    const company = new Company({ name, description, website, logoUrl, address, phone, email });
    await company.save();
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/companies/:id
 * @desc    Update company (employer only)
 */
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can update companies.' });
    }
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
