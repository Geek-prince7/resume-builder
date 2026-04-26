const express = require('express');
const multer = require('multer');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.get('/profile', authenticate, userController.getUser);
router.put('/profile', authenticate, userController.updateUser);
router.post('/profile/parse-resume', authenticate, upload.single('resume'), userController.parseResume);

module.exports = router;
