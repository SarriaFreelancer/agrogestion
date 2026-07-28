import React, { createContext, useContext, useEffect } from 'react';
import { useSync } from './SyncProvider';
import { useTenant } from './TenantProvider';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { PLAN_CONFIG, THEME_CONFIG } from './mocks';

// Custom Hooks Modulares
import { useConfiguracion } from './hooks/useConfiguracion';
import { useEstructura } from './hooks/useEstructura';
import { useEmpresas } from './hooks/useEmpresas';
import { useMonitoreo } from './hooks/useMonitoreo';
import { useOperaciones } from './hooks/useOperaciones';
import { useHydration } from './hooks/useHydration';

// Hooks de Maestros
import { useActividades } from './hooks/maestros/useActividades';
import { useCuadrillas } from './hooks/maestros/useCuadrillas';
import { useCultivos } from './hooks/maestros/useCultivos';
import { useMaquinarias } from './hooks/maestros/useMaquinarias';
import { useProductos } from './hooks/maestros/useProductos';
import { useProveedores } from './hooks/maestros/useProveedores';
import { useTrabajadores } from './hooks/maestros/useTrabajadores';
import { useUnidades } from './hooks/maestros/useUnidades';

const AgroContext = createContext();

export function AgroProvider({ children }) {
  const { syncToDatabase, syncQueue, isOnline, processSync, setSyncQueue, lastSync } = useSync();
  const { currentClient, clients, setCurrentClient, setClients, switchClient } = useTenant();
  const { currentUser } = useAuth();

  // 1. Configuracion Global
  const config = useConfiguracion(syncToDatabase);
  
  // 2. Estructura Agrícola
  const estructura = useEstructura(syncToDatabase);

  // 2.5. Empresas
  const empresasHook = useEmpresas(syncToDatabase);

  // 3. Maestros
  const actividades = useActividades(syncToDatabase);
  const cuadrillas = useCuadrillas(syncToDatabase);
  const cultivos = useCultivos(syncToDatabase);
  const maquinarias = useMaquinarias(syncToDatabase);
  const productos = useProductos(syncToDatabase);
  const proveedores = useProveedores(syncToDatabase);
  const trabajadores = useTrabajadores(syncToDatabase);
  const unidades = useUnidades(syncToDatabase);

  // 4. Operaciones
  const operaciones = useOperaciones(syncToDatabase, productos.productos, productos.setProductos);

  // 5. Monitoreo
  const monitoreo = useMonitoreo(syncToDatabase);

  // 6. Sincronizacion
  // Necesitamos pasar los setters a useHydration para que cargue desde la DB al inicio
  const setters = {
    setConfiguraciones: config.setConfiguraciones,
    setSectores: estructura.setSectores,
    setActividades: actividades.setActividades,
    setGruposActividades: actividades.setGruposActividades,
    setCuadrillas: cuadrillas.setCuadrillas,
    setCultivos: cultivos.setCultivos,
    setMaquinarias: maquinarias.setMaquinarias,
    setTiposMaquinaria: maquinarias.setTiposMaquinaria,
    setProductos: productos.setProductos,
    setTiposProductos: productos.setTiposProductos,
    setProveedores: proveedores.setProveedores,
    setTrabajadores: trabajadores.setTrabajadores,
    setUnidades: unidades.setUnidades,
    setControlesAgro: monitoreo.setControlesAgro,
    setRegistrosControles: monitoreo.setRegistrosControles,
    setMantenimientos: monitoreo.setMantenimientos,
    setPlanificaciones: operaciones.setPlanificaciones,
    setUsuarios: config.setUsuarios,
    setCategoriasAcceso: config.setCategoriasAcceso,
    setEmpresas: empresasHook.setEmpresas
  };

  const { isHydrating, isHydratingRef } = useHydration(currentClient, setters);
  const { applyTheme } = useTheme();

  useEffect(() => {
    if (currentClient && config.configuraciones) {
      applyTheme(currentClient.theme || 'Tema Principal', config.configuraciones.modoOscuro === 1);
    }
  }, [currentClient?.theme, config.configuraciones?.modoOscuro]);

  // Funciones de Clientes (Stub o implementacion básica)
  const addClient = (key, data) => setClients(p => ({...p, [key]: data}));
  const updateClient = (key, plan, customModules, theme, dbConfig) => {
    setClients(p => {
      const c = {...p[key], plan, theme, ...dbConfig};
      if (customModules) c.modules = customModules;
      if (currentClient.id === c.id) setCurrentClient(c);
      return {...p, [key]: c};
    });
  };
  const editClient = (key, updates) => setClients(p => {
    const c = {...p[key], ...updates};
    if (currentClient.id === c.id) setCurrentClient(c);
    return {...p, [key]: c};
  });
  const suspendClient = (key, reason) => editClient(key, { status: 'Suspendido', suspendedReason: reason });
  const reactivateClient = (key) => editClient(key, { status: 'Activo', suspendedReason: '' });
  const deleteClient = (key) => setClients(p => { const n = {...p}; delete n[key]; return n; });
  const resetClientData = () => alert("Not implemented in refactored version");

  const value = {
    ...config,
    ...estructura,
    ...empresasHook,
    ...actividades,
    ...cuadrillas,
    ...cultivos,
    ...maquinarias,
    ...productos,
    ...proveedores,
    ...trabajadores,
    ...unidades,
    ...operaciones,
    ...monitoreo,
    isHydrating,
    isHydratingRef,
    
    // Auth & Sync exports for backwards compatibility
    currentUser,
    currentClient, clients, setCurrentClient, switchClient,
    addClient, updateClient, editClient, suspendClient, reactivateClient, deleteClient, resetClientData,
    syncQueue, isOnline, processSync, setSyncQueue, lastSync,
    PLAN_CONFIG, THEME_CONFIG
  };

  return (
    <AgroContext.Provider value={value}>
      {children}
    </AgroContext.Provider>
  );
}

export const useAgro = () => useContext(AgroContext);
