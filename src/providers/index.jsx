import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { TenantProvider } from './TenantProvider';
import { SyncProvider } from './SyncProvider';
import { AgroProvider } from './AgroContext';

export { useAuth } from './AuthProvider';
export { useTheme, THEME_CONFIG } from './ThemeProvider';
export { useTenant, DEFAULT_CLIENTS } from './TenantProvider';
export { useSync } from './SyncProvider';
export { useAgro } from './AgroContext';

// Crear el cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos por defecto
    },
  },
});

export function GlobalProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TenantProvider>
          <AuthProvider>
            <SyncProvider>
              <AgroProvider>
                {children}
              </AgroProvider>
            </SyncProvider>
          </AuthProvider>
        </TenantProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
