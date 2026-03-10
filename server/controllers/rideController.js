const Ride = require('../models/Ride');
const User = require('../models/User');
const Review = require('../models/Review');
const { haversineDistance, calculatePartialFare } = require('../utils/fareHelper');

// Helper: Get route from OSRM (completely free, no API key)
const getRoutePoints = async (fromCoords, toCoords) => {
  try {
    if (!fromCoords || fromCoords.length < 2 || !toCoords || toCoords.length < 2) {
      return [];
    }
    // alternatives=true finds all main highway options (e.g. AH45 vs NH48)
    const url =
      `http://router.project-osrm.org/route/v1/driving/` +
      `${fromCoords[0]},${fromCoords[1]};` +
      `${toCoords[0]},${toCoords[1]}` +
      `?overview=full&geometries=geojson&alternatives=true`;

    const response = await fetch(url);
    const data     = await response.json();

    if (!data.routes || data.routes.length === 0) {
      console.log(`[OSRM] No routes found for ${fromCoords} to ${toCoords}`);
      return [fromCoords, toCoords];
    }
    
    const allRoutesKeyPoints = [];

    // Extract sampled points from ALL returned routes
    data.routes.forEach((route, index) => {
      const allPoints = route.geometry.coordinates;
      let sampled = [];
      // Increase sampling to 100 points per route for better 20km sphere matching
      if (allPoints.length <= 100) {
        sampled = allPoints;
      } else {
        const step = Math.floor(allPoints.length / 100);
        sampled = allPoints.filter((_, i) => i % step === 0);
      }
      allRoutesKeyPoints.push(...sampled);
      console.log(`[OSRM] Route ${index + 1}: Sampled ${sampled.length} points.`);
    });

    // Add explicit start/end to be safe
    allRoutesKeyPoints.unshift(fromCoords);
    allRoutesKeyPoints.push(toCoords);

    return allRoutesKeyPoints;
  } catch (error) {
    console.error(`[OSRM] API Critical Error: ${error.message} (Is the network or OSRM service down?)`);
    return [fromCoords, toCoords];
  }
};

