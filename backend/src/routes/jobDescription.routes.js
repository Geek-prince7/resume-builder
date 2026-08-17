const express = require('express');
const jdController = require('../controllers/jobDescription.controller');
const { authenticate } = require('../middleware/auth');
const jobQueueController = require('../controllers/jobQueue.controller');

const router = express.Router();

router.use(authenticate);

router.post('/', jdController.createJobDescription);
router.get('/', jdController.getJobDescriptions);
router.get('/tracker/summary', jdController.getTrackerSummary);
router.put('/:jdId/application', jdController.updateApplication);
router.get('/:jdId', jdController.getJobDescription);
router.post('/:jdId/generate', jdController.generateResume);
router.post('/:jdId/generate-async', jobQueueController.enqueue);
router.get('/jobs/:jobId', jobQueueController.status);
router.post('/:jdId/cover-letter', jdController.generateCoverLetter);
router.put('/:jdId/resumes/:resumeId', jdController.updateGeneratedResume);
router.post(
  '/:jdId/resumes/:resumeId/revisions/:revisionId/restore',
  jdController.restoreGeneratedResumeRevision
);
router.get('/:jdId/resumes/:resumeId/pdf', jdController.downloadGeneratedResumePdf);

module.exports = router;
