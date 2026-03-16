const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ride = require('./models/Ride');
const User = require('./models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const setupTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📡 Synchronizing Justice Window...');

    // 1. Find the latest user who likely just logged in/viewed rides
    const latestUser = await User.findOne().sort({ updatedAt: -1 });
    if (!latestUser) {
       console.error("❌ No users found in database.");
       process.exit(1);
    }

    // 2. Find the latest ride for THIS specific user
    const ride = await Ride.findOne({ driver: latestUser._id }).sort({ createdAt: -1 });
    if (!ride) {
      console.log(`❌ No ride found for user ${latestUser.name}. Please create a ride in the app first!`);
      process.exit(1);
    }

    // 3. Calculate "5 minutes from now"
    const now = new Date();
    const testTime = new Date(now.getTime() + 5 * 60 * 1000); 
    
    const hours = String(testTime.getHours()).padStart(2, '0');
    const minutes = String(testTime.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    // 4. IMPORTANT: Update expiresAt so it shows in "Active" section
    const expiryTime = new Date(testTime.getTime() + 10 * 60 * 1000); // 10 min waiting time

    ride.date = now;
    ride.time = timeStr;
    ride.expiresAt = expiryTime;
    ride.status = 'available'; // Reset status just in case
    
    // 5. Add a Ghost Passenger (Justice requires a victim)
    if (ride.bookings.filter(b => b.status === 'confirmed').length === 0) {
      const someUser = await User.findOne({ _id: { $ne: ride.driver } });
      if (someUser) {
        ride.bookings = [{
          passenger: someUser._id,
          status: 'confirmed',
          boardingPoint: { address: 'Test Pickup Area', coordinates: [0,0] },
          dropoffPoint: { address: 'Test Destination', coordinates: [0,0] },
          fareCharged: ride.price,
          bookedAt: new Date()
        }];
        ride.seatsAvailable = Math.max(0, ride.seatsAvailable - 1);
      }
    }

    await ride.save();
    
    console.log('--------------------------------------------------');
    console.log(`✅ TEST READY FOR: ${latestUser.name}`);
    console.log(`Ride: ${ride.from.split(',')[0]} -> ${ride.to.split(',')[0]}`);
    console.log(`Ride Time Set To: ${timeStr} (Starts in 5 mins)`);
    console.log(`Expires At: ${expiryTime.toLocaleTimeString()} (Active)`);
    console.log('--------------------------------------------------');
    console.log('👉 ACTION: Refresh "My Offered Rides". It will be in the ACTIVE section.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  }
};

setupTest();
