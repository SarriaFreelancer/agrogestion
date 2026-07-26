import React, { useState, useMemo } from 'react';

export default function MaquinariaTab({ data, tipos, addMaquinaria, editMaquinaria, deleteMaquinaria }) {
  const [formData, setFormData] = useState({ id: '', name: '', tipoId: '', status: 'Operativo', 
    propiaAlquilada: 'Propia', tarifa: 0, horometroActual: 0,
    frecuenciaMantenimiento: 250, ultimoMantenimientoHoras: 0 
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(item =>
      String(item.id ?? '').toLowerCase().includes(q) ||
      String(item.name ?? '').toLowerCase().includes(q) ||
      String(item.propiaAlquilada ?? '').toLowerCase().includes(q) ||
      String(tipos.find(t => t.id === item.tipoId)?.nombre ?? '').toLowerCase().includes(q)
    );
  }, [data, searchQuery, tipos]);

  const handleSave = () => {
    if (!formData.id || !formData.name) return alert("Código y Nombre son obligatorios");
    if (editingId) {
      editMaquinaria(editingId, formData);
      setEditingId(null);
      setIsCreating(false);
    } else {
      addMaquinaria(formData);
      setIsCreating(false);
    }
    setFormData({ id: '', name: '', tipoId: '', status: 'Operativo', 
      propiaAlquilada: 'Propia', tarifa: 0, horometroActual: 0,
      frecuenciaMantenimiento: 250, ultimoMantenimientoHoras: 0 
    });
  };

  const handleEdit = (item) => {
    setFormData({ 
      ...item, 
      frecuenciaMantenimiento: item.frecuenciaMantenimiento || 250,
      ultimoMantenimientoHoras: item.ultimoMantenimientoHoras || 0
    });
    setEditingId(item.id);
    setIsCreating(true);
  };

  const handleAddClick = () => {
    if (isCreating || editingId) {
      setIsCreating(false);
      setEditingId(null);
    } else {
      setFormData({ id: '', name: '', tipoId: '', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 0, horometroActual: 0, frecuenciaMantenimiento: 250, ultimoMantenimientoHoras: 0 });
      setIsCreating(true);
      setEditingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Catálogo de Maquinaria y Equipos</h3>
          <input
            className="input-field"
            style={{ maxWidth: '260px', margin: 0, padding: '0.4rem 0.75rem', fontSize: '0.88rem' }}
            placeholder="Buscar maquinaria..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={handleAddClick}>
          {(isCreating || editingId) ? 'Cancelar' : '+ Agregar Maquinaria'}
        </button>
      </div>

      {(isCreating || editingId) && (
        <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h4>{editingId ? 'Editar Maquinaria' : 'Crear Maquinaria'}</h4>
          <div className="grid-3" style={{ marginTop: '1rem' }}>
            <div className="input-group"><label className="input-label">Código</label><input className="input-field" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Nombre / Descripción</label><input className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Tipo</label>
              <select className="input-field" value={formData.tipoId} onChange={e => setFormData({ ...formData, tipoId: e.target.value })}>
                <option value="">Seleccionar Tipo...</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Estado</label>
              <select className="input-field" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="Operativo">Operativo</option><option value="Mantenimiento">Mantenimiento</option><option value="Fuera de Servicio">Fuera de Servicio</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Propia/Alquilada</label>
              <select className="input-field" value={formData.propiaAlquilada} onChange={e => setFormData({ ...formData, propiaAlquilada: e.target.value })}>
                <option value="Propia">Propia</option><option value="Alquilada">Alquilada</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Tarifa (H/K/V)</label><input type="number" className="input-field" value={formData.tarifa} onChange={e => setFormData({ ...formData, tarifa: Number(e.target.value) })} /></div>
            <div className="input-group"><label className="input-label">Horómetro Actual</label><input type="number" step="0.1" className="input-field" value={formData.horometroActual} onChange={e => setFormData({ ...formData, horometroActual: Number(e.target.value) })} /></div>
            <div className="input-group"><label className="input-label">Frecuencia Manto. (Hrs)</label><input type="number" className="input-field" value={formData.frecuenciaMantenimiento} onChange={e => setFormData({ ...formData, frecuenciaMantenimiento: Number(e.target.value) })} /></div>
            <div className="input-group" style={{ display: 'flex', alignItems: 'flex-end' }}><button className="btn-primary" onClick={handleSave} style={{ width: '100%' }}>Guardar</button></div>
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--primary-light)' }}>
            <th style={{ padding: '0.8rem 0.5rem' }}>Código</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Descripción</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Tipo</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Propia/Alq.</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Tarifa</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Horómetro</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Frec. Manto.</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Estado</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '0.8rem 0.5rem', fontWeight: 'bold' }}>{item.id}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{item.name}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{tipos.find(t => t.id === item.tipoId)?.nombre || 'N/A'}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{item.propiaAlquilada}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>${item.tarifa || 0}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}><strong>{item.horometroActual || 0}</strong></td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{item.frecuenciaMantenimiento || 250} hrs</td>
              <td style={{ padding: '0.8rem 0.5rem' }}><span className={`badge ${item.status === 'Operativo' ? 'badge-active' : 'badge-inactive'}`}>{item.status}</span></td>
              <td style={{ padding: '0.8rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleEdit(item)}>Editar</button>
                <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#ff5252', color: 'white', border: 'none' }} onClick={() => deleteMaquinaria(item.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
