import React, { useState, useMemo } from 'react';

export default function SimpleCrudTab({ title, data, onAdd, onEdit, onDelete, fields }) {
  const [formData, setFormData] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(item =>
      fields.some(f => String(item[f.key] ?? '').toLowerCase().includes(q))
    );
  }, [data, searchQuery, fields]);

  const handleSave = () => {
    if (editingId) {
      onEdit(editingId, formData);
      setEditingId(null);
      setIsCreating(false);
    } else {
      onAdd(formData);
      setIsCreating(false);
    }
    setFormData({});
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setEditingId(item.id);
    setIsCreating(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <input
            className="input-field"
            style={{ maxWidth: '260px', margin: 0, padding: '0.4rem 0.75rem', fontSize: '0.88rem' }}
            placeholder="Buscar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => { setIsCreating(!isCreating); setEditingId(null); setFormData({}); }}>
          {(isCreating || editingId) ? 'Cancelar' : '+ Agregar Nuevo'}
        </button>
      </div>

      {(isCreating || editingId) && (
        <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h4>{editingId ? 'Editar' : 'Crear'} Registro</h4>
          <div className="grid-3" style={{ marginTop: '1rem' }}>
            {fields.map(f => (
              <div key={f.key} className="input-group">
                <label className="input-label">{f.label}</label>
                {f.type === 'select' && Array.isArray(f.options) ? (
                  <select className="input-field" value={formData[f.key] || ''} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}>
                    {f.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input className="input-field" value={formData[f.key] || ''} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
            <div className="input-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn-primary" onClick={handleSave} style={{ width: '100%' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--primary-light)' }}>
            {fields.map(f => <th key={f.key} style={{ padding: '0.8rem 0.5rem' }}>{f.label}</th>)}
            <th style={{ padding: '0.8rem 0.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
              {fields.map(f => <td key={f.key} style={{ padding: '0.8rem 0.5rem' }}>{item[f.key]}</td>)}
              <td style={{ padding: '0.8rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleEdit(item)}>Editar</button>
                <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#ff5252', color: 'white', border: 'none' }} onClick={() => onDelete(item.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

