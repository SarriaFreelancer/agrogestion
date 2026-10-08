import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'agro_audit_logs';

export const initialAuditLogs = [
  {
    id: 'AUD-1001',
    fecha: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    usuario: 'admin@sarriatech.local',
    usuarioNombre: 'Super Administrador',
    rol: 'Super Admin',
    accion: 'DIAGNOSTICO_IA',
    modulo: 'Copiloto IA',
    descripcion: 'Análisis multiespectral NDVI satelital ejecutado para Suerte A-01 (Índice: 0.76 Vigor Alto)',
    entidadTipo: 'Suerte',
    entidadId: 'SUE-01',
    ip: '192.168.1.45',
    dispositivo: 'Desktop - Chrome 124 (Windows)',
    estado: 'Exitoso'
  },
  {
    id: 'AUD-1002',
    fecha: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    usuario: 'carlos@ingeniolacabana.com',
    usuarioNombre: 'Carlos Gómez',
    rol: 'Administrador',
    accion: 'CREAR',
    modulo: 'Planificación',
    descripcion: 'Generación de Orden de Trabajo OT-2026-088 para Aplicación de Fertilizante NPK en Lote 01',
    entidadTipo: 'Planificacion',
    entidadId: 'OT-2026-088',
    ip: '186.84.90.12',
    dispositivo: 'Tablet Android - PWA AgroGestión',
    estado: 'Exitoso'
  },
  {
    id: 'AUD-1003',
    fecha: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    usuario: 'pedro@agrosur.com',
    usuarioNombre: 'Pedro Martínez',
    rol: 'Administrador',
    accion: 'ACTUALIZAR',
    modulo: 'Maestros',
    descripcion: 'Ajuste de horómetro y tarifa horaria para Tractor John Deere 8320R (Horómetro: 2,450 hrs)',
    entidadTipo: 'Maquinaria',
    entidadId: 'TRAC-01',
    ip: '190.156.44.78',
    dispositivo: 'Desktop - Firefox (Windows)',
    estado: 'Exitoso'
  },
  {
    id: 'AUD-1004',
    fecha: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    usuario: 'maria@ingeniolacabana.com',
    usuarioNombre: 'María López',
    rol: 'Usuario General',
    accion: 'CREAR',
    modulo: 'Monitoreo',
    descripcion: 'Registro de muestreo fitosanitario en Suerte B-01: Barrenador Diatraea en 4.2% de incidencia',
    entidadTipo: 'Monitoreo',
    entidadId: 'MON-441',
    ip: '186.84.90.33',
    dispositivo: 'Mobile Android - PWA',
    estado: 'Exitoso'
  },
  {
    id: 'AUD-1005',
    fecha: new Date(Date.now() - 1000 * 60 * 380).toISOString(),
    usuario: 'admin@sarriatech.local',
    usuarioNombre: 'Super Administrador',
    rol: 'Super Admin',
    accion: 'ACTUALIZAR',
    modulo: 'Estructura Agrícola',
    descripcion: 'Modificación de área efectiva de Suerte C-01 de 18.0 Ha a 18.4 Ha con 4 válvulas de riego',
    entidadTipo: 'Suerte',
    entidadId: 'SUE-03',
    ip: '192.168.1.45',
    dispositivo: 'Desktop - Chrome 124 (Windows)',
    estado: 'Exitoso'
  },
  {
    id: 'AUD-1006',
    fecha: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    usuario: 'carlos@ingeniolacabana.com',
    usuarioNombre: 'Carlos Gómez',
    rol: 'Administrador',
    accion: 'SINCRONIZAR',
    modulo: 'Sincronización',
    descripcion: 'Descarga y sincronización offline de 14 órdenes de campo y 6 muestreos fitosanitarios',
    entidadTipo: 'SyncQueue',
    entidadId: 'BATCH-882',
    ip: '186.84.90.12',
    dispositivo: 'Tablet Android - PWA AgroGestión',
    estado: 'Exitoso'
  },
  {
    id: 'AUD-1007',
    fecha: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    usuario: 'admin@sarriatech.local',
    usuarioNombre: 'Super Administrador',
    rol: 'Super Admin',
    accion: 'LOGIN',
    modulo: 'Autenticación',
    descripcion: 'Inicio de sesión exitoso con credenciales de Super Administrador',
    entidadTipo: 'Sesion',
    entidadId: 'SES-0991',
    ip: '192.168.1.45',
    dispositivo: 'Desktop - Chrome 124 (Windows)',
    estado: 'Exitoso'
  },
  {
    id: 'AUD-1008',
    fecha: new Date(Date.now() - 1000 * 60 * 1800).toISOString(),
    usuario: 'carlos@ingeniolacabana.com',
    usuarioNombre: 'Carlos Gómez',
    rol: 'Administrador',
    accion: 'EXPORTAR_REPORTE',
    modulo: 'Reportes',
    descripcion: 'Exportación a Excel del reporte consolidado de Costos y Aplicación de Insumos Q1',
    entidadTipo: 'Reporte',
    entidadId: 'REP-COSTOS-Q1',
    ip: '186.84.90.12',
    dispositivo: 'Desktop - Chrome 124 (Windows)',
    estado: 'Exitoso'
  }
];

export function useAuditoria(syncToDatabase) {
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading audit logs from localStorage:', e);
    }
    return initialAuditLogs;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auditLogs.slice(0, 500)));
    } catch (e) {
      console.warn('Error saving audit logs to localStorage:', e);
    }
  }, [auditLogs]);

  const registrarAuditoria = useCallback((accion, modulo, descripcion, extra = {}) => {
    const nuevoLog = {
      id: `AUD-${Date.now()}`,
      fecha: new Date().toISOString(),
      accion,
      modulo,
      descripcion,
      usuario: extra.usuario || 'admin@sarriatech.local',
      usuarioNombre: extra.usuarioNombre || 'Super Administrador',
      rol: extra.rol || 'Super Admin',
      entidadTipo: extra.entidadTipo || modulo,
      entidadId: extra.entidadId || 'N/A',
      ip: extra.ip || '127.0.0.1 (Local)',
      dispositivo: extra.dispositivo || 'PWA / Web Client',
      estado: extra.estado || 'Exitoso',
      detalles: extra.detalles || null
    };

    setAuditLogs(prev => [nuevoLog, ...prev]);

    if (syncToDatabase && typeof syncToDatabase === 'function') {
      try {
        syncToDatabase('Auditoria', 'add', nuevoLog);
      } catch (e) {
        console.warn('Error syncing audit log to db:', e);
      }
    }
    return nuevoLog;
  }, [syncToDatabase]);

  const limpiarAuditoria = useCallback(() => {
    setAuditLogs([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    auditLogs,
    setAuditLogs,
    registrarAuditoria,
    limpiarAuditoria
  };
}
