const mongoose = require('mongoose');
const User = require('./models/User');
const Ride = require('./models/Ride');
require('dotenv').config({ path: './.env' });

async function runTests() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- Phase 3 Backend Internal Test ---');

    // 1. Cleanup old test data
    await User.deleteMany({ email: /test-phase3/ });
    await Ride.deleteMany({ from: 'TestCity' });

    // 2. Setup Driver & Passenger
    const maleDriver = await User.create({
      name: 'Male Driver',
      email: 'driver-test-phase3@example.com',
      password: 'password123',
      gender: 'male',
      phone: '9000000001'
    });
    const femaleDriver = await User.create({
        name: 'Female Driver',
        email: 'female-test-phase3@example.com',
        password: 'password123',
        gender: 'female',
        phone: '9000000002'
      });
    const malePass = await User.create({
      name: 'Male Pass',
      email: 'pass-test-phase3@example.com',
      password: 'password123',
      gender: 'male',
      phone: '9000000003'
    });

    console.log('✅ Users Created');

    // 3. Create a Ride (Chennai to Bangalore)
    const ride = await Ride.create({
      driver: maleDriver._id,
      from: 'TestCity X',
      to: 'TestCity Y',
      fromCoordinates: { type: 'Point', coordinates: [80.2, 13.0] },
      toCoordinates: { type: 'Point', coordinates: [77.6, 12.9] },
      routePoints: { type: 'LineString', coordinates: [[80.2, 13.0], [77.6, 12.9]] },
      date: new Date(Date.now() + 86400000), // tomorrow
      time: '10:00',
      seatsAvailable: 1,
      carModel: 'Test Car',
      carNumber: 'TS01AB1234',
      price: 500,
      genderPreference: 'any',
      driverGender: 'male',
      status: 'available'
    });

    console.log('✅ Ride Created ID:', ride._id);

    // 4. Test Booking (Male Pass books Male Driver)
    // We'll call the controller method directly for simplicity in this terminal test
    const { bookRide } = require('./controllers/bookingController');
    
    // Mock req/res
    const req = {
      user: malePass,
      body: {
        rideId: ride._id,
        boardingAddress: 'Start point',
        boardingCoordinates: [80.2, 13.0],
        dropoffAddress: 'Mid point',
        dropoffCoordinates: [79.1, 12.9], // Vellore-ish
        paymentMethod: 'cash'
      }
    };
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`[POST /api/bookings] Status: ${code}`, JSON.stringify(data));
          return data;
        }
      })
    };

    console.log('\n--- Test 1: Valid Booking ---');
    await bookRide(req, res);

    // 5. Verify Seat Count
    const updatedRide = await Ride.findById(ride._id);
    console.log('Seat Count after booking (should be 0):', updatedRide.seatsAvailable);

    // 6. Test Double Booking
    console.log('\n--- Test 2: Double Booking (Should 409) ---');
    await bookRide(req, res);

    // 7. Test Driver books own ride
    console.log('\n--- Test 3: Driver books own ride (Should 403) ---');
    const reqOwn = { ...req, user: maleDriver };
    await bookRide(reqOwn, res);

    // 8. Test Female driver / Male passenger
    const femaleRide = await Ride.create({
        driver: femaleDriver._id,
        from: 'TestCity X',
        to: 'TestCity Y',
        fromCoordinates: { type: 'Point', coordinates: [80.2, 13.0] },
        toCoordinates: { type: 'Point', coordinates: [77.6, 12.9] },
        routePoints: { type: 'LineString', coordinates: [[80.2, 13.0], [77.6, 12.9]] },
        date: new Date(Date.now() + 86400000),
        time: '12:00',
        seatsAvailable: 4,
        carModel: 'Lady Car',
        carNumber: 'TN01XY9999',
        price: 400,
        genderPreference: 'female-only',
        driverGender: 'female',
        status: 'available'
    });
    console.log('\n--- Test 4: Male books female-only ride (Should 403) ---');
    const reqCross = { ...req, body: { ...req.body, rideId: femaleRide._id } };
    await bookRide(reqCross, res);

    // Cleanup
    await User.deleteMany({ email: /test-phase3/ });
    await Ride.deleteMany({ from: 'TestCity' });
    console.log('\n✅ Cleanup done. Tests Completed.');
    
    process.exit(0);
  } catch (err) {
    console.error('Test Error:', err);
    process.exit(1);
  }
}

runTests();
