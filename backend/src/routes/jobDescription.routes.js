const express = require('express');
const jdController = require('../controllers/jobDescription.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', jdController.createJobDescription);
router.get('/', jdController.getJobDescriptions);
router.get('/:jdId', jdController.getJobDescription);
router.post('/:jdId/generate', jdController.generateResume);
router.put('/:jdId/resumes/:resumeId', jdController.updateGeneratedResume);
router.post(
  '/:jdId/resumes/:resumeId/revisions/:revisionId/restore',
  jdController.restoreGeneratedResumeRevision
);

module.exports = router;
