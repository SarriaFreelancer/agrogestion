import React, { createContext, useContext, useState, useEffect } from 'react';
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
