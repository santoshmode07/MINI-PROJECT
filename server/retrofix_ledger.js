const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Ride = require('./models/Ride');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

const retrofix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) throw new Error('Admin not found');

        // Find completed rides in the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const rides = await Ride.find({ 
            status: 'completed',
            updatedAt: { $gt: oneDayAgo }
        });

        console.log(`Found ${rides.length} completed rides in the last 24 hours.`);

        for (const ride of rides) {
            // Check if there's a COMMISSION record for this rideId and adminId
            const existingComm = await Transaction.findOne({ 
                rideId: ride._id, 
                userId: admin._id,
                type: 'COMMISSION'
            });

            if (!existingComm) {
                console.log(`Ride ${ride._id} is missing commission record. Repairing...`);
                // Calculate missing commission from bookings
                for (const booking of ride.bookings) {
                    if (booking.status === 'confirmed' && (booking.moneyReleased || ride.status === 'completed')) {
                        const riderCut = booking.totalDriverEarnings;
                        const originalFare = Math.round(riderCut / 0.8);
                        const commission = Math.round(originalFare * 0.2);
                        const subsidy = originalFare - (booking.fareCharged || 0);

                        await Transaction.create({
                            userId: admin._id,
                            type: 'COMMISSION',
                            amount: commission,
                            rideId: ride._id,
                            description: `Retro-fixed Commission - Ride to ${ride.to}`
                        });

                        if (subsidy > 0) {
                            await Transaction.create({
                                userId: admin._id,
                                type: 'SUBSIDY',
                                amount: -subsidy,
                                rideId: ride._id,
                                description: `Retro-fixed Subsidy - Ride to ${ride.to}`
                            });
                        }
                    }
                }
            }
        }

        console.log('Retro-fix complete.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

retrofix();
