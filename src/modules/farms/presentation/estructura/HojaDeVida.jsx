import { useState } from 'react';
import { useAgro } from '@/providers/AgroContext';

export default function HojaDeVida({ node, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [showOtrasUnidades, setShowOtrasUnidades] = useState(false);
  const [formData, setFormData] = useState(node || {});
  const [saveStatus, setSaveStatus] = useState('');

  const { deleteEstructura, cultivos, unidades } = useAgro();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const addOtraUnidad = () => {
    const unidadPorDefecto = unidades[0]?.name || '';
    setFormData(prev => ({
      ...prev,
      otrasUnidades: [
        ...(prev.otrasUnidades || []),
        { unidad: unidadPorDefecto, cantidad: 0 }
      ]
    }));
  };

  const updateOtraUnidad = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      otrasUnidades: (prev.otrasUnidades || []).map((item, i) => i === index ? {
        ...item,
        [field]: field === 'cantidad' ? (value === '' ? '' : Number(value)) : value
      } : item)
    }));
  };

  const removeOtraUnidad = (index) => {
    setFormData(prev => ({
      ...prev,
      otrasUnidades: (prev.otrasUnidades || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onUpdate(node.id, formData);
    setEditMode(false);
    setSaveStatus('Cambios guardados con éxito');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleDelete = () => {
    deleteEstructura(node.id);
  };

  if (!node) return null;

  return (
    <div className="glass-card" style={{ marginTop: '1.5rem', border: editMode ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ color: 'var(--text-main)', margin: 0 }}>
            {node.type}: <span style={{ fontWeight: 'bold' }}>{node.id}</span> - {node.name}
          </h3>
          <small style={{ color: 'var(--text-muted)' }}>ID Interno: {node.id}</small>
          {saveStatus && <span style={{ marginLeft: '1rem', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.85rem' }}>{saveStatus}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {editMode ? (
            <>
              <button type="button" onClick={handleSave} className="btn-primary" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}>GUARDAR</button>
              <button type="button" onClick={() => { setEditMode(false); setFormData({ ...node }); }} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>CANCELAR</button>
            </>
          ) : (
            <button type="button" onClick={() => setEditMode(true)} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              EDITAR INFORMACIÓN
            </button>
          )}
          <button type="button" onClick={handleDelete} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: '#ff5252', color: 'white', border: 'none' }}>
            ELIMINAR
          </button>
        </div>
      </div>

      {editMode ? (
        <div className="grid-2" style={{ gap: '1rem' }}>
          <div className="input-group"><label className="input-label">Código</label><input name="codigo" className="input-field" value={formData.id || ''} onChange={handleChange} /></div>
          <div className="input-group"><label className="input-label">Nombre</label><input name="name" className="input-field" value={formData.name || ''} onChange={handleChange} /></div>

          {node.type === 'Sector' && (
            <>
              <div className="input-group" style={{ gridColumn: 'span 2' }}><label className="input-label">Planta o Cliente</label><input name="plantaCliente" className="input-field" value={formData.plantaCliente || ''} onChange={handleChange} /></div>
              <div className="input-group" style={{ gridColumn: 'span 2' }}><label className="input-label">Descripción</label><input name="description" className="input-field" value={formData.description || ''} onChange={handleChange} /></div>
            </>
          )}

          {node.type === 'Finca' && (
            <div className="input-group"><label className="input-label">Ubicación / Coordenadas</label><input name="location" className="input-field" value={formData.location || ''} onChange={handleChange} /></div>
          )}

          {node.type === 'Lote' && (
            <div className="input-group">
              <label className="input-label">Topografía</label>
              <select name="topography" className="input-field" value={formData.topography || ''} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                <option value="Plana">Plana</option>
                <option value="Ondulada">Ondulada</option>
                <option value="Quebrada">Quebrada</option>
              </select>
            </div>
          )}

          {node.type === 'Suerte' && (
            <>
              <div className="input-group">
                <label className="input-label">Cultivo</label>
                <select name="cultivo" className="input-field" value={formData.cultivo || ''} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  {cultivos.filter(c => c.estado !== 'Inactivo').map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group"><label className="input-label">Área Neta / Efectiva (ha)</label><input type="number" step="any" name="hectareas" className="input-field" value={formData.hectareas ?? ''} onChange={handleChange} /></div>
              <div className="input-group"><label className="input-label">Área Bruta (ha)</label><input type="number" step="any" name="areaBruta" className="input-field" value={formData.areaBruta ?? ''} onChange={handleChange} /></div>
              <div className="input-group"><label className="input-label">Espacio entre Surcos (m)</label><input type="number" step="any" name="distanciaSurcos" className="input-field" value={formData.distanciaSurcos ?? ''} onChange={handleChange} /></div>

              <div style={{ gridColumn: '1 / -1', background: '#f4f6f8', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setShowOtrasUnidades(!showOtrasUnidades)}>
                  <span>Otras Unidades</span>
                  <span>{showOtrasUnidades ? '▲ Ocultar' : '▼ Mostrar'}</span>
                </div>
                {showOtrasUnidades && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <strong>Ingresar Unidad</strong>
                      <button type="button" className="btn-secondary" onClick={addOtraUnidad} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        + Agregar unidad
                      </button>
                    </div>
                    {(formData.otrasUnidades || []).map((item, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '0.75rem', alignItems: 'end', marginBottom: '0.75rem' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label">Unidad</label>
                          <select className="input-field" value={item.unidad} onChange={(e) => updateOtraUnidad(index, 'unidad', e.target.value)}>
                            {unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                          </select>
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label">Cantidad</label>
                          <input type="number" step="any" className="input-field" value={item.cantidad ?? ''} onChange={(e) => updateOtraUnidad(index, 'cantidad', e.target.value)} />
                        </div>
                        <button type="button" className="btn-secondary" onClick={() => removeOtraUnidad(index)} style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem', background: '#ffebee', color: '#b71c1c', border: '1px solid #f8bbd0' }}>
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Estado</label>
                <select name="estado" className="input-field" value={formData.estado || ''} onChange={handleChange}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="input-group"><label className="input-label">Estado Productivo</label><input name="estadoProductivo" className="input-field" value={formData.estadoProductivo || ''} onChange={handleChange} /></div>
              <div className="input-group"><label className="input-label">Edad (días)</label><input type="number" name="edadSuerteDias" className="input-field" value={formData.edadSuerteDias ?? ''} onChange={handleChange} /></div>
              <div className="input-group"><label className="input-label">Edad Última Cosecha</label><input type="number" name="edadUltimaCosechaDias" className="input-field" value={formData.edadUltimaCosechaDias ?? ''} onChange={handleChange} /></div>
              <div className="input-group"><label className="input-label">Latitud</label><input type="number" step="any" name="lat" className="input-field" value={formData.lat ?? ''} onChange={handleChange} /></div>
              <div className="input-group"><label className="input-label">Longitud</label><input type="number" step="any" name="lng" className="input-field" value={formData.lng ?? ''} onChange={handleChange} /></div>

              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Geometría del Polígono (JSON: [[lat,lng], ...])</label>
                <textarea
                  name="geometria"
                  className="input-field"
                  style={{ minHeight: '80px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                  value={Array.isArray(formData.geometria) ? JSON.stringify(formData.geometria) : formData.geometria || '[]'}
                  onChange={(e) => {
                    try {
                      const val = JSON.parse(e.target.value);
                      setFormData({ ...formData, geometria: val });
                    } catch {
                      setFormData({ ...formData, geometria: e.target.value });
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}
                  onClick={() => {
                    if (!formData.lat || !formData.lng) return alert('Primero ingrese Lat y Lng del centro');
                    const offset = 0.001;
                    const sample = [
                      [formData.lat + offset, formData.lng - offset],
                      [formData.lat + offset, formData.lng + offset],
                      [formData.lat - offset, formData.lng + offset],
                      [formData.lat - offset, formData.lng - offset]
                    ];
                    setFormData({ ...formData, geometria: sample });
                  }}
                >
                  Generar Polígono de Prueba
                </button>
              </div>
            </>
          )}

          <div className="input-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="button" className="btn-primary" onClick={handleSave} style={{ width: '100%', padding: '1rem', fontWeight: 'bold', borderRadius: '8px', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)' }}>
              APLICAR Y GUARDAR CAMBIOS EN {node.type.toUpperCase()}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid-2" style={{ gap: '1rem' }}>
          <div><span style={{ fontWeight: 'bold' }}>Código:</span> {node.id}</div>
          <div><span style={{ fontWeight: 'bold' }}>Nombre:</span> {node.name}</div>

          {node.type === 'Sector' && (
            <>
              <div><span style={{ fontWeight: 'bold' }}>Planta / Cliente:</span> {node.plantaCliente || 'N/A'}</div>
              <div style={{ gridColumn: 'span 2' }}><span style={{ fontWeight: 'bold' }}>Descripción:</span> {node.description || 'N/A'}</div>
            </>
          )}

          {node.type === 'Finca' && <div><span style={{ fontWeight: 'bold' }}>Ubicación:</span> {node.location || 'N/A'}</div>}

          {node.type === 'Lote' && <div><span style={{ fontWeight: 'bold' }}>Topografía:</span> {node.topography || 'N/A'}</div>}

          {node.type === 'Suerte' && (
            <>
              <div><span style={{ fontWeight: 'bold' }}>Área Neta:</span> {node.hectareas} ha</div>
              <div><span style={{ fontWeight: 'bold' }}>Área Bruta:</span> {node.areaBruta || 0} ha</div>
              <div><span style={{ fontWeight: 'bold' }}>Espacio Surcos:</span> {node.distanciaSurcos || 0} m</div>

              <div style={{ gridColumn: '1 / -1', background: '#f4f6f8', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setShowOtrasUnidades(!showOtrasUnidades)}>
                  <span>Otras Unidades</span>
                  <span>{showOtrasUnidades ? '▲ Ocultar' : '▼ Mostrar'}</span>
                </div>
                {showOtrasUnidades && (
                  <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
                    {(node.otrasUnidades || []).map((item, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem', background: '#fff', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 'bold' }}>{item.unidad}:</span>
                        <span>{item.cantidad ?? 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div><span style={{ fontWeight: 'bold' }}>Cultivo:</span> {node.cultivo}</div>
              <div><span style={{ fontWeight: 'bold' }}>Estado:</span> <span className={`badge ${node.estado === 'Activo' ? 'badge-active' : 'badge-inactive'}`} style={{ marginLeft: '0.5rem' }}>{node.estado}</span></div>
              <div><span style={{ fontWeight: 'bold' }}>Estado Prod.:</span> {node.estadoProductivo || 'N/A'}</div>
              <div><span style={{ fontWeight: 'bold' }}>Edad Suerte:</span> {node.edadSuerteDias || 0} días</div>
              <div><span style={{ fontWeight: 'bold' }}>Edad Última Cosecha:</span> {node.edadUltimaCosechaDias || 0} días</div>
              <div><span style={{ fontWeight: 'bold' }}>Ubicación GPS:</span> {node.lat ? `${node.lat}, ${node.lng}` : 'No definida'}</div>
              <div><span style={{ fontWeight: 'bold' }}>Polígono:</span> {node.geometria?.length > 0 ? `${node.geometria.length} puntos definidos` : 'No definido'}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
