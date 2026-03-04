import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * role: expected role string ("student" or "admin")
 */
const ProtectedRoute = ({ role }) => {
  const { user } = useAuth();

  if (!user) {
    // not logged in
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // role mismatch
    return <Navigate to="/login" replace />;
  }

  // nested routes will render here
  return <Outlet />;
};

export default ProtectedRoute;
