import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';

/**
 * Wraps protected routes. While the AuthContext bootstrap is running we show
 * a spinner; once ready we either render the outlet or redirect to /login.
 *
 * Per agent_02 R3 §4 ProtectedRoute pattern.
 */
export function ProtectedRoute() {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <LoadingSpinner fullscreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
