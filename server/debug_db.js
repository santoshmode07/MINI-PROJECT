const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from the same directory
dotenv.config({ path: path.join(__dirname, '.env') });

const Ride = require('./models/Ride');
const User = require('./models/User');

async function debugDatabase() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const rides = await Ride.find({ 
      from: /Vijayawada/i, 
      to: /Visakhapatnam/i 
    }).sort({ createdAt: -1 }).limit(1).populate('driver', 'name gender');

    if (rides.length === 0) {
      console.log('No matching rides found for Vijayawada to Visakhapatnam.');
    } else {
      const ride = rides[0];
      console.log('--- Ride Document ---');
      console.log('ID:', ride._id);
      console.log('From:', ride.from);
      console.log('To:', ride.to);
      console.log('From Coordinates:', JSON.stringify(ride.fromCoordinates.coordinates));
      console.log('To Coordinates:', JSON.stringify(ride.toCoordinates.coordinates));
      console.log('Route Points Count:', ride.routePoints?.coordinates?.length || 0);
      console.log('Driver Gender:', ride.driverGender || (ride.driver && ride.driver.gender));
      console.log('Status:', ride.status);
      console.log('Expires At:', ride.expiresAt);
      console.log('Date:', ride.date);
      console.log('Time:', ride.time);
      console.log('---------------------');
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

debugDatabase();
