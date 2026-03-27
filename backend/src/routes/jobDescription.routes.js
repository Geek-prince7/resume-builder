const express = require('express');
const jdController = require('../controllers/jobDescription.controller');

const router = express.Router();

router.post('/:userId/job-descriptions', jdController.createJobDescription);
router.get('/:userId/job-descriptions', jdController.getJobDescriptions);
router.get('/:userId/job-descriptions/:jdId', jdController.getJobDescription);
router.post('/:userId/job-descriptions/:jdId/generate', jdController.generateResume);

module.exports = router;
