import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDonors from './pages/admin/ManageDonors';
import ManageHospitals from './pages/admin/ManageHospitals';
import Inventory from './pages/admin/Inventory';
import Requests from './pages/admin/Requests';
import Alerts from './pages/admin/Alerts';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorAppointments from './pages/donor/DonorAppointments';
import DonorEligibility from './pages/donor/DonorEligibility';

// Hospital Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import RequestBlood from './pages/hospital/RequestBlood';
import TrackRequests from './pages/hospital/TrackRequests';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routing */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Dashboard Portals */}
          <Route element={<DashboardLayout />}>
            {/* Admin Portal */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/donors" element={<ManageDonors />} />
            <Route path="/admin/hospitals" element={<ManageHospitals />} />
            <Route path="/admin/inventory" element={<Inventory />} />
            <Route path="/admin/requests" element={<Requests />} />
            <Route path="/admin/alerts" element={<Alerts />} />

            {/* Donor Portal */}
            <Route path="/donor" element={<DonorDashboard />} />
            <Route path="/donor/history" element={<DonorDashboard />} />
            <Route path="/donor/appointments" element={<DonorAppointments />} />
            <Route path="/donor/eligibility" element={<DonorEligibility />} />

            {/* Hospital Portal */}
            <Route path="/hospital" element={<HospitalDashboard />} />
            <Route path="/hospital/request" element={<RequestBlood />} />
            <Route path="/hospital/history" element={<TrackRequests />} />
          </Route>

          {/* Fallback Catch */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
