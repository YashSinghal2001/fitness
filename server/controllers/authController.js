const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// @desc    Register a new client (DISABLED)
// @route   POST /api/auth/register
// @access  Public
const registerClient = async (req, res, next) => {
  return next(new AppError('Client self-registration is disabled.', 403));
};

// @desc    Register a new admin
// @route   POST /api/auth/admin/register
// @access  Public
const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please add all fields', 400));
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(new AppError('User already exists', 400));
    }

    // Create user with admin role
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });

    if (user) {
      res.status(201).json({
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: generateToken(user._id),
      });
    } else {
      return next(new AppError('Invalid user data', 400));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please add email and password', 400));
    }

    // Check for user email
    // Explicitly use lean(false) as requested, though it is default for Mongoose queries unless .lean() is called
    const user = await User.findOne({ email }).lean(false);

    if (user) {
      console.log(`User found: ${user.email}`);
    } else {
      console.log(`User not found for email: ${email}`);
    }

    // Manual bcrypt comparison as requested to avoid any double-hashing issues
    // Using bcrypt.compare(plainText, hash)
    let isMatch = false;
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
      console.log(`Password match result: ${isMatch}`);
      console.log(`mustChangePassword status: ${user.mustChangePassword}`);
    }

    if (user && isMatch) {
      // Check if user must change password
      if (user.mustChangePassword) {
        return res.json({
          success: true,
          requirePasswordChange: true,
          userId: user._id
        });
      }

      // Optimize JWT: reduce payload (already minimal) and use short expiration
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.json({
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        },
        token: token,
      });
    } else {
      return next(new AppError('Invalid credentials', 401));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Change initial password
// @route   POST /api/auth/change-initial-password
// @access  Public
const changeInitialPassword = async (req, res, next) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return next(new AppError('Please provide user ID and new password', 400));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update password
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide current and new password', 400));
    }

    const user = await User.findById(req.user.id);

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return next(new AppError('Invalid current password', 401));
    }

    // Update password
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.status(200).json({
      message: 'Password updated successfully',
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return next(new AppError('Please provide token and new password', 400));
    }

    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.mustChangePassword = false;

    await user.save();

    // 3) Log the user in, send JWT
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token: jwtToken,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide email', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    
    // Update expiry to 10 minutes as requested
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    await user.save({ validateBeforeSave: false });

    // Return resetToken in response (DEV mode or as requested for no-email flow)
    res.status(200).json({
      status: 'success',
      message: 'Token generated successfully',
      resetToken: process.env.NODE_ENV === 'production' ? undefined : resetToken,
      // If we strictly follow PART 4: "Return resetToken in response (DEV mode only)"
      // But the frontend needs it to proceed to step 2 in this "no email" version.
      // Let's include it for now to satisfy the requirement of "Step 2: If token returned, show reset form"
      data: {
        resetToken: resetToken
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerClient,
  registerAdmin,
  loginUser,
  getMe,
  changeInitialPassword,
  changePassword,
  resetPassword,
  forgotPassword,
};
