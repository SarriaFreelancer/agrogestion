import React from 'react';
import { useAgro } from '../../context/AgroContext';
import { RefreshCw, Smartphone, Building2, CheckCircle2, Clock, Wifi, HardDriveDownload, Send } from 'lucide-react';

export default function Sincronizacion() {
  const { isOnline, syncQueue, lastSync, processSync } = useAgro();

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Centro de Sincronización Móvil</h1>
            <span className="badge badge-active text-[11px]">Sync offline/online</span>
          </div>
          <p className="text-sm text-[#9CA3AF]">
            Gestiona la transferencia bidireccional de datos entre la oficina central y los dispositivos de campo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lado Oficina -> Campo */}
        <div className="glass-card !p-6 border-l-4 border-l-emerald-500 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HardDriveDownload size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Descarga de Formularios</h3>
              <p className="text-xs text-gray-400">Maestros, Suertes y Órdenes Planificadas</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed">
            <strong className="text-emerald-400 block mb-1">Estado de Caché Local:</strong>
            Los formularios y maestros se descargan automáticamente al iniciar sesión. Toda la configuración está disponible en tu dispositivo para operar 100% offline en el campo.
          </div>
        </div>

        {/* Lado Campo -> Oficina */}
        <div className="glass-card !p-6 border-l-4 border-l-amber-500 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Send size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Envío de Ejecuciones</h3>
              <p className="text-xs text-gray-400">Labores realizadas y Monitoreos de campo</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
            <strong className="text-amber-400 block mb-1">Pendientes de Envío:</strong>
            Tienes <strong className="text-white">{syncQueue.length}</strong> registros capturados en campo esperando a ser sincronizados con la oficina central.
          </div>
        </div>
      </div>

      {/* Control Manual de Sync */}
      <div className="glass-card !p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Control de Sincronización Manual</h3>
            <p className="text-xs text-gray-400">Ejecute la sincronización cuando disponga de conexión estable a internet</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-gray-300">
            <Wifi size={14} className={isOnline ? "text-emerald-400" : "text-red-400"} />
            <span>{isOnline ? 'Internet Conectado' : 'Sin Conexión'}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <Clock size={15} />
            <span>Última sincronización exitosa: <strong className="text-white">{lastSync ? new Date(lastSync).toLocaleString() : 'Nunca'}</strong></span>
          </div>

          <button 
            className="btn-primary !m-0 !w-full sm:!w-auto" 
            onClick={processSync} 
            disabled={!isOnline || syncQueue.length === 0}
          >
            <RefreshCw size={17} />
            <span>{isOnline ? 'Sincronizar Datos Ahora' : 'Esperando Conexión...'}</span>
          </button>
        </div>

        <div className="glass-card">
          <h3>Resumen de la Cola</h3>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Ejecuciones de Labores:</span>
              <strong>{syncQueue.filter(i => i.module === 'Ejecucion').length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Monitoreos Agronómicos:</span>
              <strong>{syncQueue.filter(i => i.module === 'Monitoreo').length}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Último Sincronización:</span>
              <small>{lastSync ? new Date(lastSync).toLocaleString() : 'Pendiente'}</small>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h3>Detalle de Registros Pendientes</h3>
        {syncQueue.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
            No hay datos esperando para ser enviados.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '0.5rem' }}>Módulo</th>
                <th style={{ padding: '0.5rem' }}>Información</th>
                <th style={{ padding: '0.5rem' }}>Fecha Local</th>
                <th style={{ padding: '0.5rem' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {syncQueue.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.8rem 0.5rem' }}><strong>{item.module}</strong></td>
                  <td style={{ padding: '0.8rem 0.5rem' }}>{item.info || 'Registro de campo'}</td>
                  <td style={{ padding: '0.8rem 0.5rem' }}>{new Date(item.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '0.8rem 0.5rem' }}>
                    <span className="badge badge-inactive">Pendiente de Envío</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
