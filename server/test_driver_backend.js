const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Ride = require('./models/Ride');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { getDriverStats, cancelRide, getMyOffers } = require('./controllers/rideController');

async function testBackend() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a test driver who has rides
    const ride = await Ride.findOne({ status: 'available' }).populate('driver');
    if (!ride) {
      console.log('No available rides found to test with.');
      process.exit(1);
    }
    const driver = ride.driver;
    console.log(`Testing with Driver: ${driver.name} (${driver._id})`);

    // Mock Express Request/Response objects
    const req = { user: driver, params: { id: ride._id } };
    const res = {
      status: (code) => ({
        json: (data) => console.log(`[Response ${code}]`, JSON.stringify(data, null, 2))
      })
    };

    console.log('\n--- 1. Testing getDriverStats ---');
    await getDriverStats(req, res);

    console.log('\n--- 2. Testing getMyOffers ---');
    await getMyOffers(req, res);

    // console.log('\n--- 3. Testing cancelRide ---');
    // await cancelRide(req, res);

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

testBackend();
