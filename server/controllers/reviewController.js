const Review = require('../models/Review');
const User = require('../models/User');
const Ride = require('../models/Ride');

// @desc    Create a review for a user after a ride
// @route   POST /api/reviews/:rideId/:userId
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { rideId, userId: subjectId } = req.params;

    // 1. Basic validation
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    // 2. Fetch Ride and validate
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only leave feedback for completed rides' });
    }

    // 3. Logic validation: Reviewer and Subject must be participants
    // Using string comparison for safety across different ID formats
    const driverId = ride.driver.toString();
    const confirmedBookings = ride.bookings.filter(b => b.status === 'confirmed');
    const passengerIds = confirmedBookings.map(b => b.passenger.toString());
    
    const reviewerId = req.user._id.toString();
    
    // Check Reviewer Participation
    const isReviewerInRide = (reviewerId === driverId) || passengerIds.includes(reviewerId);
    if (!isReviewerInRide) {
      console.warn(`[ReviewBlock] 🚫 Unauthorized: User ${reviewerId} not found in participants of Ride ${rideId}`);
      return res.status(403).json({ success: false, message: 'Access Denied: You were not a participant in this journey.' });
    }

    // Check Subject Participation
    const isSubjectInRide = (subjectId === driverId) || passengerIds.includes(subjectId);
    if (!isSubjectInRide) {
       return res.status(400).json({ success: false, message: 'The user you are trying to review was not part of this ride roster.' });
    }

    // Prevent self-review
    if (subjectId === reviewerId) {
      return res.status(400).json({ success: false, message: 'You cannot review yourself' });
    }

    // 4. Create Review
    // Wrapped in try/catch specifically for duplicate identification
    try {
      const review = await Review.create({
        reviewer: reviewerId,
        subject: subjectId,
        rideId,
        rating,
        comment
      });

      console.log(`[Review] ⭐ New review from ${reviewerId} for ${subjectId} via Ride ${rideId}`);

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: review
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ 
          success: false, 
          message: 'Error: You have already submitted feedback for this specific journey. Duplicate reviews are not allowed.' 
        });
      }
      throw err;
    }

  } catch (error) {
    console.error(`[ReviewError] 💥: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ subject: req.params.userId })
      .populate('reviewer', 'name profilePhoto avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
