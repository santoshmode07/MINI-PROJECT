const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Ride = require('./models/Ride');
const User = require('./models/User');
const { haversineDistance } = require('./utils/fareHelper');

async function simulateSearch() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // MOCK SEARCH PARAMS
    const from = "Bharathi Nagar, Patamata, Vijayawada, Vijayawada (Urban), NTR, Andhra Pradesh, 520001, India";
    const to = "Hanumanthuwaka, Visakhapatnam";
    const passengerLat = 16.5052416;
    const passengerLng = 80.6682624;
    const destinationLat = 17.76016745940662;
    const destinationLng = 83.32156022584441;
    const userGender = "male";

    console.log(`[Simulation] Searching from: [${passengerLng}, ${passengerLat}] to [${destinationLng}, ${destinationLat}]`);

    const query = {
      status: 'available',
      seatsAvailable: { $gt: 0 },
      expiresAt: { $gt: new Date() }
    };

    const genderQuery = userGender === 'male'
      ? { genderPreference: { $in: ['any', 'male-only'] } }
      : { genderPreference: { $in: ['any', 'female-only'] } };

    console.log(`[Simulation] Mongo Query: ${JSON.stringify({ ...query, ...genderQuery })}`);

    const candidateRides = await Ride.find({
      ...query,
      ...genderQuery,
      fromCoordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [passengerLng, passengerLat]
          },
          $maxDistance: 30000
        }
      }
    });

    console.log(`[Simulation] Found ${candidateRides.length} candidate rides within 30km.`);

    const matchingRides = candidateRides.filter(ride => {
      const rPoints = ride.routePoints?.coordinates || [ride.fromCoordinates.coordinates, ride.toCoordinates.coordinates];
      const destCoords = [destinationLng, destinationLat];
      
      let matched = false;
      for (let i = 0; i < rPoints.length - 1; i++) {
        const start = rPoints[i];
        const end = rPoints[i+1];
        const d1 = haversineDistance(start, destCoords);
        const d2 = haversineDistance(end, destCoords);
        
        if (d1 <= 20 || d2 <= 20) {
          matched = true;
          break;
        }
      }
      return matched;
    });

    console.log(`[Simulation] Found ${matchingRides.length} rides after path proximity check.`);

    if (matchingRides.length > 0) {
      console.log('--- Matching Ride Details ---');
      console.log('ID:', matchingRides[0]._id);
      console.log('Driver Gender:', matchingRides[0].driverGender);
      console.log('---');
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

simulateSearch();
