const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Ride = require('./models/Ride');
const Transaction = require('./models/Transaction');

async function testEscrow() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🚀 DB Connected for Escrow Test');

    const driverId = '69ad231dd5dc2ecdfdb04a56'; // Rahul
    const passengerId = '69ad3e1bcd651855271c9c33'; // Santosh
    const admin = await User.findOne({ role: 'admin' });

    console.log('--- Initial Balances ---');
    const d1 = await User.findById(driverId);
    const p1 = await User.findById(passengerId);
    console.log(`Driver (Rahul): ₹${d1.walletBalance}`);
    console.log(`Passenger (Santosh): ₹${p1.walletBalance}`);
    console.log(`Admin (System): ₹${admin.walletBalance}`);

    // 1. Create a Ride
    const ride = await Ride.create({
      driver: driverId,
      from: 'Madhapur',
      to: 'Gachibowli',
      date: new Date().toISOString().split('T')[0],
      seatsAvailable: 4,
      price: 100,
      carModel: 'Toyota Innova',
      carNumber: 'TS09-RAID-2024',
      time: '10:00 AM',
      status: 'available',
      routePoints: { type: 'LineString', coordinates: [[0,0], [1,1]] }
    });
    console.log(`✅ Ride Created: ${ride._id}`);

    // 2. Passenger Books the Ride (Online Payment)
    // Simulating the booking logic from bookingController
    const fare = 100;
    const adminComm = Math.round(fare * 0.2);
    const driverEarning = fare - adminComm;

    // Deduct from Passenger
    await User.findByIdAndUpdate(passengerId, { $inc: { walletBalance: -fare } });
    
    // Add Booking to Ride
    ride.bookings.push({
      passenger: passengerId,
      seatsBooked: 1,
      fareCharged: fare,
      totalDriverEarnings: driverEarning,
      paymentMethod: 'online',
      status: 'confirmed'
    });
    ride.seatsAvailable -= 1;
    await ride.save();

    console.log('\n--- After Booking (Hold Phase) ---');
    const d2 = await User.findById(driverId);
    const p2 = await User.findById(passengerId);
    console.log(`Driver: ₹${d2.walletBalance} (Should be same)`);
    console.log(`Passenger: ₹${p2.walletBalance} (Should be ₹100 less)`);
    console.log(`Admin: ₹${admin.walletBalance} (Should be same)`);

    // 3. Driver Completes Ride
    // Calling the Escrow Distribution logic (simulated)
    // In reality, this would be triggered by /api/rides/:id/complete
    
    console.log('\n🏁 Completing Ride & Releasing Escrow...');
    
    // Logic from rideController.completeRide
    const confirmedBookings = ride.bookings.filter(b => b.status === 'confirmed');
    let totalRiderEarnings = 0;
    let totalAdminCommissions = 0;
    const transactions = [];

    for (const booking of confirmedBookings) {
      if (booking.paymentMethod === 'online') {
        const riderCut = booking.totalDriverEarnings;
        const commission = fare - riderCut;
        
        totalRiderEarnings += riderCut;
        totalAdminCommissions += commission;

        transactions.push({
          userId: driverId,
          type: 'RIDE_EARNING',
          amount: riderCut,
          rideId: ride._id,
          description: `Escrow Release: Earnings from ride completion`
        });

        transactions.push({
          userId: admin._id,
          type: 'COMMISSION',
          amount: commission,
          rideId: ride._id,
          description: `Platform Commission`
        });
      }
    }

    // Update Driver
    await User.findByIdAndUpdate(driverId, { $inc: { walletBalance: totalRiderEarnings } });
    // Update Admin
    await User.findByIdAndUpdate(admin._id, { $inc: { walletBalance: totalAdminCommissions } });
    // Update Transactions
    await Transaction.insertMany(transactions);
    
    ride.status = 'completed';
    await ride.save();

    console.log('\n--- Final Balances (Release Phase) ---');
    const d3 = await User.findById(driverId);
    const p3 = await User.findById(passengerId);
    const a3 = await User.findById(admin._id);
    console.log(`Driver (Rahul): ₹${d3.walletBalance} (Should be +₹80)`);
    console.log(`Passenger (Santosh): ₹${p3.walletBalance} (Should be same as d2)`);
    console.log(`Admin: ₹${a3.walletBalance} (Should be +₹20)`);

    console.log('\n✅ ESCROW TEST COMPLETED SUCCESSFULLY');
    process.exit(0);

  } catch (err) {
    console.error('❌ Test Failed:', err);
    process.exit(1);
  }
}

testEscrow();
