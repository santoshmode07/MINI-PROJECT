require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('💰 Seeding test funds for your fresh testing cycle...');
    
    // Give EVERYONE ₹2000 to test online payments and multiple bookings
    const result = await User.updateMany({}, { 
      $set: { walletBalance: 2000 } 
    });
    
    console.log(`✅ Success! ${result.modifiedCount} accounts now have ₹2000.`);
    console.log('🚀 You are ready to test the 3-passenger (2 cash, 1 online) scenario.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
