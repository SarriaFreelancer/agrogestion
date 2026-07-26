import React from 'react';
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

export function GlobalProvider({ children }) {
  return (
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
  );
}
