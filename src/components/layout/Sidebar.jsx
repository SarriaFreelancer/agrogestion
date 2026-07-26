import React from 'react';
import { useAgro } from '../../context/AgroContext';

const Sidebar = ({ currentView, onNavClick, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { 
    globalPlanta, setGlobalPlanta, plantas,
    globalCultivo, setGlobalCultivo, cultivos, syncQueue, 
    currentClient, currentUser, switchClient, hasPermission, clients
  } = useAgro();
  
  const isAdminUser = currentUser?.rol === 'Super Admin' || currentUser?.rol === 'Administrador' || currentUser?.modulos?.includes('ALL');

  const handleClientSwitch = (clientKey) => {
    if (clients[clientKey]?.status === 'Suspendido') {
      alert('Esta instancia está suspendida por falta de pago.');
      return;
    }
    switchClient(clientKey);
    onNavClick('dashboard');
  };

  const NavItem = ({ view, icon, label, specialColor }) => {
    // Si es superadmin o tiene todos los modulos, lo ve todo. Sino, valida permisos.
    if (!isAdminUser && !hasPermission(view === 'gestionClientes' ? 'Dashboard' : view) && view !== 'gestionClientes') return null;
    
    const isActive = currentView === view;
    
    return (
      <li 
        onClick={() => onNavClick(view)}
        className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 text-[0.98rem]
          ${isActive 
            ? 'bg-primary text-black font-semibold shadow-[0_4px_15px_rgba(16,185,129,0.4)]' 
            : 'text-gray-300 hover:bg-white/10 hover:translate-x-1'
          }
        `}
        style={specialColor && !isActive ? { color: specialColor, borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '0.5rem', paddingTop: '0.75rem' } : {}}
      >
        <span>{icon}</span>
        {label}
      </li>
    );
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-[260px] bg-surface text-[var(--text-contrast)] p-5 lg:p-6
        flex flex-col shadow-2xl lg:shadow-[4px_0_20px_rgba(0,0,0,0.1)]
        transform transition-transform duration-300 ease-in-out
        border-r border-white/5
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo Area */}
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              🌱
            </div>
            <div>
              <span className="font-extrabold text-[var(--text-contrast)] tracking-tight text-base block leading-tight">SarriaTech</span>
              <span className="text-[10px] font-bold text-primary tracking-wider uppercase block mt-0.5">Solutions S.A.S.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {syncQueue?.length > 0 && (
              <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {syncQueue.length} ⏳
              </span>
            )}
            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_#10B981]"></div>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-[var(--text-contrast)] p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Instancia Activa */}
        <div className="p-4 mb-6 bg-background/50 border border-white/10 rounded-xl shadow-inner">
          <label className="text-[10px] font-extrabold tracking-wider text-muted uppercase block mb-2">Instancia Activa</label>
          <select 
            className="w-full p-2.5 rounded-lg border border-white/10 bg-surface text-[var(--text-contrast)] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
            value={Object.keys(clients).find(k => clients[k].id === currentClient.id) || ''}
            onChange={(e) => handleClientSwitch(e.target.value)}
          >
            {Object.entries(clients).map(([key, c]) => (
              <option key={key} value={key} disabled={c.status === 'Suspendido'} className="bg-surface text-[var(--text-contrast)] font-medium">
                {c.name}{c.status === 'Suspendido' ? ' (Suspendido)' : ''}
              </option>
            ))}
          </select>
          <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] text-muted">ID: {currentClient.id}</span>
            <span className="text-[10px] text-muted truncate max-w-[100px]" title={currentClient.databaseName}>BD: {currentClient.databaseName}</span>
          </div>
        </div>

        <ul className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-2 -mr-2">
          <NavItem view="dashboard" icon="📊" label="Dashboard" />
          <NavItem view="estructura" icon="🏢" label="Estructura Agrícola" />
          <NavItem view="maestros" icon="📑" label="Maestros" />
          <NavItem view="usuarios" icon="👥" label="Usuarios" />
          <NavItem view="planificacion" icon="📅" label="Planificación" />
          <NavItem view="ejecucion" icon="🚜" label="Ejecución (Campo)" />
          <NavItem view="reportes" icon="📈" label="Reportes" />
          <NavItem view="monitoreo" icon="🔬" label="Monitoreo" />
          <NavItem view="mantenimiento" icon="🛠️" label="Mantenimiento" />
          <NavItem view="sincronizacion" icon="🔄" label="Sincronización" />
          <NavItem view="mapas" icon="🗺️" label="Mapas" />

          {isAdminUser && (
            <>
              <NavItem view="gestionClientes" icon="🏢" label="Gestión Empresas" specialColor="#fbbf24" />
              <NavItem view="configuraciones" icon="⚙️" label="Configuraciones" />
            </>
          )}

          <NavItem view="logout" icon="🚪" label="Cerrar Sesión" specialColor="#ef4444" />
        </ul>

        {/* Global Selectors */}
        {(currentView === 'ejecucion' || currentView === 'mapas' || currentView === 'planificacion') && (
          <div className="mt-6 space-y-4 pt-6 border-t border-white/10">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-gray-400 pl-1 block">Planta Activa</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🏢</span>
                <select 
                  className="w-full bg-background border border-white/10 rounded-xl px-9 py-2.5 text-xs text-[var(--text-contrast)] appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  value={globalPlanta} 
                  onChange={e => setGlobalPlanta(e.target.value)}
                >
                  <option value="ALL">Todas las plantas</option>
                  {plantas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[10px]">▼</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-gray-400 pl-1 block">Cultivo Activo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🌱</span>
                <select 
                  className="w-full bg-background border border-white/10 rounded-xl px-9 py-2.5 text-xs text-[var(--text-contrast)] appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  value={globalCultivo} 
                  onChange={e => setGlobalCultivo(e.target.value)}
                >
                  <option value="ALL">Todos los cultivos</option>
                  {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[10px]">▼</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
                {currentUser?.nombre?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-bold text-[var(--text-contrast)] truncate max-w-[130px]">{currentUser?.nombre}</p>
                <p className="text-[10px] text-gray-400 truncate max-w-[130px] group-hover:text-gray-300 transition-colors">{currentUser?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
