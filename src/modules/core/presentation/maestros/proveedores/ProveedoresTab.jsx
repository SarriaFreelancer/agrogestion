import React, { useState, useMemo } from 'react';

export default function ProveedoresTab({ data, addProveedor, editProveedor, deleteProveedor }) {
  const [formData, setFormData] = useState({ id: '', nombre: '', tipo: 'Materia Prima', contacto: '', telefono: '', email: '', estado: 'Activo' });
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(item =>
      String(item.id ?? '').toLowerCase().includes(q) ||
      String(item.nombre ?? '').toLowerCase().includes(q) ||
      String(item.tipo ?? '').toLowerCase().includes(q) ||
      String(item.contacto ?? '').toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const handleSave = () => {
    if (!formData.id || !formData.nombre) return alert("Código y Nombre son obligatorios");
    if (editingId) {
      editProveedor(editingId, formData);
      setEditingId(null);
      setIsCreating(false);
    } else {
      addProveedor(formData);
      setIsCreating(false);
    }
    setFormData({ id: '', nombre: '', tipo: 'Materia Prima', contacto: '', telefono: '', email: '', estado: 'Activo' });
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
          <h3 style={{ margin: 0 }}>Catálogo de Proveedores</h3>
          <input
            className="input-field"
            style={{ maxWidth: '260px', margin: 0, padding: '0.4rem 0.75rem', fontSize: '0.88rem' }}
            placeholder="Buscar proveedor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => {setIsCreating(!isCreating); setEditingId(null); setFormData({ id: '', nombre: '', tipo: 'Materia Prima', contacto: '', telefono: '', email: '', estado: 'Activo' });}}>
          {(isCreating || editingId) ? 'Cancelar' : '+ Nuevo Proveedor'}
        </button>
      </div>

      {(isCreating || editingId) && (
        <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h4>{editingId ? 'Editar Proveedor' : 'Crear Proveedor'}</h4>
          <div className="grid-3" style={{marginTop: '1rem'}}>
            <div className="input-group"><label className="input-label">Código *</label><input className="input-field" value={formData.id} onChange={e=>setFormData({...formData, id: e.target.value})}/></div>
            <div className="input-group"><label className="input-label">Nombre *</label><input className="input-field" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})}/></div>
            <div className="input-group"><label className="input-label">Tipo</label>
              <select className="input-field" value={formData.tipo} onChange={e=>setFormData({...formData, tipo: e.target.value})}>
                <option value="Materia Prima">Materia Prima</option>
                <option value="Servicios">Servicios</option>
                <option value="Ambos">Ambos</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Contacto</label><input className="input-field" value={formData.contacto} onChange={e=>setFormData({...formData, contacto: e.target.value})}/></div>
            <div className="input-group"><label className="input-label">Teléfono</label><input className="input-field" value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})}/></div>
            <div className="input-group"><label className="input-label">Email</label><input className="input-field" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})}/></div>
            <div className="input-group"><label className="input-label">Estado</label>
              <select className="input-field" value={formData.estado} onChange={e=>setFormData({...formData, estado: e.target.value})}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
            <div className="input-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn-primary" onClick={handleSave} style={{ width: '100%' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--primary-light)' }}>
            <th style={{ padding: '0.8rem 0.5rem' }}>Código</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Nombre</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Tipo</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Contacto</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Teléfono</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Email</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Estado</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)', background: p.estado === 'Inactivo' ? '#f9f9f9' : 'white' }}>
              <td style={{ padding: '0.8rem 0.5rem' }}>{p.id || 'N/A'}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{p.nombre}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{p.tipo}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{p.contacto}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{p.telefono}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{p.email}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{p.estado}</td>
              <td style={{ padding: '0.8rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleEdit(p)}>Editar</button>
                <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#ff5252', color: 'white', border: 'none' }} onClick={() => deleteProveedor(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
