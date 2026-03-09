const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Create a review for a user
// @route   POST /api/reviews/:userId
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const subjectId = req.params.userId;

    // Check if subject exists
    const subject = await User.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent self-review
    if (subjectId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot review yourself' });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      subject: subjectId,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this user' });
    }
    res.status(400).json({ success: false, message: error.message });
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
