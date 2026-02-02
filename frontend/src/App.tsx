import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import StudentDashboard from '@/pages/student/StudentDashboard';
import AdminPanel from '@/components/admin/AdminPanel';
import SchedulerPage from '@/pages/SchedulerPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import ExamsPage from '@/pages/ExamsPage';
import TasksPage from '@/pages/TasksPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SearchPage from '@/pages/SearchPage'; // --- FIX: Import SearchPage ---
import ExamDetailPage from '@/pages/ExamDetailPage';
// Layout Components
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="schedulify-theme">
      {/* 1. <Router> must be on the OUTSIDE */}
      <Router>
        {/* 2. <AuthProvider> must be on the INSIDE */}
        <AuthProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Auth Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
              </Route>
              
              {/* Protected Routes */}
              <Route path="/app" element={<MainLayout />}>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="scheduler" element={<SchedulerPage />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="exams" element={<ExamsPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="search" element={<SearchPage />} /> {/* --- FIX: Add SearchPage route --- */}
              </Route>
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;