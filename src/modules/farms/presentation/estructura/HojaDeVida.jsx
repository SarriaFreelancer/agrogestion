import React, { useState, useEffect } from 'react';
import { useAgro } from '@/providers/AgroContext';
import { 
  Sprout, 
  MapPin, 
  Layers, 
  Edit3, 
  Save, 
  X, 
  Trash2, 
  Compass, 
  Activity, 
  Calendar, 
  Grid,
  Droplets,
  Trees
} from 'lucide-react';
import { notifySuccess } from '@/utils/swal';

export default function HojaDeVida({ node, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [showOtrasUnidades, setShowOtrasUnidades] = useState(false);
  const [formData, setFormData] = useState(node || {});
  const [saveStatus, setSaveStatus] = useState('');

  const { deleteEstructura, cultivos, unidades } = useAgro();

  useEffect(() => {
    setFormData(node || {});
    setEditMode(false);
  }, [node?.id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const addOtraUnidad = () => {
    const unidadPorDefecto = unidades[0]?.name || 'Hectáreas';
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
    onUpdate(node.id, formData, node.type);
    setEditMode(false);
    setSaveStatus('Cambios guardados con éxito');
    notifySuccess('Información actualizada correctamente');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleDelete = () => {
    deleteEstructura(node.id, node.type);
  };

  if (!node) return null;

  return (
    <div className="glass-card !p-6 border-[var(--glass-border)] shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--glass-border)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Layers size={14} />
            <span>Nivel: {node.type}</span>
          </div>
          <h2 className="text-xl font-extrabold text-[var(--text-contrast)] mt-0.5">
            {node.id} - {node.name}
          </h2>
          {saveStatus && (
            <span className="text-xs text-primary font-bold">{saveStatus}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button 
                type="button" 
                onClick={handleSave} 
                className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <Save size={14} /> Guardar
              </button>
              <button 
                type="button" 
                onClick={() => { setEditMode(false); setFormData({ ...node }); }} 
                className="btn-secondary !py-2 !px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <X size={14} /> Cancelar
              </button>
            </>
          ) : (
            <button 
              type="button" 
              onClick={() => setEditMode(true)} 
              className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <Edit3 size={14} /> Editar Información
            </button>
          )}

          <button 
            type="button" 
            onClick={handleDelete} 
            className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>

      {/* Form / Details */}
      {editMode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="input-group">
            <label className="input-label">Código</label>
            <input 
              name="id" 
              className="input-field" 
              value={formData.id || ''} 
              onChange={handleChange} 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Nombre</label>
            <input 
              name="name" 
              className="input-field" 
              value={formData.name || ''} 
              onChange={handleChange} 
            />
          </div>

          {(node.type === 'Sector' || node.type === 'Zona') && (
            <>
              <div className="input-group sm:col-span-2">
                <label className="input-label">Planta / Central Asignada</label>
                <input 
                  name="plantaCliente" 
                  className="input-field" 
                  value={formData.plantaCliente || ''} 
                  onChange={handleChange} 
                />
              </div>
              <div className="input-group sm:col-span-2">
                <label className="input-label">Descripción</label>
                <input 
                  name="description" 
                  className="input-field" 
                  value={formData.description || ''} 
                  onChange={handleChange} 
                />
              </div>
            </>
          )}

          {node.type === 'Finca' && (
            <div className="input-group sm:col-span-2">
              <label className="input-label">Ubicación / Coordenadas GPS</label>
              <input 
                name="location" 
                className="input-field" 
                value={formData.location || ''} 
                onChange={handleChange} 
                placeholder="Ej: 3.5284, -76.2981" 
              />
            </div>
          )}

          {node.type === 'Lote' && (
            <div className="input-group sm:col-span-2">
              <label className="input-label">Topografía del Suelo</label>
              <select 
                name="topography" 
                className="input-field" 
                value={formData.topography || ''} 
                onChange={handleChange}
              >
                <option value="">Seleccionar topografía...</option>
                <option value="Plana">Plana (0 - 3% pendiente)</option>
                <option value="Ondulada">Ondulada (3 - 12% pendiente)</option>
                <option value="Quebrada">Quebrada / Ladera (&gt; 12% pendiente)</option>
              </select>
            </div>
          )}

          {(node.type === 'Suerte' || node.type === 'Surco' || node.type === 'Seccion') && (
            <>
              {node.type === 'Suerte' && (
                <div className="input-group">
                  <label className="input-label">Cultivo Principal</label>
                  <select 
                    name="cultivo" 
                    className="input-field" 
                    value={formData.cultivo || ''} 
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar cultivo...</option>
                    {(cultivos || []).filter(c => c.estado !== 'Inactivo').map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Área Neta Efectiva (Ha)</label>
                <input 
                  type="number" 
                  step="any" 
                  name="hectareas" 
                  className="input-field" 
                  value={formData.hectareas ?? ''} 
                  onChange={handleChange} 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Número de Plantas / Densidad</label>
                <input 
                  type="number" 
                  name="plantas" 
                  className="input-field" 
                  value={formData.plantas ?? ''} 
                  onChange={handleChange} 
                />
              </div>

              {node.type === 'Suerte' && (
                <>
                  <div className="input-group">
                    <label className="input-label">Estado Operativo</label>
                    <select 
                      name="estado" 
                      className="input-field" 
                      value={formData.estado || 'Activo'} 
                      onChange={handleChange}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="En Renovación">En Renovación</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Estado Fenológico / Productivo</label>
                    <input 
                      name="estadoProductivo" 
                      className="input-field" 
                      value={formData.estadoProductivo || ''} 
                      onChange={handleChange} 
                      placeholder="Ej: En Crecimiento Vigoroso, Floración, Cosecha"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Edad (días)</label>
                    <input 
                      type="number" 
                      name="edadSuerteDias" 
                      className="input-field" 
                      value={formData.edadSuerteDias ?? ''} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Latitud Centroide</label>
                    <input 
                      type="number" 
                      step="any" 
                      name="lat" 
                      className="input-field" 
                      value={formData.lat ?? ''} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Longitud Centroide</label>
                    <input 
                      type="number" 
                      step="any" 
                      name="lng" 
                      className="input-field" 
                      value={formData.lng ?? ''} 
                      onChange={handleChange} 
                    />
                  </div>
                </>
              )}
            </>
          )}

        </div>
      ) : (
        /* Read Mode Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-[var(--glass-border)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Identificador</span>
            <div className="text-base font-extrabold text-[var(--text-contrast)] font-mono">{node.id}</div>
            <div className="text-xs text-[var(--text-muted)]">Nivel: {node.type}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-[var(--glass-border)] space-y-1">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Nombre Oficial</span>
            <div className="text-base font-bold text-[var(--text-contrast)]">{node.name}</div>
            <div className="text-xs text-primary font-medium">{node.cultivo || node.plantaCliente || 'Agrícola'}</div>
          </div>

          {(node.hectareas !== undefined || node.surcos?.length > 0) && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-[var(--glass-border)] space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Superficie</span>
              <div className="text-base font-extrabold text-emerald-400">
                {Number(node.hectareas || 0).toFixed(2)} Ha
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {node.plantas ? `${node.plantas.toLocaleString()} plantas` : `${node.surcos?.length || 0} surcos/válvulas`}
              </div>
            </div>
          )}

          {node.estadoProductivo && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-[var(--glass-border)] space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Fase Productiva</span>
              <div className="text-sm font-bold text-[var(--text-contrast)]">{node.estadoProductivo}</div>
              <div className="text-xs text-[var(--text-muted)]">Edad: {node.edadSuerteDias || 0} días</div>
            </div>
          )}

          {node.topography && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-[var(--glass-border)] space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Topografía</span>
              <div className="text-sm font-bold text-[var(--text-contrast)]">{node.topography}</div>
            </div>
          )}

          {node.lat && node.lng && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-[var(--glass-border)] space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Geoposicionamiento</span>
              <div className="text-xs font-mono text-cyan-400">{node.lat.toFixed(4)}, {node.lng.toFixed(4)}</div>
            </div>
          )}

        </div>
      )}

      {/* Sub-elements summary if has children */}
      {node.surcos && node.surcos.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-[var(--glass-border)]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <Droplets size={14} className="text-blue-400" />
            Válvulas / Surcos Registrados ({node.surcos.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {node.surcos.map(s => (
              <div key={s.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-[var(--glass-border)] text-xs">
                <div className="font-bold text-[var(--text-contrast)]">{s.name}</div>
                <div className="text-[11px] text-emerald-400 font-medium">{s.hectareas} Ha</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
