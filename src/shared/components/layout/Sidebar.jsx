import React from 'react';
import { useAgro } from '@/providers/AgroContext';
import { useAuth } from '@/providers/AuthProvider';
import { useTenant } from '@/providers/TenantProvider';
import { useTheme } from '@/providers/ThemeProvider';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  Users,
  CalendarRange,
  Tractor,
  BarChart3,
  Microscope,
  Wrench,
  RefreshCw,
  Map,
  Building2,
  Settings,
  LogOut,
  Sprout,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

const Sidebar = ({ currentView, onNavClick, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { 
    globalPlanta, setGlobalPlanta, plantas,
    globalCultivo, setGlobalCultivo, cultivos, syncQueue, 
    switchClient, clients
  } = useAgro();
  
  const { currentUser, hasPermission } = useAuth();
  const { currentClient } = useTenant();
  const { modoOscuroGlobal, toggleThemeMode } = useTheme();
  
  const isAdminUser = currentUser?.rol === 'Super Admin' || currentUser?.rol === 'Administrador' || currentUser?.modulos?.includes('ALL');

  const navGroups = [
    {
      title: 'OPERACIÓN AGRÍCOLA',
      items: [
        { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'Dashboard' },
        { view: 'aiCopilot', icon: Sparkles, label: 'Copiloto IA & Satélite', permission: 'Monitoreo', badge: '✨ IA', highlight: true },
        { view: 'estructura', icon: Layers, label: 'Estructura Agrícola', permission: 'Estructura' },
        { view: 'planificacion', icon: CalendarRange, label: 'Planificación', permission: 'Planificacion' },
        { view: 'ejecucion', icon: Tractor, label: 'Ejecución (Campo)', permission: 'Ejecucion' },
        { view: 'monitoreo', icon: Microscope, label: 'Monitoreo & Sanidad', permission: 'Monitoreo' },
      ]
    },
    {
      title: 'GESTIÓN & CONTROL',
      items: [
        { view: 'maestros', icon: BookOpen, label: 'Maestros', permission: 'Maestros' },
        { view: 'mantenimiento', icon: Wrench, label: 'Mantenimiento', permission: 'Mantenimiento' },
        { view: 'mapas', icon: Map, label: 'Mapas GIS', permission: 'Mapas' },
        { view: 'sincronizacion', icon: RefreshCw, label: 'Sincronización', permission: 'Sincronizacion', badge: syncQueue?.length > 0 ? `${syncQueue.length}` : null },
        { view: 'reportes', icon: BarChart3, label: 'Reportes & BI', permission: 'Reportes' },
        { view: 'usuarios', icon: Users, label: 'Usuarios & Permisos', permission: 'Usuarios' },
      ]
    },
    ...(isAdminUser ? [{
      title: 'ADMINISTRACIÓN SAAS',
      items: [
        { view: 'gestionClientes', icon: Building2, label: 'Gestión Empresas', permission: 'ALL', highlight: true },
        { view: 'auditoria', icon: ShieldCheck, label: 'Auditoría & Trazabilidad', permission: 'Configuraciones' },
        { view: 'configuraciones', icon: Settings, label: 'Configuraciones', permission: 'Configuraciones' },
      ]
    }] : [])
  ];

  const NavItem = ({ item }) => {
    const isSuperAdminView = item.view === 'gestionClientes';
    if (!isAdminUser && !hasPermission(item.permission) && !isSuperAdminView) return null;
    
    const isActive = currentView === item.view;
    const Icon = item.icon;
    
    return (
      <li 
        onClick={() => onNavClick(item.view)}
        className={`group relative px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between text-[13.5px] font-semibold
          ${isActive 
            ? 'bg-emerald-500/25 border border-emerald-400/50 text-white font-bold shadow-lg shadow-emerald-950/40' 
            : 'text-slate-300 hover:text-white hover:bg-white/[0.08] hover:translate-x-0.5'
          }
          ${item.highlight && !isActive ? 'text-amber-300 font-bold' : ''}
        `}
      >
        <div className="flex items-center gap-3 truncate">
          <Icon 
            size={18} 
            className={`shrink-0 transition-colors ${
              isActive 
                ? 'text-emerald-300' 
                : item.highlight 
                  ? 'text-amber-400' 
                  : 'text-slate-400 group-hover:text-emerald-400'
            }`} 
          />
          <span className={`truncate text-[13px] ${isActive ? 'text-white font-extrabold' : 'text-slate-200 group-hover:text-white'}`}>
            {item.label}
          </span>
        </div>

        {item.badge && (
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-400 text-black font-black' : 'bg-amber-500/25 text-amber-300 border border-amber-500/40'}`}>
            {item.badge}
          </span>
        )}

        {isActive && (
          <ChevronRight size={14} className="text-emerald-300 shrink-0 ml-1" />
        )}
      </li>
    );
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[275px] bg-[#0f172a] text-white p-5
        flex flex-col shadow-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.2)]
        transform transition-transform duration-300 ease-in-out
        border-r border-slate-800 select-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Header / Brand Logo */}
        <div className="flex items-center justify-between w-full mb-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-black font-extrabold text-xl shadow-lg shadow-primary/20">
              🌱
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight text-[16px] block leading-tight">
                AgroGestión
              </span>
              <span className="text-[10px] font-bold text-primary tracking-wider uppercase block mt-0.5">
                {currentClient?.name ? currentClient.name.slice(0, 18) : 'Plataforma SaaS'}
              </span>
            </div>
          </div>
          
          <button 
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block mb-1">
                {group.title}
              </span>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <NavItem key={item.view} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer: Quick Theme Toggle & User Profile */}
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
          
          {/* Quick Theme Switcher Button */}
          <button
            onClick={toggleThemeMode}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-slate-700/50 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-sm"
          >
            <div className="flex items-center gap-2">
              {modoOscuroGlobal ? (
                <Moon size={15} className="text-indigo-400" />
              ) : (
                <Sun size={15} className="text-amber-400" />
              )}
              <span>{modoOscuroGlobal ? 'Modo Oscuro Activo' : 'Modo Claro Activo'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-primary font-extrabold">
              Cambiar
            </span>
          </button>

          {/* User Card */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.nombres?.[0] || currentUser?.nombre?.[0] || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.nombres ? `${currentUser.nombres} ${currentUser.apellidos || ''}` : (currentUser?.nombre || currentUser?.correo || 'Usuario')}
                </p>
                <p className="text-[10px] text-primary truncate font-semibold">
                  {currentUser?.rol || 'Operador'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => onNavClick('logout')}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;
