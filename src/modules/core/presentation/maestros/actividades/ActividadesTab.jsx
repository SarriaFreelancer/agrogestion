import { useState, useMemo } from 'react';
import { useAgro } from '@/providers/AgroContext';

export default function ActividadesTab({ data, grupos, unidades, cultivos, addActividad, editActividad, deleteActividad, globalCultivo }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    code: '', name: '', groupId: '', cultivo: globalCultivo !== 'Todos' ? globalCultivo : (cultivos[0]?.name || ''), tipo: 'Manual',
    clasificacion: 'N/A', unidadProduccion: 'Hectáreas', unidadMedida: 'Hectáreas', tarifaBase: 0, productosEstandar: []
  });
  
  const clasificaciones = ['Aplicación de insumos', 'Aplicación de fertilizantes', 'Riego', 'Fertirriego', 'Labores de siembra', 'Corte', 'Transporte', 'N/A'];
  const { productos } = useAgro();

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(item =>
      String(item.code ?? '').toLowerCase().includes(q) ||
      String(item.name ?? '').toLowerCase().includes(q) ||
      String(item.cultivo ?? '').toLowerCase().includes(q) ||
      String(item.tipo ?? '').toLowerCase().includes(q) ||
      String(item.clasificacion ?? '').toLowerCase().includes(q) ||
      String(grupos.find(g => g.id === item.groupId)?.name ?? '').toLowerCase().includes(q)
    );
  }, [data, searchQuery, grupos]);

  const handleSave = () => {
    if(!formData.name || !formData.groupId) return alert("Nombre y Grupo son obligatorios");
    
    if (editingId) {
      editActividad(editingId, formData);
      setEditingId(null);
      setIsCreating(false);
    } else {
      addActividad(formData);
      setIsCreating(false);
    }
  };

  const handleEdit = (act) => {
    setFormData({ ...act });
    setEditingId(act.id);
    setIsCreating(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Gestión de Actividades</h3>
          <input
            className="input-field"
            style={{ maxWidth: '260px', margin: 0, padding: '0.4rem 0.75rem', fontSize: '0.88rem' }}
            placeholder="Buscar actividad, código, grupo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => { setIsCreating(!isCreating); setEditingId(null); setFormData({code: '', name: '', groupId: '', cultivo: globalCultivo !== 'Todos' ? globalCultivo : (cultivos[0]?.name || ''), tipo: 'Manual', clasificacion: 'N/A', unidadProduccion: 'Hectáreas', unidadMedida: 'Hectáreas', tarifaBase: 0, productosEstandar: []}); }}>
          {isCreating ? 'Cancelar' : '+ Nueva Actividad'}
        </button>
      </div>

      {(isCreating || editingId) && (
        <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h4>{editingId ? 'Editar Actividad' : 'Crear Nueva Actividad'}</h4>
          <div className="grid-3" style={{ marginTop: '1rem' }}>
            <div className="input-group"><label className="input-label">Código</label><input className="input-field" value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value})} placeholder="Ej. INS-03"/></div>
            <div className="input-group"><label className="input-label">Nombre *</label><input className="input-field" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}/></div>
            <div className="input-group"><label className="input-label">Cultivo *</label>
              <select className="input-field" value={formData.cultivo} onChange={e=>setFormData({...formData, cultivo: e.target.value})}>
                <option value="Todos">Todos los cultivos</option>{cultivos.filter(c => c.estado !== 'Inactivo').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Grupo *</label>
              <select className="input-field" value={formData.groupId} onChange={e=>setFormData({...formData, groupId: e.target.value})}>
                <option value="">Seleccionar...</option>
                {grupos.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Tipo Labor</label>
              <select className="input-field" value={formData.tipo} onChange={e=>setFormData({...formData, tipo: e.target.value})}>
                <option value="Manual">Manual</option><option value="Mecánica">Mecánica</option><option value="Mixta">Mixta</option>
              </select>
            </div>
            <div className="input-group"><label className="input-label">Clasificación *</label>
              <select className="input-field" value={formData.clasificacion} onChange={e=>setFormData({...formData, clasificacion: e.target.value})}>
                {clasificaciones.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Unidad de Producción</label>
              <select className="input-field" value={formData.unidadProduccion} onChange={e=>setFormData({...formData, unidadProduccion: e.target.value})}>
                {unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Unidad de Medida (Pago)</label>
              <select className="input-field" value={formData.unidadMedida} onChange={e=>setFormData({...formData, unidadMedida: e.target.value})}>
                {unidades.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
            <div className="input-group"><label className="input-label">Tarifa Base ($)</label><input type="number" className="input-field" value={formData.tarifaBase} onChange={e=>setFormData({...formData, tarifaBase: Number(e.target.value)})}/></div>
            
            {(formData.clasificacion === 'Aplicación de insumos' || formData.clasificacion === 'Aplicación de fertilizantes' || formData.clasificacion === 'Fertirriego') && (
              <div className="input-group" style={{ gridColumn: 'span 2' }}>
                <label className="input-label">Productos Estándar (Insumos/Fertilizantes)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--input-bg)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                  {productos.map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.productosEstandar?.includes(p.id)} 
                        onChange={e => {
                          const current = formData.productosEstandar || [];
                          const updated = e.target.checked ? [...current, p.id] : current.filter(prodId => prodId !== p.id);
                          setFormData({ ...formData, productosEstandar: updated });
                        }}
                      />
                      {p.nombre}
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <div className="input-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn-primary" onClick={handleSave} style={{width: '100%'}}>Guardar Actividad</button>
            </div>
          </div>
        </div>
      )}

      <div style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
          <thead>
            <tr style={{borderBottom: '2px solid var(--primary-light)'}}>
              <th style={{padding: '0.8rem 0.5rem'}}>Código</th>
              <th style={{padding: '0.8rem 0.5rem'}}>Actividad</th>
              <th style={{padding: '0.8rem 0.5rem'}}>Grupo</th>
              <th style={{padding: '0.8rem 0.5rem'}}>Cultivo</th>
              <th style={{padding: '0.8rem 0.5rem'}}>Tipo</th>
              <th style={{padding: '0.8rem 0.5rem'}}>Clasificación</th>
              <th style={{padding: '0.8rem 0.5rem'}}>U. Producción</th>
              <th style={{padding: '0.8rem 0.5rem'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id} style={{borderBottom: '1px solid var(--glass-border)'}}>
                <td style={{padding: '0.8rem 0.5rem', fontWeight: 'bold'}}>{item.code}</td>
                <td style={{padding: '0.8rem 0.5rem'}}>{item.name}</td>
                <td style={{padding: '0.8rem 0.5rem'}}>{grupos.find(g => g.id ===item.groupId)?.name}</td>
                <td style={{padding: '0.8rem 0.5rem'}}><span className="badge badge-info">{item.cultivo}</span></td>
                <td style={{padding: '0.8rem 0.5rem'}}>{item.tipo}</td>
                <td style={{padding: '0.8rem 0.5rem'}}><small>{item.clasificacion}</small></td>
                <td style={{padding: '0.8rem 0.5rem'}}>{item.unidadProduccion}</td>
                <td style={{padding: '0.8rem 0.5rem', display: 'flex', gap: '0.5rem'}}>
                  <button className="btn-secondary" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem'}} onClick={()=>handleEdit(item)}>Editar</button>
                  <button className="btn-secondary" style={{padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: '#ff5252', color: 'white', border: 'none'}} onClick={()=>deleteActividad(item.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
