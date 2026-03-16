const Ride = require('../models/Ride');
const User = require('../models/User');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { haversineDistance, calculatePartialFare } = require('../utils/fareHelper');

// @desc    Complete a ride (Driver only)
// @route   PATCH /api/rides/:id/complete
// @access  Private (Driver)
exports.completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (ride.status === 'completed') return res.status(400).json({ success: false, message: 'Ride already completed' });
    if (ride.status === 'cancelled') return res.status(400).json({ success: false, message: 'Cannot complete a cancelled ride' });

    ride.status = 'completed';
    await ride.save();

    // Increment Driver Stats
    const driver = await User.findById(req.user._id);
    driver.totalCompletedRides += 1;
    driver.trustScore = Math.min(100, driver.trustScore + 5); // +5 for completion
    
    // Streak bonus: every 10 rides completion
    if (driver.totalCompletedRides > 0 && driver.totalCompletedRides % 10 === 0) {
       driver.trustScore = Math.min(100, driver.trustScore + 10);
       console.log(`[Trust] 🎖️ STREAK BONUS: Driver ${driver._id} completed 10th ride.`);
    }
    
    await driver.save();

    console.log(`[RideComplete] ✅ Ride ${ride._id} completed by ${req.user._id}. Trust Score: ${driver.trustScore}`);

    res.status(200).json({ success: true, message: 'Ride marked as completed. Trust Score increased!', trustScore: driver.trustScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// EDGE CASE 5 & 6: Address Simplification & Alias Dictionary
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
  // Clean text: remove pin codes (6 digits), country, state names, special chars
  let clean = text.toLowerCase()
    .replace(/\b\d{6}\b/g, '') // Pins
    .replace(/\b(india|andhra pradesh|telangana|karnataka|tamil nadu|maharashtra|uttar pradesh|delhi)\b/g, '')
    .replace(/[^\w\s]/g, ' ')
    .trim();
  
  // Replace aliases
  Object.keys(CITY_ALIASES).forEach(alias => {
    const reg = new RegExp(`\\b${alias}\\b`, 'g');
    clean = clean.replace(reg, CITY_ALIASES[alias]);
  });
  
  // Extract key words (first 3 important words)
  const words = clean.split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, 3).join(' ');
};

// EDGE CASE 9: Background Nominatim Fallback
const getCoordsFromText = async (address) => {
  try {
     const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
     const res = await fetch(url, { 
       headers: { 'User-Agent': 'RaidDosthi-App' },
       signal: AbortSignal.timeout(3000)
     });
     const data = await res.json();
     if (data && data.length > 0) {
        return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
     }
  } catch (err) {
     console.error(`[Nominatim Fallback] Error: ${err.message}`);
  }
  return null;
};

