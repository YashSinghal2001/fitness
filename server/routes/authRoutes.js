const express = require('express');
const router = express.Router();
const {
  registerClient,
  registerAdmin,
  loginUser,
  getMe,
  changeInitialPassword,
  changePassword,
  resetPassword,
  forgotPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerClient);
router.post('/admin/register', registerAdmin);
router.post('/login', loginUser);
router.post('/change-initial-password', changeInitialPassword);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
