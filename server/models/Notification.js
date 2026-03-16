const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['NEW_BOOKING', 'BOOKING_CANCELLED', 'RIDE_CANCELLED', 'NO_SHOW', 'PRIORITY_BADGE', 'ACCOUNT_RESTRICTED'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-delete notifications older than 30 days (optional but good for cleanup)
// Or we can just keep last 10 as requested in the MISSION but history might be useful.
// The MISSION says "Keep last 10 notifications". 
// We can handle the "last 10" in the controller query but let's keep all for now.

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
