const fs = require('fs');
const path = require('path');

// Leer el contenido de AgroContext
const contextPath = path.join(__dirname, 'src', 'providers', 'AgroContext.jsx');
const content = fs.readFileSync(contextPath, 'utf8');

// Vamos a crear SyncProvider, TenantProvider, DataProvider y luego un nuevo AgroContext
const syncProviderCode = `import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '@/utils/api';

const SyncContext = createContext();

export function SyncProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState([]);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncToDatabase = async (model, action, data, currentClient) => {
    if (!currentClient || !currentClient.databaseEngine || !Object.keys(currentClient.connectionData || {}).length) {
      console.warn('⚠️ No se puede sincronizar: Configuración de BD incompleta.', currentClient);
      return { success: false, error: 'Configuración BD incompleta' };
    }

    try {
      const response = await fetch(apiUrl('/api/sync-data'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine: currentClient.databaseEngine,
          connectionData: currentClient.connectionData,
          model,
          action,
          data
        })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result;
    } catch (error) {
      console.error('❌ Error de sincronización:', error.message);
      return { success: false, error: error.message };
    }
  };

  return (
    <SyncContext.Provider value={{ isOnline, syncQueue, setSyncQueue, lastSync, setLastSync, syncToDatabase }}>
      {children}
    </SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext);
`;

fs.writeFileSync(path.join(__dirname, 'src', 'providers', 'SyncProvider.jsx'), syncProviderCode);

const tenantProviderCode = `import React, { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext();

export const DEFAULT_CLIENTS = {
  'std-01': { id: 'std-01', name: 'Cliente Estándar Demo', plan: 'Estándar', modules: ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes'], theme: 'Tema Principal' },
  'prm-01': { id: 'prm-01', name: 'Cliente Premium Demo', plan: 'Premium', modules: ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento', 'Mapas'], theme: 'Azul Océano' },
  'adm': { id: 'adm', name: 'Administrador Global', plan: 'Admin', modules: ['ALL'], theme: 'Modo Nocturno', databaseName: 'agroData_admin_global', databaseUser: 'admin_global' }
};

export const normalizeClient = (client) => ({
  ...client,
  databaseName: client.databaseName || \`agroData_\${client.id}\`,
  databaseUser: client.databaseUser || \`\${client.id}_user\`,
  databasePassword: client.databasePassword || '',
  databaseEngine: client.databaseEngine || 'SQL Server',
  connectionData: client.connectionData || {},
  status: client.status || 'Activo',
  suspendedReason: client.suspendedReason || ''
});

export function TenantProvider({ children }) {
  const [clients, setClients] = useState(() => {
    const norm = {};
    for (const [k, v] of Object.entries(DEFAULT_CLIENTS)) norm[k] = normalizeClient(v);
    return norm;
  });

  const [currentClient, setCurrentClient] = useState(() => {
    try {
      const saved = localStorage.getItem('agro_currentClient');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return normalizeClient(DEFAULT_CLIENTS['std-01']);
  });

  useEffect(() => {
    if (currentClient) {
      localStorage.setItem('agro_currentClient', JSON.stringify(currentClient));
    }
  }, [currentClient]);

  const switchClient = (clientId) => {
    if (clients[clientId]) {
      setCurrentClient(clients[clientId]);
      return true;
    }
    return false;
  };

  return (
    <TenantContext.Provider value={{ clients, setClients, currentClient, setCurrentClient, switchClient }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
`;

fs.writeFileSync(path.join(__dirname, 'src', 'providers', 'TenantProvider.jsx'), tenantProviderCode);

const indexCode = `export { AuthProvider, useAuth } from './AuthProvider';
export { ThemeProvider, useTheme, THEME_CONFIG } from './ThemeProvider';
export { TenantProvider, useTenant, DEFAULT_CLIENTS } from './TenantProvider';
export { SyncProvider, useSync } from './SyncProvider';
export { AgroProvider, useAgro } from './AgroContext';
`;

fs.writeFileSync(path.join(__dirname, 'src', 'providers', 'index.js'), indexCode);

console.log("Providers generated successfully.");
