const express = require('express');
const jdController = require('../controllers/jobDescription.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', jdController.createJobDescription);
router.get('/', jdController.getJobDescriptions);
router.get('/:jdId', jdController.getJobDescription);
router.post('/:jdId/generate', jdController.generateResume);

module.exports = router;
