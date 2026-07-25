import { useMemo, useState } from 'react';
import { Eye, PencilLine, PlusCircle, ShieldCheck, Trash2, UserCog } from 'lucide-react';
import { useAgro } from '../../context/AgroContext';

const PERMISSION_GROUPS = [
  {
    title: 'Vistas Generales',
    keys: [
      { key: 'ver_dashboard', label: 'Ver dashboard' },
      { key: 'ver_estructura', label: 'Ver estructura' },
      { key: 'ver_maestros', label: 'Ver maestros' },
      { key: 'ver_planificacion', label: 'Ver planificación' },
      { key: 'ver_ejecucion', label: 'Ver ejecución' },
      { key: 'ver_reportes', label: 'Ver reportes' },
      { key: 'ver_monitoreo', label: 'Ver monitoreo' },
      { key: 'ver_mantenimiento', label: 'Ver mantenimiento' },
      { key: 'ver_sincronizacion', label: 'Ver sincronización' },
      { key: 'ver_mapas', label: 'Ver mapas' },
      { key: 'ver_usuarios', label: 'Ver usuarios' }
    ]
  },
  {
    title: 'Gestión de Usuarios',
    keys: [
      { key: 'crear_usuario', label: 'Crear usuario' },
      { key: 'editar_usuario', label: 'Editar usuario' },
      { key: 'eliminar_usuario', label: 'Eliminar usuario' }
    ]
  },
  {
    title: 'Configuración General',
    keys: [
      { key: 'asignar_modulos', label: 'Asignar módulos' },
      { key: 'gestionar_categorias', label: 'Gestionar categorías' },
      { key: 'administrar_config', label: 'Administrar configuración' },
      { key: 'gestionar_clientes', label: 'Gestionar clientes' }
    ]
  },
  {
    title: 'Maestros',
    subGroups: [
      {
        title: 'Actividades',
        keys: [
          { key: 'ver_maestro_actividades', label: 'Ver maestro' },
          { key: 'crear_actividad', label: 'Crear' },
          { key: 'editar_actividad', label: 'Editar' },
          { key: 'eliminar_actividad', label: 'Eliminar' }
        ]
      },
      {
        title: 'Insumos',
        keys: [
          { key: 'ver_maestro_insumos', label: 'Ver maestro' },
          { key: 'crear_insumo', label: 'Crear' },
          { key: 'editar_insumo', label: 'Editar' },
          { key: 'eliminar_insumo', label: 'Eliminar' }
        ]
      },
      {
        title: 'Maquinaria',
        keys: [
          { key: 'ver_maestro_maquinaria', label: 'Ver maestro' },
          { key: 'crear_maquinaria', label: 'Crear' },
          { key: 'editar_maquinaria', label: 'Editar' },
          { key: 'eliminar_maquinaria', label: 'Eliminar' }
        ]
      },
      {
        title: 'Trabajadores',
        keys: [
          { key: 'ver_maestro_trabajadores', label: 'Ver maestro' },
          { key: 'crear_trabajador', label: 'Crear' },
          { key: 'editar_trabajador', label: 'Editar' },
          { key: 'eliminar_trabajador', label: 'Eliminar' }
        ]
      },
      {
        title: 'Controles',
        keys: [
          { key: 'ver_maestro_controles', label: 'Ver maestro' },
          { key: 'crear_control', label: 'Crear' },
          { key: 'editar_control', label: 'Editar' },
          { key: 'eliminar_control', label: 'Eliminar' }
        ]
      },
      {
        title: 'Unidades de Medida',
        keys: [
          { key: 'ver_unidades', label: 'Ver maestro' },
          { key: 'crear_unidad', label: 'Crear' },
          { key: 'editar_unidad', label: 'Editar' },
          { key: 'eliminar_unidad', label: 'Eliminar' }
        ]
      }
    ]
  },
  {
    title: 'Reportes',
    keys: [
      { key: 'generar_reporte', label: 'Generar reporte' },
      { key: 'crear_reporte', label: 'Crear' },
      { key: 'editar_reporte', label: 'Editar' },
      { key: 'eliminar_reporte', label: 'Eliminar' }
    ]
  }
];

