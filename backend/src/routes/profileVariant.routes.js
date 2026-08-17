const express = require('express');
const controller = require('../controllers/profileVariant.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);
router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:variantId', controller.update);
router.delete('/:variantId', controller.remove);
module.exports = router;
