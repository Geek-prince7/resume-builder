const express = require('express');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/discovery.controller');

const router = express.Router();
router.use(authenticate);
router.get('/recommendations', controller.listRecommendations);
router.get('/summary', controller.summary);
router.get('/companies', controller.listCompanies);
router.post('/match', controller.refreshMatches);
router.post('/run', controller.runDiscovery);
router.put('/recommendations/:id', controller.updateRecommendation);
module.exports = router;
