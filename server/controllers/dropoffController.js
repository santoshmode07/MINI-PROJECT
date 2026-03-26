const Ride = require('../models/Ride');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const socketManager = require('../utils/socketManager');

/**
 * Helper: Release Fare to Driver
 * Takes: booking, ride, releaseType ('manual' or 'auto')
 */
exports.releaseFareToDriver = async (booking, ride, releaseType = 'manual') => {
    // 🛡️ IDEMPOTENCY GUARD: Never process a booking twice
    if (booking.fareReleased) {
        console.log(`[Dropoff] 🛡️ Skipping: Booking ${booking._id} already released.`);
        return;
    }

    const admin = await User.findOne({ role: 'admin' });
    const driver = await User.findById(ride.driver);
    const passenger = await User.findById(booking.passenger);
    
    const riderCut = booking.totalDriverEarnings; // 80% of original fare
    const originalFare = Math.round(riderCut / 0.8);
    const commission = Math.round(originalFare * 0.2);
    const subsidy = originalFare - (booking.fareCharged || 0);

    if (booking.paymentMethod === 'online' || booking.paymentMethod === 'wallet') {
        // Online: Platform already holds the full fare (from booking)
        // Transfer 80% (riderCut) to driver, keep the rest as commission/subsidy
        
        // Atomic update for driver wallet
        await User.findByIdAndUpdate(ride.driver, { $inc: { walletBalance: riderCut } });
        // Atomic update for admin wallet
        if (admin) {
            await User.findByIdAndUpdate(admin._id, { $inc: { walletBalance: -riderCut } });
        }
        
        // Record driver transaction
        await Transaction.create({
            userId: ride.driver,
            type: 'RIDE_EARNING',
            amount: riderCut,
            rideId: ride._id,
            description: `Fare received - dropped ${passenger.name} (${releaseType} confirmation)`
        });
        
        if (admin) {
            // 1. Release the full amount from escrow visibility
            await Transaction.create({
                userId: admin._id,
                type: 'ESCROW_RELEASE',
                amount: -booking.fareCharged,
                rideId: ride._id,
                description: `Escrow Released: Dropoff ${passenger.name} (${releaseType})`
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
        }
    } else {
        // Cash: Driver has full cash, they owe platform (commission - subsidy)
        const netCommission = commission - subsidy;
        
        // Atomic updates
        await User.findByIdAndUpdate(ride.driver, { $inc: { walletBalance: -netCommission } });
        if (admin) {
            await User.findByIdAndUpdate(admin._id, { $inc: { walletBalance: netCommission } });
        }

        await Transaction.create({
            userId: ride.driver,
            type: 'COMMISSION',
            amount: -netCommission,
            rideId: ride._id,
            description: `20% Platform Commission (Cash Journey) - Subtracted from Wallet for ${passenger.name}`
        });
        
        if (admin) {
            await Transaction.create({
               userId: admin._id,
               type: 'COMMISSION',
               amount: commission,
               rideId: ride._id,
               description: `Gross Commission Received (Cash) - Ride ${ride._id}`
            });
            if (subsidy > 0) {
               await Transaction.create({
                 userId: admin._id,
                 type: 'SUBSIDY',
                 amount: -subsidy,
                 rideId: ride._id,
                 description: `Justice Subsidy (Cash) - Ride ${ride._id}`
               });
            }
        }
    }

    // Update booking flags
    booking.fareReleased = true;
    
    // Notify Driver
    if (booking.paymentMethod === 'cash') {
        const netCommission = commission - subsidy;
        await Notification.create({
            user: ride.driver,
            type: 'BOARDING_CONFIRMED',
            title: '💵 Cash Trip',
            message: `Collect ₹${originalFare} cash from ${passenger.name}. ₹${netCommission} fee applied to wallet.`,
            rideId: ride._id
        });
    } else {
        await Notification.create({
            user: ride.driver,
            type: 'BOARDING_CONFIRMED',
            title: '💰 Payment Released',
            message: `₹${riderCut} added to your wallet for ${passenger.name}'s trip`,
            rideId: ride._id
        });

        // Real Time Upate
        socketManager.emitToUser(ride.driver, 'fare_released', {
            rideId: ride._id,
            passengerName: passenger.name,
            amount: riderCut,
            releaseType: releaseType
        });

        socketManager.emitToUser(ride.driver, 'wallet_updated', {
            newBalance: driver.walletBalance,
            transaction: {
                type: 'credit',
                amount: riderCut,
                description: `Fare received - dropped ${passenger.name}`
            }
        });
    }
};

/**
 * ENDPOINT 1: Driver marks passenger as dropped off
 */
exports.markAsDroppedOff = async (req, res) => {
    try {
        const { rideId, passengerId } = req.params;
        const ride = await Ride.findById(rideId);

        if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
        if (ride.driver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const booking = ride.bookings.find(b => b.passenger.toString() === passengerId && b.status === 'confirmed');
        if (!booking) return res.status(404).json({ success: false, message: 'Passenger booking not found' });

        if (booking.boardingStatus !== 'arrived') {
            return res.status(400).json({ success: false, message: 'Cannot drop off passenger who did not board' });
        }

        if (booking.dropoffStatus !== 'pending') {
            return res.status(400).json({ success: false, message: 'Already marked as dropped off' });
        }

        // Update booking
        booking.dropoffStatus = 'dropped';
        booking.driverDroppedAt = new Date();
        booking.autoReleaseAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        await ride.save();

        // Notify Passenger
        await Notification.create({
            user: passengerId,
            type: 'JOURNEY_STARTED',
            title: '🚗 Have you arrived?',
            message: 'Your driver says you have arrived! Open My Bookings to confirm.',
            rideId: ride._id
        });

        // Real Time Update
        socketManager.emitToUser(passengerId, 'confirm_arrival', {
            rideId: ride._id,
            driverName: req.user.name,
            dropoffLocation: booking.dropoffPoint.address,
            autoReleaseAt: booking.autoReleaseAt
        });

        res.status(200).json({ success: true, message: 'Passenger marked as dropped off' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ENDPOINT 2: Passenger confirms arrival or raises dispute
 */
exports.confirmArrival = async (req, res) => {
    try {
        const { rideId } = req.params;
        const { arrived } = req.body;
        const ride = await Ride.findById(rideId);

        if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

        const booking = ride.bookings.find(b => b.passenger.toString() === req.user._id.toString() && b.status === 'confirmed');
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (booking.dropoffStatus !== 'dropped') {
            return res.status(400).json({ success: false, message: 'Driver has not marked your dropoff yet' });
        }

        if (booking.dropoffStatus === 'confirmed' || booking.disputeRaised) {
            return res.status(400).json({ success: false, message: 'You have already responded' });
        }

        if (arrived === true) {
            booking.dropoffStatus = 'confirmed';
            booking.passengerConfirmedAt = new Date();
            
            await exports.releaseFareToDriver(booking, ride, 'manual');
            await ride.save();

            res.status(200).json({ success: true, message: 'Arrival confirmed! Driver payment released.' });
        } else {
            booking.dropoffStatus = 'disputed';
            booking.disputeRaised = true;
            booking.disputeRaisedAt = new Date();
            await ride.save();

            // Notify Admin
            const admin = await User.findOne({ role: 'admin' });
            if (admin) {
                await Notification.create({
                    user: admin._id,
                    type: 'ACCOUNT_RESTRICTED',
                    title: '⚖️ New Dispute Raised',
                    message: `Dispute on Ride ${ride._id} by passenger ${req.user.name}. Needs review.`,
                    rideId: ride._id
                });
            }

            // Notify Driver
            await Notification.create({
                user: ride.driver,
                type: 'COMMISSION_DEDUCTED',
                title: '⚠️ Payment Frozen',
                message: `Passenger ${req.user.name} raised a dispute. Your fare is frozen pending admin review.`,
                rideId: ride._id
            });

            // Real Time Update
            socketManager.emitToAdmin('dispute_raised', {
                rideId: ride._id,
                passengerName: req.user.name,
                driverName: (await User.findById(ride.driver)).name,
                frozenAmount: booking.fareCharged
            });

            socketManager.emitToUser(ride.driver, 'ride_status_changed', {
                rideId: ride._id,
                status: 'disputed',
                message: `Passenger ${req.user.name} raised a dispute. Fare frozen.`
            });

            res.status(200).json({ success: true, message: 'Dispute raised. Admin will investigate. Your money is safe.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ENDPOINT 3: Get Dropoff Status for a ride
 */
exports.getDropoffStatus = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.rideId).populate('bookings.passenger', 'name');
        if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

        res.status(200).json({ success: true, data: ride.bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
