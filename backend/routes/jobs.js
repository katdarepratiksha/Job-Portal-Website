const express = require('express');
const Job = require('../models/Job');
const router = express.Router();

// Post a Job (only for Employers)
router.post('/post', (req, res) => {
  // Check if the user is logged in and is an employer
  if (!req.session.userId || req.session.role !== 'employer') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  // Extract job details from the request body
  const { title, description, company, location } = req.body;

  // Create a new Job object
  const job = new Job({
    title,
    description,
    company,
    location,
    postedBy: req.session.userId,  // Store the employer's ID from the session
  });

  // Save the job to the database
  job.save()
    .then((job) => res.json(job))  // Respond with the saved job
    .catch((err) => res.status(500).json({ msg: 'Server Error', error: err.message }));
});

// Get All Jobs (for job seekers)
router.get('/', (req, res) => {
  // You can add more filtering logic here based on user input
  Job.find()
    .then((jobs) => res.json(jobs))  // Respond with a list of jobs
    .catch((err) => res.status(500).json({ msg: 'Server Error', error: err.message }));
});

module.exports = router;
