const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Ride = require('./models/Ride');
const User = require('./models/User');

const CITY_ALIASES = {
  'vizag': 'visakhapatnam',
  'hyd': 'hyderabad',
  'blr': 'bangalore',
  'bengaluru': 'bangalore',
  'vja': 'vijayawada',
  'chennai': 'madras',
  'mumbai': 'bombay',
  'pune': 'poona',
  'gurgaon': 'gurugram'
};

const simplifyAddress = (text) => {
  if (!text) return "";
  let clean = text.toLowerCase()
    .replace(/\b\d{6}\b/g, '')
    .replace(/\b(india|andhra pradesh|telangana|karnataka|tamil nadu|maharashtra|uttar pradesh|delhi)\b/g, '')
    .replace(/[^\w\s]/g, ' ')
    .trim();
  
  Object.keys(CITY_ALIASES).forEach(alias => {
    const reg = new RegExp(`\\b${alias}\\b`, 'g');
    clean = clean.replace(reg, CITY_ALIASES[alias]);
  });
  
  const words = clean.split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, 3).join(' ');
};

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const rides = await Ride.find({}).populate('driver');
    console.log(`Migrating ${rides.length} rides...`);

    for (const ride of rides) {
      const updateData = {
        simplifiedFrom: simplifyAddress(ride.from),
        simplifiedTo: simplifyAddress(ride.to),
        routePointsStatus: ride.routePointsStatus || (ride.routePoints?.coordinates?.length > 2 ? 'saved' : 'pending')
      };
      
      if (!ride.driverGender && ride.driver) {
        updateData.driverGender = ride.driver.gender;
      }
      
      // Use updateOne to bypass validation for migration
      await Ride.updateOne({ _id: ride._id }, { $set: updateData });
      console.log(`Updated ride ${ride._id}`);
    }

    console.log('Migration complete!');
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

migrate();
