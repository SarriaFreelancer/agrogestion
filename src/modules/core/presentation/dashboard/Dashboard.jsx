import React, { useState } from 'react';
import { useAgro } from '@/providers/AgroContext';
import { useTenant } from '@/providers/TenantProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useSync } from '@/providers/SyncProvider';
import { 
  Layers, 
  MapPin, 
  Calendar, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  Plus, 
  Tractor, 
  Users, 
  Microscope, 
  Map, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  Sparkles,
  ArrowUpRight,
  Sun,
  Droplets,
  CloudRain,
  Wind,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

export default function Dashboard({ onNavigate = () => {} }) {
  const { 
    sectores, 
    calcTotalHa, 
    calcLotesActivos,
    planificaciones,
    maquinarias,
    mantenimientos,
    trabajadores,
    cuadrillas,
    controlesAgro,
    registrosControles,
    globalPlanta,
    globalCultivo,
    cultivos
  } = useAgro();

  const { currentClient } = useTenant();
  const { currentUser } = useAuth();
  const { isOnline, syncQueue } = useSync();

  const [activeChartTab, setActiveChartTab] = useState('superficie'); // 'superficie' | 'labores' | 'rendimiento'

  // Metric computations
  const totalHa = (calcTotalHa && typeof calcTotalHa === 'function') ? calcTotalHa() : 81.9;
  const totalLotes = (calcLotesActivos && typeof calcLotesActivos === 'function') ? calcLotesActivos() : 4;
  
  let totalSuertes = 0;
  let surfaceByCrop = {};
  
  const scanNodes = (nodes) => {
    nodes?.forEach(n => {
      if (n.suertes) {
        n.suertes.forEach(s => {
          totalSuertes++;
          const c = s.cultivo || 'Sin Cultivo';
          surfaceByCrop[c] = (surfaceByCrop[c] || 0) + Number(s.hectareas || 0);
        });
      }
      if (n.sectores) scanNodes(n.sectores);
      if (n.fincas) scanNodes(n.fincas);
      if (n.lotes) scanNodes(n.lotes);
    });
  };
  scanNodes(sectores);

  // Fallback crop distribution if empty
  if (Object.keys(surfaceByCrop).length === 0) {
    surfaceByCrop = {
      'Caña de Azúcar': 49.5,
      'Café Arábica Especial': 18.4,
      'Aguacate Hass': 14.0
    };
  }

  const totalCropHa = Object.values(surfaceByCrop).reduce((a, b) => a + b, 0) || totalHa || 81.9;

  const cropColors = {
    'Caña de Azúcar': '#10B981',
    'Café Arábica Especial': '#F59E0B',
    'Aguacate Hass': '#8B5CF6',
    'Palma de Aceite': '#EC4899',
    'Maíz Tecnificado': '#3B82F6',
    'Arroz de Riego': '#06B6D4',
    'Sin Cultivo': '#6B7280'
  };

  const totalPlanes = planificaciones?.length || 18;
  const planesPendientes = planificaciones?.filter(p => p.estado === 'Borrador' || p.estado === 'Orden Generada' || !p.estado)?.length || 5;
  const planesEjecutados = planificaciones?.filter(p => p.estado === 'Completada' || p.estado === 'Ejecutada')?.length || 13;

  // Maquinaria alerts
  const alertasMaquinaria = (maquinarias || []).map(m => {
    const horasDesdeUltimo = (m.horometroActual || 0) - (m.ultimoMantenimientoHoras || 0);
    const frecuencia = m.frecuenciaMantenimiento || 250;
    const faltan = frecuencia - horasDesdeUltimo;
    return { ...m, faltan, status: faltan <= 0 ? 'danger' : faltan <= 50 ? 'warning' : 'good' };
  }).filter(m => m.status !== 'good');

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Monthly labors mock dataset
  const monthlyData = [
    { mes: 'Ene', plan: 140, ejec: 135, ha: 62 },
    { mes: 'Feb', plan: 160, ejec: 158, ha: 78 },
    { mes: 'Mar', plan: 190, ejec: 184, ha: 92 },
    { mes: 'Abr', plan: 175, ejec: 170, ha: 85 },
    { mes: 'May', plan: 210, ejec: 202, ha: 104 },
    { mes: 'Jun (Actual)', plan: 230, ejec: 188, ha: 96 }
  ];

  // Yield Trend curve
  const yieldHistory = [
    { periodo: '2023-A', real: 112, target: 110 },
    { periodo: '2023-B', real: 118, target: 115 },
    { periodo: '2024-A', real: 124, target: 120 },
    { periodo: '2024-B', real: 121, target: 122 },
    { periodo: '2025-A', real: 129, target: 125 },
    { periodo: '2025-B (Actual)', real: 134, target: 128 }
  ];

  return (
    <div className="space-y-6 fade-in p-5 lg:p-8 h-full w-full overflow-y-auto custom-scrollbar bg-transparent text-[var(--text-contrast)]">
      
      {/* ── HERO BANNER ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border border-emerald-500/25 p-6 lg:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200">
              <Sparkles size={14} className="text-emerald-300" />
              <span>Centro de Mando & Control Agrícola Integral</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              {greeting()}, {currentUser?.nombres || currentUser?.nombre || 'Super Administrador'}
            </h1>
            
            <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
              Empresa activa: <strong className="text-white font-bold">{currentClient?.name || 'Ingenio La Cabaña'}</strong> ·
              {globalPlanta !== 'Todas' && globalPlanta !== 'ALL' ? ` Planta: ${globalPlanta}` : ' Operación Multisede'} · 
              Cultivo filtro: <strong className="text-emerald-300">{globalCultivo || 'Todos'}</strong>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button 
              onClick={() => onNavigate('aiCopilot')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-purple-900/30 hover:scale-[1.02]"
            >
              <Sparkles size={16} />
              <span>Copiloto IA & Satélite</span>
            </button>

            <button 
              onClick={() => onNavigate('planificacion')}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-lg hover:scale-[1.02]"
            >
              <Plus size={16} className="text-emerald-700" />
              <span>Nueva Labor</span>
            </button>

            <button 
              onClick={() => onNavigate('mapas')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <Map size={16} className="text-emerald-300" />
              <span>Mapa GIS</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPIS CARDS GRID ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Superficie */}
        <div 
          onClick={() => onNavigate('estructura')}
          className="glass-card !p-5 cursor-pointer group hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Superficie Total</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Layers size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-contrast)] mb-1 tracking-tight">
            {Number(totalHa).toFixed(1)} <span className="text-base font-medium text-emerald-400">Ha</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium pt-2 border-t border-[var(--glass-border)]">
            <span>{totalLotes} lotes en {totalSuertes} suertes</span>
            <ArrowUpRight size={14} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Card 2: Planificaciones */}
        <div 
          onClick={() => onNavigate('planificacion')}
          className="glass-card !p-5 cursor-pointer group hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Labores & OT</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Calendar size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-contrast)] mb-1 tracking-tight">
            {totalPlanes} <span className="text-base font-medium text-blue-400">órdenes</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium pt-2 border-t border-[var(--glass-border)]">
            <span>{planesPendientes} pendientes · {planesEjecutados} ejecutadas</span>
            <ArrowUpRight size={14} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Card 3: Maquinaria */}
        <div 
          onClick={() => onNavigate('mantenimiento')}
          className="glass-card !p-5 cursor-pointer group hover:border-amber-500/50 transition-all duration-300 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Parque de Maquinaria</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Tractor size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-contrast)] mb-1 tracking-tight">
            {maquinarias?.length || 6} <span className="text-base font-medium text-amber-400">equipos</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium pt-2 border-t border-[var(--glass-border)]">
            <span className={alertasMaquinaria.length > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-semibold'}>
              {alertasMaquinaria.length > 0 ? `${alertasMaquinaria.length} requieren cambio de aceite` : '100% operativos'}
            </span>
            <ArrowUpRight size={14} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Card 4: Clima & Sanidad */}
        <div 
          onClick={() => onNavigate('monitoreo')}
          className="glass-card !p-5 cursor-pointer group hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Sanidad & Clima</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Microscope size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--text-contrast)] mb-1 tracking-tight">
            28.4 <span className="text-base font-medium text-purple-400">°C · 74% HR</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium pt-2 border-t border-[var(--glass-border)]">
            <span className="text-emerald-400 font-semibold">ETo: 4.8 mm/día · Riego óptimo</span>
            <ArrowUpRight size={14} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

      </div>

      {/* ── INTERACTIVE ANALYTICS & CHARTS SECTION ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 cols: Dynamic Charts Panel */}
        <div className="lg:col-span-8 glass-card !p-6 space-y-5 border-[var(--glass-border)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--glass-border)] pb-4">
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-contrast)] flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                Análisis Gráfico de Productividad Agrícola
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Métricas de ocupación de suelo, ejecución mensual y rendimiento de cosecha</p>
            </div>

            {/* Chart Switch Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-[var(--glass-border)]">
              <button 
                onClick={() => setActiveChartTab('superficie')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeChartTab === 'superficie' ? 'bg-primary text-black shadow-sm' : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <PieChart size={13} />
                <span>Cultivos</span>
              </button>
              <button 
                onClick={() => setActiveChartTab('labores')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeChartTab === 'labores' ? 'bg-primary text-black shadow-sm' : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <BarChart3 size={13} />
                <span>Labores (Mes)</span>
              </button>
              <button 
                onClick={() => setActiveChartTab('rendimiento')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeChartTab === 'rendimiento' ? 'bg-primary text-black shadow-sm' : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <TrendingUp size={13} />
                <span>Rendimiento</span>
              </button>
            </div>
          </div>

          {/* TAB 1: CROPS SURFACE (DONUT CHART) */}
          {activeChartTab === 'superficie' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* SVG Donut Visualizer */}
              <div className="md:col-span-6 flex flex-col items-center justify-center relative py-4">
                <svg width="220" height="220" viewBox="0 0 100 100" className="transform -rotate-90">
                  {(() => {
                    let cumulativePercent = 0;
                    const entries = Object.entries(surfaceByCrop);
                    return entries.map(([crop, ha], idx) => {
                      const percent = (ha / totalCropHa) * 100;
                      const strokeDasharray = `${percent} ${100 - percent}`;
                      const strokeDashoffset = -cumulativePercent;
                      cumulativePercent += percent;
                      const color = cropColors[crop] || '#10B981';

                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={color}
                          strokeWidth="15"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 hover:opacity-80"
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Inner Donut Summary Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[var(--text-contrast)]">{totalCropHa.toFixed(1)}</span>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Hectáreas</span>
                </div>
              </div>

              {/* Legend & Percentages List */}
              <div className="md:col-span-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Distribución de Cultivos en Campo
                </h4>
                <div className="space-y-2">
                  {Object.entries(surfaceByCrop).map(([crop, ha], idx) => {
                    const percent = ((ha / totalCropHa) * 100).toFixed(1);
                    const color = cropColors[crop] || '#10B981';

                    return (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-[var(--glass-border)] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-md" style={{ backgroundColor: color }} />
                          <span className="text-xs font-bold text-[var(--text-contrast)]">{crop}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-[var(--text-contrast)]">{ha.toFixed(1)} Ha</span>
                          <span className="text-[10px] text-[var(--text-muted)] block font-medium">({percent}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MONTHLY LABORS (BAR CHART) */}
          {activeChartTab === 'labores' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pb-1">
                <span>Horas y Labores Planificadas vs Ejecutadas en Campo</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500" /> Planificadas</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-400" /> Ejecutadas</span>
                </div>
              </div>

              {/* SVG Grouped Bar Chart */}
              <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 px-2">
                {monthlyData.map((d, idx) => {
                  const maxVal = 250;
                  const planH = (d.plan / maxVal) * 100;
                  const ejecH = (d.ejec / maxVal) * 100;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="text-[10px] font-mono text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        {d.ejec}/{d.plan}
                      </div>
                      <div className="w-full max-w-[42px] flex items-end justify-center gap-1 h-full">
                        {/* Plan bar */}
                        <div 
                          className="w-1/2 bg-blue-500/40 border border-blue-400/50 rounded-t-md transition-all duration-500" 
                          style={{ height: `${planH}%` }}
                          title={`Plan: ${d.plan} labores`}
                        />
                        {/* Ejec bar */}
                        <div 
                          className="w-1/2 bg-emerald-400 rounded-t-md shadow-lg shadow-emerald-500/20 transition-all duration-500" 
                          style={{ height: `${ejecH}%` }}
                          title={`Ejecutadas: ${d.ejec} labores (${d.ha} Ha)`}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-[var(--text-contrast)]">{d.mes}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: YIELD HISTORY CURVE */}
          {activeChartTab === 'rendimiento' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Rendimiento Histórico Toneladas / Hectárea (Ton/Ha)</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Rendimiento Real</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-amber-400 border border-dashed" /> Meta Agroindustrial</span>
                </div>
              </div>

              {/* Smooth Area Curve Visualization */}
              <div className="h-56 w-full relative pt-4">
                <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="yieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Target dashed line */}
                  <line x1="20" y1="60" x2="480" y2="45" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />

                  {/* Real yield area curve */}
                  <path
                    d="M 30,120 Q 110,95 190,80 T 350,60 T 470,35 L 470,150 L 30,150 Z"
                    fill="url(#yieldGrad)"
                  />
                  <path
                    d="M 30,120 Q 110,95 190,80 T 350,60 T 470,35"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="3.5"
                  />

                  {/* Data Points */}
                  {[
                    { x: 30, y: 120, val: 112 },
                    { x: 118, y: 98, val: 118 },
                    { x: 206, y: 80, val: 124 },
                    { x: 294, y: 88, val: 121 },
                    { x: 382, y: 60, val: 129 },
                    { x: 470, y: 35, val: 134 }
                  ].map((pt, i) => (
                    <g key={i} className="cursor-pointer group">
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
                      <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="var(--text-contrast)" fontSize="11" fontWeight="bold">
                        {pt.val} T/Ha
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-bold px-2 pt-1 border-t border-[var(--glass-border)]">
                {yieldHistory.map((h, i) => (
                  <span key={i}>{h.periodo}</span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right 4 cols: Environmental & Smart Weather Card */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="glass-card !p-5 border-[var(--glass-border)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-3">
              <h3 className="text-sm font-extrabold text-[var(--text-contrast)] flex items-center gap-2">
                <Sun size={17} className="text-amber-400" />
                Estación & Balance Hídrico
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                En Línea
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-[var(--glass-border)]">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block mb-1">Temperatura</span>
                <span className="text-lg font-black text-amber-400">28.4 °C</span>
                <span className="text-[10px] text-[var(--text-muted)] block">Máx: 31.2° · Mín: 19.8°</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-[var(--glass-border)]">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block mb-1">Humedad Relativa</span>
                <span className="text-lg font-black text-cyan-400">74%</span>
                <span className="text-[10px] text-[var(--text-muted)] block">Déficit de Presión: 0.8 kPa</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-[var(--glass-border)]">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block mb-1">Evapotranspiración ETo</span>
                <span className="text-lg font-black text-emerald-400">4.8 mm/d</span>
                <span className="text-[10px] text-[var(--text-muted)] block">Hargreaves-Samani</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-[var(--glass-border)]">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block mb-1">Precipitación 24h</span>
                <span className="text-lg font-black text-blue-400">12.5 mm</span>
                <span className="text-[10px] text-[var(--text-muted)] block">Lluvia moderada</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <Droplets size={15} />
                <span>Recomendación de Riego Activa</span>
              </div>
              <p className="text-[11px] text-[var(--text-contrast)] leading-relaxed">
                Humedad de suelo en rango óptimo (Capacidad de Campo: 78%). Suertes del Lote 01 no requieren riego en las próximas 48 horas.
              </p>
            </div>
          </div>

          {/* Quick AI Diagnostic shortcut */}
          <div 
            onClick={() => onNavigate('aiCopilot')}
            className="glass-card !p-4 border-purple-500/30 bg-gradient-to-br from-purple-950/40 to-indigo-950/40 cursor-pointer hover:border-purple-500 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="font-extrabold text-xs text-[var(--text-contrast)]">Copiloto IA & Teledetección</div>
                <div className="text-[11px] text-[var(--text-muted)]">Mapeo NDVI, balance hídrico y diagnóstico</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-purple-400" />
          </div>

        </div>

      </div>

      {/* ── OPERATIONS & LABORS TABLE ─────────────────────────────────── */}
      <div className="glass-card !p-6 border-[var(--glass-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--text-contrast)] flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Órdenes de Trabajo y Labores Recientes
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Seguimiento en tiempo real de las actividades en campo</p>
          </div>
          <button 
            onClick={() => onNavigate('planificacion')}
            className="text-xs font-bold text-primary hover:text-primary-light flex items-center gap-1 transition-colors"
          >
            Ver todas las órdenes <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--glass-border)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3">Código OT</th>
                <th className="pb-3 px-3">Actividad Agrícola</th>
                <th className="pb-3 px-3">Ubicación / Suerte</th>
                <th className="pb-3 px-3">Fecha</th>
                <th className="pb-3 px-3 text-center">Estado</th>
                <th className="pb-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {(planificaciones && planificaciones.length > 0 ? planificaciones.slice(0, 5) : [
                { id: 'OT-101', ordenCode: 'OT-2026-088', actividadNombre: 'Fertilización Edáfica NPK de Fondo', loteNombre: 'Suerte A-01 (Tablón Principal)', fecha: '2026-10-08', estado: 'Ejecutada' },
                { id: 'OT-102', ordenCode: 'OT-2026-089', actividadNombre: 'Control Fitosanitario Barrenador (Drone)', loteNombre: 'Suerte B-01 (Maduración Cosecha)', fecha: '2026-10-09', estado: 'Orden Generada' },
                { id: 'OT-103', ordenCode: 'OT-2026-090', actividadNombre: 'Riego por Goteo y Balance Hídrico', loteNombre: 'Suerte C-01 (Cafetal Producción)', fecha: '2026-10-10', estado: 'Borrador' }
              ]).map((plan) => (
                <tr key={plan.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[var(--text-contrast)]">
                    {plan.ordenCode || plan.id}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[var(--text-contrast)]">
                    {plan.actividadNombre || plan.actividad || 'Labor Agrícola'}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-muted)]">
                    {plan.loteNombre || plan.suerteNombre || 'Suerte Principal'}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-muted)]">
                    {plan.fecha ? new Date(plan.fecha).toLocaleDateString('es-CO') : 'Programada'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      plan.estado === 'Completada' || plan.estado === 'Ejecutada'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : plan.estado === 'Orden Generada'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {plan.estado || 'Programada'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button 
                      onClick={() => onNavigate('planificacion')}
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      Inspeccionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
