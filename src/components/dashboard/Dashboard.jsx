import React from 'react';
import { useAgro } from '../../context/AgroContext';
import { Layers, MapPin, Calendar, Activity, TrendingUp, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

export default function Dashboard() {
  const { calcTotalHa, calcLotesActivos, currentClient, isOnline, syncQueue } = useAgro();

  return (
    <div className="space-y-8 fade-in">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard General</h1>
            <span className="badge badge-active text-[11px]">En Vivo</span>
          </div>
          <p className="text-sm text-[#9CA3AF]">
            Resumen operativo y métricas clave de la instancia <strong className="text-emerald-400 font-semibold">{currentClient.name}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-gray-300 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-red-400'}`}></span>
            {isOnline ? 'Conectado en Tiempo Real' : 'Modo Offline (En Cola)'}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card !p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hectáreas Totales</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2 tracking-tight">
            {calcTotalHa().toFixed(2)} <span className="text-lg font-normal text-emerald-400">ha</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400/90 font-medium">
            <TrendingUp size={14} />
            <span>Superficie agrícola registrada</span>
          </div>
        </div>

        <div className="glass-card !p-6 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lotes Activos</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <MapPin size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2 tracking-tight">
            {calcLotesActivos()} <span className="text-lg font-normal text-blue-400">lotes</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-400/90 font-medium">
            <CheckCircle size={14} />
            <span>Unidades productivas operativas</span>
          </div>
        </div>

        <div className="glass-card !p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Actividades Programadas</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2 tracking-tight">
            0 <span className="text-lg font-normal text-amber-400">pendientes</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
            <Activity size={14} />
            <span>Módulo de Planificación listo</span>
          </div>
        </div>
      </div>

      {/* Visor de Estado Operativo */}
      <div className="glass-card !p-8 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Estado del Sistema Agrícola</h3>
            <p className="text-xs text-gray-400">Monitoreo de sincronización y parámetros de producción</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              99.9%
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Disponibilidad de Instancia</div>
              <div className="text-xs text-gray-400">Respaldo automático y alta tolerancia a fallos</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              <Zap size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Cola de Sincronización</div>
              <div className="text-xs text-gray-400">{syncQueue.length} registros pendientes en cola local</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
