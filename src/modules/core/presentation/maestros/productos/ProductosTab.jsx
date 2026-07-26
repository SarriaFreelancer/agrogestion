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
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
        />
        <button className="btn-primary" onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancelar' : 'Nuevo Producto'}
        </button>
      </div>

      {isCreating && (
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <input placeholder="Código" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={!!editingId} />
            <input placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            <select value={formData.tipoId} onChange={e => setFormData({...formData, tipoId: e.target.value})}>
              <option value="">Seleccionar Tipo</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
            <select value={formData.unidadMedida} onChange={e => setFormData({...formData, unidadMedida: e.target.value})}>
              <option value="">Unidad de Medida</option>
              {unidades?.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" placeholder="Costo Unitario" value={formData.costoUnitario} onChange={e => setFormData({...formData, costoUnitario: parseFloat(e.target.value)})} />
          </div>
          <button className="btn-primary" onClick={handleSave}>Guardar</button>
        </div>
      )}

      {adjustingId && (
        <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <strong>Ajustar Stock ({filteredData.find(d => d.id === adjustingId)?.nombre}):</strong>
          <input type="number" placeholder="Cantidad a sumar" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} />
          <button className="btn-primary" onClick={handleAdjust}>Confirmar Ajuste</button>
          <button className="btn-secondary" onClick={() => { setAdjustingId(null); setAdjustAmount(''); }}>Cancelar</button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
            <th style={{ padding: '0.8rem 0.5rem', borderBottom: '2px solid #dee2e6' }}>Código</th>
            <th style={{ padding: '0.8rem 0.5rem', borderBottom: '2px solid #dee2e6' }}>Nombre</th>
            <th style={{ padding: '0.8rem 0.5rem', borderBottom: '2px solid #dee2e6' }}>Tipo</th>
            <th style={{ padding: '0.8rem 0.5rem', borderBottom: '2px solid #dee2e6' }}>U. Medida</th>
            <th style={{ padding: '0.8rem 0.5rem', borderBottom: '2px solid #dee2e6' }}>Stock</th>
            <th style={{ padding: '0.8rem 0.5rem', borderBottom: '2px solid #dee2e6' }}>Costo U.</th>
            <th style={{ padding: '0.8rem 0.5rem', borderBottom: '2px solid #dee2e6' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #dee2e6' }}>
              <td style={{ padding: '0.8rem 0.5rem' }}>{item.id}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{item.nombre}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{tipos.find(t => t.id === item.tipoId)?.nombre || item.tipoId}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{item.unidadMedida}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: item.stockActual <= 10 ? 'var(--danger)' : 'var(--primary-color)',
                  background: item.stockActual <= 10 ? '#ffebee' : '#e8f5e9',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {item.stockActual || 0}
                </span>
              </td>
              <td style={{ padding: '0.8rem 0.5rem' }}>${item.costoUnitario || 0}</td>
              <td style={{ padding: '0.8rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleEdit(item)}>Editar</button>
                <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#2196f3' }} onClick={() => setAdjustingId(item.id)}>+ Stock</button>
                <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#ff5252', color: 'white', border: 'none' }} onClick={() => onDelete(item.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

