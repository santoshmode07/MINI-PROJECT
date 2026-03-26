let io;

const init = (ioInstance) => {
  io = ioInstance;

  io.on('connection', (socket) => {
    const userId = socket.user?.id || socket.user?._id;
    console.log(`[Socket] User connected: ${userId} (SocketID: ${socket.id})`);

    if (userId) {
      // Join personal room for 1:1 notifications
      socket.join(`user_${userId}`);
      console.log(`[Socket] User ${userId} joined room: user_${userId}`);
      
      // Admin room if applicable
      if (socket.user.role === 'admin') {
        socket.join('admin_pool');
        console.log(`[Socket] Admin ${userId} joined room: admin_pool`);
      }
    }

    // Join Ride Room
    socket.on('join_ride_room', (rideId) => {
      socket.join(`ride_${rideId}`);
      console.log(`[Socket] Socket ${socket.id} joined room: ride_${rideId}`);
    });

    // Leave Ride Room
    socket.on('leave_ride_room', (rideId) => {
      socket.leave(`ride_${rideId}`);
      console.log(`[Socket] Socket ${socket.id} left room: ride_${rideId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${userId}`);
    });
  });
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToRide = (rideId, event, data) => {
  if (io) {
    io.to(`ride_${rideId}`).emit(event, data);
  }
};

const emitToAdmin = (event, data) => {
  if (io) {
    io.to('admin_pool').emit(event, data);
  }
};

const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  init,
  emitToUser,
  emitToRide,
  emitToAdmin,
  emitToAll
};
