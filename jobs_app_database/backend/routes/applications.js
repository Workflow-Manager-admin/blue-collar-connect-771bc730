const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { authenticateJWT } = require('../middleware/authenticate');
const router = express.Router();

/**
 * @route   GET /api/applications/
 * @desc    List all applications for the authenticated user
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const query = req.user.role === 'worker'
      ? { applicant: req.user.id }
      : req.user.role === 'employer'
        ? {} // show all for testing, you can filter by company/job
        : {};
    const applications = await Application.find(query)
      .populate('job applicant');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/applications/
 * @desc    Apply to a job (worker only)
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'worker')
      return res.status(403).json({ error: 'Only workers can apply to jobs.' });
    const { job, coverLetter, resumeUrl } = req.body;
    const jobDoc = await Job.findById(job);
    if (!jobDoc) return res.status(400).json({ error: 'Invalid job.' });
    const alreadyApplied = await Application.findOne({ job, applicant: req.user.id });
    if (alreadyApplied) return res.status(409).json({ error: 'Already applied.' });

    const application = new Application({
      job, applicant: req.user.id, coverLetter, resumeUrl
    });
    await application.save();
    jobDoc.applications.push(application._id);
    await jobDoc.save();
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PATCH /api/applications/:id
 * @desc    Update application status (employer only)
 */
router.patch('/:id', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'employer')
      return res.status(403).json({ error: 'Only employers can update applications.' });
    const { status } = req.body;
    const validStatus = ['pending', 'reviewed', 'declined', 'accepted'];
    if (!validStatus.includes(status))
      return res.status(400).json({ error: 'Invalid status.' });
    const app = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!app) return res.status(404).json({ error: 'Application not found.' });
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
