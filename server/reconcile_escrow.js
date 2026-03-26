const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Ride = require('./models/Ride');
require('./models/User'); // Important

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const rides = await Ride.find({ status: { $in: ['available', 'full'] } });
        
        let trueEscrow = 0;
        console.log(`--- Active Escrow Scanning ---`);
        rides.forEach(ride => {
            (ride.bookings || []).forEach(booking => {
                if (booking.status === 'confirmed' && booking.paymentMethod === 'online' && !booking.moneyReleased) {
                    trueEscrow += booking.fareCharged;
                    console.log(`Active Hold: ₹${booking.fareCharged} | Ride: ${ride.from} -> ${ride.to} | Passenger: ${booking.passenger}`);
                }
            });
        });

        console.log(`\nVerified Active Escrow Total: ₹${trueEscrow}`);
        
        const admin = await (require('./models/User')).findOne({ role: 'admin' });
        console.log(`Admin Current Balance: ₹${admin.walletBalance}`);
        console.log(`\nReconciliation Estimate:`);
        console.log(`- Seed Baseline: ₹2000`);
        console.log(`- Earned Commissions: ₹67`);
        console.log(`- Active Escrow: ₹${trueEscrow}`);
        const expected = 2000 + 67 + trueEscrow;
        console.log(`- Expected Balance: ₹${expected}`);
        console.log(`\nProposed Adjustment: ₹${expected - admin.walletBalance}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
