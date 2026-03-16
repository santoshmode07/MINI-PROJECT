const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Ride = require('./models/Ride');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { bookRide } = require('./controllers/bookingController');

async function testBookingNotification() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const driver = await User.findOne({ name: 'Nani' });
    const passenger = await User.findOne({ name: 'Rahul' });

    // Create a fresh ride that won't expire
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const ride = await Ride.create({
        driver: driver._id,
        from: "Vijayawada",
        to: "Gachibowli",
        simplifiedFrom: "vijayawada",
        simplifiedTo: "gachibowli",
        fromCoordinates: { type: 'Point', coordinates: [80.66, 16.50] },
        toCoordinates: { type: 'Point', coordinates: [83.39, 17.44] },
        routePoints: { type: 'LineString', coordinates: [[80.66, 16.50], [83.39, 17.44]] },
        date: tomorrow,
        time: "10:00",
        seatsAvailable: 4,
        carModel: "Tesla",
        carNumber: "AP07 TEST",
        price: 500,
        genderPreference: 'any',
        driverGender: driver.gender,
        expiresAt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000),
        status: 'available',
        bookings: []
    });

    console.log(`Created test ride: ${ride._id}`);

    const req = {
        user: passenger,
        body: {
            rideId: ride._id,
            boardingAddress: "Vijayawada",
            boardingCoordinates: [80.66, 16.50],
            dropoffAddress: "Gachibowli",
            dropoffCoordinates: [83.39, 17.44],
            paymentMethod: "cash"
        }
    };
    const res = {
        status: (code) => ({
            json: (data) => console.log(`[Booking Response ${code}]`, data.message)
        })
    };

    await bookRide(req, res);

    const notification = await Notification.findOne({ user: driver._id, type: 'NEW_BOOKING' });
    if (notification) {
        console.log("✅ Success: Notification created for driver!");
        console.log("Message:", notification.message);
    } else {
        console.log("❌ Error: No notification found.");
    }

    // Cleanup
    await Ride.findByIdAndDelete(ride._id);
    await Notification.deleteMany({ user: driver._id });

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

testBookingNotification();
