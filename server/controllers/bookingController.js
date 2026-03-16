const Ride = require('../models/Ride');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { calculatePartialFare } = require('../utils/fareHelper');

// @desc    Book a ride
// @route   POST /api/bookings
// @access  Private
exports.bookRide = async (req, res) => {
  try {
    const { rideId, boardingAddress, boardingCoordinates, dropoffAddress, dropoffCoordinates, paymentMethod } = req.body;

    if (!rideId || !boardingCoordinates || !dropoffCoordinates) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required booking details'
        });
    }

    // STEP 1 — Validate ride exists and is available
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }
    if (ride.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'This ride is no longer available'
      });
    }
    if (ride.expiresAt && new Date() > new Date(ride.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'This ride has expired'
      });
    }

    // STEP 2 — Prevent driver from booking own ride
    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot book your own ride'
      });
    }

    // STEP 3 — GENDER CHECK
    // ─────────────────────────────────────────────────
    // RULE 1: Female driver ride → only female passengers
    if (ride.driverGender === 'female' && req.user.gender === 'male') {
      return res.status(403).json({
        success: false,
        message: 'This ride is for female passengers only'
      });
    }

    // RULE 2: Male driver chose males only → only male passengers
    if (ride.genderPreference === 'male-only' && req.user.gender === 'female') {
      return res.status(403).json({
        success: false,
        message: 'This ride is for male passengers only'
      });
    }

    // STEP 4 — Check not already booked
    const alreadyBooked = ride.bookings.some(
      b => b.passenger.toString() === req.user._id.toString() && b.status === 'confirmed'
    );
    if (alreadyBooked) {
      return res.status(409).json({
        success: false,
        message: 'You have already booked this ride'
      });
    }

    // STEP 5 — Calculate partial fare
    const fareCharged = calculatePartialFare(
      ride.fromCoordinates.coordinates,
      ride.toCoordinates.coordinates,
      dropoffCoordinates,
      ride.price
    );

    // STEP 6 — ATOMIC seat decrement + booking creation
    const updatedRide = await Ride.findOneAndUpdate(
      {
        _id: rideId,
        seatsAvailable: { $gte: 1 },
        status: 'available',
        'bookings': {
          $not: {
            $elemMatch: {
              passenger: req.user._id,
              status: 'confirmed'
            }
          }
        }
      },
      {
        $inc: { seatsAvailable: -1 },
        $push: {
          bookings: {
            passenger: req.user._id,
            status: 'confirmed',
            boardingPoint: {
              address:     ride.from,
              coordinates: ride.fromCoordinates.coordinates
            },
            dropoffPoint: {
              address: dropoffAddress || ride.to,
              coordinates: dropoffCoordinates
            },
            fareCharged,
            paymentMethod: paymentMethod || 'cash',
            bookedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedRide) {
      return res.status(400).json({
        success: false,
        message: 'No seats available or ride is not active'
      });
    }

    // STEP 7 — If seats now 0, mark ride as full
    if (updatedRide.seatsAvailable === 0) {
      await Ride.findByIdAndUpdate(rideId, {
        status: 'full'
      });
    }

    // STEP 8 — Create Notification for Driver
    await Notification.create({
      user: ride.driver,
      type: 'NEW_BOOKING',
      title: 'New Booking!',
      message: `${req.user.name} has joined your ride to ${ride.to}`,
      rideId: ride._id,
      passengerId: req.user._id
    });

    res.status(201).json({
        success: true,
        message: 'Ride booked successfully',
        data: {
          fareCharged,
          paymentMethod: paymentMethod || 'cash',
          status: 'confirmed',
          seatsAvailable: updatedRide.seatsAvailable
        }
    });

  } catch (error) {
    console.error('Booking Error:', error.message);
    res.status(500).json({
        success: false,
        message: error.message
    });
  }
};

// @desc    Get current bookings for logged-in user
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const rides = await Ride.find({
      'bookings': {
        $elemMatch: {
          passenger: req.user._id,
          status: 'confirmed'
        }
      },
      date: { $gte: new Date().setHours(0,0,0,0) } // Upcoming or today
    })
    .populate('driver', 'name averageRating isVerified profilePhoto phone')
    .select('from to date time carModel carNumber price seatsAvailable status bookings driver');

    const myBookings = rides.map(ride => {
      const myBooking = ride.bookings.find(
        b => b.passenger.toString() === req.user._id.toString() && b.status === 'confirmed'
      );
      return {
        ride: {
          _id: ride._id,
          from: ride.from,
          to: ride.to,
          date: ride.date,
          time: ride.time,
          carModel: ride.carModel,
          carNumber: ride.carNumber,
          status: ride.status,
          driver: ride.driver
        },
        booking: myBooking
      };
    });

    res.status(200).json({
      success: true,
      data: myBookings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:rideId
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if ride has already started
    const now = new Date();
    const departureTime = new Date(`${ride.date.toISOString().split('T')[0]}T${ride.time}`);

    if (now >= departureTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel after ride has already started'
      });
    }

    // ATOMIC cancellation + seat restore
    const updatedRide = await Ride.findOneAndUpdate(
      {
        _id: rideId,
        'bookings.passenger': req.user._id,
        'bookings.status': 'confirmed'
      },
      {
        $inc: { seatsAvailable: 1 },
        $set: { 'bookings.$.status': 'cancelled' }
      },
      { new: true }
    );

    if (!updatedRide) {
      return res.status(404).json({
        success: false,
        message: 'Active booking not found for this ride'
      });
    }

    // If ride was full before, set back to available
    if (updatedRide.status === 'full') {
      await Ride.findByIdAndUpdate(rideId, {
        status: 'available'
      });
    }

    // STEP 6 — Notify Driver
    await Notification.create({
      user: ride.driver,
      type: 'BOOKING_CANCELLED',
      title: 'Booking Cancelled',
      message: `${req.user.name} cancelled their booking for your ride to ${updatedRide.to}`,
      rideId: updatedRide._id,
      passengerId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get passenger list (driver only)
// @route   GET /api/bookings/ride/:rideId
// @access  Private (Driver)
exports.getPassengerList = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId)
      .populate('bookings.passenger', 'name gender averageRating isVerified profilePhoto phone');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Only driver can access this
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the ride driver can view passengers'
      });
    }

    const confirmedPassengers = ride.bookings
      .filter(b => b.status === 'confirmed')
      .map(b => {
          // Mask Aadhaar would go here if it was on the passenger model in this populate
          // but we already mask sensitive data in user model or manually
          return b;
      });

    res.status(200).json({
      success: true,
      data: confirmedPassengers,
      totalPassengers: confirmedPassengers.length,
      seatsRemaining: ride.seatsAvailable
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
