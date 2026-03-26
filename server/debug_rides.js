const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Ride = require('./models/Ride');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const rides = await Ride.find().sort({ createdAt: -1 }).limit(3);
        rides.forEach(r => {
            console.log(`- ID: ${r._id}, Status: ${r.status}, Date: ${r.date}, Time: ${r.time}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
