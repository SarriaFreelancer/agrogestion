import { useMemo, useState } from 'react';
import { Building2, Plus, Pencil, Trash2, Users, MapPin, ShieldCheck, CheckCircle2, XCircle, Search, ChevronDown, ChevronRight, Settings2 } from 'lucide-react';
import { useAgro } from '@/providers/AgroContext';
import { MODULES_PRINCIPALES, MODULES_CONFIGURACION } from '@/providers/mocks';

const PLANES = ['Basico', 'Intermedio', 'Premium', 'Empresarial'];
const ESTADOS = ['Activa', 'Inactiva'];

const planColors = {
  Basico: 'bg-gray-500/20 text-gray-300',
  Intermedio: 'bg-blue-500/20 text-blue-300',
  Premium: 'bg-amber-500/20 text-amber-300',
  Empresarial: 'bg-purple-500/20 text-purple-300'
};

const emptyEmpresaForm = () => ({
  nit: '',
  name: '',
  pais: 'Colombia',
  ciudad: '',
  estado: 'Activa',
  plan: 'Basico',
  maxUsuarios: 10,
  maxPlantas: 2,
  modulosPrincipales: ['Dashboard'],
  modulosConfiguracion: ['Usuarios']
});

export default function GestionClientes() {
  const { empresas, addEmpresa, editEmpresa, deleteEmpresa, usuarios, plantas, currentUser } = useAgro();

  const isSuperAdmin = currentUser?.rol === 'Super Admin';

  const [formData, setFormData] = useState(emptyEmpresaForm());
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  // Permisos
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <div className="glass-card max-w-lg text-center p-10 fade-in">
          <ShieldCheck size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-contrast)] mb-2">Acceso Restringido</h2>
          <p className="text-[var(--text-muted)]">Esta sección solo está disponible para el usuario <strong>Super Admin</strong>.</p>
        </div>
      </div>
    );
  }

  const filteredEmpresas = useMemo(() => {
    if (!searchQuery) return empresas;
    const q = searchQuery.toLowerCase();
    return empresas.filter(e =>
      e.name?.toLowerCase().includes(q) ||
      e.nit?.toLowerCase().includes(q) ||
      e.ciudad?.toLowerCase().includes(q) ||
      e.plan?.toLowerCase().includes(q)
    );
  }, [empresas, searchQuery]);

  const getUserCount = (empresaId) => usuarios?.filter(u => u.empresaId === empresaId).length || 0;
  const getPlantaCount = (empresaId) => plantas?.filter(p => p.companyId === empresaId || p.empresaId === empresaId).length || 0;
  const getUsersForEmpresa = (empresaId) => usuarios?.filter(u => u.empresaId === empresaId) || [];

  const startCreating = () => {
    setFormData(emptyEmpresaForm());
    setEditingId(null);
    setIsFormOpen(true);
  };

  const startEditing = (empresa) => {
    setFormData({
      nit: empresa.nit || '',
      name: empresa.name || '',
      pais: empresa.pais || 'Colombia',
      ciudad: empresa.ciudad || '',
      estado: empresa.estado || 'Activa',
      plan: empresa.plan || 'Basico',
      maxUsuarios: empresa.maxUsuarios || 10,
      maxPlantas: empresa.maxPlantas || 2,
      modulosPrincipales: empresa.modulosPrincipales || ['Dashboard'],
      modulosConfiguracion: empresa.modulosConfiguracion || ['Usuarios']
    });
    setEditingId(empresa.id);
    setIsFormOpen(true);
  };

  const cancelForm = () => {
    setFormData(emptyEmpresaForm());
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.nit || !formData.name) {
      alert('Complete al menos el NIT y el Nombre de la empresa.');
      return;
    }

    if (editingId) {
      editEmpresa(editingId, formData);
    } else {
      addEmpresa({ ...formData, id: `EMP-${String(Date.now()).slice(-6)}` });
    }
    cancelForm();
  };

  const toggleModuloPrincipal = (key) => {
    setFormData(prev => ({
      ...prev,
      modulosPrincipales: prev.modulosPrincipales.includes(key)
        ? prev.modulosPrincipales.filter(m => m !== key)
        : [...prev.modulosPrincipales, key]
    }));
  };

  const toggleModuloConfig = (key) => {
    setFormData(prev => ({
      ...prev,
      modulosConfiguracion: prev.modulosConfiguracion.includes(key)
        ? prev.modulosConfiguracion.filter(m => m !== key)
        : [...prev.modulosConfiguracion, key]
    }));
  };

  return (
    <div className="space-y-6 fade-in p-6 lg:p-10 h-full w-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-contrast)]">Gestión de Empresas</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Administre las empresas clientes, sus planes, módulos habilitados y estado de licencia.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 self-start" onClick={startCreating}>
          <Plus size={16} /> Nueva Empresa
        </button>
      </div>

      {/* Buscador */}
      <div className="glass-card !p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            className="input-field !pl-10 !mb-0"
            placeholder="Buscar por nombre, NIT, ciudad o plan..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={`grid gap-6 ${isFormOpen ? 'lg:grid-cols-12' : 'lg:grid-cols-1'}`}>
        {/* Tabla de Empresas */}
        <div className={isFormOpen ? 'lg:col-span-7' : ''}>
          <div className="glass-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--glass-border)]">
                    <th className="text-left px-4 py-3 text-[var(--text-muted)] font-semibold text-xs uppercase tracking-wider"></th>
                    <th className="text-left px-4 py-3 text-[var(--text-muted)] font-semibold text-xs uppercase tracking-wider">NIT/Código</th>
                    <th className="text-left px-4 py-3 text-[var(--text-muted)] font-semibold text-xs uppercase tracking-wider">Nombre</th>
                    <th className="text-left px-4 py-3 text-[var(--text-muted)] font-semibold text-xs uppercase tracking-wider">País</th>
                    <th className="text-left px-4 py-3 text-[var(--text-muted)] font-semibold text-xs uppercase tracking-wider">Ciudad</th>
                    <th className="text-center px-4 py-3 text-[var(--text-muted)] font-semibold text-xs uppercase tracking-wider">Estado</th>
                    <th className="text-center px-4 py-3 text-[var(--text-muted)] font-semibold text-xs uppercase tracking-wider">Plan</th>
                    <th className="text-center px-4 py-3 text-[var(--text-muted)] font-semibold text-xs uppercase tracking-wider">Usuarios</th>
                    <th className="text-center px-4 py-3 text-[var(--text-muted)] font-semibold text-xs uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmpresas.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-[var(--text-muted)]">
                        <Building2 size={40} className="mx-auto mb-3 opacity-30" />
                        <p>No se encontraron empresas</p>
                      </td>
                    </tr>
                  ) : (
                    filteredEmpresas.map(empresa => {
                      const userCount = getUserCount(empresa.id);
                      const empresaUsers = getUsersForEmpresa(empresa.id);
                      const isExpanded = expandedRow === empresa.id;

                      return (
                        <>
                          <tr
                            key={empresa.id}
                            className={`border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors cursor-pointer ${editingId === empresa.id ? 'bg-primary/5' : ''}`}
                            onClick={() => setExpandedRow(isExpanded ? null : empresa.id)}
                          >
                            <td className="px-4 py-3 text-[var(--text-muted)]">
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </td>
                            <td className="px-4 py-3 text-[var(--text-contrast)] font-mono text-xs">{empresa.nit}</td>
                            <td className="px-4 py-3 text-[var(--text-contrast)] font-semibold">{empresa.name}</td>
                            <td className="px-4 py-3 text-[var(--text-muted)]">{empresa.pais}</td>
                            <td className="px-4 py-3 text-[var(--text-muted)]">{empresa.ciudad}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${empresa.estado === 'Activa' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {empresa.estado === 'Activa' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                {empresa.estado}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${planColors[empresa.plan] || 'bg-gray-500/20 text-gray-300'}`}>
                                {empresa.plan}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center gap-1 text-[var(--text-contrast)] font-bold">
                                <Users size={14} className="text-primary" /> {userCount}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                                  onClick={() => startEditing(empresa)}
                                  title="Editar"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                  onClick={() => deleteEmpresa(empresa.id)}
                                  title="Eliminar"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {/* Fila expandida - Usuarios de la empresa */}
                          {isExpanded && (
                            <tr key={`${empresa.id}-users`} className="bg-[var(--glass-bg)]">
                              <td colSpan={9} className="px-6 py-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Users size={16} className="text-primary" />
                                  <span className="text-sm font-bold text-[var(--text-contrast)]">
                                    Usuarios de {empresa.name} ({empresaUsers.length})
                                  </span>
                                </div>
                                {empresaUsers.length === 0 ? (
                                  <p className="text-xs text-[var(--text-muted)] italic pl-6">Sin usuarios asignados a esta empresa.</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-6">
                                    {empresaUsers.map(user => (
                                      <div key={user.id} className="flex items-center gap-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                          {(user.nombres || 'U')[0]}
                                        </div>
                                        <div className="overflow-hidden">
                                          <p className="text-xs font-semibold text-[var(--text-contrast)] truncate">{user.nombres} {user.apellidos}</p>
                                          <p className="text-[10px] text-[var(--text-muted)] truncate">{user.correo} · {user.rol}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Formulario */}
        {isFormOpen && (
          <div className="lg:col-span-5">
            <div className="glass-card !p-6 space-y-5 fade-in sticky top-0">
              <h3 className="text-base font-bold text-[var(--text-contrast)] flex items-center gap-2">
                {editingId ? <Pencil size={18} className="text-primary" /> : <Plus size={18} className="text-primary" />}
                {editingId ? 'Editar Empresa' : 'Nueva Empresa'}
              </h3>

              {/* Campos principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group !mb-0">
                  <label className="input-label">NIT / Código</label>
                  <input className="input-field" value={formData.nit} onChange={e => setFormData(p => ({ ...p, nit: e.target.value }))} placeholder="900123456-1" />
                </div>
                <div className="input-group !mb-0">
                  <label className="input-label">Nombre de la Empresa</label>
                  <input className="input-field" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Ingenio La Cabaña" />
                </div>
                <div className="input-group !mb-0">
                  <label className="input-label">País</label>
                  <input className="input-field" value={formData.pais} onChange={e => setFormData(p => ({ ...p, pais: e.target.value }))} placeholder="Colombia" />
                </div>
                <div className="input-group !mb-0">
                  <label className="input-label">Ciudad</label>
                  <input className="input-field" value={formData.ciudad} onChange={e => setFormData(p => ({ ...p, ciudad: e.target.value }))} placeholder="Cali" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group !mb-0">
                  <label className="input-label">Estado</label>
                  <select className="input-field" value={formData.estado} onChange={e => setFormData(p => ({ ...p, estado: e.target.value }))}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="input-group !mb-0">
                  <label className="input-label">Plan Actual</label>
                  <select className="input-field" value={formData.plan} onChange={e => setFormData(p => ({ ...p, plan: e.target.value }))}>
                    {PLANES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input-group !mb-0">
                  <label className="input-label">Usuarios Máximos</label>
                  <input className="input-field" type="number" min={1} value={formData.maxUsuarios} onChange={e => setFormData(p => ({ ...p, maxUsuarios: parseInt(e.target.value) || 1 }))} />
                </div>
                <div className="input-group !mb-0">
                  <label className="input-label">Plantas Máximas</label>
                  <input className="input-field" type="number" min={1} value={formData.maxPlantas} onChange={e => setFormData(p => ({ ...p, maxPlantas: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>

              {/* Módulos del Menú Principal */}
              <div className="pt-4 border-t border-[var(--glass-border)]">
                <h4 className="text-sm font-bold text-[var(--text-contrast)] flex items-center gap-2 mb-3">
                  <Settings2 size={16} className="text-primary" />
                  Módulos del Menú Principal
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {MODULES_PRINCIPALES.map(mod => {
                    const isChecked = formData.modulosPrincipales.includes(mod.key);
                    return (
                      <label key={mod.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs ${isChecked ? 'border-primary/50 bg-primary/10 text-[var(--text-contrast)]' : 'border-[var(--glass-border)] bg-transparent text-[var(--text-muted)] hover:border-[var(--glass-border)]'}`}>
                        <input type="checkbox" className="accent-[var(--primary-color)] w-3.5 h-3.5" checked={isChecked} onChange={() => toggleModuloPrincipal(mod.key)} />
                        {mod.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Módulos de Configuración */}
              <div className="pt-4 border-t border-[var(--glass-border)]">
                <h4 className="text-sm font-bold text-[var(--text-contrast)] flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-amber-400" />
                  Módulos de Configuración
                </h4>
                <p className="text-[10px] text-[var(--text-muted)] mb-3">Solo disponibles para roles Admin de la empresa.</p>
                <div className="grid grid-cols-2 gap-2">
                  {MODULES_CONFIGURACION.map(mod => {
                    const isChecked = formData.modulosConfiguracion.includes(mod.key);
                    return (
                      <label key={mod.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs ${isChecked ? 'border-amber-500/50 bg-amber-500/10 text-[var(--text-contrast)]' : 'border-[var(--glass-border)] bg-transparent text-[var(--text-muted)]'}`}>
                        <input type="checkbox" className="accent-amber-400 w-3.5 h-3.5" checked={isChecked} onChange={() => toggleModuloConfig(mod.key)} />
                        {mod.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-[var(--glass-border)]">
                <button className="btn-primary flex-1" onClick={handleSubmit}>
                  {editingId ? '✓ Guardar Cambios' : '✓ Crear Empresa'}
                </button>
                <button className="btn-secondary" onClick={cancelForm}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
