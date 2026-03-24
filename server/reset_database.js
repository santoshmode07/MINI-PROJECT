require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Ride = require('./models/Ride');
const Transaction = require('./models/Transaction');
const Notification = require('./models/Notification');
const Review = require('./models/Review');
const Payout = require('./models/Payout');

async function reset() {
  try {
    console.log('🚀 Connecting to Database for fresh start...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('🧹 Clearing Rides & Bookings...');
    await Ride.deleteMany({});
    
    console.log('🧹 Clearing Wallet History (Transactions)...');
    await Transaction.deleteMany({});
    
    console.log('🧹 Clearing Notifications...');
    await Notification.deleteMany({});
    
    console.log('🧹 Clearing Reviews...');
    await Review.deleteMany({});
    
    console.log('🧹 Clearing Payouts...');
    await Payout.deleteMany({});
    
    console.log('💰 Resetting User Wallet Balances & Clearing Embedded History...');
    // Resetting to ₹0 and CLEARING the embedded walletTransactions array
    await User.updateMany({}, { 
      $set: { 
        walletBalance: 0,
        walletTransactions: [], // CLEAR LEGACY HISTORY
        averageRating: 0,
        totalRides: 0,
        restrictedUntil: null,
        isRestricted: false
      } 
    });
    
    console.log('\n✨ SYSTEM RESET COMPLETE ✨');
    console.log('- All Rides/Bookings deleted');
    console.log('- Wallet histories wiped');
    console.log('- All users reset to ₹0 wallet balance');
    console.log('- All restrictions/flags cleared');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
  }
}

reset();
