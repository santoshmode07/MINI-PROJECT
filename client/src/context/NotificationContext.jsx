import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [driverStats, setDriverStats] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get('/notifications');
      
      // Check for new notifications to show toast
      const newOnes = data.data.filter(n => !n.isRead && !notifications.find(prev => prev._id === n._id));
      newOnes.forEach(n => {
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

      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, [token, notifications, navigate]);

  const fetchDriverStats = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get('/rides/driver-stats');
      setDriverStats(data.data);
    } catch (error) {
      console.error('Failed to fetch driver stats', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchDriverStats();
      
      const interval = setInterval(() => {
        fetchNotifications();
        fetchDriverStats();
      }, 15000); // Poll every 15 seconds

      return () => clearInterval(interval);
    }
  }, [token, fetchNotifications, fetchDriverStats]);

  const markAsRead = async () => {
    try {
      await api.patch('/notifications/read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      driverStats, 
      markAsRead, 
      refreshStats: fetchDriverStats 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
