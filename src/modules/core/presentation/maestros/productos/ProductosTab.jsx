import React, { useState, useMemo } from 'react';
import { useAgro } from '@/providers/AgroContext';

export default function ProductosTab({ data, tipos, onAdd, onEdit, onDelete, ajustarStock }) {
  const { unidades } = useAgro();
  const [formData, setFormData] = useState({ id: '', nombre: '', tipoId: '', unidadMedida: '', costoUnitario: 0 });
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Stock Adjustment State
  const [adjustingId, setAdjustingId] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(item =>
      String(item.id ?? '').toLowerCase().includes(q) ||
      String(item.nombre ?? '').toLowerCase().includes(q) ||
      String(tipos.find(t => t.id === item.tipoId)?.nombre ?? '').toLowerCase().includes(q)
    );
  }, [data, searchQuery, tipos]);

  const handleSave = () => {
    if (!formData.id || !formData.nombre) return alert("Código y Nombre son obligatorios");
    if (editingId) {
      onEdit(editingId, formData);
      setEditingId(null);
      setIsCreating(false);
    } else {
      onAdd({ ...formData, stockActual: 0 });
      setIsCreating(false);
    }
    setFormData({ id: '', nombre: '', tipoId: '', unidadMedida: '', costoUnitario: 0 });
  };

  const handleAdjust = () => {
    if (!adjustAmount || Number(adjustAmount) <= 0) return alert("Cantidad inválida");
    ajustarStock(adjustingId, adjustAmount, 'entrada');
    setAdjustingId(null);
    setAdjustAmount('');
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setEditingId(item.id);
    setIsCreating(true);
  };

  return (
    <div className="tab-content" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Buscar producto..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
          style={{ maxWidth: '280px' }}
        />
        <button className="btn-primary text-white font-bold" onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancelar' : '+ Nuevo Producto'}
        </button>
      </div>

      {isCreating && (
        <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ color: 'var(--text-contrast)', marginBottom: '0.75rem', fontWeight: 'bold' }}>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <input className="input-field" placeholder="Código" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={!!editingId} style={{ flex: '1 1 180px' }} />
            <input className="input-field" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} style={{ flex: '2 1 220px' }} />
            <select className="input-field" value={formData.tipoId} onChange={e => setFormData({...formData, tipoId: e.target.value})} style={{ flex: '1 1 180px' }}>
              <option value="">Seleccionar Tipo</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
            <select className="input-field" value={formData.unidadMedida} onChange={e => setFormData({...formData, unidadMedida: e.target.value})} style={{ flex: '1 1 180px' }}>
              <option value="">Unidad de Medida</option>
              {unidades?.map(u => <option key={u.id || u} value={u.name || u}>{u.name || u}</option>)}
            </select>
            <input className="input-field" type="number" placeholder="Costo Unitario" value={formData.costoUnitario} onChange={e => setFormData({...formData, costoUnitario: parseFloat(e.target.value)})} style={{ flex: '1 1 180px' }} />
          </div>
          <button className="btn-primary text-white font-bold" onClick={handleSave}>Guardar</button>
        </div>
      )}

      {adjustingId && (
        <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid var(--primary-color)' }}>
          <strong style={{ color: 'var(--text-contrast)' }}>Ajustar Stock ({filteredData.find(d => d.id === adjustingId)?.nombre}):</strong>
          <input className="input-field" type="number" placeholder="Cantidad a sumar" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} style={{ maxWidth: '160px' }} />
          <button className="btn-primary text-white font-bold" onClick={handleAdjust}>Confirmar Ajuste</button>
          <button className="btn-secondary text-slate-800 dark:text-slate-100 font-semibold" onClick={() => { setAdjustingId(null); setAdjustAmount(''); }}>Cancelar</button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--primary-light)', textAlign: 'left' }}>
            <th style={{ padding: '0.8rem 0.5rem', color: 'var(--text-contrast)' }}>Código</th>
            <th style={{ padding: '0.8rem 0.5rem', color: 'var(--text-contrast)' }}>Nombre</th>
            <th style={{ padding: '0.8rem 0.5rem', color: 'var(--text-contrast)' }}>Tipo</th>
            <th style={{ padding: '0.8rem 0.5rem', color: 'var(--text-contrast)' }}>U. Medida</th>
            <th style={{ padding: '0.8rem 0.5rem', color: 'var(--text-contrast)' }}>Stock</th>
            <th style={{ padding: '0.8rem 0.5rem', color: 'var(--text-contrast)' }}>Costo U.</th>
            <th style={{ padding: '0.8rem 0.5rem', color: 'var(--text-contrast)' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '0.8rem 0.5rem', fontWeight: 'bold', color: 'var(--text-contrast)' }}>{item.id}</td>
              <td style={{ padding: '0.8rem 0.5rem', color: 'var(--text-contrast)' }}>{item.nombre}</td>
              <td style={{ padding: '0.8rem 0.5rem', color: 'var(--text-contrast)' }}>{tipos.find(t => t.id === item.tipoId)?.nombre || item.tipoId}</td>
              <td style={{ padding: '0.8rem 0.5rem', color: 'var(--text-contrast)' }}>{item.unidadMedida}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: item.stockActual <= 10 ? 'var(--danger)' : 'var(--primary-color)',
                  background: item.stockActual <= 10 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {item.stockActual || 0}
                </span>
              </td>
              <td style={{ padding: '0.8rem 0.5rem', color: 'var(--text-contrast)' }}>${item.costoUnitario || 0}</td>
              <td style={{ padding: '0.8rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary text-slate-800 dark:text-slate-100 font-semibold" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleEdit(item)}>Editar</button>
                <button className="btn-primary text-white font-bold" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#2563eb' }} onClick={() => setAdjustingId(item.id)}>+ Stock</button>
                <button className="btn-danger text-white font-bold" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => onDelete(item.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
