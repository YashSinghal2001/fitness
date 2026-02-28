const express = require('express');
const router = express.Router();
const {
  registerClient,
  registerAdmin,
  loginUser,
  getMe,
  changePassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerClient);
router.post('/admin/register', registerAdmin);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
