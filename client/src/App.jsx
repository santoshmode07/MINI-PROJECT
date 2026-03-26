import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './context/AuthContext';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FindRides = lazy(() => import('./pages/FindRides'));
const OfferRide = lazy(() => import('./pages/OfferRide'));
const RideResults = lazy(() => import('./pages/RideResults'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const MyRides = lazy(() => import('./pages/MyRides'));
const RidePassengers = lazy(() => import('./pages/RidePassengers'));
const BoardingScreen = lazy(() => import('./pages/BoardingScreen'));
const Profile = lazy(() => import('./pages/Profile'));
const PriorityBenefits = lazy(() => import('./pages/PriorityBenefits'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));

const App = () => {
  const { token } = useAuth();

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Suspense fallback={<LoadingSpinner />}>
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
              <Route path="/my-rides" element={<MyRides />} />
              <Route path="/my-rides/:rideId/passengers" element={<RidePassengers />} />
              <Route path="/my-rides/:rideId/boarding" element={<BoardingScreen />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/priority-benefits" element={<PriorityBenefits />} />
              <Route path="/wallet-history" element={<TransactionHistory />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
          </Route>

          {/* Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
