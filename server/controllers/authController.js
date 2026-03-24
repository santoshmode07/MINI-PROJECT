const User = require('../models/User');
const generateToken = require('../utils/tokenHelper');
const validator = require('validator');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, gender, password, licenseNumber, aadhaarNumber } = req.body;

        // 1. Validation at controller level
        if (!name || !email || !phone || !gender || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide all required fields' 
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid email' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }

        // 2. Check duplicate email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // 3. Create user
        const user = await User.create({
            name,
            email,
            phone,
            gender,
            password,
            licenseNumber,
            aadhaarNumber
        });

        if (user) {
            // 4. Generate token
            const token = generateToken(res, user._id);

            res.status(201).json({
                success: true,
                data: {
                    user: user.toJSON(), // Force toJSON transform for masking and safety
                    token
                },
                message: 'User registered successfully'
            });
        }
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide email and password' 
            });
        }

        // 1. Check user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // 2. Match password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // 3. Generate token
        const token = generateToken(res, user._id);

        res.status(200).json({
            success: true,
            data: {
                user: user.toJSON(), // Force toJSON transform for masking and safety
                token
            },
            message: 'Logged in successfully'
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logoutUser = async (req, res) => {
    try {
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0)
        });
        res.status(200).json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.status(200).json({
                success: true,
                data: user.toJSON() // Explicitly call toJSON to ensure masking
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

const Transaction = require('../models/Transaction');

/**
 * @desc    Top up wallet
 * @route   POST /api/auth/wallet/topup
 * @access  Private
 */
const topUpWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Please provide a valid amount' });
        }

        const user = await User.findById(req.user._id);
        user.walletBalance += Number(amount);
        await user.save();

        // Record Transaction
        await Transaction.create({
            userId: user._id,
            type: 'TOPUP',
            amount: Number(amount),
            description: 'Funds added to wallet via digital top-up'
        });

        res.status(200).json({
            success: true,
            message: `₹${amount} added to your wallet`,
            data: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get user transactions
 * @route   GET /api/auth/wallet/transactions
 * @access  Private
 */
const getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerUser,
    authUser,
    logoutUser,
    getUserProfile,
    topUpWallet,
    getMyTransactions
};
