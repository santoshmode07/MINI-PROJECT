const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Ride = require('./models/Ride');
const User = require('./models/User');
const { haversineDistance, calculatePartialFare } = require('./utils/fareHelper');

// Import logic from controller (mocked here or we can just use the controller functions if we export them)
const { getAllRides } = require('./controllers/rideController');

async function testScenario(name, query, user) {
  console.log(`\n--- Testing Scenario: ${name} ---`);
  const req = { query, user };
  const res = {
    status: (code) => ({
      json: (data) => {
        console.log(`Result: ${data.success ? '✅' : '❌'} - Count: ${data.count}`);
        if (data.count > 0) {
           const match = data.data.find(r => r._id.toString() === '69b2a67a2ff99719eb7dc80d');
           if (match) {
             console.log(`Ride 69b2a67a2ff99719eb7dc80d FOUND!`);
           } else {
             console.log(`Ride 69b2a67a2ff99719eb7dc80d NOT FOUND in pool.`);
           }
        }
      }
    })
  };
  await getAllRides(req, res);
}

async function runAllTests() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find a test user
    const user = await User.findOne({ gender: 'male' });
    if (!user) {
        console.error("No male user found for testing.");
        process.exit(1);
    }

    const targetRideId = '69b2a67a2ff99719eb7dc80d';
    // Coordinates for Vizag area
    const vizagLat = 17.760167;
    const vizagLng = 83.321560;
    // Midway point (e.g., Eluru/Rajahmundry area)
    const midwayLat = 17.0000;
    const midwayLng = 81.7800;

    // SCENARIO 1: Text Search "Visakhapatnam"
    await testScenario("Text: Visakhapatnam", { to: "Visakhapatnam" }, user);

    // SCENARIO 2: Text Search "Vizag" (Alias)
    await testScenario("Text: Vizag (Alias)", { to: "Vizag" }, user);

    // SCENARIO 3: Text Search "Hanumanthuwaka Visakhapatnam"
    await testScenario("Text: Hanumanthuwaka Visakhapatnam", { to: "Hanumanthuwaka Visakhapatnam" }, user);

    // SCENARIO 4: GPS Search (End Destination)
    await testScenario("GPS: Visakhapatnam Coordinates", { 
      passengerLat: 16.5052416, passengerLng: 80.6682624, // Starting from Vijayawada
      destinationLat: vizagLat, destinationLng: vizagLng 
    }, user);

    // SCENARIO 5: GPS Search (Midway City)
    await testScenario("GPS: Midway City Coordinates", { 
      passengerLat: 16.5052416, passengerLng: 80.6682624,
      destinationLat: midwayLat, destinationLng: midwayLng 
    }, user);

    // SCENARIO 6: No GPS Input (Text only)
    await testScenario("No GPS: Only Text", { to: "Visakhapatnam" }, user);

    // SCENARIO 7: Today's Date (Assuming ride is future)
    await testScenario("Date: Today", { to: "Visakhapatnam", date: new Date().toISOString().split('T')[0] }, user);

    // SCENARIO 8: Tomorrow's Date (Match)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await testScenario("Date: Tomorrow", { to: "Visakhapatnam", date: tomorrow.toISOString().split('T')[0] }, user);

    // SCENARIO 9: No Date (Browse All)
    await testScenario("Date: None (Browse All)", { to: "Visakhapatnam" }, user);

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

runAllTests();
