import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BlrSportsComplexPage from './pages/BlrSportsComplexPage';
import MyAccountPage from './pages/MyAccountPage';
import RegistrationPage from './pages/RegistrationPage';
import RulesPage from './pages/RulesPage';
import HelpPage from './pages/HelpPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/bangalore-sports" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/bangalore-sports-complex" element={<BlrSportsComplexPage />} />
        <Route path="/my-account" element={<MyAccountPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/rules-and-regulation" element={<RulesPage />} />
        <Route path="/help" element={<HelpPage />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
