import React, { useState } from 'react';
import { useAgro } from '../../context/AgroContext';

export default function Mantenimiento() {
  const { 
    maquinarias, 
    mantenimientos, 
    addMantenimiento, 
    deleteMantenimiento,
    globalCultivo 
  } = useAgro();

  const [selectedMaq, setSelectedMaq] = useState(null);
  const [formData, setFormData] = useState({ 
    tipo: 'Preventivo', 
    horometer: '', 
    descripcion: '', 
    costo: 0,
    tecnico: '' 
  });

  // Calcular alertas
  const alertas = maquinarias.map(m => {
    const horasDesdeUltimo = m.horometroActual - (m.ultimoMantenimientoHoras || 0);
    const frecuencia = m.frecuenciaMantenimiento || 250;
    const faltan = frecuencia - horasDesdeUltimo;
    
    let status = 'good'; // Verde
    if (faltan <= 0) status = 'danger'; // Rojo
    else if (faltan <= 50) status = 'warning'; // Amarillo

    return { ...m, horasDesdeUltimo, faltan, status };
  }).filter(m => m.status !== 'good');

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedMaq) return alert("Seleccione una maquinaria");
    if (!formData.horometer || !formData.descripcion) return alert("Horómetro y descripción requeridos");

    addMantenimiento({
      ...formData,
      maquinariaId: selectedMaq.id,
      maquinariaNombre: selectedMaq.name,
      maquinariaCodigo: selectedMaq.id
    });

    setFormData({ tipo: 'Preventivo', horometer: '', descripcion: '', costo: 0, tecnico: '' });
    setSelectedMaq(null);
    alert("Mantenimiento registrado correctamente");
  };

  return (
    <div className="space-y-8 fade-in p-6 lg:p-10 h-full w-full overflow-y-auto custom-scrollbar bg-transparent">
      <div className="header border-b border-white/10 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-contrast)] tracking-tight">Gestión de Mantenimiento</h1>
        <p className="text-sm text-[#9CA3AF]">Control preventivo y correctivo de maquinaria basado en horómetro.</p>
      </div>

      {/* Panel de Alertas */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ borderLeft: '5px solid #ff5252' }}>
          <h3 style={{ color: '#ff5252' }}>Vencidos</h3>
          <div className="value" style={{ color: '#ff5252' }}>{alertas.filter(a => a.status === 'danger').length}</div>
          <p>Equipos que ya pasaron su ciclo de mantenimiento.</p>
        </div>
        <div className="glass-card" style={{ borderLeft: '5px solid #ffa000' }}>
          <h3 style={{ color: '#ffa000' }}>Próximos</h3>
          <div className="value" style={{ color: '#ffa000' }}>{alertas.filter(a => a.status === 'warning').length}</div>
          <p>Equipos con menos de 50 horas para mantenimiento.</p>
        </div>
        <div className="glass-card" style={{ borderLeft: '5px solid #2e7d32' }}>
          <h3 style={{ color: '#2e7d32' }}>Al Día</h3>
          <div className="value" style={{ color: '#2e7d32' }}>{maquinarias.length - alertas.length}</div>
          <p>Maquinaria con ciclos de mantenimiento vigentes.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Formulario de Registro */}
        <div className="glass-card" style={{ flex: '1', minWidth: '320px' }}>
          <h3>Registrar Mantenimiento</h3>
          <form onSubmit={handleSave} style={{ marginTop: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label">Maquinaria</label>
              <select 
                className="input-field" 
                onChange={(e) => setSelectedMaq(maquinarias.find(m => m.id === e.target.value))}
                value={selectedMaq?.id || ''}
              >
                <option value="">Seleccione Equipo...</option>
                {maquinarias.map(m => (
                  <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
                ))}
              </select>
            </div>

            {selectedMaq && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.9rem' }}>
                <div><strong>Horómetro Actual:</strong> {selectedMaq.horometroActual} hrs</div>
                <div><strong>Último Manto:</strong> {selectedMaq.ultimoMantenimientoHoras || 0} hrs</div>
                <div><strong>Frecuencia:</strong> {selectedMaq.frecuenciaMantenimiento || 250} hrs</div>
              </div>
            )}

            <div className="grid-2" style={{ marginTop: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Tipo</label>
                <select className="input-field" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                  <option value="Preventivo">Preventivo</option>
                  <option value="Correctivo">Correctivo</option>
                  <option value="Reparación Mayor">Reparación Mayor</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Horómetro del Servicio</label>
                <input type="number" className="input-field" value={formData.horometer} onChange={e => setFormData({...formData, horometer: Number(e.target.value)})} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Descripción del Trabajo</label>
              <textarea className="input-field" style={{ minHeight: '80px' }} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} placeholder="Ej: Cambio de aceite, filtros y revisión de frenos."></textarea>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Costo Repuestos/Mano Obra</label>
                <input type="number" className="input-field" value={formData.costo} onChange={e => setFormData({...formData, costo: Number(e.target.value)})} />
              </div>
              <div className="input-group">
                <label className="input-label">Técnico / Taller</label>
                <input className="input-field" value={formData.tecnico} onChange={e => setFormData({...formData, tecnico: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
              🛠 GUARDAR REGISTRO DE MANTENIMIENTO
            </button>
          </form>
        </div>

        {/* Historial y Estado */}
        <div className="glass-card" style={{ flex: '1.5', minWidth: '360px' }}>
          <h3>Historial de Intervenciones</h3>
          <div style={{ marginTop: '1.5rem', maxHeight: '600px', overflowY: 'auto' }}>
            {mantenimientos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>No hay mantenimientos registrados aún.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '0.5rem' }}>Fecha / Equipo</th>
                    <th style={{ padding: '0.5rem' }}>Tipo / Horas</th>
                    <th style={{ padding: '0.5rem' }}>Descripción</th>
                    <th style={{ padding: '0.5rem' }}>Costo</th>
                    <th style={{ padding: '0.5rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {[...mantenimientos].reverse().map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.8rem 0.5rem' }}>
                        <small>{new Date(m.fechaRegistro).toLocaleDateString()}</small><br/>
                        <strong>{m.maquinariaCodigo}</strong>
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem' }}>
                        <span className={`badge ${m.tipo === 'Preventivo' ? 'badge-active' : 'badge-inactive'}`} style={{ fontSize: '0.7rem' }}>{m.tipo}</span><br/>
                        <small>{m.horometer} hrs</small>
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem' }}>
                        <div style={{ fontSize: '0.85rem', maxWidth: '200px' }}>{m.descripcion}</div>
                        <small style={{ color: '#888' }}>Por: {m.tecnico || 'N/A'}</small>
                      </td>
                      <td style={{ padding: '0.8rem 0.5rem' }}>${m.costo?.toLocaleString()}</td>
                      <td style={{ padding: '0.8rem 0.5rem' }}>
                        <button onClick={() => deleteMantenimiento(m.id)} style={{ background: 'none', border: 'none', color: '#ff5252', cursor: 'pointer' }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
