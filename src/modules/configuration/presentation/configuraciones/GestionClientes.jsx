import { useMemo, useState } from 'react';
import { Building2, CheckCircle2, ChevronDown, Database, DoorOpen, Globe2, KeyRound, Palette, RefreshCcw, Settings2, ShieldCheck, Trash2, UserRound, Users } from 'lucide-react';
import { useAgro } from '@/providers/AgroContext';
import DatabaseConnectionConfig from '@/modules/configuration/presentation/configuraciones/DatabaseConnectionConfig';

export default function GestionClientes() {
  const { clients, updateClient, editClient, deleteClient, suspendClient, reactivateClient, resetClientData, addClient, switchClient, currentClient, PLAN_CONFIG, THEME_CONFIG } = useAgro();
  const isAdminUser = currentClient.modules?.includes('ALL');
  const firstClientKey = Object.keys(clients)[0] || '';
  const activeClientKey = Object.keys(clients).find(key => clients[key].id === currentClient.id) || firstClientKey;
  const [selectedClientKey, setSelectedClientKey] = useState(activeClientKey);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newClientPlan, setNewClientPlan] = useState('Estándar');
  const [newClientTheme, setNewClientTheme] = useState('Verde Agro');
  const [newDatabaseName, setNewDatabaseName] = useState('');
  const [newDatabaseUser, setNewDatabaseUser] = useState('');
  const [newDatabasePassword, setNewDatabasePassword] = useState('');
  const [newDatabaseConfig, setNewDatabaseConfig] = useState({
    databaseEngine: 'SQL Server',
    connectionData: {}
  });
  const [openClientGroup, setOpenClientGroup] = useState(null);

  const allModules = [
    { key: 'Dashboard', label: 'Dashboard' },
    { key: 'Estructura', label: 'Estructura' },
    { key: 'Maestros', label: 'Maestros' },
    { key: 'Planificacion', label: 'Planificación' },
    { key: 'Ejecucion', label: 'Ejecución' },
    { key: 'Reportes', label: 'Informes' },
    { key: 'Monitoreo', label: 'Monitoreo' },
    { key: 'Mantenimiento', label: 'Mantenimiento' },
    { key: 'Mapas', label: 'Mapas' },
    { key: 'Sincronizacion', label: 'Sincronización' }
  ];

  const groupedClients = useMemo(() => {
    const groups = {
      'Estándar': [],
      Premium: [],
      Admin: []
    };

    Object.entries(clients).forEach(([key, client]) => {
      const plan = groups[client.plan] ? client.plan : 'Estándar';
      groups[plan].push([key, client]);
    });

    return groups;
  }, [clients]);

  const selectedClient = clients[selectedClientKey] || clients[firstClientKey];
  const selectedTheme = THEME_CONFIG[selectedClient?.theme || 'Verde Agro'] || THEME_CONFIG['Verde Agro'];
  const selectedModules = selectedClient?.modules || [];
  const hasGlobalAccess = selectedModules.includes('ALL');

  const planLabels = {
    'Estándar': {
      title: 'Clientes estándar',
      subtitle: 'Operación base',
      icon: Building2
    },
    Premium: {
      title: 'Clientes premium',
      subtitle: 'Funciones ampliadas',
      icon: Users
    },
    Admin: {
      title: 'Global admin',
      subtitle: 'Acceso total',
      icon: Globe2
    }
  };

  const handleCreate = () => {
    if (!newClientName || !newClientId) {
      alert('Complete los datos');
      return;
    }

    const key = newClientId.toLowerCase();
    addClient(key, { id: newClientId,
      name: newClientName,
      plan: newClientPlan,
      theme: newClientTheme,
      databaseName: newDatabaseName || `agroData_${newClientId}`,
      databaseUser: newDatabaseUser || `${newClientId}_user`,
      databasePassword: newDatabasePassword,
      databaseEngine: newDatabaseConfig.databaseEngine,
      connectionData: newDatabaseConfig.connectionData
    });
    
    // Limpiar formulario y cerrar modal
    setSelectedClientKey(key);
    setNewClientName('');
    setNewClientId('');
    setNewDatabaseName('');
    setNewDatabaseUser('');
    setNewDatabasePassword('');
    setNewDatabaseConfig({
      databaseEngine: 'SQL Server',
      connectionData: {}
    });
    setIsAdding(false);
    
    // Mostrar mensaje de éxito
    setSuccessMessage('Cliente creado con éxito');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handlePlanChange = (clientKey, plan) => {
    updateClient(clientKey, plan);
  };

  const handleThemeChange = (clientKey, theme) => {
    const client = clients[clientKey];
    updateClient(clientKey, client.plan, client.modules, theme);
  };

  const handleDatabaseChange = (clientKey, field, value) => {
    const client = clients[clientKey];
    updateClient(clientKey, client.plan, client.modules, client.theme, {
      [field]: value
    });
  };

  const handleClientFieldChange = (clientKey, field, value) => {
    editClient(clientKey, { [field]: value });
  };

  const handleEnterClient = () => {
    if (selectedClient.status === 'Suspendido') {
      alert('Esta instancia está suspendida por falta de pago.');
      return;
    }

    switchClient(selectedClientKey);
  };

  const toggleModule = (clientKey, moduleKey) => {
    const client = clients[clientKey];
    const currentModules = client.modules || [];

    if (currentModules.includes('ALL')) return;

    const newModules = currentModules.includes(moduleKey)
      ? currentModules.filter(module => module !== moduleKey)
      : [...currentModules, moduleKey];

    updateClient(clientKey, client.plan, newModules, client.theme);
  };

  if (!isAdminUser) {
    return (
      <div className="glass-card fade-in client-empty-detail">
        Esta secciÃ³n solo estÃ¡ disponible para el usuario administrador.
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in p-6 lg:p-10 h-full w-full overflow-y-auto custom-scrollbar bg-transparent">
      <div className="header clients-header">
        <div>
          <h1>Gestión de Empresas</h1>
          <p>Agrupe empresas por tipo, seleccione una instancia y gestione sus módulos activos.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsAdding(true)}>+ Nueva Empresa</button>
      </div>

      {successMessage && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #c3e6cb',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle2 size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {isAdding && (
        <div className="glass-card client-create-card">
          <h3>Nueva Empresa</h3>
          <div className="grid-2 client-form-grid">
            <div className="input-group">
              <label className="input-label">Nombre Empresa</label>
              <input className="input-field" value={newClientName} onChange={e => setNewClientName(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">ID Instancia</label>
              <input
                className="input-field"
                value={newClientId}
                onChange={e => {
                  setNewClientId(e.target.value);
                  if (!newDatabaseName) setNewDatabaseName(`agroData_${e.target.value}`);
                  if (!newDatabaseUser) setNewDatabaseUser(`${e.target.value}_user`);
                }}
              />
            </div>
          </div>
          <div className="grid-2 client-form-grid">
            <div className="input-group">
              <label className="input-label">Plan Inicial</label>
              <select className="input-field" value={newClientPlan} onChange={e => setNewClientPlan(e.target.value)}>
                {Object.keys(PLAN_CONFIG).map(plan => <option key={plan} value={plan}>{plan}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Tema de Color</label>
              <select className="input-field" value={newClientTheme} onChange={e => setNewClientTheme(e.target.value)}>
                {Object.keys(THEME_CONFIG).map(theme => <option key={theme} value={theme}>{theme}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
            <DatabaseConnectionConfig
              clientData={newDatabaseConfig}
              onUpdate={setNewDatabaseConfig}
              isNewClient={true}
            />
          </div>

          <div className="client-form-actions" style={{ marginTop: '2rem' }}>
            <button className="btn-primary" onClick={handleCreate}>Crear</button>
            <button className="btn-secondary" onClick={() => setIsAdding(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="clients-layout">
        <section className="glass-card clients-list-panel">
          <div className="clients-list-title">
            <h3>Lista de Empresas</h3>
            <span>{Object.keys(clients).length} empresas</span>
          </div>

          {Object.entries(planLabels).map(([plan, meta]) => {
            const Icon = meta.icon;
            const group = groupedClients[plan] || [];

            return (
              <div className="client-group" key={plan}>
                <button
                  type="button"
                  className={`client-group-header client-group-toggle ${openClientGroup === plan ? 'open' : ''}`}
                  onClick={() => setOpenClientGroup(openClientGroup === plan ? null : plan)}
                >
                  <div>
                    <Icon size={18} />
                    <strong>{meta.title}</strong>
                  </div>
                  <span>{group.length}</span>
                  <ChevronDown size={17} />
                </button>
                <small>{meta.subtitle}</small>

                {openClientGroup === plan && (
                  <div className="client-group-list">
                    {group.length === 0 && <div className="client-empty">Sin clientes en este grupo</div>}
                    {group.map(([key, client]) => (
                      <button
                        type="button"
                        key={key}
                        className={`client-list-item ${selectedClientKey === key ? 'active' : ''}`}
                        onClick={() => setSelectedClientKey(key)}
                      >
                        <span className="client-list-avatar" style={{ background: THEME_CONFIG[client.theme || 'Verde Agro']?.primary || 'var(--primary-color)' }}>
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                        <span>
                          <strong>{client.name}</strong>
                          <small>{client.id} · {client.status === 'Suspendido' ? 'Suspendido' : client.databaseName}</small>
                        </span>
                        {client.id === currentClient.id && <CheckCircle2 size={17} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <section className="glass-card client-detail-panel">
          {selectedClient ? (
            <>
              <div className="client-detail-head">
                <div>
                  <div className="client-badges">
                    <span className="client-plan-badge">{selectedClient.plan}</span>
                    <span className="client-theme-badge" style={{ background: selectedTheme.primary }}>{selectedClient.theme || 'Verde Agro'}</span>
                    {selectedClient.id === currentClient.id && <span className="client-active-badge">Sesión activa</span>}
                    {selectedClient.status === 'Suspendido' && <span className="client-suspended-badge">Suspendido</span>}
                  </div>
                  <h2>{selectedClient.name}</h2>
                  <p>ID Instancia: {selectedClient.id}</p>
                </div>
                <button className="btn-secondary client-enter-btn" onClick={handleEnterClient} disabled={selectedClient.status === 'Suspendido'}>
                  <DoorOpen size={17} />
                  {selectedClient.id === currentClient.id ? 'Sesión activa' : 'Entrar'}
                </button>
              </div>

              <div className="client-database-card">
                <div className="client-database-title">
                  <Building2 size={19} />
                  <div>
                    <h3>Datos de la Empresa</h3>
                    <p>Edite la información comercial de la empresa y su estado de servicio.</p>
                  </div>
                </div>

                <div className="grid-3 client-controls-grid">
                  <div className="input-group">
                    <label className="input-label">Empresa</label>
                    <input className="input-field" value={selectedClient.name || ''} onChange={(e) => handleClientFieldChange(selectedClientKey, 'name', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Estado servicio</label>
                    <select
                      className="input-field"
                      value={selectedClient.status || 'Activo'}
                      onChange={(e) => e.target.value === 'Suspendido' ? suspendClient(selectedClientKey, selectedClient.suspendedReason || 'Pago pendiente') : reactivateClient(selectedClientKey)}
                      disabled={hasGlobalAccess}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Suspendido">Suspendido por pago</option>
                    </select>
                  </div>
                </div>

                {selectedClient.status === 'Suspendido' && (
                  <div className="input-group">
                    <label className="input-label">Motivo de suspensión</label>
                    <input className="input-field" value={selectedClient.suspendedReason || ''} onChange={(e) => handleClientFieldChange(selectedClientKey, 'suspendedReason', e.target.value)} />
                  </div>
                )}

                {!hasGlobalAccess && (
                  <div className="client-form-actions">
                    <button className="btn-secondary" onClick={() => resetClientData(selectedClientKey)}>
                      <RefreshCcw size={17} />
                      Reiniciar datos
                    </button>
                    <button className="btn-secondary client-danger-btn" onClick={() => deleteClient(selectedClientKey)}>
                      <Trash2 size={17} />
                      Eliminar empresa
                    </button>
                  </div>
                )}
              </div>

              <div className="grid-2 client-controls-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <UserRound size={32} style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{Math.floor(Math.random() * 15) + 3}</span>
                  <small style={{ color: '#666' }}>Usuarios vinculados</small>
                </div>
                <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Building2 size={32} style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{Math.floor(Math.random() * 3) + 1}</span>
                  <small style={{ color: '#666' }}>Plantas operativas</small>
                  <small style={{ color: '#999', fontSize: '0.7rem', marginTop: '0.5rem' }}>(Ingrese a la sesión para administrarlas)</small>
                </div>
              </div>

              <div className="grid-2 client-controls-grid">
                <div className="input-group">
                  <label className="input-label">
                    <Settings2 size={16} />
                    Plan
                  </label>
                  <select className="input-field" value={selectedClient.plan} onChange={(e) => handlePlanChange(selectedClientKey, e.target.value)}>
                    {Object.keys(PLAN_CONFIG).map(plan => <option key={plan} value={plan}>{plan}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">
                    <Palette size={16} />
                    Tema
                  </label>
                  <select className="input-field" value={selectedClient.theme || 'Verde Agro'} onChange={(e) => handleThemeChange(selectedClientKey, e.target.value)}>
                    {Object.keys(THEME_CONFIG).map(theme => <option key={theme} value={theme}>{theme}</option>)}
                  </select>
                </div>
              </div>

              <div className="client-database-card">
                <div className="client-database-title">
                  <Database size={19} />
                  <div>
                    <h3>Conexión de base de datos</h3>
                    <p>Configure el motor y parámetros de conexión para esta instancia.</p>
                  </div>
                </div>

                <DatabaseConnectionConfig
                  key={selectedClientKey}
                  clientData={{
                    databaseEngine: selectedClient.databaseEngine,
                    connectionData: selectedClient.connectionData || {}
                  }}
                  onUpdate={(config) => {
                    const client = clients[selectedClientKey];
                    updateClient(selectedClientKey, client.plan, client.modules, client.theme, {
                      databaseEngine: config.databaseEngine,
                      connectionData: config.connectionData
                    });
                  }}
                  isNewClient={false}
                />
              </div>

              <div className="client-modules-head">
                <div>
                  <h3>Módulos habilitados</h3>
                  <p>{hasGlobalAccess ? 'El administrador global tiene acceso a todos los módulos.' : 'Active o desactive los módulos disponibles para esta instancia.'}</p>
                </div>
                <span>{hasGlobalAccess ? 'ALL' : `${selectedModules.length}/${allModules.length}`}</span>
              </div>

              <div className="client-modules-grid">
                {allModules.map(module => {
                  const isEnabled = hasGlobalAccess || selectedModules.includes(module.key);

                  return (
                    <button
                      type="button"
                      key={module.key}
                      className={`client-module-chip ${isEnabled ? 'enabled' : ''}`}
                      onClick={() => toggleModule(selectedClientKey, module.key)}
                      disabled={hasGlobalAccess}
                    >
                      {isEnabled ? <CheckCircle2 size={17} /> : <ShieldCheck size={17} />}
                      <span>{module.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="client-empty-detail">Seleccione un cliente para ver su configuración.</div>
          )}
        </section>
      </div>
    </div>
  );
}


