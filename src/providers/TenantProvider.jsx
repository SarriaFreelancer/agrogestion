import React, { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext();

export const DEFAULT_CLIENTS = {
  'std-01': { id: 'std-01', name: 'Cliente Estándar Demo', plan: 'Estándar', modules: ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes'], theme: 'Tema Principal' },
  'prm-01': { id: 'prm-01', name: 'Cliente Premium Demo', plan: 'Premium', modules: ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento', 'Mapas'], theme: 'Azul Océano' },
  'adm': { id: 'adm', name: 'Administrador Global', plan: 'Admin', modules: ['ALL'], theme: 'Modo Nocturno', databaseName: 'agroData_admin_global', databaseUser: 'admin_global' }
};

export const normalizeClient = (client) => ({
  ...client,
  databaseName: client.databaseName || `agroData_${client.id}`,
  databaseUser: client.databaseUser || `${client.id}_user`,
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
