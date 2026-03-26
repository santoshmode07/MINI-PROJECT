const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Ride = require('../models/Ride');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id);
        
        // 1. Transaction History (Global)
        const transactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('userId', 'name email role')
            .populate('rideId', 'from to');

        // 2. Summary Metrics
        const totalRevenue = await Transaction.aggregate([
            { $match: { type: 'COMMISSION' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalSubsidies = await Transaction.aggregate([
            { $match: { type: 'SUBSIDY', amount: { $lt: 0 } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const platformBalance = admin.walletBalance;

        res.status(200).json({
            success: true,
            data: {
                platformBalance,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalSubsidies: Math.abs(totalSubsidies[0]?.total || 0),
                transactionCount: await Transaction.countDocuments(),
                transactions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all users (for admin management)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
