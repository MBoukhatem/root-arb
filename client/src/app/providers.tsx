import { type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/shared/i18n/i18n';
import { LanguageProvider } from '@/shared/i18n/LanguageContext';
import { ThemeProvider } from '@/shared/theme/ThemeContext';
import { AuthProvider } from '@/features/auth/AuthContext';
import { RootErrorBoundary } from './RootErrorBoundary';

// Stable QueryClient outside the component so HMR doesn't reset the cache.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Composition root. Order matters:
 *  - QueryClient before Auth so AuthContext can call queryClient.clear() on logout.
 *  - i18n before Language/Theme/Auth so they can call `t()` at mount.
 *  - BrowserRouter wraps RootErrorBoundary so the fallback (ServerErrorPage)
 *    can use <Link> / router hooks — otherwise it crashes with
 *    "Cannot destructure property 'basename' of useContext(...) as null".
 *  - RootErrorBoundary catches errors thrown inside any route.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <BrowserRouter>
                <RootErrorBoundary>
                  {children}
                  <Toaster
                    position="top-right"
                    containerStyle={{ pointerEvents: 'none' }}
                    toastOptions={{ style: { pointerEvents: 'auto' } }}
                  />
                </RootErrorBoundary>
              </BrowserRouter>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
