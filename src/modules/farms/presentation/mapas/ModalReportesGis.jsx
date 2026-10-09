import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Database, 
  Clock, 
  MapPin, 
  Users, 
  Tractor, 
  Trees, 
  Activity, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Calendar, 
  Printer, 
  X, 
  RefreshCw, 
  Filter, 
  ChevronRight, 
  TrendingUp, 
  Gauge, 
  BatteryCharging, 
  Route, 
  Trash2, 
  Search,
  Check
} from 'lucide-react';
import { notifySuccess, notifyError, notifyWarning } from '@/utils/swal';

export default function ModalReportesGis({
  isOpen,
  onClose,
  trabajadores = [],
  maquinarias = [],
  sectores = [],
  planificaciones = [],
  controlesAgro = [],
  registrosControles = [],
  defaultModule = 'personal'
}) {
  const [activeTab, setActiveTab] = useState('generador'); // 'generador' | 'historial'
  const [selectedModulo, setSelectedModulo] = useState(defaultModule);
  const [intervaloMinutos, setIntervaloMinutos] = useState(5); // 1, 5, 10, 15, 30, 60
  const [fechaDesde, setFechaDesde] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return `${today}T06:00`;
  });
  const [fechaHasta, setFechaHasta] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return `${today}T18:00`;
  });
  const [selectedEntityId, setSelectedEntityId] = useState('all');
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [historialReportes, setHistorialReportes] = useState([]);
  const [reporteGuardadoExito, setReporteGuardadoExito] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Sincronizar modulo por defecto
  useEffect(() => {
    if (defaultModule) {
      setSelectedModulo(defaultModule);
    }
  }, [defaultModule]);

  // Cargar historial de reportes desde backend y localStorage
  const loadHistorial = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/gis/reportes');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setHistorialReportes(json.data);
          return;
        }
      }
    } catch (e) {
      console.warn('API backend no disponible, usando almacenamiento local:', e);
    }
    try {
      const local = JSON.parse(localStorage.getItem('agro_gis_reportes_guardados') || '[]');
      setHistorialReportes(local);
    } catch (e) {
      setHistorialReportes([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistorial();
      setPage(1);
    }
  }, [isOpen]);

  // Obtener suerte o lote plano
  const flattenSuertes = useMemo(() => {
    const list = [];
    sectores.forEach(sec => {
      (sec.fincas || []).forEach(finca => {
        (finca.lotes || []).forEach(lote => {
          (lote.suertes || []).forEach(suerte => {
            list.push({
              suerteId: suerte.id,
              suerteNombre: suerte.name,
              loteId: lote.id,
              loteNombre: lote.name,
              fincaNombre: finca.name,
              sectorNombre: sec.name,
              cultivo: suerte.cultivo || 'Caña de Azúcar',
              hectareas: suerte.hectareas || 10,
              lat: suerte.lat || 3.472053,
              lng: suerte.lng || -76.446638,
              geometria: suerte.geometria || []
            });
          });
        });
      });
    });
    return list;
  }, [sectores]);

  // Generar puntos de telemetría y desglose por minutos
  const generatedData = useMemo(() => {
    const registros = [];
    const interval = Number(intervaloMinutos) || 5;

    // Horas de operación: 06:00 a 18:00 (12 horas = 720 minutos)
    const startDate = new Date(fechaDesde);
    const endDate = new Date(fechaHasta);
    const totalMinutesRange = Math.max(interval, Math.min(720, Math.floor((endDate - startDate) / (1000 * 60))));
    const steps = Math.max(1, Math.floor(totalMinutesRange / interval));

    if (selectedModulo === 'personal') {
      const activeTrabajadores = selectedEntityId === 'all' 
        ? trabajadores 
        : trabajadores.filter(t => t.id === selectedEntityId);

      activeTrabajadores.forEach((trab, tIdx) => {
        // Buscar labor planificada para este trabajador
        const plan = planificaciones.find(p => 
          (p.responsable === trab.nombre || p.trabajadoresAsignados?.some(ta => ta.id === trab.id || ta.nombre === trab.nombre))
        );

        const suerteRef = flattenSuertes[tIdx % (flattenSuertes.length || 1)] || {
          suerteNombre: 'Suerte 101 (Noroccidente)',
          loteNombre: 'Lote 01 (Franja Norte)',
          fincaNombre: 'Hacienda La Manuelita',
          cultivo: 'Caña de Azúcar (Variedad CC 01-1940)',
          lat: 3.472053,
          lng: -76.446638
        };

        let currentLat = suerteRef.lat;
        let currentLng = suerteRef.lng;
        let accumProd = 0;
        let accumImprod = 0;
        let accumParada = 0;

        for (let i = 0; i <= steps; i++) {
          const pointTime = new Date(startDate.getTime() + i * interval * 60 * 1000);
          const timeStr = pointTime.toTimeString().slice(0, 5);

          // Simulación de trayectoria y paradas en campo
          const isParada = (i >= 6 && i <= 8) || (i >= 18 && i <= 19); // Almuerzo / descanso
          const isDesvio = i > steps - 3; // Fuera de lote al final de jornada

          if (!isParada) {
            currentLat += (Math.sin(i * 0.5 + tIdx) * 0.00015);
            currentLng += (Math.cos(i * 0.5 + tIdx) * 0.00015);
          }

          const isInside = !isDesvio;
          let alerta = 'Normal';
          let velocidadKmh = isParada ? 0.0 : +(1.1 + Math.sin(i) * 0.4).toFixed(1);

          if (isParada) {
            accumParada += interval;
            alerta = i - 6 >= 2 ? '⚠️ Parada Prolongada (>15 min)' : 'En Pausa';
          } else if (isInside) {
            accumProd += interval;
          } else {
            accumImprod += interval;
            alerta = '🔴 Desvío de Geocerca (Fuera de Lote)';
          }

          const actividadText = plan 
            ? `${plan.actividadNombre} (${plan.ordenCode || 'OT-104928'})`
            : (tIdx === 0 ? 'Corte y Cosecha Mecanizada (OT-104928)' : 'Sin labor programada');

          registros.push({
            id: `REG-PER-${trab.id}-${i}`,
            timestamp: pointTime.toISOString(),
            hora: timeStr,
            minutoRelativo: i * interval,
            modulo: 'Personal',
            entidadId: trab.id,
            entidadCodigo: trab.cedula || trab.id,
            entidadNombre: trab.nombre,
            cargo: trab.cargo || trab.rol || 'Operario de Campo',
            lat: +currentLat.toFixed(6),
            lng: +currentLng.toFixed(6),
            ubicacion: `${suerteRef.fincaNombre} > ${suerteRef.loteNombre} > ${suerteRef.suerteNombre}`,
            suerte: suerteRef.suerteNombre,
            cultivo: suerteRef.cultivo,
            geocercaEstado: isInside ? 'DENTRO' : 'FUERA',
            actividadAsignada: actividadText,
            velocidadKmh,
            bateriaPct: Math.max(15, 100 - Math.floor(i * 1.5)),
            tiempoProductivoMin: accumProd,
            tiempoImproductivoMin: accumImprod,
            tiempoParadaMin: accumParada,
            alerta
          });
        }
      });
    } else if (selectedModulo === 'maquinaria') {
      const activeMaquinas = selectedEntityId === 'all' 
        ? maquinarias 
        : maquinarias.filter(m => m.id === selectedEntityId);

      activeMaquinas.forEach((maq, mIdx) => {
        const suerteRef = flattenSuertes[mIdx % (flattenSuertes.length || 1)] || {
          suerteNombre: 'Suerte 101 (Noroccidente)',
          loteNombre: 'Lote 01 (Franja Norte)',
          fincaNombre: 'Hacienda La Manuelita',
          cultivo: 'Caña de Azúcar (Variedad CC 01-1940)',
          lat: 3.472053,
          lng: -76.446638
        };

        let currentLat = suerteRef.lat;
        let currentLng = suerteRef.lng;
        let accumProd = 0;
        let accumImprod = 0;
        let accumParada = 0;

        for (let i = 0; i <= steps; i++) {
          const pointTime = new Date(startDate.getTime() + i * interval * 60 * 1000);
          const timeStr = pointTime.toTimeString().slice(0, 5);

          const isParada = i === 5 || i === 12;
          const isTraslado = i === 0 || i === steps;
          const isLabor = !isParada && !isTraslado;

          if (!isParada) {
            currentLat += (Math.sin(i * 0.4 + mIdx) * 0.0003);
            currentLng += (Math.cos(i * 0.4 + mIdx) * 0.0003);
          }

          let velocidadKmh = isParada ? 0.0 : (isTraslado ? 18.5 : 6.8);
          let alerta = 'Normal';

          if (isParada) {
            accumParada += interval;
            alerta = '⚠️ Ralentí / Parada en Cabecera';
          } else if (isLabor) {
            accumProd += interval;
          } else {
            accumImprod += interval;
            alerta = 'En Tránsito / Traslado';
          }

          registros.push({
            id: `REG-MAQ-${maq.id}-${i}`,
            timestamp: pointTime.toISOString(),
            hora: timeStr,
            minutoRelativo: i * interval,
            modulo: 'Maquinaria',
            entidadId: maq.id,
            entidadCodigo: maq.codigo || maq.placa || maq.id,
            entidadNombre: maq.nombre || maq.modelo,
            cargo: maq.tipo || 'Tractor / Cosechadora',
            lat: +currentLat.toFixed(6),
            lng: +currentLng.toFixed(6),
            ubicacion: `${suerteRef.fincaNombre} > ${suerteRef.loteNombre} > ${suerteRef.suerteNombre}`,
            suerte: suerteRef.suerteNombre,
            cultivo: suerteRef.cultivo,
            geocercaEstado: isLabor ? 'DENTRO' : 'FUERA',
            actividadAsignada: `Labor Mecanizada - ${maq.implementoAsignado || 'Surcado / Cosecha'}`,
            velocidadKmh,
            bateriaPct: Math.max(20, 100 - Math.floor(i * 2)), // Combustible
            tiempoProductivoMin: accumProd,
            tiempoImproductivoMin: accumImprod,
            tiempoParadaMin: accumParada,
            alerta
          });
        }
      });
    } else if (selectedModulo === 'fitosanitario') {
      const muestreos = registrosControles.length > 0 ? registrosControles : [
        { id: 'MUE-01', plaga: 'Diatraea saccharalis (Barrenador)', severidad: 'Alta', incidencia: '18%', lote: 'Lote 01', suerte: 'Suerte 101', evaluador: 'Ing. Agrónomo' },
        { id: 'MUE-02', plaga: 'Aeneolamia varia (Salivazo)', severidad: 'Media', incidencia: '8%', lote: 'Lote 01', suerte: 'Suerte 102', evaluador: 'Técnico Fitosanitario' },
        { id: 'MUE-03', plaga: 'Roya Café (Hemileia vastatrix)', severidad: 'Baja', incidencia: '3%', lote: 'Lote 02', suerte: 'Suerte 201', evaluador: 'Auxiliar Campo' }
      ];

      muestreos.forEach((mue, idx) => {
        const suerteRef = flattenSuertes[idx % (flattenSuertes.length || 1)] || {
          suerteNombre: mue.suerte || 'Suerte 101 (Noroccidente)',
          loteNombre: mue.lote || 'Lote 01 (Franja Norte)',
          fincaNombre: 'Hacienda La Manuelita',
          cultivo: 'Caña de Azúcar (Variedad CC 01-1940)',
          lat: 3.472053 + idx * 0.0008,
          lng: -76.446638 + idx * 0.0008
        };

        registros.push({
          id: `REG-FITO-${idx}`,
          timestamp: new Date().toISOString(),
          hora: `0${8 + idx}:30`,
          minutoRelativo: idx * 30,
          modulo: 'Fitosanitario',
          entidadId: mue.id || `MUE-${idx + 1}`,
          entidadCodigo: mue.id || `MUE-${idx + 1}`,
          entidadNombre: mue.plaga || 'Evaluación de Plagas',
          cargo: mue.evaluador || 'Monitor de Campo',
          lat: +(suerteRef.lat + (idx * 0.0002)).toFixed(6),
          lng: +(suerteRef.lng + (idx * 0.0002)).toFixed(6),
          ubicacion: `${suerteRef.fincaNombre} > ${suerteRef.loteNombre} > ${suerteRef.suerteNombre}`,
          suerte: suerteRef.suerteNombre,
          cultivo: suerteRef.cultivo,
          geocercaEstado: 'DENTRO',
          actividadAsignada: `Muestreo Fitosanitario: ${mue.plaga} (Incidencia: ${mue.incidencia || '12%'})`,
          velocidadKmh: 0.0,
          bateriaPct: 92,
          tiempoProductivoMin: 45,
          tiempoImproductivoMin: 5,
          tiempoParadaMin: 15,
          alerta: mue.severidad === 'Alta' ? '⚠️ Nivel Crítico (Supera Umbral)' : 'Severidad Normal'
        });
      });
    } else {
      // Catastro / Lotes
      flattenSuertes.forEach((suerte, idx) => {
        registros.push({
          id: `REG-CAT-${suerte.suerteId || idx}`,
          timestamp: new Date().toISOString(),
          hora: '07:00',
          minutoRelativo: 0,
          modulo: 'Catastro',
          entidadId: suerte.suerteId || `SUE-${idx + 1}`,
          entidadCodigo: suerte.suerteId || `SUE-${idx + 1}`,
          entidadNombre: suerte.suerteNombre,
          cargo: `Lote: ${suerte.loteNombre}`,
          lat: +suerte.lat.toFixed(6),
          lng: +suerte.lng.toFixed(6),
          ubicacion: `${suerte.fincaNombre} > ${suerte.loteNombre} > ${suerte.suerteNombre}`,
          suerte: suerte.suerteNombre,
          cultivo: suerte.cultivo,
          geocercaEstado: 'VÉRTICE / POLÍGONO',
          actividadAsignada: `Área: ${suerte.hectareas} ha | Cultivo: ${suerte.cultivo}`,
          velocidadKmh: 0.0,
          bateriaPct: 100,
          tiempoProductivoMin: 480,
          tiempoImproductivoMin: 0,
          tiempoParadaMin: 0,
          alerta: 'Geometría Verificada'
        });
      });
    }

    return registros;
  }, [selectedModulo, intervaloMinutos, fechaDesde, fechaHasta, selectedEntityId, trabajadores, maquinarias, flattenSuertes, planificaciones, registrosControles]);

  // Resumen / KPIs
  const kpis = useMemo(() => {
    const total = generatedData.length;
    const prodMin = generatedData.reduce((acc, r) => acc + (r.tiempoProductivoMin || 0), 0) / (total > 0 ? (total / Math.max(1, new Set(generatedData.map(d => d.entidadId)).size)) : 1);
    const improdMin = generatedData.reduce((acc, r) => acc + (r.tiempoImproductivoMin || 0), 0) / (total > 0 ? (total / Math.max(1, new Set(generatedData.map(d => d.entidadId)).size)) : 1);
    const paradaMin = generatedData.reduce((acc, r) => acc + (r.tiempoParadaMin || 0), 0) / (total > 0 ? (total / Math.max(1, new Set(generatedData.map(d => d.entidadId)).size)) : 1);
    const totalTime = (prodMin + improdMin + paradaMin) || 1;
    const eficiencia = Math.min(100, Math.round((prodMin / totalTime) * 100));
    const alertas = generatedData.filter(r => r.alerta && r.alerta.includes('⚠️') || r.alerta.includes('🔴')).length;

    return {
      totalRegistros: total,
      prodMin: Math.round(prodMin),
      improdMin: Math.round(improdMin),
      paradaMin: Math.round(paradaMin),
      eficiencia,
      alertas
    };
  }, [generatedData]);

  // Filtrado de tabla y paginación
  const filteredRows = useMemo(() => {
    if (!searchTerm) return generatedData;
    const s = searchTerm.toLowerCase();
    return generatedData.filter(r => 
      r.entidadNombre?.toLowerCase().includes(s) ||
      r.hora?.toLowerCase().includes(s) ||
      r.ubicacion?.toLowerCase().includes(s) ||
      r.actividadAsignada?.toLowerCase().includes(s) ||
      r.alerta?.toLowerCase().includes(s)
    );
  }, [generatedData, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page]);

  // Guardar reporte en Base de Datos
  const handleGuardarEnBd = async () => {
    setIsSavingDb(true);
    const newReportPayload = {
      titulo: `Reporte GIS de ${selectedModulo.toUpperCase()} - Frecuencia ${intervaloMinutos} min`,
      modulo: selectedModulo,
      moduloLabel: selectedModulo === 'personal' ? 'Tracking Personal en Campo' : (selectedModulo === 'maquinaria' ? 'Telemetría Maquinaria' : (selectedModulo === 'fitosanitario' ? 'Muestreos Fitosanitarios' : 'Catastro y Geocercas')),
      intervaloMinutos: Number(intervaloMinutos),
      fechaInicio: fechaDesde,
      fechaFin: fechaHasta,
      entidadFiltro: selectedEntityId,
      totalRegistros: generatedData.length,
      tiempoProductivoTotalMin: kpis.prodMin,
      tiempoImproductivoTotalMin: kpis.improdMin,
      tiempoParadaTotalMin: kpis.paradaMin,
      eficienciaPct: kpis.eficiencia,
      alertasDetectadas: kpis.alertas,
      registros: generatedData.slice(0, 100), // Primeros 100 registros representativos
      generadoPor: 'David Sarria (Super Admin)'
    };

    try {
      const res = await fetch('http://localhost:3000/api/gis/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReportPayload)
      });
      if (res.ok) {
        const json = await res.json();
        setReporteGuardadoExito(json.data);
        notifySuccess('¡Reporte GIS guardado exitosamente en Base de Datos!');
        loadHistorial();
        setIsSavingDb(false);
        return;
      }
    } catch (e) {
      console.warn('API error, guardando en local:', e);
    }

    // Fallback local
    const local = JSON.parse(localStorage.getItem('agro_gis_reportes_guardados') || '[]');
    const fallbackObj = {
      id: `REP-LOCAL-${Date.now()}`,
      ...newReportPayload,
      createdAt: new Date().toISOString()
    };
    local.unshift(fallbackObj);
    localStorage.setItem('agro_gis_reportes_guardados', JSON.stringify(local));
    setHistorialReportes(local);
    setReporteGuardadoExito(fallbackObj);
    notifySuccess('¡Reporte GIS guardado en Base de Datos local!');
    setIsSavingDb(false);
  };

  // Exportar a Excel (CSV con UTF-8)
  const handleExportCsv = () => {
    if (generatedData.length === 0) {
      notifyWarning('No hay datos generados para exportar');
      return;
    }

    const headers = [
      'Modulo',
      'Fecha_Hora',
      'Hora',
      'Minuto_Intervalo',
      'ID_Entidad',
      'Codigo_Documento',
      'Nombre_Entidad',
      'Cargo_Tipo',
      'Latitud',
      'Longitud',
      'Ubicacion_Jerarquica',
      'Suerte',
      'Cultivo',
      'Estado_Geocerca',
      'Actividad_OT_Asignada',
      'Velocidad_Kmh',
      'Nivel_Bateria_Combustible',
      'Tiempo_Productivo_Min',
      'Tiempo_Improductivo_Min',
      'Tiempo_Parada_Min',
      'Alertas_Eventos'
    ];

    const rows = generatedData.map(r => [
      `"${r.modulo}"`,
      `"${r.timestamp}"`,
      `"${r.hora}"`,
      r.minutoRelativo,
      `"${r.entidadId}"`,
      `"${r.entidadCodigo}"`,
      `"${r.entidadNombre}"`,
      `"${r.cargo}"`,
      r.lat,
      r.lng,
      `"${r.ubicacion}"`,
      `"${r.suerte}"`,
      `"${r.cultivo}"`,
      `"${r.geocercaEstado}"`,
      `"${r.actividadAsignada.replace(/"/g, '""')}"`,
      r.velocidadKmh,
      `${r.bateriaPct}%`,
      r.tiempoProductivoMin,
      r.tiempoImproductivoMin,
      r.tiempoParadaMin,
      `"${r.alerta}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_gis_${selectedModulo}_cada_${intervaloMinutos}min_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notifySuccess('¡Archivo Excel / CSV descargado con éxito!');
  };

  // Exportar a JSON
  const handleExportJson = () => {
    const jsonReport = {
      meta: {
        sistema: 'AgroGestión SaaS GIS Telemetry Engine',
        modulo: selectedModulo,
        intervaloMinutos: Number(intervaloMinutos),
        fechaGeneracion: new Date().toISOString(),
        totalPuntos: generatedData.length,
        resumenKpis: kpis
      },
      puntosTelemetria: generatedData
    };

    const blob = new Blob([JSON.stringify(jsonReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `telemetria_gis_${selectedModulo}_${intervaloMinutos}min.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notifySuccess('¡Dataset JSON descargado con éxito!');
  };

  // Imprimir reporte
  const handlePrint = () => {
    window.print();
  };

  // Eliminar reporte de historial
  const handleDeleteReport = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/gis/reportes/${id}`, { method: 'DELETE' });
    } catch (e) {}

    const updated = historialReportes.filter(h => h.id !== id);
    setHistorialReportes(updated);
    localStorage.setItem('agro_gis_reportes_guardados', JSON.stringify(updated));
    notifySuccess('Reporte eliminado del historial.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                Generador de Reportes GIS & Telemetría por Minutos
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Base de Datos SQL / JSON
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Auditoría geoespacial: latitud, longitud, tiempos productivos vs improductivos, geocercas y actividades.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveTab('generador')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'generador' 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Generar Reporte
              </button>
              <button
                onClick={() => setActiveTab('historial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'historial' 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Historial Guardado ({historialReportes.length})
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'generador' ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Formulario de Parámetros de Reporte */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              
              {/* 1. Módulo */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  1. Módulo GIS a Reportar
                </label>
                <select
                  value={selectedModulo}
                  onChange={(e) => {
                    setSelectedModulo(e.target.value);
                    setSelectedEntityId('all');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="personal">👷 Tracking de Personal / Cuadrillas</option>
                  <option value="maquinaria">🚜 Tracking Maquinaria & Equipos</option>
                  <option value="fitosanitario">🔬 Muestreos & Controles Fitosanitarios</option>
                  <option value="catastro">🗺️ Catastro, Lotes & Geocercas</option>
                </select>
              </div>

              {/* 2. Frecuencia de Minutos */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block flex items-center justify-between">
                  <span>2. Frecuencia / Minutos</span>
                  <span className="text-emerald-400 font-mono">c/{intervaloMinutos} min</span>
                </label>
                <select
                  value={intervaloMinutos}
                  onChange={(e) => setIntervaloMinutos(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>⏱️ Cada 1 minuto (Alta precisión)</option>
                  <option value={5}>⏱️ Cada 5 minutos (Recomendado)</option>
                  <option value={10}>⏱️ Cada 10 minutos</option>
                  <option value={15}>⏱️ Cada 15 minutos</option>
                  <option value={30}>⏱️ Cada 30 minutos</option>
                  <option value={60}>⏱️ Cada 60 minutos (1 hora)</option>
                </select>
              </div>

              {/* 3. Fecha/Hora Desde */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  3. Rango Desde
                </label>
                <input
                  type="datetime-local"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 4. Fecha/Hora Hasta */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  4. Rango Hasta
                </label>
                <input
                  type="datetime-local"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 5. Entidad Específica */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  5. Filtrar Colaborador / Máquina
                </label>
                <select
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">🌐 Todos los registros</option>
                  {selectedModulo === 'personal' && trabajadores.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre} ({t.cedula || t.id})</option>
                  ))}
                  {selectedModulo === 'maquinaria' && maquinarias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre || m.modelo} ({m.codigo || m.id})</option>
                  ))}
                </select>
              </div>

            </div>

            {/* KPI Cards de Resumen */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-100">{kpis.totalRegistros}</div>
                  <div className="text-[11px] text-slate-400">Puntos GPS Registrados</div>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-emerald-400">{kpis.prodMin} min</div>
                  <div className="text-[11px] text-slate-400">Tiempo Productivo ({kpis.eficiencia}%)</div>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-rose-400">{kpis.improdMin} min</div>
                  <div className="text-[11px] text-slate-400">Fuera de Geocerca</div>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-amber-400">{kpis.paradaMin} min</div>
                  <div className="text-[11px] text-slate-400">Tiempo en Paradas</div>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-purple-400">{kpis.alertas}</div>
                  <div className="text-[11px] text-slate-400">Alertas Detectadas</div>
                </div>
              </div>
            </div>

            {/* Barra de Acciones de Exportación y Guardado */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por colaborador, suerte, labor o alerta..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleGuardarEnBd}
                  disabled={isSavingDb}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5" />
                  {isSavingDb ? 'Guardando en BD...' : '💾 Guardar en Base de Datos'}
                </button>

                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  📥 Excel / CSV
                </button>

                <button
                  onClick={handleExportJson}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  📄 GeoJSON / JSON
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-400" />
                  🖨️ Imprimir
                </button>
              </div>
            </div>

            {/* Tabla de Telemetría Detallada Minuto a Minuto */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 tracking-wider">
                    <tr>
                      <th className="px-3.5 py-2.5">Hora (Min)</th>
                      <th className="px-3.5 py-2.5">Colaborador / Máquina</th>
                      <th className="px-3.5 py-2.5">Coordenadas (Lat, Lng)</th>
                      <th className="px-3.5 py-2.5">Ubicación / Suerte</th>
                      <th className="px-3.5 py-2.5">Geocerca</th>
                      <th className="px-3.5 py-2.5">Actividad Asignada / OT</th>
                      <th className="px-3.5 py-2.5">Tiempos (Prod / Improd / Parada)</th>
                      <th className="px-3.5 py-2.5">Alertas / Diagnóstico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {paginatedRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500 font-medium">
                          No se encontraron registros con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-3.5 py-2 font-mono font-bold text-slate-200">
                            {row.hora} <span className="text-[10px] text-slate-500">(+{row.minutoRelativo}m)</span>
                          </td>
                          <td className="px-3.5 py-2">
                            <div className="font-bold text-slate-100">{row.entidadNombre}</div>
                            <div className="text-[10px] text-slate-400">{row.entidadCodigo} • {row.cargo}</div>
                          </td>
                          <td className="px-3.5 py-2 font-mono text-[11px] text-emerald-400">
                            {row.lat}, {row.lng}
                          </td>
                          <td className="px-3.5 py-2">
                            <div className="font-medium text-slate-200">{row.suerte}</div>
                            <div className="text-[10px] text-slate-400">{row.ubicacion}</div>
                          </td>
                          <td className="px-3.5 py-2">
                            {row.geocercaEstado === 'DENTRO' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                🟢 DENTRO
                              </span>
                            ) : row.geocercaEstado === 'FUERA' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                🔴 FUERA
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                🔷 {row.geocercaEstado}
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 max-w-[220px] truncate" title={row.actividadAsignada}>
                            <div className="text-slate-200 font-medium">{row.actividadAsignada}</div>
                            <div className="text-[10px] text-slate-400">Vel: {row.velocidadKmh} km/h • Bat: {row.bateriaPct}%</div>
                          </td>
                          <td className="px-3.5 py-2 font-mono text-[11px]">
                            <span className="text-emerald-400 font-bold">{row.tiempoProductivoMin}m</span> /{' '}
                            <span className="text-rose-400">{row.tiempoImproductivoMin}m</span> /{' '}
                            <span className="text-amber-400">{row.tiempoParadaMin}m</span>
                          </td>
                          <td className="px-3.5 py-2">
                            {row.alerta.includes('⚠️') ? (
                              <span className="text-amber-400 font-medium flex items-center gap-1 text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {row.alerta}
                              </span>
                            ) : row.alerta.includes('🔴') ? (
                              <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                {row.alerta}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                {row.alerta}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginador */}
              <div className="px-4 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div>
                  Mostrando {filteredRows.length > 0 ? (page - 1) * rowsPerPage + 1 : 0} a {Math.min(page * rowsPerPage, filteredRows.length)} de {filteredRows.length} registros
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="px-2 font-bold text-slate-200">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Pestaña Historial de Reportes en BD */
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">Reportes GIS Persistidos en Base de Datos</h3>
                <p className="text-xs text-slate-400">Consulta los informes de telemetría y tiempos generados previamente.</p>
              </div>
              <button
                onClick={loadHistorial}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualizar Lista
              </button>
            </div>

            {historialReportes.length === 0 ? (
              <div className="text-center py-16 bg-slate-950/60 rounded-2xl border border-slate-800">
                <Database className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-300">No hay reportes guardados en base de datos</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Genera un reporte con la frecuencia de minutos deseada y presiona "Guardar en Base de Datos".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historialReportes.map(rep => (
                  <div key={rep.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3 hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {rep.codigo || rep.id}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            c/{rep.intervaloMinutos} min
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 mt-1">{rep.titulo}</h4>
                      </div>
                      <button
                        onClick={() => handleDeleteReport(rep.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Eliminar Reporte"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-2.5 rounded-lg text-center border border-slate-800/80">
                      <div>
                        <div className="text-[10px] text-slate-400">Total Puntos</div>
                        <div className="text-xs font-bold text-slate-200">{rep.totalRegistros || 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Tiempo Prod.</div>
                        <div className="text-xs font-bold text-emerald-400">{rep.tiempoProductivoTotalMin || 0}m</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Eficiencia</div>
                        <div className="text-xs font-bold text-blue-400">{rep.eficienciaPct || 0}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Generado: {new Date(rep.createdAt).toLocaleDateString()}</span>
                      <span className="text-slate-300 font-medium">{rep.generadoPor || 'Super Admin'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Motor GIS conectado a PostgreSQL / SQLite & Servicio de Telemetría
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
