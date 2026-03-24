const mongoose = require('mongoose');
require('dotenv').config();
const Ride = require('./models/Ride');
const User = require('./models/User');

async function debug() {
  await mongoose.connect(process.env.MONGO_URI);
  const now = new Date();
  console.log('Current Time:', now.toString());
  console.log('Current ISO:', now.toISOString());

  const ridesToProcess = await Ride.find({
    status: { $in: ['available', 'full'] },
    'bookings': {
      $elemMatch: {
        status: 'confirmed',
        otp: null
      }
    }
  });

  console.log('Found Rides to process:', ridesToProcess.length);

  for (const ride of ridesToProcess) {
    const dateStr = ride.date.toISOString().split('T')[0];
    const departureTime = new Date(`${dateStr}T${ride.time}`);
    const diffMinutes = (departureTime - now) / 60000;

    console.log(`Ride ${ride._id}: Departure ${departureTime.toString()}, Diff: ${diffMinutes.toFixed(2)} min`);
    
    if (diffMinutes <= 5.5 && diffMinutes >= -15) {
      console.log('>> SHOULD TRIGGER OTP GENERATION');
    } else {
      console.log('>> OUTSIDE WINDOW');
    }
  }
  process.exit(0);
}

debug();
