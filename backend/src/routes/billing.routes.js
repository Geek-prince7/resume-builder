const express = require('express');
const billingController = require('../controllers/billing.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/plans', billingController.getPlans);
router.get('/usage', authenticate, billingController.getUsage);
router.post('/checkout', authenticate, billingController.createCheckout);
router.post('/portal', authenticate, billingController.createPortal);

module.exports = router;