const moduleOptions = ['Dashboard', 'Estructura', 'Maestros', 'Planificacion', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento', 'Sincronizacion', 'Mapas', 'Usuarios'];

const PERMISSION_FIELDS = PERMISSION_GROUPS.flatMap(group => {
  if (group.subGroups) {
    return group.subGroups.flatMap(sub => sub.keys);
  }
  return group.keys || [];
});

const emptyUserForm = (clientId = '') => ({
  codigo: '',
  nombres: '',
  apellidos: '',
  cedula: '',
  correo: '',
  contrasena: '',
  rol: 'Usuario General',
  categoriaCodigo: 'USUARIO_GENERAL',
  modulos: ['Dashboard'],
  estado: 'Activo',
  fechaIngreso: '',
  clienteCodigo: clientId
});

const emptyCategoryForm = (clientId = '') => ({
  codigo: '',
  nombre: '',
  descripcion: '',
  estado: 'Activo',
  clienteCodigo: clientId,
  modulos: ['Dashboard'],
  permisos: PERMISSION_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: 0 }), {})
});

export default function Usuarios() {
  const {
    usuarios,
    categoriasAcceso,
    addUsuario,
    editUsuario,
    deleteUsuario,
    addCategoriaAcceso,
    editCategoriaAcceso,
    deleteCategoriaAcceso,
    currentClient,
    currentUser,
    hasActionPermission
  } = useAgro();

  const [activeTab, setActiveTab] = useState('usuarios');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [userForm, setUserForm] = useState(() => emptyUserForm(currentClient.id));
  const [categoryForm, setCategoryForm] = useState(() => emptyCategoryForm(currentClient.id));
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  const canManageUsers = hasActionPermission('crear_usuario') || hasActionPermission('editar_usuario') || hasActionPermission('eliminar_usuario') || currentUser?.rol === 'Super Admin';
  const canManageCategories = hasActionPermission('gestionar_categorias') || currentUser?.rol === 'Super Admin';

  const normalizedUsers = useMemo(() => usuarios.filter(user => {
    const userClient = user.clienteCodigo || user.cliente_codigo || currentClient.id;
    return userClient === currentClient.id || userClient === currentClient.databaseName || !userClient;
  }), [usuarios, currentClient.id, currentClient.databaseName]);

  const normalizedCategories = useMemo(() => categoriasAcceso.filter(category => {
    const categoryClient = category.clienteCodigo || category.cliente_codigo || currentClient.id;
    return categoryClient === currentClient.id || categoryClient === currentClient.databaseName || !categoryClient;
  }), [categoriasAcceso, currentClient.id, currentClient.databaseName]);

  const filteredUsers = useMemo(() => {
    return normalizedUsers.filter(user => {
      const search = searchQuery.toLowerCase();
      const code = (user.codigo || user.code || user.id || '').toLowerCase();
      const name = `${user.nombres || ''} ${user.apellidos || ''}`.toLowerCase();
      const email = (user.correo || '').toLowerCase();
      const role = (user.rol || '').toLowerCase();
      const date = (user.fechaIngreso || user.fecha_ingreso || '').toLowerCase();
      return code.includes(search) || name.includes(search) || email.includes(search) || role.includes(search) || date.includes(search);
    });
  }, [normalizedUsers, searchQuery]);

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm(currentClient.id));
    setIsCreating(false);
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm(currentClient.id));
  };

  const handleUserModulesChange = (moduleName) => {
    setUserForm(prev => {
      const current = Array.isArray(prev.modulos) ? prev.modulos : [];
      if (moduleName === 'ALL') {
        return { ...prev, modulos: ['ALL'] };
      }
      const next = current.includes(moduleName)
        ? current.filter(item => item !== moduleName)
        : [...current.filter(item => item !== 'ALL'), moduleName];
      return { ...prev, modulos: next };
    });
  };

  const handleUserRoleChange = (role) => {
    const rolePreset = role === 'Super Admin'
      ? ['ALL']
      : role === 'Administrador'
        ? moduleOptions
        : ['Dashboard', 'Estructura', 'Reportes'];

    setUserForm(prev => ({
      ...prev,
      rol: role,
      categoriaCodigo: role === 'Super Admin' ? 'SUPER_ADMIN' : role === 'Administrador' ? 'ADMIN' : 'USUARIO_GENERAL',
      modulos: rolePreset
    }));
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    const existingUser = normalizedUsers.find(user => (user.id || user.codigo || user.code) === editingUserId);

    const payload = {
      codigo: userForm.codigo || `USR-${Date.now()}`,
      nombres: userForm.nombres,
      apellidos: userForm.apellidos,
      cedula: userForm.cedula,
      correo: userForm.correo,
      contrasena: userForm.contrasena || existingUser?.contrasena || '',
      rol: userForm.rol,
      categoriaCodigo: userForm.categoriaCodigo,
      modulos: userForm.rol === 'Super Admin' ? ['ALL'] : userForm.modulos,
      estado: userForm.estado,
      fechaIngreso: userForm.fechaIngreso,
      clienteCodigo: currentClient.id
    };

    if (editingUserId) {
      editUsuario(editingUserId, payload);
    } else {
      addUsuario(payload);
    }

    resetUserForm();
  };

  const handleCategoryPermissionToggle = (key) => {
    setCategoryForm(prev => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [key]: Number(prev.permisos?.[key] ?? 0) === 1 ? 0 : 1
      }
    }));
  };

  const handleCategoryModuleToggle = (moduleName) => {
    setCategoryForm(prev => {
      const current = Array.isArray(prev.modulos) ? prev.modulos : [];
      const isAdding = !current.includes(moduleName);

      let nextModules;
      if (moduleName === 'ALL') {
        nextModules = ['ALL'];
      } else {
        nextModules = isAdding
          ? [...current.filter(item => item !== 'ALL'), moduleName]
          : current.filter(item => item !== moduleName);
      }

      // Define permission keys for each module
      const permissionsByModule = {
        'Estructura': ['crear_actividad', 'editar_actividad', 'eliminar_actividad'],
        'Maestros': [
          'ver_maestro_actividades',
          'ver_maestro_insumos',
          'ver_maestro_maquinaria',
          'ver_maestro_trabajadores',
          'ver_maestro_controles',
          'ver_unidades'
        ]
      };

      const nextPermisos = { ...prev.permisos };
      if (moduleName === 'ALL') {
        // set all defined permissions to 1 or 0 based on isAdding
        Object.values(permissionsByModule).flat().forEach(key => {
          nextPermisos[key] = isAdding ? 1 : 0;
        });
      } else if (permissionsByModule[moduleName]) {
        permissionsByModule[moduleName].forEach(key => {
          nextPermisos[key] = isAdding ? 1 : 0;
        });
      }

      return { ...prev, modulos: nextModules, permisos: nextPermisos };
    });
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();

    const payload = {
      codigo: categoryForm.codigo || `CAT-${Date.now()}`,
      nombre: categoryForm.nombre,
      descripcion: categoryForm.descripcion,
      permisos: categoryForm.permisos,
      modulos: categoryForm.modulos,
      estado: categoryForm.estado,
      clienteCodigo: currentClient.id
    };

    if (editingCategoryId) {
      editCategoriaAcceso(editingCategoryId, payload);
    } else {
      addCategoriaAcceso(payload);
    }

    resetCategoryForm();
  };

  const startEditUser = (user) => {
    setEditingUserId(user.id || user.codigo || user.code);
    setIsCreating(true);
    setUserForm({
      codigo: user.codigo || user.code || user.id || '',
      nombres: user.nombres || '',
      apellidos: user.apellidos || '',
      cedula: user.cedula || '',
      correo: user.correo || '',
      contrasena: '',
      rol: user.rol || 'Usuario General',
      categoriaCodigo: user.categoriaCodigo || user.categoria_codigo || 'USUARIO_GENERAL',
      modulos: Array.isArray(user.modulos) ? user.modulos : [],
      estado: user.estado || 'Activo',
      fechaIngreso: user.fechaIngreso || user.fecha_ingreso || '',
      clienteCodigo: user.clienteCodigo || currentClient.id
    });
  };

  const startEditCategory = (category) => {
    setEditingCategoryId(category.id || category.codigo || category.code);
    setCategoryForm({
      codigo: category.codigo || category.code || category.id || '',
      nombre: category.nombre || category.name || '',
      descripcion: category.descripcion || '',
      estado: category.estado || 'Activo',
      clienteCodigo: category.clienteCodigo || currentClient.id,
      modulos: Array.isArray(category.modulos) ? category.modulos : [],
      permisos: {
        ...emptyCategoryForm(currentClient.id).permisos,
        ...(category.permisos || {})
      }
    });
  };

  // auto-select first user if none is selected
  const activeSelectedUserId = selectedUserId || (filteredUsers[0]?.id || filteredUsers[0]?.codigo || filteredUsers[0]?.code || null);
  const selectedUser = normalizedUsers.find(u => (u.id || u.codigo || u.code) === activeSelectedUserId);

  const selectedUserCategory = selectedUser ? normalizedCategories.find(cat => (
    cat.codigo === selectedUser.categoriaCodigo ||
    cat.id === selectedUser.categoriaCodigo ||
    cat.code === selectedUser.categoriaCodigo
  )) : null;

  const hasSelectedUserPermission = (key) => {
    if (selectedUser?.rol === 'Super Admin' || selectedUser?.categoriaCodigo === 'SUPER_ADMIN') return true;
    return Number(selectedUserCategory?.permisos?.[key]) === 1;
  };

  return (
    <div className="fade-in">
      <div className="header">
        <h1>Usuarios y accesos</h1>
        <p>
          Administra los usuarios del cliente <strong>{currentClient.name}</strong>, asigna módulos y define categorías de acceso.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button type="button" className={activeTab === 'usuarios' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('usuarios')}>
          <UserCog size={16} style={{ marginRight: '0.4rem' }} />
          Usuarios
        </button>
        <button type="button" className={activeTab === 'categorias' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('categorias')}>
          <ShieldCheck size={16} style={{ marginRight: '0.4rem' }} />
          Categorías de acceso
        </button>
      </div>

      {activeTab === 'usuarios' && (
        <div>
          {/* BARRA DE BÚSQUEDA Y BOTÓN SUPERIOR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <input 
              className="input-field" 
              style={{ maxWidth: '380px', margin: 0 }} 
              placeholder="Buscar por código, nombre, correo, fecha..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button className="btn-primary" onClick={() => { setIsCreating(!isCreating); setEditingUserId(null); setUserForm(emptyUserForm(currentClient.id)); }}>
              {isCreating ? 'Cancelar' : '+ Nuevo Usuario'}
            </button>
          </div>

          {/* FORMULARIO COLAPSABLE */}
          {isCreating && (
            <div style={{ background: 'var(--input-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>{editingUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h4>
                {editingUserId && (
                  <button type="button" className="btn-secondary" onClick={resetUserForm} style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                    Cancelar edición
                  </button>
                )}
              </div>
              <form onSubmit={handleUserSubmit}>
                <div className="grid-3">
                  <div className="input-group">
                    <label className="input-label">Código de usuario</label>
                    <input className="input-field" value={userForm.codigo} onChange={e => setUserForm({ ...userForm, codigo: e.target.value })} placeholder="USR-0001" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Nombres *</label>
                    <input className="input-field" value={userForm.nombres} onChange={e => setUserForm({ ...userForm, nombres: e.target.value })} placeholder="Juan Carlos" required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Apellidos *</label>
                    <input className="input-field" value={userForm.apellidos} onChange={e => setUserForm({ ...userForm, apellidos: e.target.value })} placeholder="Pérez Gómez" required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Cédula</label>
                    <input className="input-field" value={userForm.cedula} onChange={e => setUserForm({ ...userForm, cedula: e.target.value })} placeholder="Documento" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Correo *</label>
                    <input className="input-field" type="email" value={userForm.correo} onChange={e => setUserForm({ ...userForm, correo: e.target.value })} placeholder="usuario@correo.com" required />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Contraseña {!editingUserId && '*'}</label>
                    <input className="input-field" type="password" value={userForm.contrasena} onChange={e => setUserForm({ ...userForm, contrasena: e.target.value })} placeholder="••••••••" required={!editingUserId} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Fecha de ingreso a la empresa</label>
                    <input type="date" className="input-field" value={userForm.fechaIngreso} onChange={e => setUserForm({ ...userForm, fechaIngreso: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Rol</label>
                    <select className="input-field" value={userForm.rol} onChange={e => handleUserRoleChange(e.target.value)}>
                      <option value="Usuario General">Usuario General</option>
                      <option value="Administrador">Administrador</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Categoría de acceso</label>
                    <select className="input-field" value={userForm.categoriaCodigo} onChange={e => setUserForm({ ...userForm, categoriaCodigo: e.target.value })}>
                      <option value="USUARIO_GENERAL">Usuario General</option>
                      <option value="ADMIN">Administrador</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      {normalizedCategories.map(category => (
                        <option key={category.id || category.codigo} value={category.codigo || category.code || category.id}>{category.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Estado</label>
                    <select className="input-field" value={userForm.estado} onChange={e => setUserForm({ ...userForm, estado: e.target.value })}>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label className="input-label">Módulos asignados</label>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {moduleOptions.map(moduleName => (
                        <label key={moduleName} className="custom-checkbox" style={{ background: 'rgba(255,255,255,0.55)', padding: '0.3rem 0.5rem', borderRadius: '999px', fontSize: '0.85rem' }}>
                          <input
                            type="checkbox"
                            checked={userForm.modulos.includes('ALL') ? moduleName === 'ALL' : userForm.modulos.includes(moduleName)}
                            onChange={() => handleUserModulesChange(moduleName)}
                            disabled={userForm.rol === 'Super Admin'}
                          />
                          <span>{moduleName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                  <button type="submit" className="btn-primary" disabled={!canManageUsers} style={{ minWidth: '150px' }}>
                    <PlusCircle size={16} style={{ marginRight: '0.4rem' }} />
                    {editingUserId ? 'Guardar cambios' : 'Crear usuario'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MAIN GRID: LIST & DETAILS PANEL */}
          <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }}>
            {/* TABLA DE USUARIOS */}
            <div className="glass-card" style={{ flex: '1 1 320px', margin: 0, padding: '1.25rem', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Usuarios del cliente</h3>
                <span className="badge">{filteredUsers.length}</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => {
                      const isSelected = (user.id || user.codigo || user.code) === activeSelectedUserId;
                      return (
                        <tr 
                          key={user.id || user.codigo || user.code} 
                          onClick={() => setSelectedUserId(user.id || user.codigo || user.code)}
                          style={{ 
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
                            borderLeft: isSelected ? '4px solid var(--primary-color)' : 'none'
                          }}
                        >
                          <td style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>{user.codigo || user.code || user.id}</td>
                          <td>{`${user.nombres || ''} ${user.apellidos || ''}`.trim()}</td>
                          <td>{user.correo}</td>
                          <td>{user.rol}</td>
                          <td>
                            <span className={`badge ${user.estado === 'Activo' ? 'badge-active' : 'badge-inactive'}`}>
                              {user.estado || 'Activo'}
                            </span>
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button type="button" className="btn-secondary" style={{ padding: '0.3rem 0.5rem' }} onClick={() => startEditUser(user)}>
                                <PencilLine size={14} />
                              </button>
                              <button type="button" className="btn-danger" style={{ padding: '0.3rem 0.5rem' }} onClick={() => deleteUsuario(user.id || user.codigo || user.code)} disabled={!canManageUsers}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No se encontraron usuarios.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PANEL DE DETALLE Y PERMISOS DEL USUARIO SELECCIONADO */}
            <div className="glass-card" style={{ flex: '1 1 320px', margin: 0, padding: '1.25rem', height: 'fit-content' }}>
              {selectedUser ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'var(--primary-color)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>
                      {selectedUser.nombres?.[0]?.toUpperCase() || selectedUser.correo?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{`${selectedUser.nombres || ''} ${selectedUser.apellidos || ''}`.trim()}</h3>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>{selectedUser.correo}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '0.65rem', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-muted)' }}>Código:</strong> {selectedUser.codigo || selectedUser.code || selectedUser.id}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-muted)' }}>Cédula:</strong> {selectedUser.cedula || 'N/A'}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-muted)' }}>Fecha de ingreso:</strong> {selectedUser.fechaIngreso || selectedUser.fecha_ingreso || 'No registrada'}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-muted)' }}>Rol:</strong> <span className="badge" style={{ verticalAlign: 'middle' }}>{selectedUser.rol}</span>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-muted)' }}>Categoría:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedUser.categoriaCodigo?.toLowerCase().replace('_', ' ') || 'Ninguna'}</span>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-muted)' }}>Estado:</strong> <span className={`badge ${selectedUser.estado === 'Activo' ? 'badge-active' : 'badge-inactive'}`} style={{ verticalAlign: 'middle' }}>{selectedUser.estado || 'Activo'}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>Módulos autorizados</h4>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      {selectedUser.rol === 'Super Admin' || selectedUser.categoriaCodigo === 'SUPER_ADMIN' ? (
                        <span className="badge badge-active" style={{ background: '#2E7D32' }}>Todos (ALL)</span>
                      ) : (
                        Array.isArray(selectedUser.modulos) && selectedUser.modulos.map(modName => (
                          <span key={modName} className="badge badge-active" style={{ fontSize: '0.78rem' }}>{modName}</span>
                        ))
                      )}
                      {(!Array.isArray(selectedUser.modulos) || selectedUser.modulos.length === 0) && selectedUser.rol !== 'Super Admin' && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ninguno</span>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>Permisos Granulares</h4>
                    <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                      {PERMISSION_GROUPS.map(group => {
                        const allKeys = (group.keys ? group.keys : []).concat(group.subGroups ? group.subGroups.flatMap(s => s.keys) : []);
                        const activeKeys = allKeys.filter(k => hasSelectedUserPermission(k.key));
                        
                        if (activeKeys.length === 0) return null;

                        return (
                          <div key={group.title} style={{ background: 'rgba(255,255,255,0.3)', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.35rem', color: 'var(--primary-color)' }}>{group.title}</div>
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              {activeKeys.map(k => (
                                <span key={k.key} className="badge" style={{ fontSize: '0.72rem', background: 'rgba(var(--primary-rgb), 0.12)', color: 'var(--primary-dark)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <ShieldCheck size={11} color="var(--primary-light)" /> {k.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {(selectedUser.rol !== 'Super Admin' && selectedUser.categoriaCodigo !== 'SUPER_ADMIN' && !selectedUserCategory) && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No se encontraron permisos de categoría definidos.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <UserCog size={36} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Seleccione un usuario para ver detalles y permisos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categorias' && (
        <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <form onSubmit={handleCategorySubmit} style={{ flex: '1 1 320px', display: 'grid', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <h3 style={{ margin: 0 }}>{editingCategoryId ? 'Editar categoría' : 'Nueva categoría'}</h3>
              {editingCategoryId && (
                <button type="button" className="btn-secondary" onClick={resetCategoryForm}>
                  Cancelar edición
                </button>
              )}
            </div>

            <label className="input-label">Código</label>
            <input className="input-field" value={categoryForm.codigo} onChange={e => setCategoryForm({ ...categoryForm, codigo: e.target.value })} placeholder="CAT-001" />

            <label className="input-label">Nombre</label>
            <input className="input-field" value={categoryForm.nombre} onChange={e => setCategoryForm({ ...categoryForm, nombre: e.target.value })} placeholder="Administrador" required />

            <label className="input-label">Descripción</label>
            <textarea className="input-field" rows="3" value={categoryForm.descripcion} onChange={e => setCategoryForm({ ...categoryForm, descripcion: e.target.value })} placeholder="Detalle de permisos" />

            <label className="input-label">Módulos permitidos</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {moduleOptions.map(moduleName => (
                <label key={moduleName} className="custom-checkbox" style={{ background: 'rgba(255,255,255,0.55)', padding: '0.35rem 0.6rem', borderRadius: '999px' }}>
                  <input
                    type="checkbox"
                    checked={categoryForm.modulos.includes('ALL') ? moduleName === 'ALL' : categoryForm.modulos.includes(moduleName)}
                    onChange={() => handleCategoryModuleToggle(moduleName)}
                    disabled={!canManageCategories}
                  />
                  <span>{moduleName}</span>
                </label>
              ))}
            </div>

            <label className="input-label">Estado</label>
            <select className="input-field" value={categoryForm.estado} onChange={e => setCategoryForm({ ...categoryForm, estado: e.target.value })}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>

            <label className="input-label">Permisos granulares</label>
            <div>
              {PERMISSION_GROUPS.map(group => (
              <details key={group.title} open={expandedGroups.has(group.title)} onToggle={e => {
                const newSet = new Set(expandedGroups);
                if (e.target.open) newSet.add(group.title); else newSet.delete(group.title);
                setExpandedGroups(newSet);
              }} style={{ marginBottom: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    style={{ marginRight: '0.4rem' }}
                    checked={
                      (group.keys ? group.keys : []).concat(group.subGroups ? group.subGroups.flatMap(s => s.keys) : []).every(k => Number(categoryForm.permisos?.[k.key] ?? 0) === 1)
                    }
                    onChange={e => {
                      e.stopPropagation();
                      const allKeys = (group.keys ? group.keys : []).concat(group.subGroups ? group.subGroups.flatMap(s => s.keys) : []);
                      const setTo = allKeys.every(k => Number(categoryForm.permisos?.[k.key] ?? 0) === 1) ? 0 : 1;
                      const newPermisos = { ...categoryForm.permisos };
                      allKeys.forEach(k => {
                        newPermisos[k.key] = setTo;
                      });
                      setCategoryForm(prev => ({ ...prev, permisos: newPermisos }));
                    }}
                  />
                  {group.title}
                </summary>
                {/* Direct keys of the group */}
                {group.keys && (
                  <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
                    {group.keys.map(field => (
                      <label key={field.key} className="config-option-row" style={{ margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={Number(categoryForm.permisos?.[field.key] ?? 0) === 1}
                          onChange={() => handleCategoryPermissionToggle(field.key)}
                          disabled={!canManageCategories}
                        />
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          {field.key.startsWith('ver_') && <Eye size={14} color="#4A90E2" style={{ marginRight: '0.3rem' }} />}
                          {field.key.startsWith('crear_') && <PlusCircle size={14} color="#28A745" style={{ marginRight: '0.3rem' }} />}
                          {field.key.startsWith('editar_') && <PencilLine size={14} color="#FFC107" style={{ marginRight: '0.3rem' }} />}
                          {field.key.startsWith('eliminar_') && <Trash2 size={14} color="#DC3545" style={{ marginRight: '0.3rem' }} />}
                          <strong>{field.label}</strong>
                          <small>{field.key}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {/* Sub‑groups */}
                {group.subGroups && group.subGroups.map(sub => (
                  <details key={sub.title} open={expandedGroups.has(`${group.title}-${sub.title}`)} onToggle={e => {
                    const newSet = new Set(expandedGroups);
                    const id = `${group.title}-${sub.title}`;
                    if (e.target.open) newSet.add(id); else newSet.delete(id);
                    setExpandedGroups(newSet);
                  }} style={{ marginLeft: '1rem', marginBottom: '0.5rem' }}>
                    <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      {/* Sub‑group checkbox */}
                      <input
                        type="checkbox"
                        style={{ marginRight: '0.4rem' }}
                        checked={sub.keys.every(k => Number(categoryForm.permisos?.[k.key] ?? 0) === 1)}
                        onChange={e => {
                          e.stopPropagation();
                          const newPermisos = { ...categoryForm.permisos };
                          sub.keys.forEach(k => {
                            newPermisos[k.key] = Number(categoryForm.permisos?.[k.key] ?? 0) === 1 ? 0 : 1;
                          });
                          setCategoryForm(prev => ({ ...prev, permisos: newPermisos }));
                        }}
                      />
                      {sub.title}
                    </summary>
                    <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
                      {sub.keys.map(field => (
                        <label key={field.key} className="config-option-row" style={{ margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={Number(categoryForm.permisos?.[field.key] ?? 0) === 1}
                            onChange={() => handleCategoryPermissionToggle(field.key)}
                            disabled={!canManageCategories}
                          />
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            {field.key.startsWith('ver_') && <Eye size={14} color="#4A90E2" style={{ marginRight: '0.3rem' }} />}
                            {field.key.startsWith('crear_') && <PlusCircle size={14} color="#28A745" style={{ marginRight: '0.3rem' }} />}
                            {field.key.startsWith('editar_') && <PencilLine size={14} color="#FFC107" style={{ marginRight: '0.3rem' }} />}
                            {field.key.startsWith('eliminar_') && <Trash2 size={14} color="#DC3545" style={{ marginRight: '0.3rem' }} />}
                            <strong>{field.label}</strong>
                            <small>{field.key}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </details>
                ))}
              </details>
            ))}
            </div>

            <button type="submit" className="btn-primary" disabled={!canManageCategories}>
              <PlusCircle size={16} style={{ marginRight: '0.4rem' }} />
              {editingCategoryId ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </form>

          <div style={{ flex: '1.25 1 320px', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ margin: 0 }}>Categorías de acceso</h3>
              <span className="badge">{normalizedCategories.length}</span>
            </div>

            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {normalizedCategories.map(category => (
                <div key={category.id || category.codigo || category.code} className="glass-card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{category.nombre}</h4>
                      <small style={{ color: 'var(--text-muted)' }}>{category.codigo || category.code || category.id}</small>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button type="button" className="btn-secondary" onClick={() => startEditCategory(category)}>
                        <PencilLine size={15} />
                      </button>
                      <button type="button" className="btn-danger" onClick={() => deleteCategoriaAcceso(category.id || category.codigo || category.code)} disabled={!canManageCategories}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p style={{ margin: '0.65rem 0', color: 'var(--text-muted)' }}>{category.descripcion}</p>
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    {(Array.isArray(category.modulos) ? category.modulos : []).map(moduleName => (
                      <span key={moduleName} className="badge badge-inactive">{moduleName}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
