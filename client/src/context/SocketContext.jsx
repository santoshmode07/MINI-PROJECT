import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'], // Prefer websockets
      reconnectionAttempts: 5,
      reconnectionDelay: 5000
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to server:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const joinRideRoom = useCallback((rideId) => {
    if (socket && isConnected) {
      socket.emit('join_ride_room', rideId);
      console.log(`[Socket] Requested to join ride room: ${rideId}`);
    }
  }, [socket, isConnected]);

  const leaveRideRoom = useCallback((rideId) => {
    if (socket && isConnected) {
      socket.emit('leave_ride_room', rideId);
      console.log(`[Socket] Requested to leave ride room: ${rideId}`);
    }
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinRideRoom, leaveRideRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
