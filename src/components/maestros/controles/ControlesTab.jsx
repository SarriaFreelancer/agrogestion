import React, { useState } from 'react';

export default function ControlesTab({ data, onAdd, onEdit, onDelete }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ id: '', 
    nombre: '', 
    descripcion: '',
    frecuencia: 'Semanal',
    activo: true,
    variables: [] 
  });

  const [currentVar, setCurrentVar] = useState({ nombre: '', tipo: 'numérico', unidad: '', descripcion: '', requerida: false, sumarMuestras: false, rangos: [] });
  const [currentRango, setCurrentRango] = useState({ min: '', max: '', mensaje: '', color: '#4caf50' });

  const handleSaveControl = () => {
    if (!formData.id || !formData.nombre) return alert("Código y Nombre son obligatorios");
    if (editingId) {
      onEdit(editingId, formData);
      setEditingId(null);
      setIsCreating(false);
    } else {
      onAdd(formData);
      setIsCreating(false);
    }
    setFormData({ id: '', nombre: '', descripcion: '', frecuencia: 'Semanal', activo: true, variables: [] });
    setCurrentVar({ nombre: '', tipo: 'numérico', unidad: '', descripcion: '', requerida: false, rangos: [] });
  };

  const addVariable = () => {
    if (!currentVar.nombre) return alert("Nombre de variable requerido");
    setFormData({ ...formData, variables: [...formData.variables, { ...currentVar, id: Date.now().toString() }] });
    setCurrentVar({ nombre: '', tipo: 'numérico', unidad: '', descripcion: '', requerida: false, sumarMuestras: false, rangos: [] });
  };

  const addRango = () => {
    setCurrentVar({ ...currentVar, rangos: [...currentVar.rangos, { ...currentRango, id: Date.now().toString() }] });
    setCurrentRango({ min: '', max: '', mensaje: '', color: '#4caf50' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3>Configuración Avanzada de Controles</h3>
        <button className="btn-primary" onClick={() => { setIsCreating(!isCreating); setEditingId(null); setFormData({ id: '', nombre: '', descripcion: '', frecuencia: 'Semanal', activo: true, variables: [] }); setCurrentVar({ nombre: '', tipo: 'numérico', unidad: '', descripcion: '', requerida: false, rangos: [] }); }}>
          {(isCreating || editingId) ? 'Cancelar' : '+ Nuevo Control'}
        </button>
      </div>

      {(isCreating || editingId) && (
        <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h4>{editingId ? 'Editar Control' : 'Crear Nuevo Control'}</h4>
          <div className="grid-2" style={{ marginTop: '1rem' }}>
            <div className="input-group"><label className="input-label">Código</label><input className="input-field" value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} /></div>
            <div className="input-group"><label className="input-label">Nombre del Control</label><input className="input-field" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} /></div>
          </div>
          <div className="grid-2" style={{ marginTop: '1rem' }}>
            <div className="input-group"><label className="input-label">Frecuencia</label><select className="input-field" value={formData.frecuencia} onChange={e => setFormData({ ...formData, frecuencia: e.target.value })}>
              <option value="Semanal">Semanal</option>
              <option value="Mensual">Mensual</option>
              <option value="Diaria">Diaria</option>
              <option value="Eventual">Eventual</option>
            </select></div>
            <div className="input-group"><label className="input-label">Estado</label><select className="input-field" value={formData.activo ? 'activo' : 'inactivo'} onChange={e => setFormData({ ...formData, activo: e.target.value === 'activo' })}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select></div>
          </div>
          <div className="input-group" style={{ marginTop: '1rem' }}><label className="input-label">Descripción</label><textarea className="input-field" rows={2} value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} /></div>

          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginTop: '1rem', border: '1px solid #ddd' }}>
            <h5>Variables del Control</h5>
            <div className="grid-3" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
              <input className="input-field" placeholder="Nombre Variable" value={currentVar.nombre} onChange={e => setCurrentVar({ ...currentVar, nombre: e.target.value })} />
              <input className="input-field" placeholder="Unidad" value={currentVar.unidad} onChange={e => setCurrentVar({ ...currentVar, unidad: e.target.value })} />
              <select className="input-field" value={currentVar.tipo} onChange={e => setCurrentVar({ ...currentVar, tipo: e.target.value })}>
                <option value="numérico">Numérico</option>
                <option value="texto">Texto</option>
                <option value="booleano">Booleano (Sí/No)</option>
              </select>
            </div>
            <div className="grid-3" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
              <input className="input-field" placeholder="Descripción variable" value={currentVar.descripcion} onChange={e => setCurrentVar({ ...currentVar, descripcion: e.target.value })} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label className="input-group" style={{ alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <input type="checkbox" checked={currentVar.requerida} onChange={e => setCurrentVar({ ...currentVar, requerida: e.target.checked })} />
                  <span style={{ fontSize: '0.9rem' }}>Requerida</span>
                </label>
                <label className="input-group" style={{ alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <input type="checkbox" checked={currentVar.sumarMuestras} onChange={e => setCurrentVar({ ...currentVar, sumarMuestras: e.target.checked })} />
                  <span style={{ fontSize: '0.9rem' }}>Sumar en muestras</span>
                </label>
              </div>
              <button className="btn-secondary" onClick={addVariable}>+ Añadir Variable</button>
            </div>

            {currentVar.tipo === 'numérico' && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
                <h6>Configurar Rangos y Alertas (Opcional)</h6>
                <div className="grid-4" style={{ gap: '0.5rem' }}>
                  <input type="number" className="input-field" placeholder="Min" value={currentRango.min} onChange={e => setCurrentRango({ ...currentRango, min: e.target.value })} />
                  <input type="number" className="input-field" placeholder="Max" value={currentRango.max} onChange={e => setCurrentRango({ ...currentRango, max: e.target.value })} />
                  <input className="input-field" placeholder="Mensaje" value={currentRango.mensaje} onChange={e => setCurrentRango({ ...currentRango, mensaje: e.target.value })} />
                  <input type="color" style={{ height: '40px', width: '100%' }} value={currentRango.color} onChange={e => setCurrentRango({ ...currentRango, color: e.target.value })} />
                </div>
                <button className="btn-secondary" style={{ marginTop: '0.5rem' }} onClick={addRango}>+ Añadir Rango de Alerta</button>
                
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {currentVar.rangos.map((r, i) => (
                    <span key={i} className="badge" style={{ background: r.color, color: 'white', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {r.min}-{r.max}: {r.mensaje}
                      <button onClick={() => setCurrentVar({ ...currentVar, rangos: currentVar.rangos.filter((_, idx) => idx !== i) })} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', padding: '0 0.25rem' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <ul style={{ marginTop: '1rem' }}>
              {formData.variables.map((v, i) => (
                <li key={i} style={{ padding: '0.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{v.nombre}</strong> ({v.tipo}{v.unidad ? ` · ${v.unidad}` : ''}) {v.requerida && <span style={{ color: '#2e7d32' }}>• requerida</span>} {v.sumarMuestras && <span style={{ color: '#1565c0' }}>• suma</span>}
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{v.descripcion}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => {
                      setCurrentVar(v);
                      setFormData({ ...formData, variables: formData.variables.filter((_, idx) => idx !== i) });
                    }} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>Editar</button>
                    <button onClick={() => setFormData({ ...formData, variables: formData.variables.filter((_, idx) => idx !== i) })} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }} onClick={handleSaveControl}>
            ✓ GUARDAR CONFIGURACIÓN COMPLETA
          </button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--primary-light)' }}>
            <th style={{ padding: '0.8rem 0.5rem' }}>Código</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Control</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Variables</th>
            <th style={{ padding: '0.8rem 0.5rem' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <td style={{ padding: '0.8rem 0.5rem', fontWeight: 'bold' }}>{item.id}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>{item.nombre}</td>
              <td style={{ padding: '0.8rem 0.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {item.variables.map(v => <span key={v.id} className="badge badge-info" style={{ marginRight: '0.3rem' }}>{v.nombre}{v.unidad ? ` (${v.unidad})` : ''}</span>)}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#555' }}>{item.descripcion}</div>
                <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#777' }}>Frecuencia: {item.frecuencia || 'Semanal'}</div>
              </td>
              <td style={{ padding: '0.8rem 0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => { setFormData({ ...item }); setEditingId(item.id); setIsCreating(true); }}>Editar</button>
                <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#ff5252', color: 'white', border: 'none' }} onClick={() => onDelete(item.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

