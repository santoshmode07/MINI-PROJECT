const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    upiId: {
        type: String,
        required: [true, 'Please provide your UPI ID for settlement'],
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: [100, 'Minimum withdrawal amount is ₹100']
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'rejected'],
        default: 'pending'
    },
    adminNote: {
        type: String,
        default: ''
    },
    transactionId: {
        type: String, // Referral ID of the actual UPI bank transfer
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payout', payoutSchema);
