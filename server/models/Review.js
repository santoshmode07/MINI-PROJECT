const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    trim: true,
    maxlength: 500
  },
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  }
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per person per ride
reviewSchema.index({ reviewer: 1, subject: 1, rideId: 1 }, { unique: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function(userId) {
  const obj = await this.aggregate([
    {
      $match: { subject: userId }
    },
    {
      $group: {
        _id: '$subject',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj[0]) {
      await mongoose.model('User').findByIdAndUpdate(userId, {
        averageRating: (Math.round(obj[0].averageRating * 10) / 10),
        totalRatings: obj[0].totalRatings
      });
    } else {
      await mongoose.model('User').findByIdAndUpdate(userId, {
        averageRating: 0,
        totalRatings: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', async function() {
  await this.constructor.getAverageRating(this.subject);
});

// Call getAverageRating before remove
reviewSchema.pre('remove', async function() {
  await this.constructor.getAverageRating(this.subject);
});

module.exports = mongoose.model('Review', reviewSchema);
