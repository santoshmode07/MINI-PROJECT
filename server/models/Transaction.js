const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['COMMISSION', 'SUBSIDY', 'TRANSFER', 'TOPUP', 'RIDE_PAYMENT', 'RIDE_EARNING', 'REFUND', 'WITHDRAWAL', 'SYSTEM_INFO', 'ESCROW_HOLD', 'ESCROW_RELEASE'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride'
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        originalFare: Number,
        commissionAmount: Number,
        subsidyAmount: Number,
        passengerPays: Number,
        driverEarns: Number,
        paymentMethod: String,
        paymentIntentId: String
    }
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
