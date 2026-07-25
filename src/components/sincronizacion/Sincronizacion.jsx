import React from 'react';
import { useAgro } from '../../context/AgroContext';

export default function Sincronizacion() {
  const { isOnline, syncQueue, lastSync, processSync } = useAgro();

  return (
    <div className="fade-in">
      <div className="header">
        <h1>Centro de Sincronización Móvil</h1>
        <p>Gestiona la transferencia de datos entre la oficina (Desktop) y el campo (Móvil).</p>
      </div>

      <div className="grid-2">
        {/* Lado Oficina -> Campo */}
        <div className="glass-card" style={{ borderLeft: '5px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>🏢 ➔ 📱</div>
            <div>
              <h3 style={{ margin: 0 }}>Descarga de Formularios</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Maestros, Suertes y Órdenes Planificadas</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#e8f5e9', borderRadius: '8px', fontSize: '0.9rem' }}>
            <strong>Estado:</strong> Los formularios se descargan automáticamente al iniciar sesión con internet. Toda la configuración de actividades y controles ya está disponible en tu dispositivo para uso offline.
          </div>
        </div>

        {/* Lado Campo -> Oficina */}
        <div className="glass-card" style={{ borderLeft: '5px solid #ffa000' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>🚜 ➔ 💻</div>
            <div>
              <h3 style={{ margin: 0 }}>Envío de Ejecuciones</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Labores realizadas y Monitoreos de campo</p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3e0', borderRadius: '8px', fontSize: '0.9rem' }}>
            <strong>Pendientes:</strong> Tienes <strong>{syncQueue.length}</strong> registros capturados en campo esperando a ser enviados a la oficina central.
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '2rem' }}>
        <div className="glass-card" style={{ borderTop: `5px solid ${isOnline ? '#4caf50' : '#f44336'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '15px', height: '15px', borderRadius: '50%', 
              backgroundColor: isOnline ? '#4caf50' : '#f44336',
              boxShadow: `0 0 10px ${isOnline ? '#4caf50' : '#f44336'}`
            }}></div>
            <h2 style={{ margin: 0 }}>{isOnline ? 'Conexión Activa' : 'Sin Conexión'}</h2>
          </div>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            {isOnline 
              ? 'Puedes sincronizar tus datos ahora mismo con el servidor central.' 
              : 'Estás trabajando en modo local. Los datos se guardan de forma segura en tu móvil hasta que recuperes la conexión.'}
          </p>
          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '1rem', height: '50px', fontSize: '1.1rem', opacity: (!isOnline || syncQueue.length === 0) ? 0.5 : 1 }}
            disabled={!isOnline || syncQueue.length === 0}
            onClick={processSync}
          >
            {isOnline ? '🚀 ENVIAR DATOS A OFICINA' : '🚫 ESPERANDO INTERNET...'}
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
