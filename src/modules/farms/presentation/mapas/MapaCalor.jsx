import React, { useEffect, useRef, useState } from 'react';
import { useAgro } from '@/providers/AgroContext';
import { 
  Map as MapIcon, 
  Satellite, 
  Layers, 
  Filter, 
  MapPin, 
  Sparkles, 
  Search, 
  Maximize2, 
  Info, 
  Activity,
  Droplets,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Navigation,
  Crosshair,
  ShieldCheck,
  Calendar,
  Layers3
} from 'lucide-react';
import { notifySuccess, notifyError } from '@/utils/swal';

export default function MapaCalor() {
  const { registrosControles, controlesAgro, sectores, planificaciones, globalCultivo } = useAgro();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  const baseTileLayer = useRef(null);

  const [mapType, setMapType] = useState('satellite'); // 'satellite' | 'osm' | 'dark'
  const [selectedSuerte, setSelectedSuerte] = useState(null);
  const [showNdviSimulation, setShowNdviSimulation] = useState(false);
  const [showLaborsLayer, setShowLaborsLayer] = useState(true);
  const [showMonitoreosLayer, setShowMonitoreosLayer] = useState(true);
  const [showLoteBounds, setShowLoteBounds] = useState(true);

  // Geofence GPS Simulator & Validator state
  const [testGps, setTestGps] = useState({ lat: '3.4530', lng: '-76.5330' });
  const [validationResult, setValidationResult] = useState(null);

  // Helper recursivo para extraer todas las suertes y lotes sin importar el nivel de anidamiento
  const extractAllSuertesAndLotes = (nodes) => {
    const suertes = [];
    const lotes = [];

    const traverse = (node, ctx = {}) => {
      if (!node) return;
      const currentCtx = {
        sector: node.type === 'Sector' ? (node.name || node.nombre) : (ctx.sector || 'Sector Principal'),
        finca: node.type === 'Finca' ? (node.name || node.nombre) : (ctx.finca || 'Hacienda Principal'),
        lote: node.type === 'Lote' ? (node.name || node.nombre) : (ctx.lote || 'Lote Principal')
      };

      // Si es un Lote, guardar
      if (node.type === 'Lote' || (node.suertes && Array.isArray(node.suertes))) {
        lotes.push({
          ...node,
          name: node.name || node.nombre || `Lote ${node.id}`,
          fincaName: currentCtx.finca,
          sectorName: currentCtx.sector
        });
      }

      // Si tiene suertes directas
      if (node.suertes && Array.isArray(node.suertes)) {
        node.suertes.forEach(st => {
          const sName = st.name || st.nombre || `Suerte ${st.id}`;
          const sHa = Number(st.hectareas || st.area || st.ha || 0);
          const sCultivo = st.cultivo || 'Caña de Azúcar';
          const sGeom = st.geometria || st.coordenadas || st.polygon || st.coords || (
            st.lat && st.lng ? [
              [st.lat - 0.002, st.lng - 0.002],
              [st.lat + 0.002, st.lng - 0.002],
              [st.lat + 0.002, st.lng + 0.002],
              [st.lat - 0.002, st.lng + 0.002]
            ] : null
          );

          suertes.push({
            ...st,
            name: sName,
            hectareas: sHa,
            cultivo: sCultivo,
            geometria: sGeom,
            fincaName: currentCtx.finca,
            loteName: currentCtx.lote,
            sectorName: currentCtx.sector
          });
        });
      }

      // Recorrer hijos
      if (node.zonas && Array.isArray(node.zonas)) node.zonas.forEach(child => traverse(child, currentCtx));
      if (node.sectores && Array.isArray(node.sectores)) node.sectores.forEach(child => traverse(child, currentCtx));
      if (node.fincas && Array.isArray(node.fincas)) node.fincas.forEach(child => traverse(child, currentCtx));
      if (node.lotes && Array.isArray(node.lotes)) node.lotes.forEach(child => traverse(child, currentCtx));
    };

    (nodes || []).forEach(n => traverse(n));
    return { suertes, lotes };
  };

  const { suertes: allSuertes, lotes: allLotes } = extractAllSuertesAndLotes(sectores);

  // Filtrar registros que tengan coordenadas
  const registrosConGps = (registrosControles || []).filter(r => r.lat && r.lng);

  // Estadísticas de superficie
  const totalSuertesCount = allSuertes.length;
  const totalHaCount = allSuertes.reduce((acc, s) => acc + Number(s.hectareas || 0), 0);

  // Inicializar mapa Leaflet
  useEffect(() => {
    if (!mapInstance.current && window.L && mapRef.current) {
      mapInstance.current = window.L.map(mapRef.current, {
        zoomControl: false
      }).setView([3.4530, -76.5330], 14);

      window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      // Default Esri Satélite (Alta definición, libre sin API key)
      baseTileLayer.current = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, Maxar, Earthstar Geographics'
      }).addTo(mapInstance.current);

      markersLayer.current = window.L.layerGroup().addTo(mapInstance.current);

      // On map click -> set GPS validator coords
      mapInstance.current.on('click', (e) => {
        setTestGps({
          lat: e.latlng.lat.toFixed(5),
          lng: e.latlng.lng.toFixed(5)
        });
      });
    }
  }, []);

  // CARTO Basemaps API Key oficial
  const CARTO_API_KEY = 'cb1_4dz5_1_6e0c0b2aaa6bc37eadf27bcd';

  // Cambiar tipo de mapa base
  useEffect(() => {
    if (!mapInstance.current || !baseTileLayer.current || !window.L) return;

    if (mapType === 'satellite') {
      baseTileLayer.current.setUrl('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
    } else if (mapType === 'osm') {
      baseTileLayer.current.setUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    } else if (mapType === 'dark') {
      baseTileLayer.current.setUrl(`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`);
    }
  }, [mapType]);

  // Dibujar polígonos de geocercas y marcadores
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current || !window.L) return;

    markersLayer.current.clearLayers();
    const boundsPoints = [];

    // 1. Dibujar Geocercas de Suertes / Lotes
    allSuertes.forEach(suerte => {
      if (suerte.geometria && Array.isArray(suerte.geometria) && suerte.geometria.length >= 3) {
        let strokeColor = '#10b981';
        let fillColor = '#10b981';
        
        if (showNdviSimulation) {
          const hash = (suerte.name || suerte.id || 'A').charCodeAt(0) % 3;
          fillColor = hash === 0 ? '#10b981' : hash === 1 ? '#fbbf24' : '#ef4444';
          strokeColor = hash === 0 ? '#059669' : hash === 1 ? '#d97706' : '#dc2626';
        } else if (suerte.cultivo?.toLowerCase().includes('caña')) {
          fillColor = '#10B981';
          strokeColor = '#059669';
        } else if (suerte.cultivo?.toLowerCase().includes('café')) {
          fillColor = '#F59E0B';
          strokeColor = '#D97706';
        } else if (suerte.cultivo?.toLowerCase().includes('aguacate')) {
          fillColor = '#8B5CF6';
          strokeColor = '#7C3AED';
        } else if (suerte.cultivo?.toLowerCase().includes('palma')) {
          fillColor = '#06B6D4';
          strokeColor = '#0891B2';
        }

        const polygon = window.L.polygon(suerte.geometria, {
          color: strokeColor,
          weight: 2.5,
          fillColor: fillColor,
          fillOpacity: showNdviSimulation ? 0.65 : 0.40,
          dashArray: showLoteBounds ? '4, 4' : null
        }).addTo(markersLayer.current);

        suerte.geometria.forEach(pt => {
          if (Array.isArray(pt) && pt.length >= 2) boundsPoints.push(pt);
        });

        polygon.on('click', () => {
          setSelectedSuerte({
            suerte,
            lote: suerte.loteName,
            finca: suerte.fincaName,
            sector: suerte.sectorName,
            cultivo: suerte.cultivo || 'Caña de Azúcar'
          });
        });

        polygon.bindTooltip(`
          <div style="font-size: 12px; font-weight: 600; padding: 4px; line-height: 1.4;">
            <strong style="color: #059669; font-size: 13px;">${suerte.name}</strong><br/>
            <span>🌾 Cultivo: ${suerte.cultivo}</span><br/>
            <span>📍 Lote: ${suerte.loteName} · ${suerte.fincaName}</span><br/>
            <span style="color: #0284c7;">📐 Superficie: ${suerte.hectareas} Ha</span>
          </div>
        `, {
          sticky: true,
          className: 'leaflet-custom-tooltip'
        });
      }
    });

    // 2. Marcadores de Labores / Planificaciones de Campo
    if (showLaborsLayer && planificaciones && planificaciones.length > 0) {
      planificaciones.forEach(p => {
        const centerLat = boundsPoints.length > 0 ? boundsPoints[0][0] : 3.4530;
        const centerLng = boundsPoints.length > 0 ? boundsPoints[0][1] : -76.5330;
        const pLat = centerLat + (Math.random() - 0.5) * 0.005;
        const pLng = centerLng + (Math.random() - 0.5) * 0.005;

        const laborMarker = window.L.circleMarker([pLat, pLng], {
          radius: 8,
          fillColor: p.estado === 'Completada' || p.estado === 'Ejecutada' ? '#10b981' : '#3b82f6',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95
        }).addTo(markersLayer.current);

        laborMarker.bindPopup(`
          <div style="font-size: 12px; color: #111827; padding: 4px;">
            <strong style="color: #1d4ed8;">🚜 Labor Agrícola: ${p.ordenCode || p.id}</strong><br/>
            <strong>Actividad:</strong> ${p.actividadNombre || p.actividad || 'Labor General'}<br/>
            <strong>Ubicación:</strong> ${p.loteNombre || 'Suerte 1A'}<br/>
            <strong>Estado:</strong> ${p.estado || 'Programada'}
          </div>
        `);
      });
    }

    // 3. Marcadores GPS de monitoreos fitosanitarios
    if (showMonitoreosLayer && registrosConGps.length > 0) {
      registrosConGps.forEach(r => {
        const monMarker = window.L.circleMarker([r.lat, r.lng], {
          radius: 8,
          fillColor: '#a855f7',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.95
        }).addTo(markersLayer.current);

        boundsPoints.push([r.lat, r.lng]);

        monMarker.bindPopup(`
          <div style="font-size: 12px; color: #111827; padding: 4px;">
            <strong style="color: #7e22ce;">🔬 Muestreo Fitosanitario</strong><br/>
            <strong>Protocolo:</strong> ${r.controlNombre || 'Barrenador / Roya'}<br/>
            <strong>Responsable:</strong> ${r.usuario || 'Agrónomo de Campo'}<br/>
            <strong>GPS:</strong> ${Number(r.lat).toFixed(4)}, ${Number(r.lng).toFixed(4)}
          </div>
        `);
      });
    }

    // Auto-ajustar mapa a los polígonos existentes
    if (boundsPoints.length > 0 && mapInstance.current) {
      mapInstance.current.fitBounds(window.L.latLngBounds(boundsPoints), { padding: [40, 40], maxZoom: 16 });
      // Set test GPS default to first point
      setTestGps({
        lat: boundsPoints[0][0].toFixed(5),
        lng: boundsPoints[0][1].toFixed(5)
      });
    }

  }, [sectores, showNdviSimulation, showLaborsLayer, showMonitoreosLayer, showLoteBounds, mapType, planificaciones, registrosConGps]);

  // Point in Polygon helper for Geofence validation
  const isPointInPoly = (point, vs) => {
    if (!vs || !Array.isArray(vs) || vs.length < 3) return false;
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0], yi = vs[i][1];
      const xj = vs[j][0], yj = vs[j][1];
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Run Geofence Validation
  const handleValidateGps = () => {
    const pLat = parseFloat(testGps.lat);
    const pLng = parseFloat(testGps.lng);

    if (isNaN(pLat) || isNaN(pLng)) {
      notifyError('Ingrese coordenadas latitud y longitud válidas');
      return;
    }

    let foundSuerte = null;

    for (const st of allSuertes) {
      if (st.geometria && isPointInPoly([pLat, pLng], st.geometria)) {
        foundSuerte = st;
        break;
      }
    }

    if (foundSuerte) {
      setValidationResult({
        valid: true,
        suerte: foundSuerte.name,
        lote: foundSuerte.loteName,
        finca: foundSuerte.fincaName,
        lat: pLat,
        lng: pLng,
        message: `Coordenada verificada dentro de la geocerca de ${foundSuerte.name} (${foundSuerte.fincaName}). Labor autorizada en polígono correcto.`
      });
      notifySuccess(`Ubicación GPS válida: ${foundSuerte.name}`);
    } else {
      setValidationResult({
        valid: false,
        lat: pLat,
        lng: pLng,
        message: `ALERTA DE DESVIACIÓN: La coordenada GPS (${pLat.toFixed(4)}, ${pLng.toFixed(4)}) se encuentra fuera de las geocercas de los lotes delimitados.`
      });
    }

    if (mapInstance.current && window.L) {
      mapInstance.current.setView([pLat, pLng], 15);
      window.L.circleMarker([pLat, pLng], {
        radius: 11,
        fillColor: foundSuerte ? '#10b981' : '#ef4444',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1
      }).addTo(markersLayer.current).bindPopup(`Punto GPS Validado: ${foundSuerte ? foundSuerte.name : 'Fuera de Geocerca'}`).openPopup();
    }
  };

  return (
    <div className="h-full w-full flex flex-col fade-in relative overflow-hidden bg-slate-100 dark:bg-[#090d16] text-[var(--text-contrast)]">
      
      {/* ── TOP FLOATING CONTROL BAR ──────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Pills & Map Mode */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 p-2 rounded-2xl shadow-2xl text-slate-800 dark:text-white">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <MapIcon size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">GIS & Geocercas</span>
          </div>

          {/* Base Layer Switcher: 1. Satélite (Esri), 2. Modo Calles, 3. Modo Oscuro (Carto) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.06] p-1 rounded-xl border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapType === 'satellite' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🛰️ Satélite (Esri)</span>
            </button>
            <button
              onClick={() => setMapType('osm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapType === 'osm' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🗺️ Modo Calles</span>
            </button>
            <button
              onClick={() => setMapType('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                mapType === 'dark' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🌙 Modo Oscuro (Carto)</span>
            </button>
          </div>

          {/* NDVI Toggle */}
          <button
            onClick={() => setShowNdviSimulation(!showNdviSimulation)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              showNdviSimulation
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            <Sparkles size={14} className={showNdviSimulation ? "text-white" : "text-purple-600 dark:text-purple-400"} />
            <span>{showNdviSimulation ? 'NDVI Activo' : 'Capa NDVI'}</span>
          </button>

          {/* Lotes Geofence Outlines Toggle */}
          <button
            onClick={() => setShowLoteBounds(!showLoteBounds)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              showLoteBounds
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            <Layers3 size={14} className={showLoteBounds ? "text-white" : "text-emerald-600 dark:text-emerald-400"} />
            <span>{showLoteBounds ? 'Geocercas ON' : 'Geocercas OFF'}</span>
          </button>
        </div>

        {/* Right Info Pill */}
        <div className="pointer-events-auto hidden md:flex items-center gap-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 px-4 py-2 rounded-2xl text-xs shadow-2xl text-slate-800 dark:text-white">
          <span className="text-slate-500 dark:text-slate-400">Superficie Delimitada:</span>
          <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{totalHaCount.toFixed(1)} Ha</strong>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-500 dark:text-slate-400">Total Suertes/Lotes:</span>
          <strong className="text-slate-900 dark:text-white font-bold">{totalSuertesCount}</strong>
        </div>

      </div>

      {/* ── LEAFLET MAP CONTAINER ─────────────────────────────────────── */}
      <div ref={mapRef} className="h-full w-full z-0 relative" />

      {/* ── BOTTOM DRAWER & GEOFENCE VALIDATOR ────────────────────────── */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] grid grid-cols-1 md:grid-cols-12 gap-3 pointer-events-none">
        
        {/* Left 7 cols: Geofence GPS Device Validator Tool */}
        <div className="md:col-span-7 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/70 p-4 rounded-3xl shadow-2xl space-y-3 text-slate-800 dark:text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-cyan-600 dark:text-cyan-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Validador de Geocerca GPS en Terreno
              </h4>
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Antifraude / Control de Campo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block mb-1">Latitud GPS</label>
              <input 
                type="text" 
                value={testGps.lat} 
                onChange={e => setTestGps({ ...testGps, lat: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block mb-1">Longitud GPS</label>
              <input 
                type="text" 
                value={testGps.lng} 
                onChange={e => setTestGps({ ...testGps, lng: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleValidateGps}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
              >
                <Crosshair size={14} /> Validar Geocerca
              </button>
            </div>
          </div>

          {validationResult && (
            <div className={`p-2.5 rounded-2xl text-xs border flex items-start gap-2 ${
              validationResult.valid 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-200' 
                : 'bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-200'
            }`}>
              {validationResult.valid ? <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
              <div>
                <strong className="block font-bold">{validationResult.valid ? 'Labor Verificada en Polígono Correcto' : 'Alerta de Desviación GPS'}</strong>
                <p className="text-[11px] opacity-90 mt-0.5">{validationResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 cols: Selected Polygon Details / Legend */}
        <div className="md:col-span-5 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/70 p-4 rounded-3xl shadow-2xl space-y-2 text-slate-800 dark:text-slate-100">
          {selectedSuerte ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <strong className="text-sm text-slate-900 dark:text-white font-bold">{selectedSuerte.suerte.name}</strong>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold">
                  {selectedSuerte.cultivo}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div>Finca: <strong className="text-slate-900 dark:text-white">{selectedSuerte.finca}</strong></div>
                <div>Lote: <strong className="text-slate-900 dark:text-white">{selectedSuerte.lote}</strong></div>
                <div>Área: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{selectedSuerte.suerte.hectareas || 0} Ha</strong></div>
                <div>Sector: <strong className="text-cyan-700 dark:text-cyan-400 font-bold">{selectedSuerte.sector}</strong></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase block tracking-wider">Leyenda de Capas Jerárquicas</span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" /> Caña (Verde)</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" /> Café (Ámbar)</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" /> Aguacate (Púrpura)</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" /> Labores OT (Azul)</div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Haz clic en cualquier geocerca para inspeccionar su delimitación.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