// @desc    Offer a new ride
// @route   POST /api/rides/offer
// @access  Private (Driver)
exports.offerRide = async (req, res) => {
  try {
    const { from, to, date, time, seatsAvailable, carModel, carNumber, price, fromCoordinates, toCoordinates, waitingTime } = req.body;
    let { genderPreference } = req.body;

    // STEP 1 — Auto-capture driverGender from logged-in user
    const driverGender = req.user.gender;

    // RULE: Female riders (drivers) are locked to 'female-only' preference
    if (driverGender === 'female') {
      genderPreference = 'female-only';
    } 
    // RULE: Male riders (drivers) can choose 'male-only' or 'any'
    else if (driverGender === 'male') {
      if (!['male-only', 'any'].includes(genderPreference)) {
        genderPreference = 'male-only'; // default for male if invalid
      }
    }

    // STEP 3 — Calculate expiresAt
    const departureDateTime = new Date(`${date}T${time}`);
    const wTime = waitingTime || 10;
    const expiresAt = new Date(
      departureDateTime.getTime() + wTime * 60 * 1000
    );

    const fCoords = (fromCoordinates && Array.isArray(fromCoordinates) && fromCoordinates.length === 2) ? fromCoordinates : [];
    const tCoords = (toCoordinates && Array.isArray(toCoordinates) && toCoordinates.length === 2) ? toCoordinates : [];

    const ride = await Ride.create({
      driver: req.user._id,
      from,
      to,
      fromCoordinates: { type: 'Point', coordinates: fCoords },
      toCoordinates: { type: 'Point', coordinates: tCoords },
      routePoints: { type: 'LineString', coordinates: await getRoutePoints(fCoords, tCoords) },
      date,
      time,
      seatsAvailable,
      carModel,
      carNumber,
      price,
      genderPreference,
      driverGender,
      expiresAt,
      waitingTime: wTime,
      bookings: []
    });

    res.status(201).json({
      success: true,
      data: ride
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all available rides (Smart GPS Search)
// @route   GET /api/rides
// @access  Private
exports.getAllRides = async (req, res) => {
  try {
    const { from, to, date, passengerLat, passengerLng, destinationLat, destinationLng } = req.query;

    // Use query if coordinates are not provided, or fallback to text search if no GPS
    let query = { 
      status: 'available', 
      seatsAvailable: { $gt: 0 },
      expiresAt: { $gt: new Date() }
    };

    let startOfDay, endOfDay;
    if (date && date !== 'null' && date !== 'undefined' && date.trim() !== '') {
        const searchDate = new Date(date);
        startOfDay = new Date(searchDate.setHours(0,0,0,0));
        endOfDay = new Date(searchDate.setHours(23,59,59,999));
        query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Safety First: Gender-Based Filtering
    const genderQuery = req.user.gender === 'male'
      ? { genderPreference: { $in: ['any', 'male-only'] } }
      : { genderPreference: { $in: ['any', 'female-only'] } };

    // Smart GPS Logic
    if (passengerLat && passengerLng && destinationLat && destinationLng) {
      const passengerCoords   = [parseFloat(passengerLng),  parseFloat(passengerLat)];
      const destinationCoords = [parseFloat(destinationLng), parseFloat(destinationLat)];

      const candidateRides = await Ride.find({
        ...query,
        ...genderQuery,
        fromCoordinates: {
          $near: {
            $geometry: {
              type:        'Point',
              coordinates: passengerCoords
            },
            $maxDistance: 30000 // Boarding Rule: Within 30km of Raider Start
          }
        }
      }).populate('driver', 'name averageRating isVerified profilePhoto phone')
        .populate('bookings.passenger', 'gender');

      console.log(`[SmartRadar] Analyzing ${candidateRides.length} potential rides for path proximity...`);

      const matchingRides = candidateRides
        .filter(ride => {
          const rPoints = (ride.routePoints && ride.routePoints.coordinates && ride.routePoints.coordinates.length >= 2) 
            ? ride.routePoints.coordinates 
            : [ride.fromCoordinates.coordinates, ride.toCoordinates.coordinates];
          
          let minPerpDist = Infinity;
          let matched = false;

          for (let i = 0; i < rPoints.length - 1; i++) {
             const start = rPoints[i];
             const end = rPoints[i+1];
             
             const d1 = haversineDistance(start, destinationCoords);
             const d2 = haversineDistance(end, destinationCoords);
             const dTotal = haversineDistance(start, end);

             // 1. Direct point match (20km sphere)
             if (d1 <= 20 || d2 <= 20) {
                minPerpDist = Math.min(minPerpDist, d1, d2);
                matched = true;
                break;
             }

             // 2. Segment match (Is destination near the line between A and B?)
             // We use the Triangle Inequality: if P is near AB, then AP + PB is close to AB.
             const detour = (d1 + d2) - dTotal;
             if (detour <= 5) { // 5km detouring tolerance for segment check
                // Calculate perpendicular distance to the segment
                const s = (d1 + d2 + dTotal) / 2;
                const tempArea = s * (s - d1) * (s - d2) * (s - dTotal);
                const area = tempArea > 0 ? Math.sqrt(tempArea) : 0;
                const perpDist = dTotal > 0 ? (2 * area) / dTotal : d1;
                
                minPerpDist = Math.min(minPerpDist, perpDist);
                if (perpDist <= 20) {
                   matched = true;
                   break;
                }
             }
          }

          if (matched) {
             console.log(`[SmartRadar] ✅ MATCH: Ride ${ride._id} is ${minPerpDist.toFixed(1)}km from your target.`);
             return true;
          }

          console.log(`[SmartRadar] ❌ REJECT: Ride ${ride._id} is ${minPerpDist.toFixed(1)}km away (20km limit).`);
          return false;
        })
        .map(ride => {
          const distanceToOrigin = haversineDistance(passengerCoords, ride.fromCoordinates.coordinates).toFixed(1);
          
          const fareForPassenger = calculatePartialFare(
            ride.fromCoordinates.coordinates, 
            ride.toCoordinates.coordinates,   
            destinationCoords,                
            ride.price
          );
          
          const confirmed = (ride.bookings || []).filter(b => b.status === 'confirmed');
          const breakdown = {
            male: confirmed.filter(b => b.passenger?.gender === 'male').length,
            female: confirmed.filter(b => b.passenger?.gender === 'female').length
          };
          
          const bookingDetails = {
            totalBooked:   confirmed.length,
            fareForPassenger,
            distanceToRider: `${distanceToOrigin} km to meeting point`
          };

          return { ...ride.toObject(), passengerBreakdown: breakdown, bookingDetails, dynamicFare: fareForPassenger };
        });

      return res.status(200).json({ success: true, count: matchingRides.length, data: matchingRides });
    }

    // Default Fallback to Text/Generic Search
    if (from && from !== 'null' && from.trim() !== '') query.from = { $regex: from.trim(), $options: 'i' };
    if (to && to !== 'null' && to.trim() !== '') query.to = { $regex: to.trim(), $options: 'i' };

    const rides = await Ride.find({ ...query, ...genderQuery })
      .populate('driver', 'name averageRating isVerified profilePhoto phone')
      .populate('bookings.passenger', 'gender');

    const formattedRides = rides.map(ride => {
      const confirmed = (ride.bookings || []).filter(b => b.status === 'confirmed');
      const breakdown = {
        male: confirmed.filter(b => b.passenger?.gender === 'male').length,
        female: confirmed.filter(b => b.passenger?.gender === 'female').length
      };

      return {
        ...ride.toObject(),
        passengerBreakdown: breakdown,
        bookingDetails: {
          totalBooked: confirmed.length,
          fareForPassenger: ride.price,
          distanceToRider: "Location unknown"
        },
        dynamicFare: ride.price
      };
    });

    res.status(200).json({ success: true, count: formattedRides.length, data: formattedRides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single ride details with safety data
// @route   GET /api/rides/:id
// @access  Private
exports.getRideById = async (req, res) => {
  try {
    const { passengerLat, passengerLng, destinationLat, destinationLng } = req.query;

    // Ensure deep population of bookings
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name gender phone avatar isVerified licenseNumber aadhaarNumber averageRating totalRatings profilePhoto')
      .populate('bookings.passenger', 'name gender avatar phone averageRating isVerified profilePhoto');
    
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    // Mask sensitive data for privacy
    if (ride.driver && ride.driver.aadhaarNumber) {
        const aadh = ride.driver.aadhaarNumber;
        ride.driver.aadhaarNumber = `XXXX-XXXX-${aadh.slice(-4)}`;
    }

    const confirmed = (ride.bookings || []).filter(b => b.status === 'confirmed');
    const breakdown = {
      male: confirmed.filter(b => b.passenger?.gender === 'male').length,
      female: confirmed.filter(b => b.passenger?.gender === 'female').length
    };

    const reviews = await Review.find({ subject: ride.driver._id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Dynamic Fare & Distance Logic
    let dynamicFare = ride.price;
    let distanceToRider = "Detecting...";
    
    // Safety Message
    let safetyMessage = "";
    if (ride.driverGender === 'female') {
       safetyMessage = "🛡️ Verified Female-only RAIDER";
    } else if (ride.genderPreference === 'male-only') {
       safetyMessage = "👥 ALL-MALE TRANSIT";
    } else {
       safetyMessage = "VERIFIED COMMUNITY PROTOCOL";
    }

    if (passengerLat && passengerLng && destinationLat && destinationLng) {
      const pDropoff = [parseFloat(destinationLng), parseFloat(destinationLat)];
      
      // LOGIC: Fare is calculated from RAIDER START to CUSTOMER DROP-OFF (midway)
      dynamicFare = calculatePartialFare(
        ride.fromCoordinates.coordinates, // Driver Origin
        ride.toCoordinates.coordinates,   // Driver Destination
        pDropoff,                         // Passenger Drop-off
        ride.price
      );
    }

    return res.status(200).json({ 
      success: true, 
      data: {
        ...ride.toObject(),
        passengerBreakdown: breakdown,
        driverReviews: reviews,
        dynamicFare,
        safetyMessage,
        bookingDetails: {
           distanceToRider: "Calculating..."
        }
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
// @desc    Get rides offered by current user
exports.getMyOffers = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: rides.length, data: rides });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
