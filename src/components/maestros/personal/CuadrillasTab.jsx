import React, { useState } from 'react';

export default function CuadrillasTab({ data, trabajadores, addCuadrilla, editCuadrilla, deleteCuadrilla }) {
  const [formData, setFormData] = useState({ id: '', nombre: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleSave = () => {
    if (!formData.id || !formData.nombre) return alert("Código y Descripción son obligatorios");
    if (editingId) {
      editCuadrilla(editingId, formData);
      setEditingId(null);
    } else {
      addCuadrilla(formData);
      setIsCreating(false);
    }
    setFormData({ id: '', nombre: '' });
  };

  const handleEdit = (item) => {
    setFormData({...item});
    setEditingId(item.id);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3>Catálogo de Cuadrillas</h3>
        <button className="btn-primary" onClick={() => {setIsCreating(!isCreating); setEditingId(null); setFormData({ id: '', nombre: ''});}}>
          {(isCreating || editingId) ? 'Cancelar' : '+ Nueva Cuadrilla'}
        </button>
      </div>

      {(isCreating || editingId) && (
        <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h4>{editingId ? 'Editar Cuadrilla' : 'Crear Cuadrilla'}</h4>
          <div className="grid-3" style={{marginTop: '1rem'}}>
            <div className="input-group">
              <label className="input-label">Código</label>
              <input className="input-field" value={formData.id} onChange={e=>setFormData({...formData, id: e.target.value})} placeholder="Ej. CUA-01"/>
            </div>
            <div className="input-group">
              <label className="input-label">Descripción</label>
              <input className="input-field" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} placeholder="Ej. Cuadrilla de Cosecha"/>
            </div>
            <div className="input-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn-primary" onClick={handleSave} style={{width: '100%'}}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
          <thead>
            <tr style={{borderBottom: '2px solid var(--primary-light)'}}>
              <th style={{padding: '0.8rem 0.5rem'}}>Código</th>
              <th style={{padding: '0.8rem 0.5rem'}}>Descripción</th>
              <th style={{padding: '0.8rem 0.5rem'}}>N° Trabajadores</th>
              <th style={{padding: '0.8rem 0.5rem'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map(c => {
              const count = trabajadores.filter(t => t.cuadrillaId === c.id).length;
              return (
                <tr key={c.id} style={{borderBottom: '1px solid var(--glass-border)'}}>
                  <td style={{padding: '0.8rem 0.5rem', fontWeight: 'bold'}}>{c.id}</td>
                  <td style={{padding: '0.8rem 0.5rem'}}>{c.nombre}</td>
                  <td style={{padding: '0.8rem 0.5rem'}}><span className="badge badge-info">{count} Trabajadores</span></td>
                  <td style={{padding: '0.8rem 0.5rem', display: 'flex', gap: '0.5rem'}}>
                    <button className="btn-secondary" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}} onClick={()=>handleEdit(c)}>Editar</button>
                    <button className="btn-secondary" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#ff5252', color: 'white', border: 'none'}} onClick={()=>deleteCuadrilla(c.id)}>Eliminar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

