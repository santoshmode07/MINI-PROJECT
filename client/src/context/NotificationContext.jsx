import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [driverStats, setDriverStats] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { socket, isConnected } = useSocket();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const initialLoadDone = React.useRef(false);
  const notifiedIds = React.useRef(new Set());

  const fetchNotifications = useCallback(async () => {
    if (!token || !navigator.onLine) return;
    try {
      const { data } = await api.get('/notifications');
      
      if (initialLoadDone.current) {
        // Only toast Truly NEW ones that we haven't seen in this session
        const newOnes = data.data.filter(n => !n.isRead && !notifiedIds.current.has(n._id));
        newOnes.forEach(n => {
          notifiedIds.current.add(n._id);
          toast.info(n.message, {
            onClick: () => {
              if (n.type === 'NEW_BOOKING' || n.type === 'BOOKING_CANCELLED') {
                navigate(`/my-rides/${n.rideId}/passengers`);
              } else if (n.type === 'RIDE_CANCELLED') {
                navigate('/bookings');
              }
            },
            autoClose: 5000
          });
        });
      } else {
        // First load: just record IDs without toasting
        data.data.forEach(n => notifiedIds.current.add(n._id));
        initialLoadDone.current = true;
      }

      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, [token, navigate]);

  const fetchDriverStats = useCallback(async () => {
    if (!token || !navigator.onLine) return;
    try {
      const { data } = await api.get('/rides/driver-stats');
      setDriverStats(data.data);
    } catch (error) {
      console.error('Failed to fetch driver stats', error);
    }
  }, [token]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (token) {
        fetchNotifications();
        fetchDriverStats();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (token && isOnline) {
      fetchNotifications();
      fetchDriverStats();
      
      const interval = setInterval(() => {
        if (navigator.onLine && !isConnected) {
          fetchNotifications();
          fetchDriverStats();
        }
      }, 300000); // 5 minute fallback

      return () => {
        clearInterval(interval);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token, fetchNotifications, fetchDriverStats, isOnline]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = ({ notification, unreadCount }) => {
      console.log('[Socket] New notification received:', notification);
      if (notifiedIds.current.has(notification._id)) return; // Prevent duplicates

      notifiedIds.current.add(notification._id);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(unreadCount);
      toast.info(notification.message, {
        onClick: () => {
          if (notification.type === 'NEW_BOOKING' || notification.type === 'BOOKING_CANCELLED') {
            navigate(`/my-rides/${notification.rideId}/passengers`);
          } else if (notification.type === 'RIDE_CANCELLED') {
            navigate('/bookings');
          }
        },
        autoClose: 6000
      });
    };

    const handleWalletUpdated = (data) => {
      console.log('[Socket] Wallet updated:', data);
      refreshUser(); // Refresh full user object to get new balance
      toast.success(`Wallet updated: ₹${data.transaction.amount} ${data.transaction.type === 'credit' ? 'added' : 'deducted'}`);
    };

    const handleRideStatusChanged = (data) => {
      console.log('[Socket] Ride status changed:', data);
      toast.info(`Ride Alert: ${data.message}`);
      fetchNotifications(); // Refresh list to get new notification object
    };

    const handleNewBooking = (data) => {
      console.log('[Socket] New booking received for stats update');
      fetchDriverStats(); // Refresh stats for the bubble on My Rides
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('wallet_updated', handleWalletUpdated);
    socket.on('ride_status_changed', handleRideStatusChanged);
    socket.on('new_booking_received', handleNewBooking);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('wallet_updated', handleWalletUpdated);
      socket.off('ride_status_changed', handleRideStatusChanged);
      socket.off('new_booking_received', handleNewBooking);
    };
  }, [socket, isConnected, navigate, refreshUser, fetchNotifications, fetchDriverStats]);

  const markAsRead = async () => {
    try {
      await api.patch('/notifications/read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const contextValue = React.useMemo(() => ({ 
    notifications, 
    unreadCount, 
    driverStats, 
    markAsRead, 
    refreshStats: fetchDriverStats 
  }), [notifications, unreadCount, driverStats, fetchDriverStats]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
