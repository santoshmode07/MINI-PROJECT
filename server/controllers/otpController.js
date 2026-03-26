const Ride = require('../models/Ride');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const socketManager = require('../utils/socketManager');

// @desc    Get boarding details for a ride (Driver only)
// @route   GET /api/otp/boarding/:rideId
exports.getBoardingDetails = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate('bookings.passenger', 'name gender profilePhoto');

    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const confirmedBookings = ride.bookings.filter(b => b.status === 'confirmed');
    
    // Calculate time remaining in boarding window (20 min from departure)
    const dateStr = ride.date.toISOString().split('T')[0];
    const departureTime = new Date(`${dateStr}T${ride.time}`);
    const boardingCloseTime = new Date(departureTime.getTime() + (ride.waitingTime || 10) * 60 * 1000); // Dynamic boarding window
    const now = new Date();
    const timeRemaining = Math.max(0, Math.floor((boardingCloseTime - now) / 1000));

    const passengers = confirmedBookings.map(b => ({
      name: b.passenger.name,
      gender: b.passenger.gender,
      profilePhoto: b.passenger.profilePhoto,
      boardingPoint: b.boardingPoint.address,
      paymentMethod: b.paymentMethod,
      fare: b.fareCharged,
      bookingId: b._id,
      boardingStatus: b.boardingStatus,
      otpVerified: b.otpVerified,
      otpLocked: b.otpLocked
    }));

    res.status(200).json({
      success: true,
      data: {
        rideFrom: ride.from,
        rideTo: ride.to,
        departureTime: ride.time,
        waitingTime: ride.waitingTime || 10,
        rideDate: ride.date,
        passengers,
        timeRemaining,
        verifiedCount: confirmedBookings.filter(b => b.otpVerified).length,
        totalCount: confirmedBookings.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify passenger OTP (Driver only)
// @route   POST /api/otp/verify
exports.verifyOTP = async (req, res) => {
  try {
    const { rideId, bookingId, otp } = req.body;
    const ride = await Ride.findById(rideId);

    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Find the specific booking targeted by the driver
    const booking = ride.bookings.id(bookingId);
    if (!booking || booking.status !== 'confirmed') {
       return res.status(404).json({ success: false, message: 'Specific booking not found on this journey' });
    }

    if (booking.otpLocked) {
      return res.status(400).json({ success: false, message: 'Identity terminal locked (5 failed attempts)' });
    }

    if (booking.otpVerified) {
       return res.status(400).json({ success: false, message: 'Passenger already verified' });
    }

    if (booking.otp === otp) {
       booking.otpVerified = true;
       booking.otpVerifiedAt = new Date();
       booking.boardingStatus = 'arrived';
       booking.otpAttempts = 0;
       
       await ride.save();

       // Notify Passenger
       const passenger = await User.findById(booking.passenger);
       await Notification.create({
         user: booking.passenger,
         type: 'BOARDING_CONFIRMED',
         title: '✅ Identity Verified!',
         message: `Have a safe journey to ${booking.dropoffPoint.address}. You are now officially boarded.`,
         rideId: ride._id
       });

       return res.status(200).json({
         success: true,
         message: 'Identity verified successfully',
         data: {
           name: passenger.name,
           boardingPoint: booking.boardingPoint.address
         }
       });
    } else {
       booking.otpAttempts += 1;
       const remaining = 5 - booking.otpAttempts;
       if (remaining <= 0) {
          booking.otpLocked = true;
          await ride.save();
          return res.status(400).json({ success: false, message: 'Identity terminal locked (Max attempts reached)' });
       }
       await ride.save();
       return res.status(400).json({ 
         success: false, 
         message: `Invalid Secure Pin. ${remaining} attempts remaining.`
       });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Money Release Helper (PART 5)
exports.processMoneyRelease = async (booking, ride, admin) => {
    // 🛑 IDEMPOTENCY GUARD: Never process a booking twice
    if (booking.moneyReleased || booking.refundProcessed) {
        console.log(`[Escrow] 🛡️ Skipping: Booking ${booking._id} already finalized.`);
        return;
    }

    if (booking.boardingStatus === 'arrived') {
        const driver = await User.findById(ride.driver);
        const riderCut = booking.totalDriverEarnings; // 80% of original fare
        const originalFare = Math.round(riderCut / 0.8);
        const commission = Math.round(originalFare * 0.2);
        const subsidy = originalFare - (booking.fareCharged || 0);

        if (booking.paymentMethod === 'online' || booking.paymentMethod === 'wallet') {
            const passenger = await User.findById(booking.passenger);
            // Online: Platform already holds the full fare (from booking)
            // Transfer 80% (riderCut) to driver, keep the rest as commission/subsidy
            driver.walletBalance += riderCut;
            if (admin) admin.walletBalance -= riderCut;
            
            await Transaction.create({
                userId: ride.driver,
                type: 'RIDE_EARNING',
                amount: riderCut,
                rideId: ride._id,
                description: `Fare received (Online) - Journey to ${ride.to}`
            });
            
            // Real Time Update
            socketManager.emitToUser(ride.driver, 'fare_released', {
                rideId: ride._id,
                passengerName: passenger.name,
                amount: riderCut,
                releaseType: 'manual'
            });

            socketManager.emitToUser(ride.driver, 'wallet_updated', {
                newBalance: driver.walletBalance,
                transaction: {
                    type: 'credit',
                    amount: riderCut,
                    description: `Fare received (Online) - Journey to ${ride.to}`
                }
            });

            if (admin) {
                // 1. Release the full amount from escrow visibility
                await Transaction.create({
                    userId: admin._id,
                    type: 'ESCROW_RELEASE',
                    amount: -booking.fareCharged,
                    rideId: ride._id,
                    description: `Escrow Released: Journey to ${ride.to}`
                });

                // 2. Recognize Gross Commission
                await Transaction.create({
                    userId: admin._id,
                    type: 'COMMISSION',
                    amount: commission,
                    rideId: ride._id,
                    description: `Platform Gross Commission - Ride ${ride._id}`
                });

                // 3. Recognize Subsidy Expense (if applicable)
                if (subsidy > 0) {
                    await Transaction.create({
                        userId: admin._id,
                        type: 'SUBSIDY',
                        amount: -subsidy,
                        rideId: ride._id,
                        description: `Justice Subsidy - Ride ${ride._id}`
                    });
                }
                await admin.save();
            }
            await driver.save();
            booking.moneyReleased = true;
        } else {
            // Cash: Driver has full cash (e.g. 90), they owe platform (commission - subsidy)
            const netCommission = commission - subsidy;
            const passenger = await User.findById(booking.passenger);
            
            driver.walletBalance -= netCommission;
            if (admin) admin.walletBalance += netCommission;
            booking.moneyReleased = true;

            const txs = [
                {
                    userId: ride.driver,
                    type: 'COMMISSION',
                    amount: -netCommission,
                    rideId: ride._id,
                    description: `Platform Fee (Cash Journey) - to ${ride.to}`
                }
            ];
            
            if (admin) {
                // Admin sees the breakdown
                txs.push({
                   userId: admin._id,
                   type: 'COMMISSION',
                   amount: commission,
                   rideId: ride._id,
                   description: `Gross Commission (Cash) - Ride ${ride._id}`
                });
                if (subsidy > 0) {
                   txs.push({
                     userId: admin._id,
                     type: 'SUBSIDY',
                     amount: -subsidy,
                     rideId: ride._id,
                     description: `Justice Subsidy (Cash) - Ride ${ride._id}`
                   });
                }
            }

            await Transaction.insertMany(txs);
            await driver.save();
            if (admin) await admin.save();
        }
    } else if (booking.boardingStatus === 'not_arrived') {
        if (booking.paymentMethod === 'online' || booking.paymentMethod === 'wallet') {
            // Online: Full refund to passenger
            const passenger = await User.findById(booking.passenger);
            passenger.walletBalance += booking.fareCharged;
            if (admin) {
                admin.walletBalance -= booking.fareCharged;
                await Transaction.create({
                    userId: admin._id,
                    type: 'ESCROW_RELEASE',
                    amount: -booking.fareCharged,
                    rideId: ride._id,
                    description: `Escrow Release: Passenger ${passenger.name} missed ride`
                });
                await admin.save();
            }
            await passenger.save();
            booking.refundProcessed = true;

            await Transaction.create({
                userId: booking.passenger,
                type: 'REFUND',
                amount: booking.fareCharged,
                rideId: ride._id,
                description: `Refund: You did not board the ride to ${ride.to}`
            });
            // if (admin) await admin.save(); // This was moved inside the admin check
            // await passenger.save(); // This was moved before the admin check

            // Notify Passenger
            await Notification.create({
                user: booking.passenger,
                type: 'RIDE_MISSED',
                title: '❌ You missed your ride',
                message: `You missed your ride to ${ride.to}. Refund of ₹${booking.fareCharged} processed.`,
                rideId: ride._id
            });
        } else {
            // Cash: No cash received, no commission debt
            booking.refundProcessed = true;
            await Transaction.create({
                userId: ride.driver,
                type: 'SYSTEM_INFO',
                amount: 0,
                rideId: ride._id,
                description: `No cash received for missing passenger. Commission cancelled.`
            });

            // Notify Passenger
            await Notification.create({
                user: booking.passenger,
                type: 'RIDE_MISSED',
                title: '❌ You missed your ride',
                message: `You missed your ride to ${booking.dropoffPoint.address}. Better luck next time!`,
                rideId: ride._id
            });
        }
    }
};

// @desc    Finalize ride after journey (Driver only)
// @route   POST /api/otp/mark-arrived/:rideId
exports.markArrived = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check if waitingTime after departure
    const dateStr = ride.date.toISOString().split('T')[0];
    const departureTime = new Date(`${dateStr}T${ride.time}`);
    const availableTime = new Date(departureTime.getTime() + (ride.waitingTime || 10) * 60 * 1000);
    const now = new Date();

    if (now < availableTime) {
      const wait = Math.ceil((availableTime - now) / 60000);
      return res.status(400).json({ success: false, message: `Journey starting available after ${wait} minutes of waiting.` });
    }

    if (ride.status === 'completed') {
        return res.status(400).json({ success: false, message: 'Ride already marked as arrived' });
    }

    const admin = await User.findOne({ role: 'admin' });
    const confirmedBookings = ride.bookings.filter(b => b.status === 'confirmed');

    let verifiedCount = 0;
    let refundCount = 0;
    let walletCredit = 0;
    let cashCollection = 0;

    for (const b of confirmedBookings) {
        if (b.boardingStatus === 'pending') {
            b.boardingStatus = 'not_arrived';
        }
        
        if (b.boardingStatus === 'arrived') {
            // NEW BEHAVIOR: Keep money in escrow, move to dropoff status
            b.dropoffStatus = 'pending';
            b.fareReleased = false;
            verifiedCount++;
            
            // Stats for summary (not actual credit)
            if (b.paymentMethod === 'online') {
                walletCredit += Math.round(b.totalDriverEarnings);
            } else {
                cashCollection += Math.round(b.totalDriverEarnings);
            }
        } else if (b.boardingStatus === 'not_arrived') {
            // Still process immediate refund for no-shows
            await exports.processMoneyRelease(b, ride, admin);
            refundCount++;
        }
    }

    ride.status = 'ongoing';
    ride.journeyStartedAt = now; // Real start time
    ride.markedArrivedAt = now;
    await ride.save();

    // Real Time Update
    socketManager.emitToRide(ride._id, 'ride_status_changed', {
        rideId: ride._id,
        status: 'ongoing',
        message: 'The journey has officially started!'
    });

    const confirmedPassengers = ride.bookings.filter(b => b.boardingStatus === 'arrived');
    if (confirmedPassengers.length > 0) {
        const notifications = confirmedPassengers.map(b => ({
            user: b.passenger,
            type: 'JOURNEY_STARTED',
            title: '🚗 Your journey has started!',
            message: `Estimated arrival: ${b.dropoffPoint.address}`,
            rideId: ride._id
        }));
        await Notification.insertMany(notifications);
    }

    res.status(200).json({
      success: true,
      message: `Syndicate Journey Started! 🚀 ${verifiedCount} passengers boarded.`,
      data: { 
        verifiedCount, 
        refundCount, 
        walletCredit, 
        cashCollection 
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
