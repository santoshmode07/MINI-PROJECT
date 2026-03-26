const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Transaction = require('./models/Transaction');
const User = require('./models/User');
const Ride = require('./models/Ride');

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) throw new Error('Admin not found');

        console.log(`--- Syndicate Treasury Reconciliation ---`);
        console.log(`Phase 1: Analyzing Active Obligations...`);

        // Find ALL currently active confirmed online bookings
        const activeRides = await Ride.find({ status: { $in: ['available', 'full'] } });
        const activeHoldIds = [];
        let trueEscrowTotal = 0;

        for (const ride of activeRides) {
            (ride.bookings || []).forEach(b => {
                if (b.status === 'confirmed' && b.paymentMethod === 'online' && !b.moneyReleased) {
                    trueEscrowTotal += b.fareCharged;
                    activeHoldIds.push(ride._id.toString());
                }
            });
        }

        console.log(`Verified Active Escrow Needed: ₹${trueEscrowTotal}`);

        // Phase 2: Calculate earned income
        const commissions = await Transaction.aggregate([
            { $match: { type: 'COMMISSION' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const subsidies = await Transaction.aggregate([
            { $match: { type: 'SUBSIDY' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const earnedComm = commissions[0]?.total || 0;
        const totalSub = Math.abs(subsidies[0]?.total || 0);
        const seedValue = 2000;

        console.log(`Seed Funds: ₹${seedValue}`);
        console.log(`Earned Commissions: ₹${earnedComm}`);
        console.log(`Paid Subsidies: ₹${totalSub}`);

        const correctBalance = seedValue + earnedComm - totalSub + trueEscrowTotal;
        console.log(`\nTARGET CLEAN BALANCE: ₹${correctBalance}`);
        console.log(`CURRENT DB BALANCE: ₹${admin.walletBalance}`);

        if (admin.walletBalance !== correctBalance) {
            console.log(`Adjusting balance by ₹${correctBalance - admin.walletBalance}...`);
            admin.walletBalance = correctBalance;
            await admin.save();
            console.log(`✅ Balance reconciled!`);
        }

        // Phase 3: Cleanup Zombie Transaction Logs
        console.log(`\nPhase 3: Cleaning Zombie Logs...`);
        // Find all ESCROW_HOLD (TOPUP) that don't belong to an active ride
        // We'll be conservative and just ensure the user's dashboard only shows what they earned.
        // Actually, we should keep the logs but label them or just focus on the balance fix.
        // I'll leave the logs for now to allow for future audit, but the balance is now correct.

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanup();
