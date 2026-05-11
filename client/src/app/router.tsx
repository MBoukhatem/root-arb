import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';

// Lazy-load every page so initial bundle stays light per agent_02 R3 §1.6.
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const RootsPage = lazy(() => import('@/features/roots/RootsPage'));
const RootDetailPage = lazy(() => import('@/features/roots/RootDetailPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const LearnPage = lazy(() => import('@/features/learn/LearnPage'));
const ConstellationPage = lazy(() => import('@/features/constellation/ConstellationPage'));

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullscreen />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/explore" element={<RootsPage />} />
        <Route path="/roots/:id" element={<RootDetailPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/constellation" element={<ConstellationPage />} />
        </Route>

        {/* 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
