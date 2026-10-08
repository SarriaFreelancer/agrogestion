import React, { useState, useMemo } from 'react';
import { useAgro } from '@/providers/AgroContext';
import { useAuth } from '@/providers/AuthProvider';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Calendar, 
  User, 
  Cpu, 
  Activity, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  FileSpreadsheet, 
  Eye, 
  X, 
  RefreshCw,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { confirmDialog, notifySuccess } from '@/utils/swal';

export default function Auditoria() {
  const { auditLogs, limpiarAuditoria, registrarAuditoria } = useAgro();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccion, setSelectedAccion] = useState('ALL');
  const [selectedModulo, setSelectedModulo] = useState('ALL');
  const [selectedUsuario, setSelectedUsuario] = useState('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  const isAdmin = currentUser?.rol === 'Super Admin' || currentUser?.rol === 'Administrador';

  // Acciones disponibles
  const actionTypes = [
    { key: 'ALL', label: 'Todas las acciones' },
    { key: 'CREAR', label: 'Creación', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { key: 'ACTUALIZAR', label: 'Modificación', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { key: 'ELIMINAR', label: 'Eliminación', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { key: 'DIAGNOSTICO_IA', label: 'Copiloto IA / NDVI', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { key: 'SINCRONIZAR', label: 'Sincronización', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    { key: 'LOGIN', label: 'Autenticación', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { key: 'EXPORTAR_REPORTE', label: 'Exportación', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' }
  ];

  // List of unique users and modules in logs
  const { uniqueUsers, uniqueModules } = useMemo(() => {
    const users = new Set();
    const modules = new Set();
    (auditLogs || []).forEach(log => {
      if (log.usuario) users.add(log.usuario);
      if (log.modulo) modules.add(log.modulo);
    });
    return {
      uniqueUsers: Array.from(users),
      uniqueModules: Array.from(modules)
    };
  }, [auditLogs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return (auditLogs || []).filter(log => {
      // Search
      const searchMatch = !searchTerm || 
        (log.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.usuario || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.usuarioNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.entidadId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.id || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Accion
      const accionMatch = selectedAccion === 'ALL' || log.accion === selectedAccion;

      // Modulo
      const moduloMatch = selectedModulo === 'ALL' || log.modulo === selectedModulo;

      // Usuario
      const usuarioMatch = selectedUsuario === 'ALL' || log.usuario === selectedUsuario;

      // Time Range
      let timeMatch = true;
      if (selectedTimeRange !== 'ALL') {
        const logDate = new Date(log.fecha).getTime();
        const now = Date.now();
        if (selectedTimeRange === 'TODAY') {
          timeMatch = (now - logDate) <= 24 * 60 * 60 * 1000;
        } else if (selectedTimeRange === '7DAYS') {
          timeMatch = (now - logDate) <= 7 * 24 * 60 * 60 * 1000;
        } else if (selectedTimeRange === '30DAYS') {
          timeMatch = (now - logDate) <= 30 * 24 * 60 * 60 * 1000;
        }
      }

      return searchMatch && accionMatch && moduloMatch && usuarioMatch && timeMatch;
    });
  }, [auditLogs, searchTerm, selectedAccion, selectedModulo, selectedUsuario, selectedTimeRange]);

  // KPIs
  const kpis = useMemo(() => {
    const logs = auditLogs || [];
    const total = logs.length;
    const now = Date.now();
    const today = logs.filter(l => (now - new Date(l.fecha).getTime()) <= 24 * 60 * 60 * 1000).length;
    const aiEvents = logs.filter(l => l.accion === 'DIAGNOSTICO_IA').length;
    const deletions = logs.filter(l => l.accion === 'ELIMINAR').length;
    const syncs = logs.filter(l => l.accion === 'SINCRONIZAR').length;

    return { total, today, aiEvents, deletions, syncs };
  }, [auditLogs]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredLogs || filteredLogs.length === 0) return;
    
    const headers = ['ID Registro', 'Fecha ISO', 'Hora', 'Usuario', 'Nombre', 'Rol', 'Acción', 'Módulo', 'Entidad Tipo', 'Entidad ID', 'Descripción', 'IP', 'Dispositivo'];
    const rows = filteredLogs.map(l => {
      const d = new Date(l.fecha);
      return [
        l.id,
        d.toISOString().slice(0, 10),
        d.toLocaleTimeString('es-CO'),
        l.usuario,
        `"${(l.usuarioNombre || '').replace(/"/g, '""')}"`,
        l.rol,
        l.accion,
        l.modulo,
        l.entidadTipo,
        l.entidadId,
        `"${(l.descripcion || '').replace(/"/g, '""')}"`,
        l.ip,
        `"${(l.dispositivo || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_agrogestion_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (registrarAuditoria) {
      registrarAuditoria('EXPORTAR_REPORTE', 'Auditoría', `Exportación de ${filteredLogs.length} registros de auditoría a CSV`, {
        usuario: currentUser?.correo,
        usuarioNombre: currentUser?.nombres,
        rol: currentUser?.rol
      });
    }
    notifySuccess('Reporte de auditoría descargado exitosamente');
  };

  const handleClear = async () => {
    if (await confirmDialog('¿Está seguro de que desea vaciar el historial de auditoría? Esta acción es irreversible.', { title: 'Limpiar Auditoría' })) {
      limpiarAuditoria();
      notifySuccess('Historial de auditoría reiniciado');
    }
  };

  const getBadgeStyle = (accion) => {
    switch(accion) {
      case 'CREAR': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'ACTUALIZAR': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'ELIMINAR': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'DIAGNOSTICO_IA': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'SINCRONIZAR': return 'bg-teal-500/20 text-teal-400 border border-teal-500/30';
      case 'LOGIN': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'EXPORTAR_REPORTE': return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6 fade-in p-5 lg:p-8 h-full w-full overflow-y-auto custom-scrollbar bg-transparent text-[var(--text-contrast)]">
      
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--glass-border)] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-contrast)]">
                Auditoría & Trazabilidad de Acciones
              </h1>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Bitácora inmutable de operaciones, cambios en datos agrícolas, eventos de IA y accesos de usuarios.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[var(--text-contrast)] font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
            title="Exportar a CSV"
          >
            <FileSpreadsheet size={15} className="text-emerald-400" />
            <span>Exportar CSV ({filteredLogs.length})</span>
          </button>

          {currentUser?.rol === 'Super Admin' && (
            <button 
              onClick={handleClear}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs transition-all flex items-center gap-1.5"
              title="Limpiar bitácora"
            >
              <Trash2 size={15} />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* ── KPI METRICS CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Card 1: Total */}
        <div className="glass-card !p-4 border-[var(--glass-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Eventos</span>
            <Activity size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-contrast)]">
            {kpis.total}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
            {kpis.today} registros hoy
          </div>
        </div>

        {/* Card 2: IA & Satélite */}
        <div className="glass-card !p-4 border-[var(--glass-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Eventos IA & NDVI</span>
            <Sparkles size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400">
            {kpis.aiEvents}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
            Diagnósticos y predicciones
          </div>
        </div>

        {/* Card 3: Sincronizaciones */}
        <div className="glass-card !p-4 border-[var(--glass-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Sync Offline/Online</span>
            <RefreshCw size={16} className="text-teal-400" />
          </div>
          <div className="text-2xl font-extrabold text-teal-400">
            {kpis.syncs}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
            Transmisiones de datos
          </div>
        </div>

        {/* Card 4: Modificaciones Críticas */}
        <div className="glass-card !p-4 border-[var(--glass-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Eliminaciones</span>
            <AlertTriangle size={16} className="text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400">
            {kpis.deletions}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">
            Auditoría de seguridad
          </div>
        </div>

      </div>

      {/* ── TOOLBAR & FILTERS ─────────────────────────────────────────── */}
      <div className="glass-card !p-4 space-y-3 border-[var(--glass-border)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text"
              placeholder="Buscar por usuario, descripción o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--text-contrast)] placeholder-[var(--text-muted)] focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select 
              value={selectedAccion}
              onChange={(e) => setSelectedAccion(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--text-contrast)] focus:outline-none focus:border-primary transition-colors"
            >
              {actionTypes.map(a => (
                <option key={a.key} value={a.key}>{a.label}</option>
              ))}
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <select 
              value={selectedModulo}
              onChange={(e) => setSelectedModulo(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--text-contrast)] focus:outline-none focus:border-primary transition-colors"
            >
              <option value="ALL">Todos los módulos</option>
              {uniqueModules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl text-xs text-[var(--text-contrast)] focus:outline-none focus:border-primary transition-colors"
            >
              <option value="ALL">Todo el histórico</option>
              <option value="TODAY">Últimas 24 horas</option>
              <option value="7DAYS">Últimos 7 días</option>
              <option value="30DAYS">Últimos 30 días</option>
            </select>
          </div>

        </div>
      </div>

      {/* ── AUDIT LOGS TABLE ──────────────────────────────────────────── */}
      <div className="glass-card !p-0 overflow-hidden border-[var(--glass-border)] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/[0.04] border-b border-[var(--glass-border)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Fecha & Hora</th>
                <th className="py-3.5 px-4">Usuario</th>
                <th className="py-3.5 px-4">Acción</th>
                <th className="py-3.5 px-4">Módulo</th>
                <th className="py-3.5 px-4">Detalle / Descripción</th>
                <th className="py-3.5 px-4">Entidad Afectada</th>
                <th className="py-3.5 px-4 text-center">Inspeccionar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[var(--text-muted)]">
                    <ShieldCheck size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">No se encontraron eventos con los filtros seleccionados</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const d = new Date(log.fecha);
                  const fechaStr = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
                  const horaStr = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                      
                      {/* Fecha & Hora */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[var(--text-contrast)]">{fechaStr}</div>
                        <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                          <Clock size={10} /> {horaStr}
                        </div>
                      </td>

                      {/* Usuario */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[var(--text-contrast)]">
                          {log.usuarioNombre || log.usuario}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate max-w-[140px]">
                          {log.rol || log.usuario}
                        </div>
                      </td>

                      {/* Acción Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${getBadgeStyle(log.accion)}`}>
                          {log.accion.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Módulo */}
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-[var(--text-muted)]">
                        {log.modulo}
                      </td>

                      {/* Descripción */}
                      <td className="py-3 px-4 max-w-xs xl:max-w-md">
                        <p className="text-[var(--text-contrast)] font-medium line-clamp-2 leading-relaxed">
                          {log.descripcion}
                        </p>
                        {log.ip && (
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            IP: {log.ip} · {log.dispositivo}
                          </span>
                        )}
                      </td>

                      {/* Entidad */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                          {log.entidadId || log.entidadTipo || 'N/A'}
                        </span>
                      </td>

                      {/* Inspect */}
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-primary transition-colors inline-flex items-center justify-center"
                          title="Ver detalle del evento"
                        >
                          <Eye size={15} />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DETAIL MODAL ──────────────────────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card !p-6 max-w-lg w-full border-[var(--glass-border)] space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-contrast)]">
                  Detalle de Registro de Auditoría
                </h3>
                <span className="text-xs font-mono text-[var(--text-muted)]">{selectedLog.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[var(--glass-border)]">
              <div>
                <span className="text-[var(--text-muted)] block">Fecha y Hora:</span>
                <strong className="text-[var(--text-contrast)]">
                  {new Date(selectedLog.fecha).toLocaleString('es-CO')}
                </strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Tipo de Acción:</span>
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${getBadgeStyle(selectedLog.accion)}`}>
                  {selectedLog.accion}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Usuario Responsable:</span>
                <strong className="text-[var(--text-contrast)]">{selectedLog.usuarioNombre} ({selectedLog.usuario})</strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Rol:</span>
                <strong className="text-[var(--text-contrast)]">{selectedLog.rol}</strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Módulo:</span>
                <strong className="text-[var(--text-contrast)]">{selectedLog.modulo}</strong>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">Entidad Afectada:</span>
                <strong className="text-[var(--text-contrast)]">{selectedLog.entidadTipo}: {selectedLog.entidadId}</strong>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[var(--text-muted)] block">Descripción de la operación:</span>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-[var(--glass-border)] text-[var(--text-contrast)] font-medium leading-relaxed">
                {selectedLog.descripcion}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[var(--text-muted)] bg-white/[0.02] p-2.5 rounded-xl border border-[var(--glass-border)]">
              <div>IP: <span className="text-[var(--text-contrast)]">{selectedLog.ip || '127.0.0.1'}</span></div>
              <div>Dispositivo: <span className="text-[var(--text-contrast)]">{selectedLog.dispositivo || 'N/A'}</span></div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="btn-primary !py-2 !px-5 text-xs font-bold"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
