import { useState } from 'react';
import './index.css';
import { AgroProvider, useAgro } from './context/AgroContext';

// Import components
import Dashboard from './components/dashboard/Dashboard';
import Estructura from './components/estructura/Estructura';
import Maestros from './components/maestros/Maestros';
import Usuarios from './components/usuarios/Usuarios';
import Planificacion from './components/planificacion/Planificacion';
import Ejecucion from './components/ejecucion/Ejecucion';
import Reportes from './components/reportes/Reportes';
import Configuraciones from './components/configuraciones/Configuraciones';
import Auth from './components/auth/Auth';
import Monitoreo from './components/monitoreo/Monitoreo';
import Mantenimiento from './components/mantenimiento/Mantenimiento';
import Sincronizacion from './components/sincronizacion/Sincronizacion';
import MapaCalor from './components/mapas/MapaCalor';
import GestionClientes from './components/configuraciones/GestionClientes';
import InstallPWA from './components/InstallPWA';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { 
    globalCultivo, setGlobalCultivo, cultivos, isOnline, syncQueue, 
    currentClient, currentUser, loginUser, logoutUser, switchClient, hasPermission, clients, hasActionPermission
  } = useAgro();
  const isAdminUser = currentUser?.rol === 'Super Admin' || currentUser?.rol === 'Administrador' || currentUser?.modulos?.includes('ALL');

  if (!currentUser) {
    return <Auth loginUser={loginUser} />;
  }

  if (currentClient.status === 'Suspendido' && !isAdminUser) {
    return (
      <div className="auth-page">
        <div className="glass-card" style={{ maxWidth: '520px', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--primary-dark)', marginBottom: '1rem' }}>Servicio suspendido</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Esta instancia está suspendida por falta de pago. Comuníquese con el administrador para reactivar el servicio.
          </p>
          <button className="btn-primary" onClick={() => logoutUser()}>Volver al login</button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    // Si la vista actual no tiene permiso, volver al dashboard
    if (currentView !== 'dashboard' && !hasPermission(getViewPermission(currentView))) {
       return <Dashboard />;
    }

    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      case 'estructura': return <Estructura />;
      case 'maestros': return <Maestros />;
      case 'usuarios': return <Usuarios />;
      case 'planificacion': return <Planificacion />;
      case 'ejecucion': return <Ejecucion />;
      case 'reportes': return <Reportes />;
      case 'monitoreo': return <Monitoreo />;
      case 'mantenimiento': return <Mantenimiento />;
      case 'sincronizacion': return <Sincronizacion />;
      case 'mapas': return <MapaCalor />;
      case 'gestionClientes': return <GestionClientes />;
      case 'configuraciones': return <Configuraciones />;
      default: return <Dashboard />;
    }
  };

  function getViewPermission(view) {
    const map = {
      'dashboard': 'Dashboard',
      'estructura': 'Estructura',
      'maestros': 'Maestros',
      'usuarios': 'Usuarios',
      'planificacion': 'Planificacion',
      'ejecucion': 'Ejecucion',
      'reportes': 'Reportes',
      'monitoreo': 'Monitoreo',
      'mantenimiento': 'Mantenimiento',
      'sincronizacion': 'Sincronizacion',
      'mapas': 'Mapas',
      'gestionClientes': 'GestionClientes',
      'configuraciones': 'Configuraciones' 
    };
    return map[view] || view;
  }

  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleClientSwitch = (clientKey) => {
    if (clients[clientKey]?.status === 'Suspendido') {
      alert('Esta instancia está suspendida por falta de pago.');
      return;
    }

    switchClient(clientKey);
    setCurrentView('dashboard');
  };

  return (
    <div className="app-container">
      <InstallPWA />
      {isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span>🌱 AgroGestión</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {syncQueue.length > 0 && <span className="badge badge-inactive" style={{fontSize: '0.7rem', padding: '0.2rem 0.5rem'}}>{syncQueue.length} ⏳</span>}
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isOnline ? '#4caf50' : '#f44336' }}></div>
          </div>
          <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        </div>

        {/* SELECTOR DE CLIENTE (Multi-tenant Demo) */}
        <div style={{ padding: '0.5rem 1rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', margin: '1rem' }}>
          <label style={{ fontSize: '0.7rem', opacity: 0.7, color: 'white', display: 'block', marginBottom: '0.3rem' }}>CLIENTE / INSTANCIA:</label>
          <select 
            style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: 'none', background: '#333', color: 'white', fontSize: '0.8rem' }}
            value={Object.keys(clients).find(k => clients[k].id === currentClient.id)}
            onChange={(e) => handleClientSwitch(e.target.value)}
          >
            {Object.entries(clients).map(([key, c]) => (
              <option key={key} value={key} disabled={c.status === 'Suspendido'}>{c.name}{c.status === 'Suspendido' ? ' (Suspendido)' : ''}</option>
            ))}
          </select>
          <div style={{ fontSize: '0.6rem', marginTop: '0.4rem', color: '#ffcc00' }}>
            ID Instancia: {currentClient.id}
          </div>
          {isAdminUser && (
            <div style={{ fontSize: '0.6rem', marginTop: '0.25rem', color: '#c8e6c9' }}>
              Base: {currentClient.databaseName || `agroData_${currentClient.id}`}
            </div>
          )}
        </div>
        
        <ul className="sidebar-menu">
          {hasPermission('Dashboard') && <li className={currentView === 'dashboard' ? 'active' : ''} onClick={() => handleNavClick('dashboard')}>📊 Dashboard</li>}
          {hasPermission('Estructura') && <li className={currentView === 'estructura' ? 'active' : ''} onClick={() => handleNavClick('estructura')}>🗺️ Estructura Agrícola</li>}
          {hasPermission('Maestros') && <li className={currentView === 'maestros' ? 'active' : ''} onClick={() => handleNavClick('maestros')}>📚 Maestros</li>}
          {hasPermission('Usuarios') && <li className={currentView === 'usuarios' ? 'active' : ''} onClick={() => handleNavClick('usuarios')}>👥 Usuarios</li>}
          {hasPermission('Planificacion') && <li className={currentView === 'planificacion' ? 'active' : ''} onClick={() => handleNavClick('planificacion')}>📅 Planificación</li>}
          {hasPermission('Ejecucion') && <li className={currentView === 'ejecucion' ? 'active' : ''} onClick={() => handleNavClick('ejecucion')}>🚜 Ejecución (Campo)</li>}
          {hasPermission('Reportes') && <li className={currentView === 'reportes' ? 'active' : ''} onClick={() => handleNavClick('reportes')}>📊 Reportes</li>}
          {hasPermission('Monitoreo') && <li className={currentView === 'monitoreo' ? 'active' : ''} onClick={() => handleNavClick('monitoreo')}>🔬 Monitoreo</li>}
          {hasPermission('Mantenimiento') && <li className={currentView === 'mantenimiento' ? 'active' : ''} onClick={() => handleNavClick('mantenimiento')}>🛠 Mantenimiento</li>}
          {hasPermission('Sincronizacion') && <li className={currentView === 'sincronizacion' ? 'active' : ''} onClick={() => handleNavClick('sincronizacion')}>🔄 Sincronización</li>}
          {hasPermission('Mapas') && <li className={currentView === 'mapas' ? 'active' : ''} onClick={() => handleNavClick('mapas')}>🗺️ Mapas</li>}
          
          {/* MÓDULO SUPER ADMIN */}
          {isAdminUser && (
            <li className={currentView === 'gestionClientes' ? 'active' : ''} onClick={() => handleNavClick('gestionClientes')} style={{ color: '#ffcc00', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.5rem' }}>
              🏢 Gestión Clientes
            </li>
          )}

          {hasPermission('Configuraciones') && <li className={currentView === 'configuraciones' ? 'active' : ''} onClick={() => handleNavClick('configuraciones')}>⚙️ Configuraciones</li>}
          
          <li onClick={() => logoutUser()} style={{ marginTop: '2rem', color: '#ff5252' }}>🚪 Cerrar Sesión</li>
        </ul>

        <div className="global-filter">
          <h3>Cultivo Activo</h3>
          <select value={globalCultivo} onChange={e => setGlobalCultivo(e.target.value)}>
            <option value="Todos">Todos</option>
            {cultivos.filter(c => c.estado !== 'Inactivo').map(cultivo => (
              <option key={cultivo.id} value={cultivo.name}>{cultivo.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="main-content">
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>☰ Menú</button>
        </div>
        <div className="view-container">
          {renderView()}
        </div>
        <footer className="system-footer">
          © {new Date().getFullYear()} SarriaTech Solutions S.A.S.
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <AgroProvider>
      <AppContent />
    </AgroProvider>
  );
}

export default App;
