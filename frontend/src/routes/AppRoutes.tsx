import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';

// Pages
import { LoginPage } from '../pages/Login';
import { DashboardPage } from '../pages/Dashboard';
import { RepositoryPage } from '../pages/Repository';
import { ReviewPage } from '../pages/Review';
import { TrainingPage } from '../pages/Training';
import { SettingsPage } from '../pages/Settings';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/repository/:id" element={<RepositoryPage />} />
        <Route path="/review/:scanId" element={<ReviewPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
