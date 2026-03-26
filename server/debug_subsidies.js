const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Ride = require('./models/Ride');
require('./models/User');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const rides = await Ride.find();
        console.log(`Found ${rides.length} total rides.`);
        
        let totalSubsidy = 0;
        let bookingCount = 0;
        
        rides.forEach(ride => {
            (ride.bookings || []).forEach(booking => {
                bookingCount++;
                if (booking.systemSubsidy) {
                    totalSubsidy += booking.systemSubsidy;
                    console.log(`Ride ${ride._id}: Booking by ${booking.passenger} has subsidy ₹${booking.systemSubsidy}`);
                }
            });
        });

        console.log(`\nAggregated Summary:`);
        console.log(`- Total Bookings: ${bookingCount}`);
        console.log(`- Total System Subsidies Recorded in Bookings: ₹${totalSubsidy}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
