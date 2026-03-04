import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

// page placeholders
import Login from '../pages/Login';
import Register from '../pages/Register';

import StudentDashboard from '../pages/student/Dashboard';
import StudentUpload from '../pages/student/Upload';
import StudentCompanies from '../pages/student/Companies';
import StudentResult from '../pages/student/Result';
import StudentRoadmap from '../pages/student/Roadmap';

import AdminDashboard from '../pages/admin/Dashboard';
import AdminAddCompany from '../pages/admin/AddCompany';
import AdminCompanies from '../pages/admin/Companies';
import AdminAnalytics from '../pages/admin/Analytics';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route
      path="/student/*"
      element={<ProtectedRoute role="student" />}
    >
      <Route
        element={<MainLayout />}
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="upload" element={<StudentUpload />} />
        <Route path="companies" element={<StudentCompanies />} />
        <Route path="result" element={<StudentResult />} />
        <Route path="roadmap" element={<StudentRoadmap />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Route>

    <Route
      path="/admin/*"
      element={<ProtectedRoute role="admin" />}
    >
      <Route
        element={<MainLayout />}
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="add-company" element={<AdminAddCompany />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRoutes;
