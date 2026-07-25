import React, { useState, useMemo } from 'react';

export default function TrabajadoresTab({ data, cuadrillas, addTrabajador, editTrabajador, deleteTrabajador }) {
  const [formData, setFormData] = useState({ identificacion: '', nombre: '', apellido: '', cargo: 'Jornalero', estado: 'Activo', cuadrillaId: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(item =>
      String(item.identificacion ?? '').toLowerCase().includes(q) ||
      String(item.nombre ?? '').toLowerCase().includes(q) ||
      String(item.apellido ?? '').toLowerCase().includes(q) ||
      String(item.cargo ?? '').toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const handleSave = () => {
    if(!formData.nombre || !formData.apellido) return alert("Nombre y apellido requeridos");
    if (editingId) {
      editTrabajador(editingId, formData);
      setEditingId(null);
      setIsCreating(false);
    } else {
      addTrabajador(formData);
      setIsCreating(false);
    }
    setFormData({ identificacion: '', nombre: '', apellido: '', cargo: 'Jornalero', estado: 'Activo', cuadrillaId: '' });
  };

  const handleEdit = (item) => {
    setFormData({...item});
    setEditingId(item.id);
    setIsCreating(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Catálogo de Trabajadores</h3>
          <input
            className="input-field"
            style={{ maxWidth: '260px', margin: 0, padding: '0.4rem 0.75rem', fontSize: '0.88rem' }}
            placeholder="Buscar por código, nombre..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => {setIsCreating(!isCreating); setEditingId(null); setFormData({ identificacion: '', nombre: '', apellido: '', cargo: 'Jornalero', estado: 'Activo', cuadrillaId: '' });}}>
          {(isCreating || editingId) ? 'Cancelar' : '+ Nuevo Trabajador'}
        </button>
      </div>

      {(isCreating || editingId) && (
        <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h4>{editingId ? 'Editar Trabajador' : 'Crear Trabajador'}</h4>
          <div className="grid-3" style={{marginTop: '1rem'}}>
            <div className="input-group"><label className="input-label">Código / Identificación</label><input className="input-field" value={formData.identificacion} onChange={e=>setFormData({...formData, identificacion: e.target.value})}/></div>
            <div className="input-group"><label className="input-label">Nombres</label><input className="input-field" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})}/></div>
            <div className="input-group"><label className="input-label">Apellidos</label><input className="input-field" value={formData.apellido} onChange={e=>setFormData({...formData, apellido: e.target.value})}/></div>
            <div className="input-group"><label className="input-label">Cargo</label><input className="input-field" value={formData.cargo} onChange={e=>setFormData({...formData, cargo: e.target.value})}/></div>
            <div className="input-group"><label className="input-label">Cuadrilla Asignada</label>
              <select className="input-field" value={formData.cuadrillaId} onChange={e=>setFormData({...formData, cuadrillaId: e.target.value})}>
                <option value="">Sin Cuadrilla</option>
                {cuadrillas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Estado</label>
              <select className="input-field" value={formData.estado} onChange={e=>setFormData({...formData, estado: e.target.value})}>
                <option value="Activo">Activo</option><option value="Inactivo">Inactivo</option>
              </select>
            </div>
            <div className="input-group" style={{ display: 'flex', alignItems: 'flex-end' }}><button className="btn-primary" onClick={handleSave} style={{width: '100%'}}>Guardar</button></div>
          </div>
        </div>
      )}

      <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
        <thead>
          <tr style={{borderBottom: '2px solid var(--primary-light)'}}>
            <th style={{padding: '0.8rem 0.5rem'}}>Código / ID</th>
            <th style={{padding: '0.8rem 0.5rem'}}>Nombres</th>
            <th style={{padding: '0.8rem 0.5rem'}}>Cargo</th>
            <th style={{padding: '0.8rem 0.5rem'}}>Cuadrilla</th>
            <th style={{padding: '0.8rem 0.5rem'}}>Estado</th>
            <th style={{padding: '0.8rem 0.5rem'}}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr key={item.id} style={{borderBottom: '1px solid var(--glass-border)'}}>
              <td style={{padding: '0.8rem 0.5rem', fontWeight: 'bold'}}>{item.identificacion}</td>
              <td style={{padding: '0.8rem 0.5rem'}}>{item.nombre} {item.apellido}</td>
              <td style={{padding: '0.8rem 0.5rem'}}>{item.cargo}</td>
              <td style={{padding: '0.8rem 0.5rem'}}>{cuadrillas.find(c => c.id === item.cuadrillaId)?.nombre || 'N/A'}</td>
              <td style={{padding: '0.8rem 0.5rem'}}><span className={`badge ${item.estado === 'Activo' ? 'badge-active' : 'badge-inactive'}`}>{item.estado}</span></td>
              <td style={{padding: '0.8rem 0.5rem', display: 'flex', gap: '0.5rem'}}>
                <button className="btn-secondary" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}} onClick={()=>handleEdit(item)}>Editar</button>
                <button className="btn-secondary" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#ff5252', color: 'white', border: 'none'}} onClick={()=>deleteTrabajador(item.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
