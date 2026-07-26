import React, { useEffect, useRef, useState } from 'react';
import { useAgro } from '../../context/AgroContext';

export default function MapaCalor() {
  const { registrosControles, controlesAgro, sectores } = useAgro();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);

  const [selectedControl, setSelectedControl] = useState('');
  const [selectedVar, setSelectedVar] = useState('');

  // Filtrar registros que tengan coordenadas
  const registrosConGps = registrosControles.filter(r => r.lat && r.lng);
  
  const controlesDisponibles = controlesAgro.filter(c => 
    registrosConGps.some(r => r.controlId === r.id)
  );

  const variablesDisponibles = controlesAgro.find(c => c.id === selectedControl)?.variables || [];

  useEffect(() => {
    if (!mapInstance.current && window.L) {
      mapInstance.current = window.L.map(mapRef.current).setView([3.5, -76.3], 13); // Centrado inicial genérico (Valle del Cauca)
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      markersLayer.current = window.L.layerGroup().addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        // mapInstance.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    // Limpiar marcadores anteriores
    markersLayer.current.clearLayers();

    // 1. Dibujar Polígonos de las Suertes
    sectores.forEach(s => {
      s.fincas?.forEach(f => {
        f.lotes?.forEach(l => {
          l.suertes?.forEach(suerte => {
            if (suerte.geometria && suerte.geometria.length > 2) {
              // Buscar el último registro de esta suerte para el control seleccionado
              const lastRecord = [...registrosControles]
                .reverse()
                .find(r => r.suerteId === r.id && (!selectedControl || r.controlId === selectedControl));

              let fillColor = '#e0e0e0'; // Gris si no hay datos
              if (lastRecord) {
                const controlDef = controlesAgro.find(c => c.id === lastRecord.controlId);
                const varId = selectedVar || controlDef?.variables?.[0]?.id;
                const valor = lastRecord.valores?.[varId];
                const varDef = controlDef?.variables?.find(v => v.id === varId);
                
                if (varDef && varDef.tipo === 'numérico') {
                  const num = Number(valor);
                  const rango = varDef.rangos?.find(rg => num >= rg.min && num <= rg.max);
                  if (rango) fillColor = rango.color;
                }
              }

              const polygon = window.L.polygon(suerte.geometria, {
                color: '#388e3c',
                weight: 2,
                fillColor: fillColor,
                fillOpacity: 0.5
              }).addTo(markersLayer.current);

              polygon.bindPopup(`<strong>Suerte: ${suerte.name}</strong><br/>Área: ${suerte.hectareas} ha`);
            }
          });
        });
      });
    });

    // 2. Dibujar Marcadores de Monitoreo
    const filteredRecords = registrosConGps.filter(r => {
      const matchControl = !selectedControl || r.controlId === selectedControl;
      const matchVar = !selectedVar || (r.valores && r.valores[selectedVar] !== undefined);
      return matchControl && matchVar;
    });

    if (filteredRecords.length > 0) {
      const points = [];
      filteredRecords.forEach(r => {
        const controlDef = controlesAgro.find(c => c.id === r.controlId);
        const varId = selectedVar || (controlDef?.variables?.[0]?.id);
        const valor = r.valores?.[varId];
        const varDef = controlDef?.variables?.find(v => v.id === varId);
        
        let color = '#2196f3'; // Azul por defecto
        let mensaje = 'N/A';

        if (varDef && varDef.tipo === 'numérico') {
          const num = Number(valor);
          const rango = varDef.rangos?.find(rg => num >= rg.min && num <= rg.max);
          if (rango) {
            color = rango.color;
            mensaje = rango.mensaje;
          }
        }

        const marker = window.L.circleMarker([r.lat, r.lng], {
          radius: 12,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif;">
            <strong style="color: ${color}">${r.controlNombre}</strong><br/>
            <strong>Suerte:</strong> ${r.suerteNombre}<br/>
            <strong>Valor:</strong> ${valor} (${mensaje})<br/>
            <small>${new Date(r.fecha).toLocaleString()}</small>
          </div>
        `);
        
        marker.addTo(markersLayer.current);
        points.push([r.lat, r.lng]);
      });

      // Ajustar vista para mostrar todos los puntos
      if (points.length > 0) {
        mapInstance.current.fitBounds(window.L.latLngBounds(points), { padding: [50, 50] });
      }
    }
  }, [registrosControles, selectedControl, selectedVar]);

  return (
    <div className="space-y-8 fade-in p-6 lg:p-10 h-full w-full overflow-y-auto custom-scrollbar bg-transparent">
      <div className="header">
        <h1>Mapas de Calor y Monitoreo Geográfico</h1>
        <p>Visualización espacial de plagas, enfermedades y variables agronómicas.</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="input-group" style={{ marginBottom: 0, minWidth: '250px' }}>
          <label className="input-label">Control Agronómico</label>
          <select className="input-field" value={selectedControl} onChange={e => { setSelectedControl(e.target.value); setSelectedVar(''); }}>
            <option value="">Ver Todos</option>
            {controlesDisponibles.map(c => <option key={c.id} value={cultivo.id}>{c.nombre}</option>)}
          </select>
        </div>

        {selectedControl && (
          <div className="input-group" style={{ marginBottom: 0, minWidth: '250px' }}>
            <label className="input-label">Variable a Visualizar</label>
            <select className="input-field" value={selectedVar} onChange={e => setSelectedVar(e.target.value)}>
              <option value="">Seleccione Variable...</option>
              {variablesDisponibles.map(v => <option key={v.id} value={cultivo.id}>{v.nombre}</option>)}
            </select>
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
          {selectedVar && variablesDisponibles.find(v => v.id === selectedVar)?.rangos?.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: r.color }}></div>
              <span>{r.mensaje} ({r.min}-{r.max})</span>
            </div>
          ))}
        </div>
      </div>

      <div 
        ref={mapRef} 
        className="glass-card" 
        style={{ height: '600px', width: '100%', padding: 0, overflow: 'hidden', border: 'none', borderRadius: '15px', zIndex: 1 }}
      >
        {!window.L && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            Cargando mapas...
          </div>
        )}
      </div>
    </div>
  );
}
