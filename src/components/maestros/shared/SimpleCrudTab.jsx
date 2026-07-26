import React, { useState, useMemo } from 'react';
import { Search, Plus, X, Edit2, Trash2, Save } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field !pl-9"
              placeholder={`Buscar en ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <button 
          className={isCreating || editingId ? "btn-secondary !m-0" : "btn-primary !m-0"} 
          onClick={() => { setIsCreating(!isCreating); setEditingId(null); setFormData({}); }}
        >
          {(isCreating || editingId) ? <X size={17} /> : <Plus size={17} />}
          <span>{(isCreating || editingId) ? 'Cancelar' : 'Agregar Nuevo'}</span>
        </button>
      </div>

      {/* Form Drawer / Panel */}
      {(isCreating || editingId) && (
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-emerald-500/30 backdrop-blur-md space-y-4 fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="font-bold text-white text-base">
              {editingId ? `Editar ${title}` : `Nuevo Registro de ${title}`}
            </h4>
            <span className="badge badge-active text-[10px]">Formulario</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fields.map(f => (
              <div key={f.key} className="input-group !mb-0">
                <label className="input-label">{f.label}</label>
                {f.type === 'select' && Array.isArray(f.options) ? (
                  <select 
                    className="input-field" 
                    value={formData[f.key] || ''} 
                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                  >
                    <option value="" disabled className="bg-[#0d131f]">Seleccionar...</option>
                    {f.options.map(option => (
                      <option key={option} value={option} className="bg-[#0d131f]">{option}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    className="input-field" 
                    placeholder={`Ingrese ${f.label.toLowerCase()}`}
                    value={formData[f.key] || ''} 
                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} 
                  />
                )}
              </div>
            ))}
            <div className="flex items-end md:col-span-1">
              <button className="btn-primary !w-full !m-0" onClick={handleSave}>
                <Save size={16} />
                <span>Guardar Registro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="data-table">
          <thead>
            <tr>
              {fields.map(f => <th key={f.key}>{f.label}</th>)}
              <th className="w-28 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={fields.length + 1} className="text-center py-12 text-gray-500">
                  No se encontraron registros para mostrar
                </td>
              </tr>
            ) : (
              filteredData.map(item => (
                <tr key={item.id}>
                  {fields.map(f => <td key={f.key} className="text-white font-medium">{item[f.key]}</td>)}
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="btn-secondary !p-2 !m-0 text-gray-300 hover:text-white" 
                        title="Editar"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        className="btn-danger !p-2 !m-0" 
                        title="Eliminar"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
