import React from 'react';
import { useAgro } from '../../context/AgroContext';

export default function Dashboard() {
  const { calcTotalHa, calcLotesActivos } = useAgro();

  return (
    <div>
      <div className="header">
        <h1>Dashboard</h1>
        <p>Resumen general de tu operación agrícola</p>
      </div>

      <div className="grid-3">
        <div className="glass-card stat-card">
          <h3>Hectáreas Totales</h3>
          <div className="value">{calcTotalHa().toFixed(2)} ha</div>
        </div>
        <div className="glass-card stat-card">
          <h3>Lotes Activos</h3>
          <div className="value">{calcLotesActivos()}</div>
        </div>
        <div className="glass-card stat-card">
          <h3>Actividades Pendientes</h3>
          <div className="value">0</div> {/* Pendiente conectar módulo de planificación */}
        </div>
      </div>
      
      <div className="glass-card">
        <h3>Estado de Suertes</h3>
        <p style={{marginTop: '1rem', color: '#7f8c8d'}}>
          Aquí mostraremos gráficos interactivos para visualizar la distribución de los estados de producción (Sembrado, Previvero, etc.).
        </p>
      </div>
    </div>
  );
}
