const express = require('express');
const Job = require('../models/Job');
const Company = require('../models/Company');
const { authenticateJWT } = require('../middleware/authenticate');
const router = express.Router();

/**
 * @route   GET /api/jobs/
 * @desc    List all jobs (public)
 */
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().populate('company', 'name').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get a single job detail
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name')
      .populate('applications');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/jobs/
 * @desc    Create job posting (employer only)
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    // Only employers can post jobs
    if (req.user.role !== 'employer') {
      return res.status(403).json({ error: 'Only employers can create jobs.' });
    }
    const { title, description, company, location, salary, requirements, benefits, deadline } = req.body;
    const companyDoc = await Company.findById(company);
    if (!companyDoc) return res.status(400).json({ error: 'Invalid company.' });
    const job = new Job({
      title, description, company, location, salary, requirements, benefits, deadline, poster: req.user.id
    });
    await job.save();
    companyDoc.jobs.push(job._id);
    await companyDoc.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update job posting (employer/owner only)
 */
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    // Only poster or admin should be able to edit
    if (job.poster.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete job posting (owner only)
 */
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.poster.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    await job.remove();
    res.json({ message: 'Job deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
