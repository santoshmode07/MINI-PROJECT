import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FindRides from './pages/FindRides';
import OfferRide from './pages/OfferRide';
import RideResults from './pages/RideResults';
import MyBookings from './pages/MyBookings';
import Home from './pages/Home';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { token } = useAuth();

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
           <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/find-rides" element={<FindRides />} />
            <Route path="/offer-ride" element={<OfferRide />} />
            <Route path="/ride-results" element={<RideResults />} />
            <Route path="/bookings" element={<MyBookings />} />
        </Route>

        {/* Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
