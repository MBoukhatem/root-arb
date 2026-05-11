import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import ServerErrorPage from '@/pages/ServerErrorPage';

/**
 * Top-level error boundary - last line of defence above the router. Renders
 * the generic 500 page when an uncaught error escapes a route boundary.
 */
export function RootErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary fallback={() => <ServerErrorPage />}>{children}</ErrorBoundary>;
}
