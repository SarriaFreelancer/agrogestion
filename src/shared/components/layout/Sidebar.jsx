import React from 'react';
import { useAgro } from '@/providers/AgroContext';
import { useAuth } from '@/providers/AuthProvider';
import { useTenant } from '@/providers/TenantProvider';

const Sidebar = ({ currentView, onNavClick, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { 
    globalPlanta, setGlobalPlanta, plantas,
    globalCultivo, setGlobalCultivo, cultivos, syncQueue, 
    switchClient, clients
  } = useAgro();
  
  const { currentUser, hasPermission } = useAuth();
  const { currentClient } = useTenant();
  
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
            ? 'bg-primary text-black font-semibold shadow-md' 
            : 'text-[var(--sidebar-text-muted)] hover:bg-white/10 hover:translate-x-1'
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
        w-[260px] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] p-5 lg:p-6
        flex flex-col shadow-2xl lg:shadow-[4px_0_20px_rgba(0,0,0,0.1)]
        transform transition-transform duration-300 ease-in-out
        border-r border-white/5
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Logo Area */}
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xl shadow-md">
              🌱
            </div>
            <div>
              <span className="font-extrabold text-[var(--sidebar-text)] tracking-tight text-base block leading-tight">SarriaTech</span>
              <span className="text-[10px] font-bold text-primary tracking-wider uppercase block mt-0.5">Solutions S.A.S.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {syncQueue?.length > 0 && (
              <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {syncQueue.length} ⏳
              </span>
            )}
            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm"></div>
          </div>
          <button 
            className="lg:hidden text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Instancia Activa eliminada por petición del usuario */}

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
              <label className="text-[11px] font-medium text-[var(--sidebar-text-muted)] pl-1 block">Planta Activa</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sidebar-text-muted)]">🏢</span>
                <select 
                  className="w-full bg-[var(--input-bg)] border border-white/10 rounded-xl px-9 py-2.5 text-xs text-[var(--sidebar-text)] appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  value={globalPlanta} 
                  onChange={e => setGlobalPlanta(e.target.value)}
                >
                  <option value="ALL">Todas las plantas</option>
                  {plantas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sidebar-text-muted)] pointer-events-none text-[10px]">▼</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[var(--sidebar-text-muted)] pl-1 block">Cultivo Activo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sidebar-text-muted)]">🌱</span>
                <select 
                  className="w-full bg-[var(--input-bg)] border border-white/10 rounded-xl px-9 py-2.5 text-xs text-[var(--sidebar-text)] appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  value={globalCultivo} 
                  onChange={e => setGlobalCultivo(e.target.value)}
                >
                  <option value="ALL">Todos los cultivos</option>
                  {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sidebar-text-muted)] pointer-events-none text-[10px]">▼</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--input-bg)] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
                {currentUser?.nombre?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-bold text-[var(--sidebar-text)] truncate max-w-[130px]">{currentUser?.nombre}</p>
                <p className="text-[10px] text-[var(--sidebar-text-muted)] truncate max-w-[130px] group-hover:text-[var(--sidebar-text-muted)] transition-colors">{currentUser?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
