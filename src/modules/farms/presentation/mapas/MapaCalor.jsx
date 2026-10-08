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
  Calendar
} from 'lucide-react';
import { notifySuccess, notifyError } from '@/utils/swal';

export default function MapaCalor() {
  const { registrosControles, controlesAgro, sectores, planificaciones, globalCultivo } = useAgro();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  const baseTileLayer = useRef(null);

  const [mapType, setMapType] = useState('dark'); // 'dark' | 'satellite' | 'osm'
  const [selectedSuerte, setSelectedSuerte] = useState(null);
  const [showNdviSimulation, setShowNdviSimulation] = useState(false);
  const [showLaborsLayer, setShowLaborsLayer] = useState(true);
  const [showMonitoreosLayer, setShowMonitoreosLayer] = useState(true);
  const [selectedHierarchyLevel, setSelectedHierarchyLevel] = useState('ALL'); // 'ALL' | 'Finca' | 'Lote' | 'Suerte'

  // Geofence GPS Simulator & Validator state
  const [testGps, setTestGps] = useState({ lat: '3.5285', lng: '-76.2980' });
  const [validationResult, setValidationResult] = useState(null);
  const [selectedPlanToValidate, setSelectedPlanToValidate] = useState('');

  // Filtrar registros que tengan coordenadas
  const registrosConGps = (registrosControles || []).filter(r => r.lat && r.lng);

  // Estadísticas rápidas
  let totalSuertes = 0;
  let totalHa = 0;
  let suertesList = [];

  sectores?.forEach(s => {
    s.fincas?.forEach(f => {
      f.lotes?.forEach(l => {
        l.suertes?.forEach(st => {
          totalSuertes++;
          totalHa += Number(st.hectareas || 0);
          suertesList.push({ ...st, fincaName: f.name, loteName: l.name, sectorName: s.name });
        });
      });
    });
  });

  // Inicializar mapa
  useEffect(() => {
    if (!mapInstance.current && window.L && mapRef.current) {
      mapInstance.current = window.L.map(mapRef.current, {
        zoomControl: false
      }).setView([3.5285, -76.2980], 14);

      window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      // Default CartoDB Dark Matter (Free, keyless, high contrast)
      baseTileLayer.current = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CartoDB Dark'
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

  // Cambiar tipo de mapa base (Todos 100% libres y sin API Key)
  useEffect(() => {
    if (!mapInstance.current || !baseTileLayer.current || !window.L) return;

    if (mapType === 'satellite') {
      baseTileLayer.current.setUrl('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
    } else if (mapType === 'dark') {
      baseTileLayer.current.setUrl('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
    } else {
      baseTileLayer.current.setUrl('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    }
  }, [mapType]);

  // Dibujar capas jerárquicas y marcadores
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current || !window.L) return;

    markersLayer.current.clearLayers();

    // 1. Polígonos de Suertes y Lotes con colores jerárquicos
    sectores?.forEach(s => {
      s.fincas?.forEach(f => {
        f.lotes?.forEach(l => {
          l.suertes?.forEach(suerte => {
            const coords = suerte.geometria && suerte.geometria.length > 2 
              ? suerte.geometria 
              : [
                  [(suerte.lat || 3.5285) - 0.003, (suerte.lng || -76.2980) - 0.003],
                  [(suerte.lat || 3.5285) + 0.003, (suerte.lng || -76.2980) - 0.003],
                  [(suerte.lat || 3.5285) + 0.003, (suerte.lng || -76.2980) + 0.003],
                  [(suerte.lat || 3.5285) - 0.003, (suerte.lng || -76.2980) + 0.003]
                ];

            let strokeColor = '#10b981'; // Suerte default emerald
            let fillColor = '#10b981';
            
            if (showNdviSimulation) {
              const hash = (suerte.name || suerte.id || 'A').charCodeAt(0) % 3;
              fillColor = hash === 0 ? '#10b981' : hash === 1 ? '#fbbf24' : '#ef4444';
              strokeColor = hash === 0 ? '#059669' : hash === 1 ? '#d97706' : '#dc2626';
            } else if (suerte.cultivo === 'Caña de Azúcar') {
              fillColor = '#10B981';
              strokeColor = '#059669';
            } else if (suerte.cultivo === 'Café Arábica Especial') {
              fillColor = '#F59E0B';
              strokeColor = '#D97706';
            } else if (suerte.cultivo === 'Aguacate Hass') {
              fillColor = '#8B5CF6';
              strokeColor = '#7C3AED';
            }

            const polygon = window.L.polygon(coords, {
              color: strokeColor,
              weight: 2.5,
              fillColor: fillColor,
              fillOpacity: showNdviSimulation ? 0.65 : 0.40
            }).addTo(markersLayer.current);

            polygon.on('click', () => {
              setSelectedSuerte({
                suerte,
                lote: l.name,
                finca: f.name,
                sector: s.name,
                cultivo: suerte.cultivo || 'Caña de Azúcar'
              });
            });

            polygon.bindTooltip(`
              <div style="font-size: 11px; padding: 2px;">
                <strong style="color: #10B981;">${suerte.name}</strong><br/>
                <span>Lote: ${l.name} · Finca: ${f.name}</span><br/>
                <span>Área: ${suerte.hectareas || 0} Ha · ${suerte.cultivo || 'Caña'}</span>
              </div>
            `, {
              sticky: true,
              className: 'leaflet-custom-tooltip'
            });
          });
        });
      });
    });

    // 2. Marcadores de Labores / Planificaciones de Campo
    if (showLaborsLayer && planificaciones && planificaciones.length > 0) {
      planificaciones.forEach(p => {
        const pLat = 3.5285 + (Math.random() - 0.5) * 0.006;
        const pLng = -76.2980 + (Math.random() - 0.5) * 0.006;

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
            <strong>Ubicación:</strong> ${p.loteNombre || 'Suerte A-01'}<br/>
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

        monMarker.bindPopup(`
          <div style="font-size: 12px; color: #111827; padding: 4px;">
            <strong style="color: #7e22ce;">🔬 Muestreo Fitosanitario</strong><br/>
            <strong>Protocolo:</strong> ${r.controlNombre || 'Barrenador / Roya'}<br/>
            <strong>Responsable:</strong> ${r.usuario || 'Agrónomo de Campo'}<br/>
            <strong>GPS:</strong> ${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}
          </div>
        `);
      });
    }

  }, [sectores, showNdviSimulation, showLaborsLayer, showMonitoreosLayer, mapType, planificaciones, registrosConGps]);

  // Point in Polygon helper for Geofence validation
  const isPointInPoly = (point, vs) => {
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
    let foundLote = null;
    let foundFinca = null;

    sectores?.forEach(s => {
      s.fincas?.forEach(f => {
        f.lotes?.forEach(l => {
          l.suertes?.forEach(st => {
            const coords = st.geometria && st.geometria.length > 2
              ? st.geometria
              : [
                  [(st.lat || 3.5285) - 0.003, (st.lng || -76.2980) - 0.003],
                  [(st.lat || 3.5285) + 0.003, (st.lng || -76.2980) - 0.003],
                  [(st.lat || 3.5285) + 0.003, (st.lng || -76.2980) + 0.003],
                  [(st.lat || 3.5285) - 0.003, (st.lng || -76.2980) + 0.003]
                ];
            if (isPointInPoly([pLat, pLng], coords)) {
              foundSuerte = st;
              foundLote = l;
              foundFinca = f;
            }
          });
        });
      });
    });

    if (foundSuerte) {
      setValidationResult({
        valid: true,
        suerte: foundSuerte.name,
        lote: foundLote.name,
        finca: foundFinca.name,
        lat: pLat,
        lng: pLng,
        message: `Coordenada verificada dentro de la geocerca de ${foundSuerte.name} (${foundFinca.name}). Labor autorizada en polígono correcto.`
      });
      notifySuccess(`Ubicación GPS válida: ${foundSuerte.name}`);
    } else {
      setValidationResult({
        valid: false,
        lat: pLat,
        lng: pLng,
        message: `ALERTA DE DESVIACIÓN: La coordenada GPS (${pLat.toFixed(4)}, ${pLng.toFixed(4)}) se encuentra fuera de los polígonos agrícolas delimitados.`
      });
    }

    if (mapInstance.current && window.L) {
      mapInstance.current.setView([pLat, pLng], 15);
      window.L.circleMarker([pLat, pLng], {
        radius: 10,
        fillColor: foundSuerte ? '#10b981' : '#ef4444',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1
      }).addTo(markersLayer.current).bindPopup('Punto GPS Validado').openPopup();
    }
  };

  return (
    <div className="h-full w-full flex flex-col fade-in relative overflow-hidden bg-[#090d16] text-[var(--text-contrast)]">
      
      {/* ── TOP FLOATING CONTROL BAR ──────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Pills & Map Mode */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/60 p-2 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <MapIcon size={16} className="text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">GIS & Teledetección</span>
          </div>

          {/* Base Layer Switcher (100% Free - No API Key Needed) */}
          <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setMapType('dark')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                mapType === 'dark' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              🌙 Modo Oscuro (Carto)
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                mapType === 'satellite' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              🛰️ Satélite (Esri)
            </button>
            <button
              onClick={() => setMapType('osm')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                mapType === 'osm' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              🗺️ OpenStreetMap
            </button>
          </div>

          {/* NDVI Toggle */}
          <button
            onClick={() => setShowNdviSimulation(!showNdviSimulation)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              showNdviSimulation
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>{showNdviSimulation ? 'NDVI Activo' : 'Capa NDVI'}</span>
          </button>
        </div>

        {/* Right Info Pill */}
        <div className="pointer-events-auto hidden md:flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 px-4 py-2 rounded-2xl text-xs shadow-2xl">
          <span className="text-slate-400">Superficie Delimitada:</span>
          <strong className="text-emerald-400 font-extrabold">{totalHa.toFixed(1)} Ha</strong>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Total Suertes:</span>
          <strong className="text-white font-bold">{totalSuertes}</strong>
        </div>

      </div>

      {/* ── LEAFLET MAP CONTAINER ─────────────────────────────────────── */}
      <div ref={mapRef} className="h-full w-full z-0 relative" />

      {/* ── BOTTOM DRAWER & GEOFENCE VALIDATOR ────────────────────────── */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] grid grid-cols-1 md:grid-cols-12 gap-3 pointer-events-none">
        
        {/* Left 7 cols: Geofence GPS Device Validator Tool */}
        <div className="md:col-span-7 pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 p-4 rounded-3xl shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-cyan-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                Validador de Geocerca GPS en Terreno
              </h4>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Antifraude / Control de Campo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Latitud GPS</label>
              <input 
                type="text" 
                value={testGps.lat} 
                onChange={e => setTestGps({ ...testGps, lat: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Longitud GPS</label>
              <input 
                type="text" 
                value={testGps.lng} 
                onChange={e => setTestGps({ ...testGps, lng: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
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
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200' 
                : 'bg-rose-500/15 border-rose-500/30 text-rose-200'
            }`}>
              {validationResult.valid ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />}
              <div>
                <strong className="block font-bold">{validationResult.valid ? 'Labor Verificada en Polígono Correcto' : 'Alerta de Desviación GPS'}</strong>
                <p className="text-[11px] opacity-90 mt-0.5">{validationResult.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 cols: Selected Polygon Details / Legend */}
        <div className="md:col-span-5 pointer-events-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 p-4 rounded-3xl shadow-2xl space-y-2">
          {selectedSuerte ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <strong className="text-sm text-white">{selectedSuerte.suerte.name}</strong>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  {selectedSuerte.cultivo}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>Finca: <strong className="text-white">{selectedSuerte.finca}</strong></div>
                <div>Lote: <strong className="text-white">{selectedSuerte.lote}</strong></div>
                <div>Área: <strong className="text-emerald-400">{selectedSuerte.suerte.hectareas || 0} Ha</strong></div>
                <div>Estado: <strong className="text-cyan-400">{selectedSuerte.suerte.estadoProductivo || 'Activo'}</strong></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Leyenda de Capas Jerárquicas</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Caña (Verde)</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /> Café (Ámbar)</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500" /> Aguacate (Púrpura)</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500" /> Labores OT (Azul)</div>
              </div>
              <p className="text-[10px] text-slate-400">Haz clic en cualquier suerte para ver su ficha y georreferencia.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
