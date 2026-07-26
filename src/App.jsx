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
import MainLayout from './components/layout/MainLayout';
import Sidebar from './components/layout/Sidebar';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { 
    currentClient, currentUser, loginUser, logoutUser, hasPermission
  } = useAgro();
  const isAdminUser = currentUser?.rol === 'Super Admin' || currentUser?.rol === 'Administrador' || currentUser?.modulos?.includes('ALL');

  if (!currentUser) {
    return <Auth loginUser={loginUser} />;
  }

  if (currentClient.status === 'Suspendido' && !isAdminUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-background p-4">
        <div className="glass-card max-w-lg text-center p-8">
          <h1 className="text-red-500 font-bold text-2xl mb-4">Servicio suspendido</h1>
          <p className="text-muted mb-6">
            Esta instancia está suspendida por falta de pago. Comuníquese con el administrador para reactivar el servicio.
          </p>
          <button className="btn-primary" onClick={() => logoutUser()}>Volver al login</button>
        </div>
      </div>
    );
  }

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
      'gestionClientes': 'Dashboard',
      'configuraciones': 'Configuraciones' 
    };
    return map[view] || view;
  }

  const renderView = () => {
    // Si la vista actual no tiene permiso, volver al dashboard (excepto superadmin)
    if (!isAdminUser && currentView !== 'dashboard' && !hasPermission(getViewPermission(currentView))) {
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

  const handleNavClick = (view) => {
    if (view === 'logout') {
      logoutUser();
      return;
    }
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <InstallPWA />
      <MainLayout>
        <Sidebar 
          currentView={currentView}
          onNavClick={handleNavClick}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div className="lg:hidden m-4 mb-2 flex items-center justify-between bg-surface p-4 rounded-xl border border-white/5">
            <span className="font-semibold text-white">Menú Principal</span>
            <button 
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              ☰
            </button>
          </div>
          
          <div className="w-full h-full animate-in fade-in zoom-in-95 duration-200">
            {renderView()}
          </div>
        </div>
      </MainLayout>
    </>
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
