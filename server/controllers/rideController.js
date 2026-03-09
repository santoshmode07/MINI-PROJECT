const Ride = require('../models/Ride');
const User = require('../models/User');
const Review = require('../models/Review');

// Helper: Get route from OSRM (completely free, no API key)
const getRoutePoints = async (fromCoords, toCoords) => {
  try {
    if (!fromCoords || fromCoords.length < 2 || !toCoords || toCoords.length < 2) {
      return [];
    }
    const url =
      `http://router.project-osrm.org/route/v1/driving/` +
      `${fromCoords[0]},${fromCoords[1]};` +
      `${toCoords[0]},${toCoords[1]}` +
      `?overview=full&geometries=geojson`;

    const response = await fetch(url);
    const data     = await response.json();

    if (!data.routes || data.routes.length === 0) return [fromCoords, toCoords];
    const allPoints = data.routes[0].geometry.coordinates;

    // Save up to 50 points for high-precision path matching
    let keyPoints = [];
    if (allPoints.length <= 50) {
      keyPoints = allPoints;
    } else {
      const step = Math.floor(allPoints.length / 50);
      keyPoints = allPoints.filter((_, i) => i % step === 0);
    }
    
    // Explicitly add start and end to ensure 100% match at polar points
    if (!keyPoints.find(p => p[0] === fromCoords[0] && p[1] === fromCoords[1])) keyPoints.unshift(fromCoords);
    if (!keyPoints.find(p => p[0] === toCoords[0] && p[1] === toCoords[1])) keyPoints.push(toCoords);

    return keyPoints;
  } catch (error) {
    console.error("OSRM Error:", error.message);
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

// HAVERSINE FORMULA — Pure math, zero API cost
// Calculates real distance between two GPS points
const haversineDistance = (point1, point2) => {
  if (!point1 || !point2 || point1.length < 2 || point2.length < 2) return 0;
  const R    = 6371; // Earth radius in km
  const dLat = (point2[1] - point1[1]) * Math.PI / 180;
  const dLon = (point2[0] - point1[0]) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1[1] * Math.PI / 180) *
    Math.cos(point2[1] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// CHECK IF DESTINATION IS ON ROUTE
// Checks passenger's dropoff against all saved route dots
// 2km tolerance — destination can be slightly off main road
const isDestinationOnRoute = (routePoints, destination) => {
  const TOLERANCE_KM = 2;
  return routePoints.some(point =>
    haversineDistance(point, destination) <= TOLERANCE_KM
  );
};

// CALCULATE PARTIAL FARE
// Passenger pays only for their portion of the route
// Based on what % of total distance they travel
const calculatePartialFare = (
  rideFromCoords, rideToCoords,
  passengerPickupCoords, passengerDropoffCoords, fullPrice
) => {
  const rideTotalDistance = haversineDistance(rideFromCoords, rideToCoords);
  if (rideTotalDistance <= 1) return fullPrice; // Short ride or invalid coords

  const passengerTraveledDistance = haversineDistance(passengerPickupCoords, passengerDropoffCoords);
  
  // Calculate ratio: what % of the driver's total trip is the passenger actually taking?
  const ratio = Math.min(passengerTraveledDistance / rideTotalDistance, 1);
  
  // Base price multiplied by ratio, with a minimum of 30% of original price to cover base cost
  const calculated = Math.ceil(fullPrice * ratio);
  const minPrice = Math.ceil(fullPrice * 0.3); // Minimum 30% base fare
  
  return Math.max(calculated, minPrice);
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

    if (date && date !== 'null' && date !== 'undefined' && date.trim() !== '') {
        const searchDate = new Date(date);
        const startOfDay = new Date(searchDate.setHours(0,0,0,0));
        const endOfDay = new Date(searchDate.setHours(23,59,59,999));
        query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Safety First: Gender-Based Filtering
    const genderQuery = req.user.gender === 'male'
      ? { genderPreference: 'any' } // Males only see 'any' rides
      : {}; // Females see everything (any + female)

    // Smart GPS Logic
    if (passengerLat && passengerLng && destinationLat && destinationLng) {
      const passengerCoords   = [parseFloat(passengerLng),  parseFloat(passengerLat)];
      const destinationCoords = [parseFloat(destinationLng), parseFloat(destinationLat)];

      // SEARCH STRATEGY (Direct Boarding): 
      // 1. Driver must START near the passenger's pickup (fromCoordinates)
      console.log(`[SmartRadar] Searching for rides in range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
      console.log(`[SmartRadar] Passenger Pickup: [${passengerLng}, ${passengerLat}]`);

      const candidateRides = await Ride.find({
        ...query,
        ...genderQuery,
        fromCoordinates: {
          $near: {
            $geometry: {
              type:        'Point',
              coordinates: passengerCoords
            },
            $maxDistance: 25000 // Increased to 25km for better reliability
          }
        }
      }).populate('driver', 'name averageRating isVerified profilePhoto phone');

      console.log(`[SmartRadar] Found ${candidateRides.length} rides starting near pickup.`);

      const matchingRides = candidateRides
        .filter(ride => {
          if (!ride.routePoints || !ride.routePoints.coordinates || ride.routePoints.coordinates.length < 2) {
            return haversineDistance(ride.toCoordinates.coordinates, destinationCoords) <= 20;
          }

          const rPoints = ride.routePoints.coordinates;
          
          // 1. High-precision point check
          let minDropoffDist = Infinity;
          rPoints.forEach(p => {
            const dist = haversineDistance(p, destinationCoords);
            if (dist < minDropoffDist) minDropoffDist = dist;
          });
          if (minDropoffDist <= 20) return true;

          // 2. Linear Segment Check (The "Vellore Bridge")
          // If the ride only has a few points, check if destination lies on any segment
          for (let i = 0; i < rPoints.length - 1; i++) {
             const start = rPoints[i];
             const end = rPoints[i+1];
             const distTotal = haversineDistance(start, end);
             const distToStart = haversineDistance(start, destinationCoords);
             const distToEnd = haversineDistance(end, destinationCoords);
             
             // If sum of distances is close to total segment length, it's a match
             if ((distToStart + distToEnd) <= (distTotal + 5)) {
                console.log(`[SmartRadar] SUCCESS: Ride ${ride._id} matched along segment.`);
                return true;
             }
          }

          console.log(`[SmartRadar] REJECT: Ride ${ride._id} destination too far (MinDist: ${minDropoffDist}km)`);
          return false; 
        })
        .map(ride => {
          const distanceToRider = haversineDistance(passengerCoords, ride.fromCoordinates.coordinates).toFixed(1);
          const fareForPassenger = calculatePartialFare(ride.fromCoordinates.coordinates, ride.toCoordinates.coordinates, passengerCoords, destinationCoords, ride.price);
          
          const bookingDetails = {
            totalBooked:   ride.bookings.filter(b => b.status === 'confirmed').length,
            fareForPassenger,
            distanceToRider: `${distanceToRider} km away`
          };

          return { ...ride.toObject(), bookingDetails };
        });

      return res.status(200).json({ success: true, count: matchingRides.length, data: matchingRides });
    }

    // Default Fallback to Text/Generic Search
    if (from && from !== 'null' && from.trim() !== '') query.from = { $regex: from.trim(), $options: 'i' };
    if (to && to !== 'null' && to.trim() !== '') query.to = { $regex: to.trim(), $options: 'i' };

    const rides = await Ride.find({ ...query, ...genderQuery })
      .populate('driver', 'name averageRating isVerified profilePhoto')
      .sort({ date: 1, time: 1 });

    const formattedRides = rides.map(ride => ({
      ...ride.toObject(),
      bookingDetails: {
        totalBooked: ride.bookings.filter(b => b.status === 'confirmed').length,
        fareForPassenger: ride.price,
        distanceToRider: "Location unknown"
      }
    }));

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

    // Populate driver and riders
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name gender phone avatar isVerified licenseNumber aadhaarNumber averageRating totalRatings');
    
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    await ride.populate('bookings.passenger', 'name gender avatar');

    const breakdown = {
      male: ride.bookings.filter(b => b.status === 'confirmed' && b.passenger.gender === 'male').length,
      female: ride.bookings.filter(b => b.status === 'confirmed' && b.passenger.gender === 'female').length
    };

    const reviews = await Review.find({ subject: ride.driver._id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate Dynamic Fare if search coordinates provided
    let dynamicFare = ride.price;
    if (passengerLat && passengerLng && destinationLat && destinationLng) {
      const pPickup = [parseFloat(passengerLng), parseFloat(passengerLat)];
      const pDropoff = [parseFloat(destinationLng), parseFloat(destinationLat)];
      dynamicFare = calculatePartialFare(ride.fromCoordinates.coordinates, ride.toCoordinates.coordinates, pPickup, pDropoff, ride.price);
    }

    const responseData = {
      ...ride.toObject(),
      passengerBreakdown: breakdown,
      driverReviews: reviews,
      dynamicFare,
      safetyMessage: ""
    };

    // Safety Assurance Banner Logic
    if (ride.genderPreference === 'female-only') {
      responseData.safetyMessage = "This vehicle contains female passengers only — guaranteed safe space";
    }

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Book a ride
// @route   POST /api/rides/book/:id
// @access  Private
exports.bookRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('driver');

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.seatsAvailable <= 0) {
      return res.status(400).json({ success: false, message: 'No seats available' });
    }

    // GENDER SAFETY CHECK
    const userGender = req.user.gender;
    const driverGender = ride.driver.gender;

    // If Female: can book 'female-only' (from female) or 'any' (from male)
    if (userGender === 'female' && ride.genderPreference === 'male-only') {
       return res.status(403).json({ success: false, message: 'This ride is for males only' });
    }

    // If Male: can book 'male-only' (from male) or 'any' (from male)
    // Note: Females ONLY produce 'female-only'. So a male can't book a female ride.
    if (userGender === 'male' && ride.genderPreference === 'female-only') {
       return res.status(403).json({ success: false, message: 'This ride is for females only' });
    }

    // Check if user already booked
    const existingBooking = ride.bookings.find(
      b => b.passenger.toString() === req.user._id.toString() && b.status === 'confirmed'
    );
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You have already booked this ride' });
    }

    // Book the seat
    ride.bookings.push({
      passenger: req.user._id,
      status: 'confirmed',
      boardingPoint: {
        address: ride.from,
        coordinates: ride.fromCoordinates
      },
      dropoffPoint: {
        address: ride.to,
        coordinates: ride.toCoordinates
      },
      fareCharged: ride.price,
      paymentMethod: 'cash'
    });
    ride.seatsAvailable -= 1;
    if (ride.seatsAvailable === 0) {
      ride.status = 'full';
    }
    await ride.save();

    res.status(200).json({
      success: true,
      message: 'Ride booked successfully',
      data: ride
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
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

// @desc    Get rides booked by current user
exports.getMyBookings = async (req, res) => {
  try {
    const rides = await Ride.find({
      'bookings.passenger': req.user._id,
      'bookings.status': 'confirmed'
    }).populate('driver', 'name phone profilePhoto averageRating isVerified');

    // Filter the bookings array for each ride to only include the current user's booking details
    const formattedResults = rides.map(ride => {
      const myBooking = ride.bookings.find(
        b => b.passenger.toString() === req.user._id.toString() && b.status === 'confirmed'
      );
      const rideData = ride.toObject();
      return {
        ...rideData,
        userBooking: myBooking
      };
    });

    res.status(200).json({ success: true, count: formattedResults.length, data: formattedResults });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/rides/cancel/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    const booking = ride.bookings.find(
      b => b.passenger.toString() === req.user._id.toString() && b.status === 'confirmed'
    );

    if (!booking) return res.status(400).json({ success: false, message: 'No active booking found' });

    booking.status = 'cancelled';
    ride.seatsAvailable += 1;
    if (ride.status === 'full') {
      ride.status = 'available';
    }
    
    await ride.save();
    res.status(200).json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
