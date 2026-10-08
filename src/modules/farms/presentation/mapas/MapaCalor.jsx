import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAgro } from '@/providers/AgroContext';
import { initialData } from '@/providers/mocks';
import { 
  Map as MapIcon, 
  Satellite, 
  Layers, 
  Filter, 
  MapPin, 
  Sparkles, 
  Search, 
  Maximize2, 
  Minimize2,
  ChevronDown,
  ChevronUp,
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
  Layers3,
  Dot,
  RotateCcw,
  X,
  Flame,
  Users,
  Tractor,
  Trees,
  Settings,
  Radio,
  Gauge,
  Sliders,
  Plus,
  Zap,
  Check,
  RefreshCw
} from 'lucide-react';
import { notifySuccess, notifyError } from '@/utils/swal';

export default function MapaCalor() {
  const { 
    registrosControles, 
    controlesAgro, 
    sectores, 
    planificaciones, 
    maquinarias, 
    trabajadores, 
    cuadrillas, 
    cultivos,
    globalCultivo 
  } = useAgro();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  const heatLayerGroup = useRef(null);
  const baseTileLayer = useRef(null);

  // ── GIS Modes ──────────────────────────────────────────────────────────
  // 'catastro': Lotes, Geocercas & Vértices
  // 'calor': Mapa de Calor & Muestreos Fitosanitarios
  // 'personal': Tracking de Cuadrillas & Personal en Campo
  // 'maquinaria': Tracking de Maquinaria & Telemetría IoT
  // 'palmas': Censo Individual Planta a Planta (Palmas/Árboles)
  const [gisMode, setGisMode] = useState(() => {
    return localStorage.getItem('agro_gis_mode') || 'catastro';
  });

  // Base map type: 'satellite' | 'osm' | 'dark'
  const [mapType, setMapType] = useState(() => {
    return localStorage.getItem('agro_gis_map_type') || 'satellite';
  });

  useEffect(() => {
    try {
      localStorage.setItem('agro_gis_mode', gisMode);
    } catch (e) {}
  }, [gisMode]);

  useEffect(() => {
    try {
      localStorage.setItem('agro_gis_map_type', mapType);
    } catch (e) {}
  }, [mapType]);

  // Selections and toggles
  const [selectedSuerte, setSelectedSuerte] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null); // Worker, Machine, or Palm
  const [showNdviSimulation, setShowNdviSimulation] = useState(false);
  const [showVertexPoints, setShowVertexPoints] = useState(true);
  const [showLoteBounds, setShowLoteBounds] = useState(true);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Filter states
  const [filterPestSeverity, setFilterPestSeverity] = useState('all'); // 'all' | 'high' | 'critical'
  const [palmFilterStatus, setPalmFilterStatus] = useState('all'); // 'all' | 'Sana' | 'Alerta' | 'Enferma' | 'Vacio'

  // Geofence GPS Simulator & Validator state
  const [testGps, setTestGps] = useState({ lat: '3.5285', lng: '-76.2980' });
  const [validationResult, setValidationResult] = useState(null);

  // Configuration settings for Plant Census
  const [palmSettings, setPalmSettings] = useState(() => {
    try {
      const s = localStorage.getItem('agro_gis_palm_settings');
      if (s) return JSON.parse(s);
    } catch (e) {}
    return {
      distanciaSiembra: 9, // 9m marco triangular tresbolillo
      variedad: 'Tenera Guineensis x Oleifera',
      anodeSiembra: 2021,
      densidadHa: 143
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('agro_gis_palm_settings', JSON.stringify(palmSettings));
    } catch (e) {}
  }, [palmSettings]);

  // ── Helper recursivo para extraer todas las suertes y lotes ─────────────
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

      if (node.type === 'Lote' || (node.suertes && Array.isArray(node.suertes))) {
        lotes.push({
          ...node,
          name: node.name || node.nombre || `Lote ${node.id}`,
          fincaName: currentCtx.finca,
          sectorName: currentCtx.sector
        });
      }

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

      if (node.zonas && Array.isArray(node.zonas)) node.zonas.forEach(child => traverse(child, currentCtx));
      if (node.sectores && Array.isArray(node.sectores)) node.sectores.forEach(child => traverse(child, currentCtx));
      if (node.fincas && Array.isArray(node.fincas)) node.fincas.forEach(child => traverse(child, currentCtx));
      if (node.lotes && Array.isArray(node.lotes)) node.lotes.forEach(child => traverse(child, currentCtx));
    };

    (nodes || []).forEach(n => traverse(n));
    return { suertes, lotes };
  };

  // Safe fallback to initialData if sectores is ever empty
  const rawSectores = useMemo(() => {
    if (sectores && Array.isArray(sectores) && sectores.length > 0) return sectores;
    try {
      const saved = localStorage.getItem('agro_sectores');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialData;
  }, [sectores]);

  const { suertes: allSuertes, lotes: allLotes } = useMemo(() => extractAllSuertesAndLotes(rawSectores), [rawSectores]);

  // Superficie y estadísticas
  const totalSuertesCount = allSuertes.length;
  const totalHaCount = allSuertes.reduce((acc, s) => acc + Number(s.hectareas || 0), 0);

  // Centroide o punto base de referencia
  const defaultCenter = useMemo(() => {
    if (allSuertes.length > 0 && allSuertes[0].geometria && allSuertes[0].geometria[0]) {
      return allSuertes[0].geometria[0];
    }
    return [3.5285, -76.2980];
  }, [allSuertes]);

  // ── Generador / Modelado de Tracking de Personal en Campo ────────────────
  const workersTelemetry = useMemo(() => {
    const list = [];
    const baseNames = [
      { name: 'Carlos Benítez', rol: 'Evaluador Fitosanitario', cuadrilla: 'Cuadrilla Sanidad A', estado: 'En Labor' },
      { name: 'María Cardona', rol: 'Supervisora de Cosecha', cuadrilla: 'Cuadrilla Corte 1', estado: 'En Labor' },
      { name: 'Javier Restrepo', rol: 'Operario Fumigador', cuadrilla: 'Cuadrilla Aplicación', estado: 'En Desplazamiento' },
      { name: 'Andrés Morales', rol: 'Agrónomo de Campo', cuadrilla: 'Equipo Técnico', estado: 'En Labor' },
      { name: 'Laura Gómez', rol: 'Técnica de Riego', cuadrilla: 'Cuadrilla Riego y Drenaje', estado: 'Pausa / Descanso' }
    ];

    allSuertes.forEach((st, idx) => {
      const wInfo = baseNames[idx % baseNames.length];
      if (st.geometria && st.geometria.length > 0) {
        const pt = st.geometria[0];
        const offsetLat = (Math.sin(idx * 2) * 0.0006);
        const offsetLng = (Math.cos(idx * 2) * 0.0006);
        list.push({
          id: `WRK-${idx + 101}`,
          nombre: wInfo.name,
          cargo: wInfo.rol,
          cuadrilla: wInfo.cuadrilla,
          estado: wInfo.estado,
          bateria: Math.floor(65 + Math.random() * 30),
          suerteName: st.name,
          fincaName: st.fincaName,
          lat: pt[0] + offsetLat,
          lng: pt[1] + offsetLng,
          ultimaActualizacion: 'Hace 2 min',
          cumplimientoGeocerca: true
        });
      }
    });

    return list;
  }, [allSuertes]);

  // ── Generador / Modelado de Telemetría de Maquinaria IoT ────────────────
  const machineryTelemetry = useMemo(() => {
    const list = [];
    const machinesRef = [
      { id: 'MAQ-01', codigo: 'TRAC-01', nombre: 'Tractor John Deere 6125M', tipo: 'Tractor Agrícola', implemento: 'Rastra 24 Discos', op: 'Jorge Salazar', vel: '6.4 km/h', estado: 'Operando', rpm: 1850, fuel: '78%' },
      { id: 'MAQ-02', codigo: 'COS-01', nombre: 'Cosechadora Case IH 8800', tipo: 'Cosechadora Combinada', implemento: 'Cabezal Picador', op: 'Hernán Duque', vel: '4.2 km/h', estado: 'Operando', rpm: 2100, fuel: '62%' },
      { id: 'MAQ-03', codigo: 'FUM-01', nombre: 'Fumigadora Jacto Uniport 3030', tipo: 'Fumigadora Autopropulsada', implemento: 'Barra 28m', op: 'Fabián Ortiz', vel: '12.0 km/h', estado: 'Operando', rpm: 1600, fuel: '85%' },
      { id: 'MAQ-04', codigo: 'DRON-01', nombre: 'Dron DJI Agras T40', tipo: 'Dron de Pulverización', implemento: 'Atomizadores Centrífugos', op: 'David Sarria', vel: '22.5 km/h', estado: 'Operando', rpm: 0, fuel: '92% (Batería)' },
      { id: 'MAQ-05', codigo: 'CAM-01', nombre: 'Camión Alce Mercedes Axor', tipo: 'Transporte de Cosecha', implemento: 'Vagón Cañero', op: 'Mauricio Vivas', vel: '0.0 km/h', estado: 'En Espera', rpm: 750, fuel: '54%' }
    ];

    allSuertes.forEach((st, idx) => {
      if (idx < machinesRef.length && st.geometria && st.geometria.length > 1) {
        const mInfo = machinesRef[idx];
        const pt = st.geometria[Math.min(1, st.geometria.length - 1)];
        list.push({
          ...mInfo,
          suerteName: st.name,
          fincaName: st.fincaName,
          lat: pt[0] + (Math.cos(idx * 3) * 0.0005),
          lng: pt[1] + (Math.sin(idx * 3) * 0.0005),
          horometro: `${(1420 + idx * 85).toFixed(1)} h`,
          ultimaConexion: 'En línea (GPS Activo)'
        });
      }
    });

    return list;
  }, [allSuertes]);

  // ── Generador / Modelado de Censo Individual Palma a Palma ──────────────
  const [palmsList, setPalmsList] = useState(() => {
    try {
      const s = localStorage.getItem('agro_gis_palms');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length > 0) return p;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    if (allSuertes.length === 0) return;
    const targetSuerte = selectedSuerte ? selectedSuerte.suerte : allSuertes[0];
    if (!targetSuerte || !targetSuerte.geometria || targetSuerte.geometria.length < 3) return;

    // If already generated and has matching target, keep
    if (palmsList.length > 0 && palmsList[0].suerteName === targetSuerte.name) return;

    const baseLat = targetSuerte.geometria[0][0];
    const baseLng = targetSuerte.geometria[0][1];
    const generated = [];

    const rows = 6;
    const cols = 8;
    const stepLat = 0.00018;
    const stepLng = 0.00020;
    const statuses = ['Sana', 'Sana', 'Sana', 'Sana', 'Alerta', 'Enferma', 'Vacio'];

    let count = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offsetC = (r % 2 === 1) ? stepLng * 0.5 : 0;
        const pLat = baseLat + (r - rows / 2) * stepLat;
        const pLng = baseLng + (c - cols / 2) * stepLng + offsetC;
        const status = statuses[(r * cols + c) % statuses.length];
        
        let diagnostico = 'Palma vigorosa y productiva';
        if (status === 'Alerta') diagnostico = 'Deficiencia nutricional de Magnesio / Clorosis';
        if (status === 'Enferma') diagnostico = 'Foco de Pudrición de Cogollo (PC) en estadio inicial';
        if (status === 'Vacio') diagnostico = 'Sitio pendiente de resiembra';

        generated.push({
          id: `PALMA-${targetSuerte.name || 'L1'}-F${r + 1}-P${c + 1}`,
          codigo: `P-${String(count).padStart(3, '0')}`,
          fila: r + 1,
          posicion: c + 1,
          suerteName: targetSuerte.name,
          fincaName: targetSuerte.fincaName,
          lat: pLat,
          lng: pLng,
          estado: status,
          diagnostico,
          variedad: palmSettings.variedad,
          anoSiembra: palmSettings.anodeSiembra,
          racimosAno: status === 'Sana' ? Math.floor(14 + Math.random() * 6) : status === 'Alerta' ? 8 : 0,
          pesoPromedioRacimo: status === 'Sana' ? '21.5 kg' : '14.0 kg',
          ultimaInspeccion: '2026-09-28'
        });
        count++;
      }
    }

    setPalmsList(generated);
    try {
      localStorage.setItem('agro_gis_palms', JSON.stringify(generated));
    } catch (e) {}
  }, [allSuertes, selectedSuerte, palmSettings]);

  // CARTO Basemaps API Key oficial
  const CARTO_API_KEY = 'cb1_4dz5_1_6e0c0b2aaa6bc37eadf27bcd';

  // ── Inicializar mapa Leaflet Seguro ─────────────────────────────────────
  useEffect(() => {
    const initMap = () => {
      if (!mapInstance.current && window.L && mapRef.current) {
        mapInstance.current = window.L.map(mapRef.current, {
          zoomControl: false
        }).setView(defaultCenter, 14);

        window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

        const tileUrl = mapType === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : mapType === 'osm'
            ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            : `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`;

        baseTileLayer.current = window.L.tileLayer(tileUrl, {
          attribution: '© AgroGestión GIS / Esri / CARTO / OSM'
        }).addTo(mapInstance.current);

        markersLayer.current = window.L.layerGroup().addTo(mapInstance.current);
        heatLayerGroup.current = window.L.layerGroup().addTo(mapInstance.current);

        mapInstance.current.on('click', (e) => {
          setTestGps({
            lat: e.latlng.lat.toFixed(5),
            lng: e.latlng.lng.toFixed(5)
          });
        });
      }
    };

    initMap();
    const timer = setTimeout(initMap, 250);
    return () => clearTimeout(timer);
  }, []);

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

  // Handler para re-centrar el mapa
  const handleResetMapView = () => {
    if (!mapInstance.current || !window.L) return;
    const allPoints = [];
    allSuertes.forEach(s => {
      if (s.geometria && Array.isArray(s.geometria)) {
        s.geometria.forEach(pt => {
          if (Array.isArray(pt) && pt.length >= 2) allPoints.push(pt);
        });
      }
    });
    if (allPoints.length > 0) {
      mapInstance.current.fitBounds(window.L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 16 });
    }
  };

  // ── RENDERIZADO DINÁMICO DE CAPAS SEGÚN MODO GIS SELECCIONADO ───────────
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current || !window.L) return;

    markersLayer.current.clearLayers();
    if (heatLayerGroup.current) heatLayerGroup.current.clearLayers();

    const boundsPoints = [];

    // ── 1. CAPA BASE DE GEOCERCAS / POLÍGONOS DE SUERTES ──────────────────
    allSuertes.forEach(suerte => {
      if (suerte.geometria && Array.isArray(suerte.geometria) && suerte.geometria.length >= 3) {
        let strokeColor = '#10b981';
        let fillColor = '#10b981';
        let fillOpacity = 0.35;

        if (showNdviSimulation) {
          const hash = (suerte.name || suerte.id || 'A').charCodeAt(0) % 3;
          fillColor = hash === 0 ? '#10b981' : hash === 1 ? '#fbbf24' : '#ef4444';
          strokeColor = hash === 0 ? '#059669' : hash === 1 ? '#d97706' : '#dc2626';
          fillOpacity = 0.65;
        } else if (gisMode === 'palmas') {
          fillColor = '#065F46';
          strokeColor = '#10B981';
          fillOpacity = 0.18;
        } else if (gisMode === 'calor') {
          fillColor = '#1E293B';
          strokeColor = '#64748B';
          fillOpacity = 0.20;
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
          weight: gisMode === 'catastro' ? 2.5 : 1.5,
          fillColor: fillColor,
          fillOpacity: fillOpacity,
          dashArray: showLoteBounds ? '4, 4' : null
        }).addTo(markersLayer.current);

        suerte.geometria.forEach((pt, vertexIdx) => {
          if (Array.isArray(pt) && pt.length >= 2) {
            boundsPoints.push(pt);

            // Vértices punto a punto solo en Modo Catastro
            if (gisMode === 'catastro' && showVertexPoints) {
              const vertexMarker = window.L.circleMarker(pt, {
                radius: 4.5,
                fillColor: '#ffffff',
                color: strokeColor,
                weight: 2,
                opacity: 1,
                fillOpacity: 1
              }).addTo(markersLayer.current);

              vertexMarker.bindTooltip(`
                <div style="font-size: 11px; font-weight: 600; padding: 2px;">
                  <span style="color: ${strokeColor}; font-weight: bold;">📍 Vértice ${vertexIdx + 1} - ${suerte.name}</span><br/>
                  <span style="font-family: monospace; color: #475569;">${pt[0].toFixed(5)}, ${pt[1].toFixed(5)}</span>
                </div>
              `, { sticky: true, className: 'leaflet-custom-tooltip' });

              vertexMarker.on('click', (e) => {
                window.L.DomEvent.stopPropagation(e);
                setTestGps({
                  lat: pt[0].toFixed(5),
                  lng: pt[1].toFixed(5)
                });
                setSelectedSuerte({
                  suerte,
                  lote: suerte.loteName,
                  finca: suerte.fincaName,
                  sector: suerte.sectorName,
                  cultivo: suerte.cultivo || 'Caña de Azúcar',
                  selectedVertex: { index: vertexIdx + 1, lat: pt[0], lng: pt[1] }
                });
              });
            }
          }
        });

        polygon.on('click', () => {
          setSelectedSuerte({
            suerte,
            lote: suerte.loteName,
            finca: suerte.fincaName,
            sector: suerte.sectorName,
            cultivo: suerte.cultivo || 'Caña de Azúcar'
          });
          setSelectedEntity(null);
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

    // ── 2. MODO CALOR: MAPA DE CALOR & MUESTREOS AGRONÓMICOS ──────────────
    if (gisMode === 'calor') {
      const baseLat = boundsPoints.length > 0 ? boundsPoints[0][0] : 3.5285;
      const baseLng = boundsPoints.length > 0 ? boundsPoints[0][1] : -76.2980;

      const heatPoints = [
        { lat: baseLat + 0.0015, lng: baseLng - 0.0010, severidad: 38, plaga: 'Diatraea saccharalis (Barrenador)', nivel: 'Crítico', color: '#ef4444' },
        { lat: baseLat + 0.0005, lng: baseLng + 0.0012, severidad: 24, plaga: 'Spodoptera frugiperda (Gusano Cogollero)', nivel: 'Alto', color: '#f97316' },
        { lat: baseLat - 0.0010, lng: baseLng + 0.0005, severidad: 12, plaga: 'Rhynchophorus palmarum (Picudo)', nivel: 'Medio', color: '#eab308' },
        { lat: baseLat + 0.0020, lng: baseLng + 0.0018, severidad: 4, plaga: 'Puccinia melanocephala (Roya)', nivel: 'Bajo', color: '#10b981' },
        { lat: baseLat - 0.0015, lng: baseLng - 0.0015, severidad: 28, plaga: 'Mahanarva andigena (Salivazo)', nivel: 'Alto', color: '#f97316' },
        { lat: baseLat - 0.0005, lng: baseLng - 0.0020, severidad: 42, plaga: 'Pudrición del Cogollo (PC)', nivel: 'Crítico', color: '#dc2626' }
      ];

      heatPoints.forEach((hp, idx) => {
        if (filterPestSeverity === 'critical' && hp.nivel !== 'Crítico') return;
        if (filterPestSeverity === 'high' && hp.nivel !== 'Crítico' && hp.nivel !== 'Alto') return;

        window.L.circle([hp.lat, hp.lng], {
          radius: 80 + hp.severidad * 2.5,
          color: hp.color,
          fillColor: hp.color,
          fillOpacity: 0.28,
          weight: 1.5,
          dashArray: '3, 3'
        }).addTo(markersLayer.current);

        const heatPin = window.L.circleMarker([hp.lat, hp.lng], {
          radius: 9,
          fillColor: hp.color,
          color: '#ffffff',
          weight: 3,
          fillOpacity: 1
        }).addTo(markersLayer.current);

        heatPin.bindPopup(`
          <div style="font-size: 12px; color: #1e293b; padding: 4px; min-width: 180px;">
            <div style="font-weight: 800; color: ${hp.color}; font-size: 13px; margin-bottom: 4px;">
              🌡️ Foco Fitosanitario #${idx + 1}
            </div>
            <strong>Plaga/Enfermedad:</strong> ${hp.plaga}<br/>
            <strong>Incidencia/Severidad:</strong> <span style="font-weight: bold; color: ${hp.color};">${hp.severidad}% (${hp.nivel})</span><br/>
            <strong>GPS:</strong> ${hp.lat.toFixed(4)}, ${hp.lng.toFixed(4)}<br/>
            <div style="margin-top: 6px; padding: 4px 6px; background: #f1f5f9; border-radius: 6px; font-size: 11px;">
              ⚠️ <em>Acción sugerida: Aplicación biológica / trampeo focalizado.</em>
            </div>
          </div>
        `);

        heatPin.on('click', () => {
          setSelectedEntity({
            type: 'calor',
            title: `Foco Fitosanitario: ${hp.plaga}`,
            severidad: `${hp.severidad}%`,
            nivel: hp.nivel,
            color: hp.color,
            lat: hp.lat,
            lng: hp.lng,
            detalles: 'Muestreo evaluado mediante protocolo fitosanitario en 50 plantas muestra.'
          });
        });
      });
    }

    // ── 3. MODO PERSONAL: TRACKING DE OPERARIOS & CUADRILLAS ─────────────
    if (gisMode === 'personal') {
      workersTelemetry.forEach(w => {
        const workerMarker = window.L.circleMarker([w.lat, w.lng], {
          radius: 9,
          fillColor: w.estado === 'En Labor' ? '#10b981' : w.estado === 'En Desplazamiento' ? '#3b82f6' : '#f59e0b',
          color: '#ffffff',
          weight: 3,
          fillOpacity: 1
        }).addTo(markersLayer.current);

        workerMarker.bindTooltip(`
          <div style="font-size: 12px; font-weight: bold; color: #1e293b; padding: 2px;">
            👤 ${w.nombre}<br/>
            <span style="font-size: 10px; color: #64748b;">${w.cargo} · ${w.estado}</span>
          </div>
        `, { sticky: true });

        workerMarker.on('click', () => {
          setSelectedEntity({
            type: 'personal',
            ...w
          });
        });
      });
    }

    // ── 4. MODO MAQUINARIA: TELEMETRÍA IOT & EQUIPOS ──────────────────────
    if (gisMode === 'maquinaria') {
      machineryTelemetry.forEach(m => {
        const iconColor = m.estado === 'Operando' ? '#3b82f6' : '#f59e0b';
        
        const machineMarker = window.L.circleMarker([m.lat, m.lng], {
          radius: 11,
          fillColor: iconColor,
          color: '#ffffff',
          weight: 3,
          fillOpacity: 1
        }).addTo(markersLayer.current);

        machineMarker.bindTooltip(`
          <div style="font-size: 12px; font-weight: bold; color: #1e293b; padding: 2px;">
            🚜 ${m.nombre}<br/>
            <span style="font-size: 10px; color: #64748b;">Vel: ${m.vel} | Operador: ${m.op}</span>
          </div>
        `, { sticky: true });

        machineMarker.on('click', () => {
          setSelectedEntity({
            type: 'maquinaria',
            ...m
          });
        });
      });
    }

    // ── 5. MODO CENSO PALMA A PALMA / ÁRBOL A ÁRBOL ───────────────────────
    if (gisMode === 'palmas') {
      palmsList.forEach(p => {
        if (palmFilterStatus !== 'all' && p.estado !== palmFilterStatus) return;

        let dotColor = '#10b981';
        if (p.estado === 'Alerta') dotColor = '#f59e0b';
        if (p.estado === 'Enferma') dotColor = '#ef4444';
        if (p.estado === 'Vacio') dotColor = '#94a3b8';

        const palmMarker = window.L.circleMarker([p.lat, p.lng], {
          radius: 5,
          fillColor: dotColor,
          color: '#ffffff',
          weight: 1.5,
          fillOpacity: 0.95
        }).addTo(markersLayer.current);

        palmMarker.bindTooltip(`
          <div style="font-size: 11px; font-weight: 600; padding: 2px;">
            <strong style="color: ${dotColor};">${p.codigo} (${p.id})</strong><br/>
            <span>Fila ${p.fila}, Palma ${p.posicion}</span><br/>
            <span>Estado: <strong>${p.estado}</strong></span>
          </div>
        `, { sticky: true });

        palmMarker.on('click', (e) => {
          window.L.DomEvent.stopPropagation(e);
          setSelectedEntity({
            type: 'palma',
            ...p
          });
        });
      });
    }

    // Auto-fit on initial render or view update
    if (boundsPoints.length > 0 && mapInstance.current) {
      try {
        mapInstance.current.invalidateSize();
        if (!mapInstance.current._hasInitialFit) {
          mapInstance.current.fitBounds(window.L.latLngBounds(boundsPoints), { padding: [40, 40], maxZoom: 16 });
          mapInstance.current._hasInitialFit = true;
        }
      } catch (e) {}
    }

  }, [allSuertes, gisMode, showNdviSimulation, showLoteBounds, showVertexPoints, mapType, filterPestSeverity, palmFilterStatus, palmsList, workersTelemetry, machineryTelemetry]);

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
      
      {/* ── TOP FLOATING CONTROL SUITE ────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col gap-2.5 pointer-events-none">
        
        {/* ROW 1: GIS Mode Selector Tabs (5 Specialized Maps) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          
          <div className="flex flex-wrap items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700/70 p-1.5 rounded-2xl shadow-2xl">
            
            {/* 1. Catastro & Geocercas */}
            <button
              onClick={() => { setGisMode('catastro'); setSelectedEntity(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                gisMode === 'catastro'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <MapIcon size={15} />
              <span>1. Lotes & Geocercas</span>
            </button>

            {/* 2. Mapa de Calor & Muestreos */}
            <button
              onClick={() => { setGisMode('calor'); setSelectedEntity(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                gisMode === 'calor'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Flame size={15} />
              <span>2. Mapa de Calor (Sanidad)</span>
            </button>

            {/* 3. Tracking Personal */}
            <button
              onClick={() => { setGisMode('personal'); setSelectedEntity(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                gisMode === 'personal'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Users size={15} />
              <span>3. Tracking Personal</span>
            </button>

            {/* 4. Tracking Maquinaria */}
            <button
              onClick={() => { setGisMode('maquinaria'); setSelectedEntity(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                gisMode === 'maquinaria'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Tractor size={15} />
              <span>4. Tracking Maquinaria</span>
            </button>

            {/* 5. Censo Palma a Palma */}
            <button
              onClick={() => { setGisMode('palmas'); setSelectedEntity(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                gisMode === 'palmas'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Trees size={15} />
              <span>5. Censo Palma a Palma</span>
            </button>

          </div>

          {/* Right GIS Controls & Config */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 px-3 py-2 rounded-2xl text-xs font-bold shadow-2xl text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all pointer-events-auto"
              title="Configuración de Parámetros GIS y Censos"
            >
              <Settings size={15} className="text-emerald-500" />
              <span className="hidden sm:inline">Configurar GIS</span>
            </button>

            <button
              onClick={() => setIsPanelMinimized(!isPanelMinimized)}
              className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 px-3 py-2 rounded-2xl text-xs font-bold shadow-2xl text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all pointer-events-auto"
              title={isPanelMinimized ? "Expandir panel inferior" : "Minimizar panel para ver todo el mapa"}
            >
              {isPanelMinimized ? (
                <>
                  <ChevronUp size={16} className="text-emerald-500" />
                  <span className="hidden sm:inline">Mostrar Panel</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="text-slate-500" />
                  <span className="hidden sm:inline">Minimizar</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* ROW 2: Sub-toolbar for Tile Layers & Contextual Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          
          <div className="flex flex-wrap items-center gap-1.5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 p-1.5 rounded-2xl shadow-xl text-xs">
            
            {/* Basemap Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.06] p-1 rounded-xl">
              <button
                onClick={() => setMapType('satellite')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mapType === 'satellite' ? 'bg-emerald-600 text-white shadow' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                🛰️ Satélite
              </button>
              <button
                onClick={() => setMapType('osm')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mapType === 'osm' ? 'bg-blue-600 text-white shadow' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                🗺️ Calles
              </button>
              <button
                onClick={() => setMapType('dark')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mapType === 'dark' ? 'bg-indigo-600 text-white shadow' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                🌙 Carto Dark
              </button>
            </div>

            {/* Contextual Filters for Calor Mode */}
            {gisMode === 'calor' && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500">Severidad:</span>
                <select
                  value={filterPestSeverity}
                  onChange={e => setFilterPestSeverity(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                >
                  <option value="all">Todas las alertas</option>
                  <option value="high">Altas y Críticas (&gt;15%)</option>
                  <option value="critical">Solo Críticas (&gt;30%)</option>
                </select>
              </div>
            )}

            {/* Contextual Filters for Palma a Palma Mode */}
            {gisMode === 'palmas' && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500">Filtrar Palmas:</span>
                <select
                  value={palmFilterStatus}
                  onChange={e => setPalmFilterStatus(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                >
                  <option value="all">Todas ({palmsList.length} palmas)</option>
                  <option value="Sana">🟢 Sanas</option>
                  <option value="Alerta">🟡 En Observación / Alerta</option>
                  <option value="Enferma">🔴 Enfermas (PC / Focos)</option>
                  <option value="Vacio">⚪ Sitios Vacíos</option>
                </select>
              </div>
            )}

            {/* Vertex toggle in Catastro */}
            {gisMode === 'catastro' && (
              <button
                onClick={() => setShowVertexPoints(!showVertexPoints)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  showVertexPoints ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                <MapPin size={13} />
                <span>{showVertexPoints ? 'Vértices ON' : 'Vértices OFF'}</span>
              </button>
            )}

            {/* NDVI Toggle */}
            <button
              onClick={() => setShowNdviSimulation(!showNdviSimulation)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                showNdviSimulation ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Sparkles size={13} />
              <span>{showNdviSimulation ? 'NDVI Activo' : 'NDVI Satelital'}</span>
            </button>

            {/* Reset View */}
            <button
              onClick={handleResetMapView}
              title="Centrar mapa a todas las geocercas"
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <RotateCcw size={13} />
            </button>

          </div>

          {/* Mode Summary Indicator */}
          <div className="hidden lg:flex items-center gap-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 px-3.5 py-1.5 rounded-2xl text-xs shadow-xl text-slate-800 dark:text-white">
            <span className="text-slate-500 dark:text-slate-400">Total Delimitado:</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{totalHaCount.toFixed(1)} Ha</strong>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">Modo Activo:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">
              {gisMode === 'catastro' && 'Catastro & Geocercas'}
              {gisMode === 'calor' && 'Sanidad & Focos'}
              {gisMode === 'personal' && `${workersTelemetry.length} Operarios`}
              {gisMode === 'maquinaria' && `${machineryTelemetry.length} Maquinarias`}
              {gisMode === 'palmas' && `${palmsList.length} Palmas Censadas`}
            </span>
          </div>

        </div>

      </div>

      {/* ── LEAFLET MAP CONTAINER ─────────────────────────────────────── */}
      <div ref={mapRef} className="h-full w-full z-0 relative" />

      {/* ── BOTTOM DRAWER & INTERACTIVE INSPECTION PANELS ─────────────── */}
      {isPanelMinimized ? (
        /* Floating Minimized Pill */
        <div className="absolute bottom-4 right-4 z-[400] pointer-events-auto">
          <button
            onClick={() => setIsPanelMinimized(false)}
            className="flex items-center gap-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/70 px-4 py-2.5 rounded-2xl shadow-2xl text-slate-800 dark:text-white hover:border-emerald-500 transition-all group"
          >
            <Navigation size={16} className="text-cyan-500 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-xs font-extrabold flex items-center gap-2">
                <span>Panel GIS: {gisMode.toUpperCase()}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-bold">Minimizado</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Clic para abrir validador, telemetría y detalles</p>
            </div>
            <ChevronUp size={18} className="text-slate-400 group-hover:text-emerald-500 ml-1 transition-colors" />
          </button>
        </div>
      ) : (
        /* Expanded Grid Drawer */
        <div className="absolute bottom-4 left-4 right-4 z-[400] grid grid-cols-1 md:grid-cols-12 gap-3 pointer-events-none transition-all duration-300">
          
          {/* LEFT 7 COLS: Action Tool according to Active GIS Mode */}
          <div className="md:col-span-7 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/70 p-4 rounded-3xl shadow-2xl space-y-3 text-slate-800 dark:text-slate-100">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                {gisMode === 'catastro' && <Navigation size={16} className="text-emerald-500" />}
                {gisMode === 'calor' && <Flame size={16} className="text-rose-500" />}
                {gisMode === 'personal' && <Users size={16} className="text-purple-500" />}
                {gisMode === 'maquinaria' && <Tractor size={16} className="text-blue-500" />}
                {gisMode === 'palmas' && <Trees size={16} className="text-amber-500" />}
                
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  {gisMode === 'catastro' && 'Validador de Geocerca GPS en Terreno'}
                  {gisMode === 'calor' && 'Nivel de Muestreos & Severidad Fitosanitaria'}
                  {gisMode === 'personal' && 'Supervisión y Cuadrillas en Terreno'}
                  {gisMode === 'maquinaria' && 'Telemetría y Control de Flota Agrícola'}
                  {gisMode === 'palmas' && `Censo Botánico Individual: ${selectedSuerte ? selectedSuerte.suerte.name : 'Palmar Principal'}`}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AgroGestión GIS v2.5
                </span>
                <button
                  onClick={() => setIsPanelMinimized(true)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
                  title="Minimizar panel"
                >
                  <Minimize2 size={14} />
                </button>
              </div>
            </div>

            {/* Content for Mode 1: Catastro & GPS Validator */}
            {gisMode === 'catastro' && (
              <>
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
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
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
              </>
            )}

            {/* Content for Mode 2: Mapa de Calor / Sanidad */}
            {gisMode === 'calor' && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                    <span className="text-[10px] text-rose-600 font-bold block">Focos Críticos (&gt;30%)</span>
                    <strong className="text-base text-rose-600 font-extrabold">2 Lotes</strong>
                  </div>
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <span className="text-[10px] text-amber-600 font-bold block">Infestación Moderada</span>
                    <strong className="text-base text-amber-600 font-extrabold">3 Lotes</strong>
                  </div>
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <span className="text-[10px] text-emerald-600 font-bold block">Área Bajo Control</span>
                    <strong className="text-base text-emerald-600 font-extrabold">85% Ha</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Los círculos de calor representan la densidad de incidencia fitosanitaria. Haz clic en cualquier foco en el mapa para ver el protocolo de control y diagnóstico.
                </p>
              </div>
            )}

            {/* Content for Mode 3: Personal Tracking */}
            {gisMode === 'personal' && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                  {workersTelemetry.map((w, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedEntity({ type: 'personal', ...w })}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 cursor-pointer hover:border-purple-500 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 dark:text-white text-[11px] truncate">{w.nombre}</strong>
                        <span className={`w-2 h-2 rounded-full ${w.estado === 'En Labor' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">{w.cargo}</span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">{w.suerteName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content for Mode 4: Machinery Telemetry */}
            {gisMode === 'maquinaria' && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                  {machineryTelemetry.map((m, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedEntity({ type: 'maquinaria', ...m })}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 cursor-pointer hover:border-blue-500 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 dark:text-white text-[11px] truncate">{m.codigo}</strong>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{m.vel}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">{m.nombre}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{m.implemento}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content for Mode 5: Palma a Palma */}
            {gisMode === 'palmas' && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <span className="text-[10px] text-emerald-600 font-bold block">🟢 Sanas</span>
                    <strong className="text-sm text-emerald-600 font-extrabold">
                      {palmsList.filter(p => p.estado === 'Sana').length}
                    </strong>
                  </div>
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <span className="text-[10px] text-amber-600 font-bold block">🟡 Alerta</span>
                    <strong className="text-sm text-amber-600 font-extrabold">
                      {palmsList.filter(p => p.estado === 'Alerta').length}
                    </strong>
                  </div>
                  <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <span className="text-[10px] text-rose-600 font-bold block">🔴 Enfermas</span>
                    <strong className="text-sm text-rose-600 font-extrabold">
                      {palmsList.filter(p => p.estado === 'Enferma').length}
                    </strong>
                  </div>
                  <div className="p-2 bg-slate-500/10 border border-slate-500/20 rounded-xl">
                    <span className="text-[10px] text-slate-500 font-bold block">⚪ Vacíos</span>
                    <strong className="text-sm text-slate-500 font-extrabold">
                      {palmsList.filter(p => p.estado === 'Vacio').length}
                    </strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Censo georreferenciado a marco {palmSettings.distanciaSiembra}m x {palmSettings.distanciaSiembra}m. Haz clic en cualquier punto de palma para ver su historial, diagnóstico y racimos producidos.
                </p>
              </div>
            )}

          </div>

          {/* RIGHT 5 COLS: Selected Entity Details or Agronomic Legend */}
          <div className="md:col-span-5 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/70 p-4 rounded-3xl shadow-2xl space-y-2 text-slate-800 dark:text-slate-100">
            
            {/* If a specific entity (Worker, Machine, or Palm) is selected */}
            {selectedEntity ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    {selectedEntity.type === 'palma' && <Trees size={15} className="text-amber-500" />}
                    {selectedEntity.type === 'personal' && <Users size={15} className="text-purple-500" />}
                    {selectedEntity.type === 'maquinaria' && <Tractor size={15} className="text-blue-500" />}
                    {selectedEntity.type === 'calor' && <Flame size={15} className="text-rose-500" />}
                    <strong className="text-sm text-slate-900 dark:text-white font-bold">
                      {selectedEntity.nombre || selectedEntity.title || selectedEntity.id}
                    </strong>
                  </div>
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Palm details */}
                {selectedEntity.type === 'palma' && (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>Posición: <strong>Fila {selectedEntity.fila} · Palma {selectedEntity.posicion}</strong></div>
                      <div>Estado: <strong className={`font-bold ${selectedEntity.estado === 'Sana' ? 'text-emerald-600' : selectedEntity.estado === 'Alerta' ? 'text-amber-600' : 'text-rose-600'}`}>{selectedEntity.estado}</strong></div>
                      <div>Variedad: <strong className="text-slate-800 dark:text-slate-200">{selectedEntity.variedad}</strong></div>
                      <div>Año Siembra: <strong>{selectedEntity.anoSiembra}</strong></div>
                      <div>Racimos/Año: <strong className="text-emerald-600 font-bold">{selectedEntity.racimosAno} racimos</strong></div>
                      <div>Peso Promedio: <strong>{selectedEntity.pesoPromedioRacimo}</strong></div>
                    </div>
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px]">
                      <strong>Diagnóstico:</strong> {selectedEntity.diagnostico}
                    </div>
                  </div>
                )}

                {/* Worker details */}
                {selectedEntity.type === 'personal' && (
                  <div className="space-y-1.5 text-[11px]">
                    <div>Cargo: <strong>{selectedEntity.cargo}</strong></div>
                    <div>Cuadrilla: <strong>{selectedEntity.cuadrilla}</strong></div>
                    <div>Ubicación: <strong>{selectedEntity.suerteName} ({selectedEntity.fincaName})</strong></div>
                    <div>Estado: <strong className="text-emerald-600 font-bold">{selectedEntity.estado}</strong></div>
                    <div>Batería Dispositivo GPS: <strong>{selectedEntity.bateria}%</strong></div>
                    <div>Geocerca: <strong className="text-emerald-600">✓ En Polígono Asignado</strong></div>
                  </div>
                )}

                {/* Machine details */}
                {selectedEntity.type === 'maquinaria' && (
                  <div className="space-y-1.5 text-[11px]">
                    <div>Tipo: <strong>{selectedEntity.tipo}</strong></div>
                    <div>Implemento: <strong>{selectedEntity.implemento}</strong></div>
                    <div>Operador: <strong>{selectedEntity.op}</strong></div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>Velocidad: <strong className="text-blue-600 font-bold">{selectedEntity.vel}</strong></div>
                      <div>Combustible: <strong>{selectedEntity.fuel}</strong></div>
                      <div>Horómetro: <strong>{selectedEntity.horometro}</strong></div>
                      <div>Estado: <strong className="text-emerald-600 font-bold">{selectedEntity.estado}</strong></div>
                    </div>
                  </div>
                )}

                {/* Heat point details */}
                {selectedEntity.type === 'calor' && (
                  <div className="space-y-1.5 text-[11px]">
                    <div>Nivel: <strong style={{ color: selectedEntity.color }}>{selectedEntity.nivel} ({selectedEntity.severidad})</strong></div>
                    <div>Coordenadas: <span className="font-mono text-[10px]">{selectedEntity.lat.toFixed(5)}, {selectedEntity.lng.toFixed(5)}</span></div>
                    <p className="text-slate-600 dark:text-slate-300">{selectedEntity.detalles}</p>
                  </div>
                )}
              </div>
            ) : selectedSuerte ? (
              /* Suerte / Lot Details */
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <strong className="text-sm text-slate-900 dark:text-white font-bold">{selectedSuerte.suerte.name}</strong>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-bold">
                      {selectedSuerte.cultivo}
                    </span>
                    <button
                      onClick={() => setSelectedSuerte(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title="Cerrar selección"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>Hacienda/Finca: <strong className="text-slate-900 dark:text-white">{selectedSuerte.finca}</strong></div>
                  <div>Lote: <strong className="text-slate-900 dark:text-white">{selectedSuerte.lote}</strong></div>
                  <div>Superficie: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{selectedSuerte.suerte.hectareas || 0} Ha</strong></div>
                  <div>Sector: <strong className="text-cyan-700 dark:text-cyan-400 font-bold">{selectedSuerte.sector}</strong></div>
                </div>
                {selectedSuerte.selectedVertex && (
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[11px] text-cyan-800 dark:text-cyan-300 flex items-center justify-between">
                    <span>📍 <strong>Vértice #{selectedSuerte.selectedVertex.index}</strong>: {selectedSuerte.selectedVertex.lat.toFixed(5)}, {selectedSuerte.selectedVertex.lng.toFixed(5)}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Default Agronomic Legend */
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Leyenda GIS Multicapa</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{allSuertes.length} Geocercas</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" /> Caña de Azúcar</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" /> Café Variedad Castillo</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" /> Aguacate Hass</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" /> Palma de Aceite</div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Selecciona cualquier modo en la barra superior para alternar entre Catastro, Focos de Calor, Personal, Maquinaria y Censo de Palmas.
                </p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ── MODAL DE CONFIGURACIÓN GIS & PARÁMETROS ────────────────────── */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="text-emerald-500" size={20} />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Configuración del Sistema GIS</h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-emerald-600 dark:text-emerald-400">
                Parámetros de Censo Palma a Palma / Árbol a Árbol
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Distancia de Siembra (m)</label>
                  <input 
                    type="number" 
                    value={palmSettings.distanciaSiembra} 
                    onChange={e => setPalmSettings({ ...palmSettings, distanciaSiembra: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Año de Siembra</label>
                  <input 
                    type="number" 
                    value={palmSettings.anodeSiembra} 
                    onChange={e => setPalmSettings({ ...palmSettings, anodeSiembra: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Variedad o Clon de Palma / Árbol</label>
                <input 
                  type="text" 
                  value={palmSettings.variedad} 
                  onChange={e => setPalmSettings({ ...palmSettings, variedad: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl space-y-1 text-[11px]">
                <span className="font-bold text-slate-900 dark:text-white block">📡 Fuente de Datos de Posicionamiento:</span>
                <p className="text-slate-500 dark:text-slate-400">Integración con CARTO Basemaps API & Esri World Imagery. Precisión submétrica georreferenciada.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg"
              >
                Guardar y Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
