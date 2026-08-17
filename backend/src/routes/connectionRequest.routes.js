const express = require('express');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/connectionRequest.controller');

const router = express.Router();
router.use(authenticate);
router.get('/', controller.list);
router.get('/due', controller.due);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
