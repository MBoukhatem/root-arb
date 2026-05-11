// Public hook surface for authentication. Wraps AuthContext so feature code
// imports `@/features/auth/useAuth` rather than the context module directly.
export { useAuthContext as useAuth } from './AuthContext';
