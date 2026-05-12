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
 *  - ErrorBoundary outermost so it catches provider errors too.
 *  - QueryClient before Auth so AuthContext can call queryClient.clear() on logout.
 *  - i18n before Language/Theme/Auth so they can call `t()` at mount.
 *  - Router innermost so deep components can use hooks (useLocation etc.).
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <RootErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <BrowserRouter>
                  {children}
                  <Toaster
                    position="top-right"
                    containerStyle={{ pointerEvents: 'none' }}
                    toastOptions={{ style: { pointerEvents: 'auto' } }}
                  />
                </BrowserRouter>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </RootErrorBoundary>
  );
}
