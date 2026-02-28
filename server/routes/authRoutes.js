const express = require('express');
const router = express.Router();
const {
  registerClient,
  registerAdmin,
  loginUser,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerClient);
router.post('/admin/register', registerAdmin);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;