// EDGE CASE 4: Background OSRM Retry Job
exports.startCronJobs = () => {
  console.log(`[Cron] 🕒 Initializing search hardening background tasks...`);
  setInterval(async () => {
    try {
      const pendingRides = await Ride.find({ 
        routePointsStatus: 'pending',
        status: 'available',
        expiresAt: { $gt: new Date() }
      }).limit(5);

      if (pendingRides.length > 0) {
        console.log(`[Cron] Retrying OSRM for ${pendingRides.length} pending rides...`);
        for (const ride of pendingRides) {
           const points = await getRoutePoints(ride.fromCoordinates.coordinates, ride.toCoordinates.coordinates);
           if (points.length > 2) {
             ride.routePoints = { type: 'LineString', coordinates: points };
             ride.routePointsStatus = 'saved';
             await ride.save();
             console.log(`[Cron] ✅ RECOVERED: Ride ${ride._id} now has route points.`);
           }
        }
      }
    } catch (err) {
      console.error(`[Cron] Error: ${err.message}`);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
};

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

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data     = await response.json();

    if (!data.routes || data.routes.length === 0) {
      console.log(`[OSRM] ❌ FAILED: No routes found for ${fromCoords} to ${toCoords}`);
      return [fromCoords, toCoords];
    }
    
    console.log(`[OSRM] ✅ SUCCESS: Found ${data.routes.length} highway options.`);
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
    let { from, to, date, time, seatsAvailable, carModel, carNumber, price, fromCoordinates, toCoordinates, waitingTime, genderPreference } = req.body;
    // RESTRICTION CHECK (Phase 4)
    if (req.user.restrictedUntil && new Date(req.user.restrictedUntil) > new Date()) {
       return res.status(403).json({ 
         success: false, 
         message: `Your account is restricted until ${new Date(req.user.restrictedUntil).toLocaleString()} due to past cancellations or no-show reports.` 
       });
    }

    // EDGE CASE 12: Driver Gender Validation
    const driverGender = req.user.gender;
    if (!driverGender) {
       throw new Error("Safety Protocol Error: Driver gender must be verified before offering a ride.");
    }

    // GENDER LOCKS
    if (driverGender === 'female') {
      genderPreference = 'female-only';
    } else {
      // For male drivers, only allow 'male-only' or 'any'
      if (!['male-only', 'any'].includes(genderPreference)) {
        genderPreference = 'male-only'; 
      }
    }

    // STEP 3 — Calculate expiresAt
    const departureDateTime = new Date(`${date}T${time}`);
    const wTime = waitingTime || 10;
    const expiresAt = new Date(departureDateTime.getTime() + wTime * 60 * 1000);

    // EDGE CASE 3 & 9: Coordinate Validation & Fallback
    let fCoords = (fromCoordinates && Array.isArray(fromCoordinates) && fromCoordinates.length === 2 && !fromCoordinates.includes(0)) ? fromCoordinates : null;
    let tCoords = (toCoordinates && Array.isArray(toCoordinates) && toCoordinates.length === 2 && !toCoordinates.includes(0)) ? toCoordinates : null;

    // Background Geocoding if missing
    if (!fCoords) fCoords = await getCoordsFromText(from) || [0,0];
    if (!tCoords) tCoords = await getCoordsFromText(to) || [0,0];

    // OSRM Call with Status Track (Requirement: Valid LineString for 2dsphere)
    let rPoints = [fCoords, tCoords]; 
    let rStatus = 'pending';
    if (fCoords[0] !== 0 && tCoords[0] !== 0) {
       const points = await getRoutePoints(fCoords, tCoords);
       if (points && points.length >= 2) {
         rPoints = points;
         rStatus = 'saved';
       }
    }

    const ride = await Ride.create({
      driver: req.user._id,
      from,
      to,
      simplifiedFrom: simplifyAddress(from),
      simplifiedTo: simplifyAddress(to),
      fromCoordinates: { type: 'Point', coordinates: fCoords },
      toCoordinates: { type: 'Point', coordinates: tCoords },
      routePoints: { type: 'LineString', coordinates: rPoints },
      routePointsStatus: rStatus,
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

    // 1. Respond INSTANTLY to the user
    res.status(201).json({
      success: true,
      message: "Ride offer created! We are optimizing your route in the background.",
      data: ride
    });

    // 2. Perform heavy OSRM calculation in the BACKGROUND
    if (fCoords[0] !== 0 && tCoords[0] !== 0 && rStatus === 'pending') {
       // We don't 'await' this so the function finishes and sends the response immediately
       getRoutePoints(fCoords, tCoords).then(async (points) => {
          if (points && points.length > 2) {
             ride.routePoints = { type: 'LineString', coordinates: points };
             ride.routePointsStatus = 'saved';
             await ride.save();
             console.log(`[Background-OSRM] ✅ Route optimized for Ride ${ride._id}`);
          }
       }).catch(err => console.error(`[Background-OSRM] ❌ Failed: ${err.message}`));
    }
  } catch (error) {
    console.error(`[RideOffer] ❌ FAILED: ${error.message}`);
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
    // Who is searching? (Logging)
    const passengerId = req.user._id;
    const passengerGender = req.user.gender;
    console.log(`[RideSearch] 🔍 SEARCH START: User ${passengerId} (${passengerGender})`);

    // EDGE CASE 15: Parameter Validation & Parsing
    let { 
      from, to, date, 
      passengerLat, passengerLng, 
      destinationLat, destinationLng 
    } = req.query;

    const pLat = parseFloat(passengerLat);
    const pLng = parseFloat(passengerLng);
    const dLat = parseFloat(destinationLat);
    const dLng = parseFloat(destinationLng);

    const hasSourceGPS = !isNaN(pLat) && !isNaN(pLng) && pLat !== 0 && pLng !== 0;
    const hasDestGPS = !isNaN(dLat) && !isNaN(dLng) && dLat !== 0 && dLng !== 0;

    // EDGE CASE 13: Strict Expiry Filter
    let query = { 
      status: 'available', 
      seatsAvailable: { $gt: 0 },
      expiresAt: { $gt: new Date() } // Hard filter for expiry
    };

    // EDGE CASE 1: Date Filter (Flexible)
    // If no date is provided, we don't add query.date, showing all future rides.
    if (date && date !== 'null' && date !== 'undefined' && date.trim() !== '') {
        const searchDate = new Date(date);
        const startOfDay = new Date(searchDate.setHours(0,0,0,0));
        const endOfDay = new Date(searchDate.setHours(23,59,59,999));
        query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // EDGE CASE 12 & Safety
    const genderQuery = passengerGender === 'male'
      ? { genderPreference: { $in: ['any', 'male-only'] } }
      : { genderPreference: { $in: ['any', 'female-only'] } };

    console.log(`[RideSearch] Params: from="${from}", to="${to}", date="${date}"`);
    if (hasSourceGPS) console.log(`[RideSearch] GPS: [${pLng}, ${pLat}] -> [${dLng}, ${dLat}]`);

    // We will collect candidate rides from 3 different methods to ensure NO ride is missed
    let CandidatePool = [];

    // METHOD A: Smart GPS Radar (Passes through Source + Passes through Destination)
    if (hasSourceGPS && hasDestGPS) {
      console.log(`[RideSearch] Phase A: GPS Smart Search active (Route Intercept Mode).`);
      const sourceCoords = [pLng, pLat];
      const destCoords = [dLng, dLat];

      // Boarding Radius: Find rides that pass within 35km of passenger
      const gpsCandidates = await Ride.find({
        ...query,
        ...genderQuery,
        routePoints: {
          $near: {
            $geometry: { type: 'Point', coordinates: sourceCoords },
            $maxDistance: 35000 
          }
        }
      }).populate('driver', 'name averageRating isVerified profilePhoto phone');

      // Filter by: 1. Passes near Destination, 2. Source is before Destination in route
      const matchedByGPS = gpsCandidates.filter(ride => {
        const rPoints = (ride.routePointsStatus === 'saved' && ride.routePoints?.coordinates?.length >= 2)
          ? ride.routePoints.coordinates
          : [ride.fromCoordinates.coordinates, ride.toCoordinates.coordinates];
        
        // EDGE CASE 7: 10km Tolerance (Safer for large city bypasses)
        const TOLERANCE = 10.0; 
        
        let foundSourceIdx = -1;
        let foundDestIdx = -1;
        let minSourceDist = Infinity;
        let minDestDist = Infinity;

        for (let i = 0; i < rPoints.length; i++) {
           const p = rPoints[i];
           const dSrc = haversineDistance(p, sourceCoords);
           const dDst = haversineDistance(p, destCoords);

           if (dSrc <= TOLERANCE && dSrc < minSourceDist) {
              minSourceDist = dSrc;
              foundSourceIdx = i;
           }
           if (dDst <= TOLERANCE && dDst < minDestDist) {
              minDestDist = dDst;
              foundDestIdx = i;
           }
        }

        // If direct point match failed, try segment matching for better resolution
        if (foundSourceIdx === -1 || foundDestIdx === -1) {
           for (let i = 0; i < rPoints.length - 1; i++) {
              const start = rPoints[i];
              const end = rPoints[i+1];
              const dTotal = haversineDistance(start, end);
              if (dTotal === 0) continue;

              // Source Segment Check
              if (foundSourceIdx === -1) {
                const s1 = haversineDistance(start, sourceCoords);
                const s2 = haversineDistance(end, sourceCoords);
                const detourS = (s1 + s2) - dTotal;
                // 1.5km detour tolerance for 5km perpendicular sphere
                if (detourS <= 1.5) {
                   const s = (s1 + s2 + dTotal) / 2;
                   const tempArea = s * (s - s1) * (s - s2) * (s - dTotal);
                   const area = tempArea > 0 ? Math.sqrt(tempArea) : 0;
                   const perpS = (2 * area) / dTotal;
                   if (perpS <= TOLERANCE) foundSourceIdx = i;
                }
              }

              // Destination Segment Check
              if (foundDestIdx === -1) {
                const d1 = haversineDistance(start, destCoords);
                const d2 = haversineDistance(end, destCoords);
                const detourD = (d1 + d2) - dTotal;
                if (detourD <= 1.5) {
                   const s = (d1 + d2 + dTotal) / 2;
                   const tempArea = s * (s - d1) * (s - d2) * (s - dTotal);
                   const area = tempArea > 0 ? Math.sqrt(tempArea) : 0;
                   const perpD = (2 * area) / dTotal;
                   if (perpD <= TOLERANCE) foundDestIdx = i;
                }
              }
           }
        }

        // SUCCESS condition: SOURCE is before DESTINATION in route sequence
        const matched = (foundSourceIdx !== -1 && foundDestIdx !== -1 && foundSourceIdx <= foundDestIdx);
        if (matched) {
           console.log(`[RideSearch] ✅ ROUTE MATCH: Ride ${ride._id} passes through both points (Order: ${foundSourceIdx}->${foundDestIdx})`);
        }
        return matched;
      });

      console.log(`[RideSearch] Phase A: Found ${matchedByGPS.length} matched routes.`);
      CandidatePool.push(...matchedByGPS);
    }

    // METHOD B: Text Semantic Match (Handle Edge Cases 5, 6, 8, 10)
    // We clean the input "to" and compare against simplifiedTo in DB
    if (to && to !== 'null' && to.trim() !== '') {
       console.log(`[RideSearch] Phase B: Text Match active.`);
       const cleanTo = simplifyAddress(to);
       const textCandidates = await Ride.find({
         ...query,
         ...genderQuery,
         $or: [
           { to: { $regex: cleanTo.split(' ')[0], $options: 'i' } }, // Fuzzy head word
           { simplifiedTo: { $regex: cleanTo, $options: 'i' } }
         ]
       }).populate('driver', 'name averageRating isVerified profilePhoto phone');

       console.log(`[RideSearch] Phase B: Found ${textCandidates.length} matches.`);
       CandidatePool.push(...textCandidates);
    }

    // EDGE CASE 10: Empty Search Browse All
    if (!to || to === 'null' || to.trim() === '') {
       console.log(`[RideSearch] Phase C: Destination empty - browsing all.`);
       const allAvailable = await Ride.find({ ...query, ...genderQuery })
         .populate('driver', 'name averageRating isVerified profilePhoto phone')
         .limit(50);
       CandidatePool.push(...allAvailable);
    }

    // EDGE CASE 11: Deduplication by ID
    const uniqueMap = new Map();
    CandidatePool.forEach(r => uniqueMap.set(r._id.toString(), r));
    const finalCandidates = Array.from(uniqueMap.values());

    console.log(`[RideSearch] 🏁 FINAL POOL: ${finalCandidates.length} unique rides found.`);

    // Final Processing: Fares and Breakdown
    const results = finalCandidates.map(ride => {
      // EDGE CASE 14: Partial Fare Capping
      let fare = ride.price;
      if (hasSourceGPS && hasDestGPS) {
        fare = calculatePartialFare(
          ride.fromCoordinates.coordinates,
          ride.toCoordinates.coordinates,
          [dLng, dLat],
          ride.price
        );
        // Safety Cap & Min
        if (fare > ride.price) fare = ride.price;
        if (fare < 10) fare = 10;
      }

      const confirmed = (ride.bookings || []).filter(b => b.status === 'confirmed');
      const breakdown = {
        male: confirmed.filter(b => b.passenger?.gender === 'male').length,
        female: confirmed.filter(b => b.passenger?.gender === 'female').length
      };

      const dist = hasSourceGPS ? haversineDistance([pLng, pLat], ride.fromCoordinates.coordinates).toFixed(1) : "?";

      return {
        ...ride.toObject(),
        passengerBreakdown: breakdown,
        bookingDetails: {
          totalBooked: confirmed.length,
          fareForPassenger: fare,
          distanceToRider: hasSourceGPS ? `${dist} km away` : "Unknown dist"
        },
        dynamicFare: fare
      };
    });

    return res.status(200).json({ success: true, count: results.length, data: results });

  } catch (error) {
    console.error(`[RideSearch] 💥 CRITICAL ERROR: ${error.message}`);
    res.status(500).json({ success: false, message: "Search Protocol Error: Please try using map pin drop for best results." });
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
    const rides = await Ride.find({ driver: req.user._id })
      .sort({ createdAt: -1 })
      .populate('bookings.passenger', 'name gender profilePhoto');
    
    // Format rides with passenger counts and statuses
    const formattedRides = rides.map(ride => {
      const confirmed = ride.bookings.filter(b => b.status === 'confirmed');
      const now = new Date();
      const departureTime = new Date(`${ride.date.toISOString().split('T')[0]}T${ride.time}`);
      
      let computedStatus = ride.status;
      if (ride.status === 'available' || ride.status === 'full') {
        if (now > departureTime) computedStatus = 'expired';
      }

      return {
        ...ride.toObject(),
        computedStatus,
        totalBooked: confirmed.length,
        seatsRemaining: ride.seatsAvailable
      };
    });

    res.status(200).json({ success: true, count: formattedRides.length, data: formattedRides });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Cancel a ride (Driver only)
// @route   PATCH /api/rides/:id/cancel
// @access  Private (Driver)
exports.cancelRide = async (req, res) => {
  try {
    const { reason, otherReason } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    // Auth check
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this ride' });
    }

    if (ride.status === 'cancelled' || ride.status === 'completed') {
      return res.status(400).json({ success: false, message: `Ride already ${ride.status}` });
    }

    const finalReason = reason === 'Other' ? otherReason : reason;
    if (!finalReason) {
      return res.status(400).json({ success: false, message: 'Cancellation reason is mandatory' });
    }

    const now = new Date();
    const departureTime = new Date(`${ride.date.toISOString().split('T')[0]}T${ride.time}`);
    const diffMinutes = (departureTime - now) / (1000 * 60);
    const confirmedBookings = ride.bookings.filter(b => b.status === 'confirmed');
    const hasBookings = confirmedBookings.length > 0;

    // 1. Automatic Yearly Reset & Load Rider
    const rider = await User.findById(ride.driver);
    const currentYear = new Date().getFullYear();
    const lastResetYear = rider.appealYearReset ? new Date(rider.appealYearReset).getFullYear() : null;
    
    if (lastResetYear !== currentYear) {
      rider.genuineClaimsThisYear = 0;
      rider.appealCount = 0;
      rider.appealYearReset = new Date();
      // We'll save rider at the end of the stats update
    }

    let penaltyType = 'none';
    let trustImpact = 0;
    let restrictionHours = 0;
    let emergencyMessage = "";

    if (hasBookings) {
      if (diffMinutes > 120) {
        // SCENARIO 1: > 2 hours
        penaltyType = 'none';
        trustImpact = 5; // -5 points for any cancellation with bookings
      } else if (diffMinutes >= 30) {
        // SCENARIO 2: 30 min - 2 hours
        penaltyType = 'warning';
        trustImpact = 5;
      } else {
        // SCENARIO 3: < 30 min
        penaltyType = 'strike';
        trustImpact = 15; // -15 points for late strike
        restrictionHours = 24;
      }

      // Genuine Emergency exception (Edge Case 3) - MISSION UPGRADE
      if (['Medical emergency', 'Vehicle breakdown'].includes(reason)) {
        if (rider.genuineClaimsThisYear === 0) {
          penaltyType = 'none';
          trustImpact = 0;
          restrictionHours = 0;
          rider.genuineClaimsThisYear = 1;
          emergencyMessage = "First emergency claim accepted. No penalty applied.";
        } else if (rider.genuineClaimsThisYear === 1) {
          penaltyType = 'warning';
          trustImpact = 5;
          restrictionHours = 0;
          rider.genuineClaimsThisYear = 2;
          emergencyMessage = "This is your 2nd emergency claim this year. One more will result in full penalty.";
        } else {
          // 3rd claim onwards: Full penalty already calculated above persists
          emergencyMessage = "You have used all emergency claims for this year. Standard penalty has been applied.";
        }
      }
    }

    // Update Rider Stats
    rider.totalCancellations += 1;
    rider.trustScore = Math.max(0, rider.trustScore - trustImpact);

    if (penaltyType === 'warning') {
      rider.warnings += 1;
      if (rider.warnings >= 3) {
        restrictionHours = 24;
        rider.warnings = 0; // Reset after suspension
      }
    } else if (penaltyType === 'strike') {
      rider.strikes += 1;
      rider.lastStrikeAt = new Date();
      if (rider.strikes === 1) restrictionHours = Math.max(restrictionHours, 24);
      else if (rider.strikes === 2) restrictionHours = 48;
      else if (rider.strikes === 3) restrictionHours = 168; // 7 days
    }

    if (restrictionHours > 0) {
      const restrictedUntil = new Date(now.getTime() + restrictionHours * 60 * 60 * 1000);
      rider.restrictedUntil = restrictedUntil;
    }

    await rider.save();

    // Appeal System Context
    const appealInstructions = penaltyType === 'strike' ? {
      message: "A strike has been added to your profile. Believe this is unfair? Appeal within 48 hours by emailing support.raiddhosthi@gmail.com. Include: Email ID, Ride ID, and Reason.",
      canAppeal: rider.appealCount < 2,
      appealLimitReached: rider.appealCount >= 2,
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000)
    } : null;

    // Mark ride and bookings
    ride.status = 'cancelled';
    ride.cancellationReason = finalReason;
    ride.cancelledAt = now;
    ride.cancelledBy = req.user._id;
    ride.wasAffectedByCancel = hasBookings;

    const passengerIdsToNotify = confirmedBookings.map(b => b.passenger);
    
    ride.bookings.forEach(b => {
      if (b.status === 'confirmed') {
        b.status = 'cancelled';
        b.wasAffected = true;
        // Priority Badge for late cancellation (Scenario 3)
        if (diffMinutes < 30) {
           b.priorityBadgeGiven = true;
        }
      }
    });

    await ride.save();

    // Give Priority Badges and Notify Passengers
    await Promise.all(ride.bookings.map(async (b) => {
      if (b.status === 'confirmed' || b.wasAffected) {
        if (b.priorityBadgeGiven) {
          const passUser = await User.findById(b.passenger);
          if (passUser) {
            passUser.priorityBadgeExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await passUser.save();
            
            await Notification.create({
              user: b.passenger,
              type: 'PRIORITY_BADGE',
              title: '🎖️ Priority Badge Awarded!',
              message: 'Due to a late cancellation by your rider, you have been awarded a 7-day priority search badge.',
              rideId: ride._id
            });
          }
        }

        await Notification.create({
          user: b.passenger,
          type: 'RIDE_CANCELLED',
          title: 'Ride Cancelled by Rider',
          message: `Your ride from ${ride.from} on ${new Date(ride.date).toLocaleDateString()} has been cancelled. Reason: ${finalReason}.`,
          rideId: ride._id
        });
      }
    }));

    await ride.save();

    console.log(`[Justice] ⚖️ Ride ${ride._id} cancelled. ${penaltyType.toUpperCase()} applied to driver ${rider._id}.`);

    res.status(200).json({
      success: true,
      message: emergencyMessage || `Ride cancelled successfully. ${penaltyType !== 'none' ? `A ${penaltyType} has been added to your profile.` : ''}`,
      penalty: penaltyType,
      appeal: appealInstructions
    });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get summary stats for driver
// @route   GET /api/rides/driver/stats
// @access  Private
exports.getDriverStats = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id });
    
    const activeRides = rides.filter(r => 
      (r.status === 'available' || r.status === 'full') && 
      new Date(r.expiresAt) > new Date()
    );

    const totalBookings = activeRides.reduce((acc, r) => {
      return acc + r.bookings.filter(b => b.status === 'confirmed').length;
    }, 0);

    // New bookings since lastMyRidesView
    const newBookingsCount = await Notification.countDocuments({
      user: req.user._id,
      type: 'NEW_BOOKING',
      createdAt: { $gt: req.user.lastMyRidesView || new Date(0) }
    });

    res.status(200).json({
      success: true,
      data: {
        activeRidesCount: activeRides.length,
        totalBookingsCount: totalBookings,
        newBookingsCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Report rider no show (Passenger only)
// @route   POST /api/rides/:id/no-show
// @access  Private
exports.reportNoShow = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    // 1. Logic Checks
    const now = new Date();
    const departureTime = new Date(`${ride.date.toISOString().split('T')[0]}T${ride.time}`);
    const diffMinutes = (now - departureTime) / (1000 * 60);

    if (diffMinutes < 0) return res.status(400).json({ success: false, message: 'Departure time has not passed yet' });
    if (diffMinutes > 30) return res.status(400).json({ success: false, message: 'No show reporting window (30 min) has closed' });

    // Check if passenger booked this ride
    const booking = ride.bookings.find(b => b.passenger.toString() === req.user._id.toString() && b.status === 'confirmed');
    if (!booking) return res.status(403).json({ success: false, message: 'Only confirmed passengers can report no-show' });

    // Check if already reported
    if (ride.noShowReports.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already reported a no-show for this ride' });
    }

    // 2. Record Report
    ride.noShowReports.push(req.user._id);
    await ride.save();

    console.log(`[NoShow] Ride ${ride._id} reported by ${req.user._id}. Total: ${ride.noShowReports.length}`);

    // 3. Trigger Penalty if Majority ( > 50% )
    const confirmedCount = ride.bookings.filter(b => b.status === 'confirmed').length;
    if (ride.noShowReports.length > confirmedCount / 2) {
       const rider = await User.findById(ride.driver);
       rider.noShowCount += 1;
       rider.strikes += 1;
       rider.lastStrikeAt = new Date();
       rider.trustScore = Math.max(0, rider.trustScore - 20); // -20 for no show
       
       // Restriction for no-show strike (Scenario 4)
       const restrictionHours = 48; 
       rider.restrictedUntil = new Date(now.getTime() + restrictionHours * 60 * 60 * 1000);
       await rider.save();

       console.log(`[NoShow] 🛑 PENALTY TRIGGERED for ${ride.driver}. Strike added. Restricted for 48h.`);

       // Notify passengers
       const notifications = ride.bookings
         .filter(b => b.status === 'confirmed')
         .map(b => ({
           user: b.passenger,
           type: 'RIDE_CANCELLED',
           title: '⚠️ No-Show Confirmed',
           message: `Rider did not show up. Penalty applied. Search for alternative rides now.`,
           rideId: ride._id
         }));
       await Notification.insertMany(notifications);
    }

    res.status(200).json({ success: true, message: 'No-show report recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
