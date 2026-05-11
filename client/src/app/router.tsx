import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { PublicLayout } from '@/shared/layout/PublicLayout';
import { AppLayout } from '@/shared/layout/AppLayout';

// Lazy-load every page so the initial bundle stays light (agent_02 R3 §1.6).
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const ExplorePage = lazy(() => import('@/features/roots/ExplorePage'));
const RootDetailPage = lazy(() => import('@/features/roots/RootDetailPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const LearnPage = lazy(() => import('@/features/learn/LearnPage'));
const ConstellationPage = lazy(() => import('@/features/constellation/ConstellationPage'));
const NotesPage = lazy(() => import('@/features/notes/NotesPage'));
const CollectionsPage = lazy(() => import('@/features/collections/CollectionsPage'));
const ProfilePage = lazy(() => import('@/features/auth/ProfilePage'));

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullscreen />}>
      <Routes>
        {/* Public layout (Navbar only, no sidebar) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/roots/:id" element={<RootDetailPage />} />
        </Route>

        {/* Protected app layout (Navbar + Sidebar) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/constellation" element={<ConstellationPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
