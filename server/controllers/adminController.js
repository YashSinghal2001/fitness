const User = require('../models/User');
const crypto = require('crypto');
const DailyLog = require('../models/DailyLog');
const NutritionPlan = require('../models/NutritionPlan');
const WorkoutPlan = require('../models/WorkoutPlan');
const Goal = require('../models/Goal');

// @desc    Get all clients for the logged in admin
// @route   GET /api/admin/clients
// @access  Private (Admin)
const getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client', coach: req.user._id }).select('-password');
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get client full profile (details, nutrition, workout plan)
// @route   GET /api/admin/client/:id
// @access  Private (Admin)
const getClientById = async (req, res) => {
    try {
        const client = await User.findById(req.params.id).select('-password');

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Check if client belongs to admin
        if (client.coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this client' });
        }

        const nutritionPlan = await NutritionPlan.findOne({ client: client._id }).sort({ createdAt: -1 });
        const workoutPlan = await WorkoutPlan.findOne({ client: client._id }).sort({ createdAt: -1 });
        const goals = await Goal.find({ client: client._id, completed: false });
        const recentLogs = await DailyLog.find({ client: client._id }).sort({ date: -1 }).limit(7);

        res.json({
            client,
            nutritionPlan,
            workoutPlan,
            goals,
            recentLogs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Update client nutrition plan
// @route   PUT /api/admin/client/:id/nutrition
// @access  Private (Admin)
const updateClientNutrition = async (req, res) => {
    try {
        const client = await User.findById(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        if (client.coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this client' });
        }

        const {
            clientName,
            planType,
            period,
            checkInDate,
            cardio,
            water,
            salt,
            meals,
            dailyMacroTargets
        } = req.body;

        // Check if plan exists, update or create new
        // Usually plans are replaced or a new version is created. Let's create a new one to keep history or update existing active one.
        // For simplicity, let's update the latest one or create if not exists.
        // Actually, creating a new one is safer for history. But let's follow standard "update" pattern if ID is provided, or create if not.
        // Since the route is PUT /api/admin/client/:id/nutrition, it implies updating the client's current nutrition.
        
        // Let's see if we should create a new record or update the latest.
        // If we update, we lose history. If we create new, we keep history.
        // Let's create a new record as "Current Plan".
        
        const newPlan = new NutritionPlan({
            client: client._id,
            clientName: clientName || client.name,
            planType,
            period,
            checkInDate,
            cardio,
            water,
            salt,
            meals,
            dailyMacroTargets
        });

        const savedPlan = await newPlan.save();
        res.json(savedPlan);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Update client workout plan
// @route   PUT /api/admin/client/:id/workout
// @access  Private (Admin)
const updateClientWorkout = async (req, res) => {
    try {
        const client = await User.findById(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        if (client.coach.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this client' });
        }

        const { title, description, schedule, notes } = req.body;

        const newPlan = new WorkoutPlan({
            client: client._id,
            title,
            description,
            schedule,
            notes
        });

        const savedPlan = await newPlan.save();
        res.json(savedPlan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}


// @desc    Create a new client
// @route   POST /api/admin/clients
// @access  Private (Admin)
const createClient = async (req, res) => {
  const { name, email } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Generate strong random password
    const length = 16;
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const all = lower + upper + numbers + special;
    
    let password = "";
    // Ensure at least one of each using crypto
    password += lower[crypto.randomInt(0, lower.length)];
    password += upper[crypto.randomInt(0, upper.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += special[crypto.randomInt(0, special.length)];
    
    for (let i = 4; i < length; i++) {
      password += all[crypto.randomInt(0, all.length)];
    }
    
    // Shuffle password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');

    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by model pre-save
      role: 'client',
      coach: req.user._id,
      isActive: true,
      mustChangePassword: true,
    });

    res.status(201).json({
      message: "Client created successfully",
      clientId: user._id,
      email: user.email,
      generatedPassword: password // Return plain text password only once
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update client details (e.g. activate/deactivate)
// @route   PUT /api/admin/clients/:id
// @access  Private (Admin)
const updateClient = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Check authorization
      if (user.coach.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized' });
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      if (req.body.isActive !== undefined) {
        user.isActive = req.body.isActive;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete client
// @route   DELETE /api/admin/clients/:id
// @access  Private (Admin)
const deleteClient = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.coach.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized' });
      }
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get aggregated analytics for admin
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAdminAnalytics = async (req, res) => {
    try {
        const adminId = req.user._id;
        
        // Count total clients
        const totalClients = await User.countDocuments({ role: 'client', coach: adminId });
        
        // Count active clients
        const activeClients = await User.countDocuments({ role: 'client', coach: adminId, isActive: true });

        // Get clients IDs
        const clients = await User.find({ role: 'client', coach: adminId }).select('_id');
        const clientIds = clients.map(c => c._id);

        // Count reports submitted this week (simple check for created logs in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentLogs = await DailyLog.countDocuments({
            client: { $in: clientIds },
            createdAt: { $gte: sevenDaysAgo }
        });

        res.json({
            totalClients,
            activeClients,
            recentLogs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get recent reports from all clients
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getAllReports = async (req, res) => {
    try {
        const adminId = req.user._id;
        const clients = await User.find({ role: 'client', coach: adminId }).select('_id name');
        const clientIds = clients.map(c => c._id);

        // Get logs from last 7 days for these clients
        const logs = await DailyLog.find({
            client: { $in: clientIds }
        })
        .sort({ date: -1 })
        .populate('client', 'name email')
        .limit(50); // Limit to recent 50 logs

        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getAdminAnalytics,
  getAllReports,
  updateClientNutrition,
  updateClientWorkout
};
