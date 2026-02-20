import { Request, Response } from 'express';
import User from '../models/User';
import DailyLog from '../models/DailyLog';

const DEFAULT_COACH_ID = "507f1f77bcf86cd799439012";

// @desc    Get all clients for the logged in admin
// @route   GET /api/admin/clients
// @access  Public (Temporary)
export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await User.find({ role: 'client', coach: DEFAULT_COACH_ID }).select('-password');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new client
// @route   POST /api/admin/clients
// @access  Public (Temporary)
export const createClient = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by model pre-save
      role: 'client',
      coach: DEFAULT_COACH_ID,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update client details (e.g. activate/deactivate)
// @route   PUT /api/admin/clients/:id
// @access  Public (Temporary)
export const updateClient = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
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
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete client
// @route   DELETE /api/admin/clients/:id
// @access  Public (Temporary)
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get aggregated analytics for admin
// @route   GET /api/admin/analytics
// @access  Public (Temporary)
export const getAdminAnalytics = async (req: Request, res: Response) => {
    try {
        const adminId = DEFAULT_COACH_ID;
        
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
            clientId: { $in: clientIds },
            createdAt: { $gte: sevenDaysAgo }
        });

        res.json({
            totalClients,
            activeClients,
            recentLogs
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get recent reports from all clients
// @route   GET /api/admin/reports
// @access  Public (Temporary)
export const getAllReports = async (req: Request, res: Response) => {
    try {
        const adminId = DEFAULT_COACH_ID;
        const clients = await User.find({ role: 'client', coach: adminId }).select('_id name');
        const clientIds = clients.map(c => c._id);

        // Get logs from last 7 days for these clients
        const logs = await DailyLog.find({
            clientId: { $in: clientIds }
        })
        .sort({ date: -1 })
        .populate('clientId', 'name email')
        .limit(50); // Limit to recent 50 logs

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}