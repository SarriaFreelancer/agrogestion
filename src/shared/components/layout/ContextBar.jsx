import React from 'react';
import { useAgro } from '@/providers/AgroContext';
import { useSync } from '@/providers/SyncProvider';
import { useTenant } from '@/providers/TenantProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Building2, Sprout, Wifi, WifiOff, RefreshCw, Calendar, Sparkles, Sun, Moon } from 'lucide-react';

export default function ContextBar() {
  const { 
    globalPlanta, setGlobalPlanta, 
    globalCultivo, setGlobalCultivo, 
    plantas, cultivos,
    syncQueue
  } = useAgro();

  const { isOnline } = useSync();
  const { currentClient } = useTenant();
  const { modoOscuroGlobal, toggleThemeMode } = useTheme();

  // Filtrar cultivos que pertenecen a la planta seleccionada
  const cultivosFiltrados = (globalPlanta === 'Todas' || globalPlanta === 'ALL')
    ? (cultivos || [])
    : (cultivos || []).filter(c => !c.plantaId || c.plantaId === globalPlanta || c.plantaId === 'ALL');

  const handlePlantaChange = (e) => {
    const nuevaPlanta = e.target.value;
    setGlobalPlanta(nuevaPlanta);
    
    if (nuevaPlanta !== 'Todas' && nuevaPlanta !== 'ALL' && globalCultivo !== 'Todos' && globalCultivo !== 'ALL') {
      const cultivoAunValido = (cultivos || []).find(c => (c.id === globalCultivo || c.nombre === globalCultivo) && (c.plantaId === nuevaPlanta || !c.plantaId));
      if (!cultivoAunValido) {
        setGlobalCultivo('Todos');
      }
    }
  };

  const todayStr = new Intl.DateTimeFormat('es-CO', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  }).format(new Date());

  return (
    <header className="bg-surface/80 border-b border-[var(--glass-border)] px-4 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20 sticky top-0 backdrop-blur-xl transition-all shadow-sm">
      
      {/* Context Filters Group */}
      <div className="flex flex-wrap items-center gap-2.5 md:gap-4">
        
        {/* Planta Selector */}
        <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-1.5 shadow-sm hover:border-primary/40 transition-colors">
          <Building2 size={15} className="text-primary shrink-0" />
          <span className="text-xs font-semibold text-[var(--text-muted)] hidden sm:inline">Planta:</span>
          <select 
            value={globalPlanta} 
            onChange={handlePlantaChange}
            className="bg-transparent border-0 text-xs font-bold text-[var(--text-contrast)] focus:ring-0 outline-none cursor-pointer pr-2"
          >
            <option value="Todas" className="bg-[#111827] text-white">Todas las Plantas</option>
            {plantas?.map(p => (
              <option key={p.id} value={p.id || p.nombre} className="bg-[#111827] text-white">
                {p.nombre || p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cultivo Selector */}
        <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-1.5 shadow-sm hover:border-emerald-500/40 transition-colors">
          <Sprout size={15} className="text-emerald-500 shrink-0" />
          <span className="text-xs font-semibold text-[var(--text-muted)] hidden sm:inline">Cultivo:</span>
          <select 
            value={globalCultivo} 
            onChange={(e) => setGlobalCultivo(e.target.value)}
            className="bg-transparent border-0 text-xs font-bold text-[var(--text-contrast)] focus:ring-0 outline-none cursor-pointer pr-2"
          >
            <option value="Todos" className="bg-[#111827] text-white">Todos los Cultivos</option>
            {cultivosFiltrados?.map(c => (
              <option key={c.id} value={c.nombre || c.name || c.id} className="bg-[#111827] text-white">
                {c.nombre || c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Right Controls: Theme Toggle & Sync Status */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        
        {/* Direct Light/Dark Mode Switcher Button */}
        <button
          onClick={toggleThemeMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--glass-bg)] hover:bg-white/[0.1] border border-[var(--glass-border)] text-xs font-bold text-[var(--text-contrast)] transition-all shadow-sm group"
          title="Alternar entre modo claro y oscuro"
        >
          {modoOscuroGlobal ? (
            <>
              <Sun size={15} className="text-amber-400 group-hover:rotate-45 transition-transform" />
              <span className="hidden sm:inline">Modo Claro</span>
            </>
          ) : (
            <>
              <Moon size={15} className="text-indigo-400 group-hover:-rotate-12 transition-transform" />
              <span className="hidden sm:inline">Modo Oscuro</span>
            </>
          )}
        </button>

        {/* Date pill */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-xl">
          <Calendar size={13} className="text-primary" />
          <span className="capitalize">{todayStr}</span>
        </div>

        {/* Sync Status pill */}
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-sm">
          {isOnline ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="text-[var(--text-contrast)] text-[11px] hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>
              <span className="text-amber-400 text-[11px]">Modo Offline</span>
            </>
          )}

          {syncQueue?.length > 0 && (
            <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded-full border border-amber-500/30">
              {syncQueue.length} sync
            </span>
          )}
        </div>

      </div>
    </header>
  );
}
