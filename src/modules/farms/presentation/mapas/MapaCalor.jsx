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
  RefreshCw,
  User,
  Truck,
  Clock,
  Smartphone,
  Moon,
  Route,
  Footprints,
  ShieldAlert,
  BatteryCharging,
  TrendingUp,
  AlertOctagon,
  Timer
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
  const trailsLayer = useRef(null);
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
  const [showTrails, setShowTrails] = useState(true); // Mostrar trazas de ruta punto a punto
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedTrackingFilter, setSelectedTrackingFilter] = useState('all'); // 'all' or specific entity ID

  // Filter states
  const [filterPestSeverity, setFilterPestSeverity] = useState('all'); // 'all' | 'high' | 'critical'
  const [palmFilterStatus, setPalmFilterStatus] = useState('all'); // 'all' | 'Sana' | 'Alerta' | 'Enferma' | 'Vacio'

  // Geofence GPS Simulator & Validator state
  const [testGps, setTestGps] = useState({ lat: '3.5285', lng: '-76.2980' });
  const [validationResult, setValidationResult] = useState(null);

  // Configuration settings for Plant Census & Telemetry
  const [palmSettings, setPalmSettings] = useState(() => {
    try {
      const s = localStorage.getItem('agro_gis_palm_settings');
      if (s) return JSON.parse(s);
    } catch (e) {}
    return {
      distanciaSiembra: 9, // 9m marco triangular tresbolillo
      variedad: 'Tenera Guineensis x Oleifera',
      anodeSiembra: 2021,
      densidadHa: 143,
      umbralInactividadMin: 25 // minutos para alertar inactividad
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

  // ── INYECCIÓN AVANZADA: TRACKING DE PERSONAL CON RUTAS HISTÓRICAS ────────
  const workersTelemetry = useMemo(() => {
    const baseLat = defaultCenter[0];
    const baseLng = defaultCenter[1];

    return [
      {
        id: 'WRK-101',
        nombre: 'Carlos Benítez',
        cargo: 'Evaluador Fitosanitario',
        cuadrilla: 'Cuadrilla Sanidad A',
        estado: 'En Labor Activa',
        bateria: 82,
        suerteName: 'Suerte A-01 (Tablón Principal)',
        fincaName: 'Hacienda El Paraíso',
        lat: baseLat + 0.0003,
        lng: baseLng - 0.0002,
        esProductivo: true,
        distanciaTotal: '5.8 km',
        tiempoTotal: '5h 30m',
        tiempoProductivo: '4h 45m',
        tiempoImproductivo: '45m',
        porcentajeEficiencia: 86,
        tiempoDetenidoActual: 8, // min
        alertaParada: null,
        sensorMovimiento: 'Activo (Caminando / Muestreo)',
        ruta: [
          { lat: baseLat + 0.0035, lng: baseLng - 0.0040, hora: '06:30 AM', esProductivo: false, velocidad: '0.0 km/h', dwellMin: 15, lugar: 'Campamento Central (Salida)' },
          { lat: baseLat + 0.0025, lng: baseLng - 0.0028, hora: '07:05 AM', esProductivo: false, velocidad: '4.8 km/h', dwellMin: 5, lugar: 'Carretera Perimetral Norte' },
          { lat: baseLat + 0.0008, lng: baseLng - 0.0006, hora: '07:40 AM', esProductivo: true, velocidad: '2.5 km/h', dwellMin: 20, lugar: 'Suerte A-01 (Surco 1-20)' },
          { lat: baseLat + 0.0006, lng: baseLng - 0.0004, hora: '08:50 AM', esProductivo: true, velocidad: '2.2 km/h', dwellMin: 25, lugar: 'Suerte A-01 (Surco 21-40)' },
          { lat: baseLat + 0.0004, lng: baseLng - 0.0003, hora: '10:15 AM', esProductivo: true, velocidad: '2.8 km/h', dwellMin: 18, lugar: 'Suerte A-01 (Muestreo Barrenador)' },
          { lat: baseLat + 0.0003, lng: baseLng - 0.0002, hora: '11:30 AM', esProductivo: true, velocidad: '2.1 km/h', dwellMin: 8, lugar: 'Suerte A-01 (Punto Actual)' }
        ]
      },
      {
        id: 'WRK-102',
        nombre: 'María Cardona',
        cargo: 'Supervisora de Cosecha',
        cuadrilla: 'Cuadrilla Corte 1',
        estado: 'En Labor Activa',
        bateria: 94,
        suerteName: 'Suerte A-02 (Tablón Ribera)',
        fincaName: 'Hacienda El Paraíso',
        lat: baseLat - 0.0018,
        lng: baseLng - 0.0022,
        esProductivo: true,
        distanciaTotal: '7.4 km',
        tiempoTotal: '6h 00m',
        tiempoProductivo: '5h 20m',
        tiempoImproductivo: '40m',
        porcentajeEficiencia: 89,
        tiempoDetenidoActual: 12,
        alertaParada: null,
        sensorMovimiento: 'Activo (Supervisión de Frente)',
        ruta: [
          { lat: baseLat + 0.0035, lng: baseLng - 0.0040, hora: '06:00 AM', esProductivo: false, velocidad: '0.0 km/h', dwellMin: 20, lugar: 'Oficina de Campo' },
          { lat: baseLat + 0.0010, lng: baseLng - 0.0030, hora: '06:45 AM', esProductivo: false, velocidad: '14.0 km/h', dwellMin: 5, lugar: 'Traslado en Moto' },
          { lat: baseLat - 0.0012, lng: baseLng - 0.0020, hora: '07:30 AM', esProductivo: true, velocidad: '3.0 km/h', dwellMin: 30, lugar: 'Suerte A-02 (Frente de Corte)' },
          { lat: baseLat - 0.0015, lng: baseLng - 0.0021, hora: '09:15 AM', esProductivo: true, velocidad: '2.5 km/h', dwellMin: 35, lugar: 'Suerte A-02 (Inspección Calidad)' },
          { lat: baseLat - 0.0018, lng: baseLng - 0.0022, hora: '11:45 AM', esProductivo: true, velocidad: '1.8 km/h', dwellMin: 12, lugar: 'Suerte A-02 (Punto Actual)' }
        ]
      },
      {
        id: 'WRK-103',
        nombre: 'Javier Restrepo',
        cargo: 'Operario Fumigador',
        cuadrilla: 'Cuadrilla Aplicación',
        estado: 'Alerta: Inactivo / Dormido',
        bateria: 68,
        suerteName: 'Zona Perimetral (Fuera de Geocerca)',
        fincaName: 'Hacienda El Paraíso',
        lat: baseLat + 0.0022,
        lng: baseLng - 0.0035,
        esProductivo: false,
        distanciaTotal: '3.1 km',
        tiempoTotal: '5h 15m',
        tiempoProductivo: '2h 10m',
        tiempoImproductivo: '3h 05m',
        porcentajeEficiencia: 41,
        tiempoDetenidoActual: 48, // 48 minutos detenido!
        alertaParada: {
          tipo: 'Inactividad Prolongada',
          mensaje: 'DETENCIÓN CRÍTICA (48 min): El operario se encuentra inmóvil bajo sombra fuera del lote. Sensor del celular sin actividad ni aceleración (posible descanso no programado o pérdida de señal).',
          severidad: 'Alta'
        },
        sensorMovimiento: '💤 INMÓVIL (Sin Movimiento / Teléfono Estático)',
        ruta: [
          { lat: baseLat + 0.0035, lng: baseLng - 0.0040, hora: '06:30 AM', esProductivo: false, velocidad: '0.0 km/h', dwellMin: 15, lugar: 'Bodega de Agroquímicos' },
          { lat: baseLat + 0.0005, lng: baseLng - 0.0005, hora: '07:20 AM', esProductivo: true, velocidad: '2.0 km/h', dwellMin: 45, lugar: 'Suerte A-01 (Aplicación Folio)' },
          { lat: baseLat + 0.0002, lng: baseLng - 0.0002, hora: '08:40 AM', esProductivo: true, velocidad: '1.9 km/h', dwellMin: 50, lugar: 'Suerte A-01 (Fumigación)' },
          { lat: baseLat + 0.0018, lng: baseLng - 0.0025, hora: '10:10 AM', esProductivo: false, velocidad: '4.0 km/h', dwellMin: 10, lugar: 'Salida no autorizada de lote' },
          { lat: baseLat + 0.0022, lng: baseLng - 0.0035, hora: '10:45 AM', esProductivo: false, velocidad: '0.0 km/h', dwellMin: 48, lugar: 'Zanja / Sombra Árbol (Inmóvil)' }
        ]
      },
      {
        id: 'WRK-104',
        nombre: 'Andrés Morales',
        cargo: 'Agrónomo de Campo',
        cuadrilla: 'Equipo Técnico',
        estado: 'En Desplazamiento',
        bateria: 75,
        suerteName: 'Corredor Interlotes B-01',
        fincaName: 'Hacienda El Paraíso',
        lat: baseLat + 0.0015,
        lng: baseLng - 0.0018,
        esProductivo: false,
        distanciaTotal: '9.2 km',
        tiempoTotal: '4h 50m',
        tiempoProductivo: '3h 35m',
        tiempoImproductivo: '1h 15m',
        porcentajeEficiencia: 74,
        tiempoDetenidoActual: 4,
        alertaParada: null,
        sensorMovimiento: 'Activo (Vehicular / Cuatrimoto)',
        ruta: [
          { lat: baseLat + 0.0035, lng: baseLng - 0.0040, hora: '07:00 AM', esProductivo: false, velocidad: '0.0 km/h', dwellMin: 15, lugar: 'Laboratorio' },
          { lat: baseLat - 0.0010, lng: baseLng - 0.0015, hora: '07:50 AM', esProductivo: true, velocidad: '3.2 km/h', dwellMin: 40, lugar: 'Suerte A-02 (Revisión Suelos)' },
          { lat: baseLat + 0.0005, lng: baseLng - 0.0003, hora: '09:20 AM', esProductivo: true, velocidad: '2.8 km/h', dwellMin: 55, lugar: 'Suerte A-01 (Aforo de Caña)' },
          { lat: baseLat + 0.0015, lng: baseLng - 0.0018, hora: '11:20 AM', esProductivo: false, velocidad: '18.5 km/h', dwellMin: 4, lugar: 'En Ruta hacia Lote 02' }
        ]
      }
    ];
  }, [defaultCenter]);

  // ── INYECCIÓN AVANZADA: TELEMETRÍA DE MAQUINARIA & ALERTAS DE PARADA ────
  const machineryTelemetry = useMemo(() => {
    const baseLat = defaultCenter[0];
    const baseLng = defaultCenter[1];

    return [
      {
        id: 'MAQ-01',
        codigo: 'TRAC-01',
        nombre: 'Tractor John Deere 6125M',
        tipo: 'Tractor Agrícola',
        implemento: 'Rastra 24 Discos',
        op: 'Jorge Salazar',
        vel: '6.4 km/h',
        estado: 'Operando en Lote',
        rpm: 1850,
        fuel: '78%',
        horometro: '1,485.2 h',
        esProductivo: true,
        distanciaTotal: '24.6 km',
        tiempoTotal: '6h 15m',
        tiempoProductivo: '5h 30m',
        tiempoImproductivo: '45m',
        porcentajeEficiencia: 88,
        tiempoDetenidoActual: 3,
        alertaParada: null,
        lat: baseLat + 0.0007,
        lng: baseLng - 0.0008,
        ruta: [
          { lat: baseLat + 0.0035, lng: baseLng - 0.0040, hora: '06:00 AM', esProductivo: false, velocidad: '0.0 km/h', dwellMin: 15, lugar: 'Taller de Maquinaria' },
          { lat: baseLat + 0.0020, lng: baseLng - 0.0025, hora: '06:35 AM', esProductivo: false, velocidad: '15.0 km/h', dwellMin: 5, lugar: 'Traslado por Callejón' },
          { lat: baseLat + 0.0009, lng: baseLng - 0.0009, hora: '07:15 AM', esProductivo: true, velocidad: '6.2 km/h', dwellMin: 8, lugar: 'Suerte A-01 (Pasada 1 Rastra)' },
          { lat: baseLat + 0.0008, lng: baseLng - 0.0008, hora: '09:00 AM', esProductivo: true, velocidad: '6.5 km/h', dwellMin: 6, lugar: 'Suerte A-01 (Pasada 2 Rastra)' },
          { lat: baseLat + 0.0007, lng: baseLng - 0.0008, hora: '11:40 AM', esProductivo: true, velocidad: '6.4 km/h', dwellMin: 3, lugar: 'Suerte A-01 (Pasada 3)' }
        ]
      },
      {
        id: 'MAQ-02',
        codigo: 'FUM-01',
        nombre: 'Fumigadora Jacto Uniport 3030',
        tipo: 'Fumigadora Autopropulsada',
        implemento: 'Barra Hidráulica 28m',
        op: 'Fabián Ortiz',
        vel: '0.0 km/h',
        estado: 'Alerta: Falla Mecánica en Campo',
        rpm: 0,
        fuel: '65%',
        horometro: '2,110.5 h',
        esProductivo: false,
        distanciaTotal: '11.8 km',
        tiempoTotal: '5h 40m',
        tiempoProductivo: '3h 10m',
        tiempoImproductivo: '2h 30m',
        porcentajeEficiencia: 56,
        tiempoDetenidoActual: 52, // 52 min detenida!
        alertaParada: {
          tipo: 'Daño Mecánico en Campo',
          mensaje: 'DETENCIÓN POR AVERÍA (52 min): Máquina parada en medio del surco con motor apagado. Código de falla OBD: F-302 (Pérdida de presión en barra de pulverización). Requiere asistencia técnica.',
          severidad: 'Crítica'
        },
        lat: baseLat + 0.0005,
        lng: baseLng - 0.0003,
        ruta: [
          { lat: baseLat + 0.0035, lng: baseLng - 0.0040, hora: '06:30 AM', esProductivo: false, velocidad: '0.0 km/h', dwellMin: 20, lugar: 'Carga de Tanque (Caldo)' },
          { lat: baseLat + 0.0010, lng: baseLng - 0.0010, hora: '07:20 AM', esProductivo: true, velocidad: '12.5 km/h', dwellMin: 5, lugar: 'Suerte A-01 (Inicio Fumigación)' },
          { lat: baseLat + 0.0007, lng: baseLng - 0.0005, hora: '08:45 AM', esProductivo: true, velocidad: '11.8 km/h', dwellMin: 8, lugar: 'Suerte A-01 (Frente Norte)' },
          { lat: baseLat + 0.0005, lng: baseLng - 0.0003, hora: '10:15 AM', esProductivo: false, velocidad: '0.0 km/h', dwellMin: 52, lugar: 'Suerte A-01 (Averiada en Surco)' }
        ]
      },
      {
        id: 'MAQ-03',
        codigo: 'CAM-01',
        nombre: 'Camión Alce Mercedes Axor 3340',
        tipo: 'Transporte de Cosecha',
        implemento: 'Vagón Cañero Volcable',
        op: 'Mauricio Vivas',
        vel: '0.0 km/h',
        estado: 'Parada Operativa (Cargue)',
        rpm: 800,
        fuel: '54%',
        horometro: '4,820.0 h',
        esProductivo: true,
        distanciaTotal: '42.0 km',
        tiempoTotal: '6h 30m',
        tiempoProductivo: '5h 45m',
        tiempoImproductivo: '45m',
        porcentajeEficiencia: 88,
        tiempoDetenidoActual: 24, // 24 min en tolva
        alertaParada: {
          tipo: 'Parada Operativa Autorizada',
          mensaje: 'ESPERA DE CARGUE (24 min): Vehículo posicionado en cabecera de suerte recibiendo caña picada desde cosechadora combinada.',
          severidad: 'Baja'
        },
        lat: baseLat - 0.0015,
        lng: baseLng - 0.0025,
        ruta: [
          { lat: baseLat + 0.0040, lng: baseLng - 0.0050, hora: '05:30 AM', esProductivo: false, velocidad: '0.0 km/h', dwellMin: 15, lugar: 'Báscula Ingenio Central' },
          { lat: baseLat - 0.0005, lng: baseLng - 0.0035, hora: '06:40 AM', esProductivo: false, velocidad: '35.0 km/h', dwellMin: 8, lugar: 'Vía Principal de Acceso' },
          { lat: baseLat - 0.0015, lng: baseLng - 0.0025, hora: '08:00 AM', esProductivo: true, velocidad: '0.0 km/h', dwellMin: 24, lugar: 'Suerte A-02 (Punto de Alce)' }
        ]
      },
      {
        id: 'MAQ-04',
        codigo: 'COS-01',
        nombre: 'Cosechadora Case IH 8800',
        tipo: 'Cosechadora Combinada',
        implemento: 'Cabezal Picador 1.5m',
        op: 'Hernán Duque',
        vel: '4.5 km/h',
        estado: 'Operando en Cosecha',
        rpm: 2150,
        fuel: '62%',
        horometro: '3,140.8 h',
        esProductivo: true,
        distanciaTotal: '18.2 km',
        tiempoTotal: '6h 00m',
        tiempoProductivo: '5h 10m',
        tiempoImproductivo: '50m',
        porcentajeEficiencia: 86,
        tiempoDetenidoActual: 4,
        alertaParada: null,
        lat: baseLat - 0.0013,
        lng: baseLng - 0.0020,
        ruta: [
          { lat: baseLat - 0.0010, lng: baseLng - 0.0018, hora: '06:30 AM', esProductivo: true, velocidad: '4.2 km/h', dwellMin: 10, lugar: 'Suerte A-02 (Inicio Corte)' },
          { lat: baseLat - 0.0013, lng: baseLng - 0.0020, hora: '11:45 AM', esProductivo: true, velocidad: '4.5 km/h', dwellMin: 4, lugar: 'Suerte A-02 (Corte Continuo)' }
        ]
      }
    ];
  }, [defaultCenter]);

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

        trailsLayer.current = window.L.layerGroup().addTo(mapInstance.current);
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
    if (trailsLayer.current) trailsLayer.current.clearLayers();
    if (heatLayerGroup.current) heatLayerGroup.current.clearLayers();

    const boundsPoints = [];

    // ── 1. CAPA BASE DE GEOCERCAS / POLÍGONOS DE SUERTES ──────────────────
    allSuertes.forEach(suerte => {
      if (suerte.geometria && Array.isArray(suerte.geometria) && suerte.geometria.length >= 3) {
        let strokeColor = '#10b981';
        let fillColor = '#10b981';
        let fillOpacity = 0.30;

        if (showNdviSimulation) {
          const hash = (suerte.name || suerte.id || 'A').charCodeAt(0) % 3;
          fillColor = hash === 0 ? '#10b981' : hash === 1 ? '#fbbf24' : '#ef4444';
          strokeColor = hash === 0 ? '#059669' : hash === 1 ? '#d97706' : '#dc2626';
          fillOpacity = 0.65;
        } else if (gisMode === 'personal' || gisMode === 'maquinaria') {
          fillColor = '#0f172a';
          strokeColor = '#10b981';
          fillOpacity = 0.15;
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
        `, { sticky: true, className: 'leaflet-custom-tooltip' });
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

    // ── 3. MODO PERSONAL: TRACKING CON ICONOS DE PERSONA Y RECORRIDO COMPLETO ──
    if (gisMode === 'personal') {
      workersTelemetry.forEach((w) => {
        if (selectedTrackingFilter !== 'all' && selectedTrackingFilter !== w.id) return;

        const isInside = w.esProductivo;
        const hasAnomaly = !!w.alertaParada;

        // 3.1. Dibujar el recorrido histórico punto a punto (Trazas)
        if (showTrails && w.ruta && w.ruta.length > 1) {
          for (let i = 0; i < w.ruta.length - 1; i++) {
            const p1 = w.ruta[i];
            const p2 = w.ruta[i + 1];
            // Si ambos puntos o el destino están dentro del lote = Verde (Productivo), si no = Rojo (Improductivo)
            const segColor = (p1.esProductivo && p2.esProductivo) ? '#10B981' : '#EF4444';
            
            window.L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], {
              color: segColor,
              weight: 3.5,
              opacity: 0.85,
              dashArray: segColor === '#EF4444' ? '5, 5' : null
            }).addTo(trailsLayer.current);
          }

          // Dibujar los waypoints / puntos del recorrido
          w.ruta.forEach((wp, wpIdx) => {
            const isStart = wpIdx === 0;
            const isEnd = wpIdx === w.ruta.length - 1;
            const wpColor = wp.esProductivo ? '#10B981' : '#EF4444';

            const wpMarker = window.L.circleMarker([wp.lat, wp.lng], {
              radius: isStart || isEnd ? 6 : 4,
              fillColor: isStart ? '#3b82f6' : wpColor,
              color: '#ffffff',
              weight: 2,
              fillOpacity: 1
            }).addTo(trailsLayer.current);

            wpMarker.bindTooltip(`
              <div style="font-size: 11px; font-weight: 600; padding: 2px;">
                <strong style="color: ${wpColor};">${isStart ? '▶ INICIO' : isEnd ? '📍 POSICIÓN ACTUAL' : `Punto #${wpIdx + 1}`} - ${w.nombre}</strong><br/>
                <span>⏱️ Hora: <strong>${wp.hora}</strong></span><br/>
                <span>📍 Lugar: ${wp.lugar}</span><br/>
                <span>⏳ Detenido en punto: <strong style="color: ${wp.dwellMin > 25 ? '#ef4444' : '#059669'};">${wp.dwellMin} min</strong></span><br/>
                <span>🚦 Estado: <strong style="color: ${wpColor};">${wp.esProductivo ? '🟢 Productivo (En Lote)' : '🔴 Improductivo (Fuera)'}</strong></span>
              </div>
            `, { sticky: true });

            wpMarker.on('click', () => {
              setSelectedEntity({
                type: 'personal',
                ...w,
                activeWaypoint: wp
              });
            });
          });
        }

        // 3.2. Icono de Persona Personalizado (L.divIcon)
        const personIconHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
            <div style="
              background: ${hasAnomaly ? '#fef3c7' : isInside ? '#ecfdf5' : '#fef2f2'}; 
              border: 2.5px solid ${hasAnomaly ? '#f59e0b' : isInside ? '#10b981' : '#ef4444'}; 
              box-shadow: 0 4px 14px rgba(0,0,0,0.35); 
              border-radius: 9999px; 
              width: 38px; 
              height: 38px; 
              display: flex; 
              align-items: center; 
              justify-content: center;
            ">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${hasAnomaly ? '#d97706' : isInside ? '#059669' : '#dc2626'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              ${hasAnomaly ? `<span style="position: absolute; top: -4px; right: -4px; width: 15px; height: 15px; background: #ef4444; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; color: white; font-weight: 900;">!</span>` : ''}
            </div>
            <div style="
              background: rgba(15, 23, 42, 0.92); 
              color: white; 
              padding: 2px 7px; 
              border-radius: 8px; 
              font-size: 10px; 
              font-weight: 800; 
              margin-top: 3px; 
              white-space: nowrap; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.4); 
              border: 1px solid rgba(255,255,255,0.25);
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span>${w.nombre.split(' ')[0]}</span>
              <span>${isInside ? '🟢' : '🔴'}</span>
              ${w.tiempoDetenidoActual > 20 ? `<span style="color: #fca5a5; font-size: 9px;">⏱️${w.tiempoDetenidoActual}m</span>` : ''}
            </div>
            <div style="width: 2px; height: 6px; background: ${hasAnomaly ? '#f59e0b' : isInside ? '#10b981' : '#ef4444'};"></div>
          </div>
        `;

        const personDivIcon = window.L.divIcon({
          className: 'custom-person-pin',
          html: personIconHtml,
          iconSize: [42, 54],
          iconAnchor: [21, 54]
        });

        const workerMarker = window.L.marker([w.lat, w.lng], { icon: personDivIcon }).addTo(markersLayer.current);

        workerMarker.on('click', () => {
          setSelectedEntity({
            type: 'personal',
            ...w
          });
        });
      });
    }

    // ── 4. MODO MAQUINARIA: TRACKING CON ICONOS DE VEHÍCULO Y RECORRIDOS ───
    if (gisMode === 'maquinaria') {
      machineryTelemetry.forEach(m => {
        if (selectedTrackingFilter !== 'all' && selectedTrackingFilter !== m.id) return;

        const isInside = m.esProductivo;
        const hasAnomaly = !!m.alertaParada;

        // 4.1. Dibujar traza de ruta punto a punto
        if (showTrails && m.ruta && m.ruta.length > 1) {
          for (let i = 0; i < m.ruta.length - 1; i++) {
            const p1 = m.ruta[i];
            const p2 = m.ruta[i + 1];
            const segColor = (p1.esProductivo && p2.esProductivo) ? '#10B981' : '#EF4444';
            
            window.L.polyline([[p1.lat, p1.lng], [p2.lat, p2.lng]], {
              color: segColor,
              weight: 4,
              opacity: 0.85,
              dashArray: segColor === '#EF4444' ? '6, 6' : null
            }).addTo(trailsLayer.current);
          }

          m.ruta.forEach((wp, wpIdx) => {
            const isStart = wpIdx === 0;
            const isEnd = wpIdx === m.ruta.length - 1;
            const wpColor = wp.esProductivo ? '#10B981' : '#EF4444';

            const wpMarker = window.L.circleMarker([wp.lat, wp.lng], {
              radius: isStart || isEnd ? 7 : 4.5,
              fillColor: isStart ? '#3b82f6' : wpColor,
              color: '#ffffff',
              weight: 2,
              fillOpacity: 1
            }).addTo(trailsLayer.current);

            wpMarker.bindTooltip(`
              <div style="font-size: 11px; font-weight: 600; padding: 2px;">
                <strong style="color: ${wpColor};">${isStart ? '▶ SALIDA TALLER' : isEnd ? '📍 POSICIÓN ACTUAL' : `Paso #${wpIdx + 1}`} - ${m.codigo}</strong><br/>
                <span>⏱️ Hora: <strong>${wp.hora}</strong></span><br/>
                <span>📍 Lugar: ${wp.lugar}</span><br/>
                <span>🚜 Velocidad: <strong>${wp.velocidad}</strong></span><br/>
                <span>⏳ Detenido en punto: <strong style="color: ${wp.dwellMin > 25 ? '#ef4444' : '#059669'};">${wp.dwellMin} min</strong></span>
              </div>
            `, { sticky: true });

            wpMarker.on('click', () => {
              setSelectedEntity({
                type: 'maquinaria',
                ...m,
                activeWaypoint: wp
              });
            });
          });
        }

        // 4.2. Icono de Maquinaria Personalizado (L.divIcon)
        const machineIconHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
            <div style="
              background: ${hasAnomaly ? '#fef3c7' : isInside ? '#eff6ff' : '#fef2f2'}; 
              border: 2.5px solid ${hasAnomaly ? '#f59e0b' : isInside ? '#3b82f6' : '#ef4444'}; 
              box-shadow: 0 4px 14px rgba(0,0,0,0.35); 
              border-radius: 12px; 
              width: 40px; 
              height: 40px; 
              display: flex; 
              align-items: center; 
              justify-content: center;
            ">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${hasAnomaly ? '#d97706' : isInside ? '#1d4ed8' : '#dc2626'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 17h18"></path>
                <path d="M19 17v-4l-3-4H8L5 13v4"></path>
                <circle cx="7.5" cy="17.5" r="2.5"></circle>
                <circle cx="16.5" cy="17.5" r="2.5"></circle>
              </svg>
              ${hasAnomaly ? `<span style="position: absolute; top: -5px; right: -5px; width: 16px; height: 16px; background: #f59e0b; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; color: white; font-weight: 900;">⚠️</span>` : ''}
            </div>
            <div style="
              background: rgba(15, 23, 42, 0.92); 
              color: white; 
              padding: 2px 7px; 
              border-radius: 8px; 
              font-size: 10px; 
              font-weight: 800; 
              margin-top: 3px; 
              white-space: nowrap; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.4); 
              border: 1px solid rgba(255,255,255,0.25);
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span>${m.codigo}</span>
              <span>${isInside ? '🟢' : '🔴'}</span>
              <span>${m.vel}</span>
            </div>
            <div style="width: 2px; height: 6px; background: ${hasAnomaly ? '#f59e0b' : isInside ? '#3b82f6' : '#ef4444'};"></div>
          </div>
        `;

        const machineDivIcon = window.L.divIcon({
          className: 'custom-machine-pin',
          html: machineIconHtml,
          iconSize: [44, 56],
          iconAnchor: [22, 56]
        });

        const machineMarker = window.L.marker([m.lat, m.lng], { icon: machineDivIcon }).addTo(markersLayer.current);

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

  }, [allSuertes, gisMode, showNdviSimulation, showLoteBounds, showVertexPoints, showTrails, mapType, filterPestSeverity, palmFilterStatus, palmsList, workersTelemetry, machineryTelemetry, selectedTrackingFilter]);

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
              onClick={() => { setGisMode('catastro'); setSelectedEntity(null); setSelectedTrackingFilter('all'); }}
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
              onClick={() => { setGisMode('calor'); setSelectedEntity(null); setSelectedTrackingFilter('all'); }}
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
              onClick={() => { setGisMode('personal'); setSelectedEntity(null); setSelectedTrackingFilter('all'); }}
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
              onClick={() => { setGisMode('maquinaria'); setSelectedEntity(null); setSelectedTrackingFilter('all'); }}
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
              onClick={() => { setGisMode('palmas'); setSelectedEntity(null); setSelectedTrackingFilter('all'); }}
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
              title="Configuración de Parámetros GIS, Telemetría y Censos"
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

            {/* Tracking Trails Toggle for Personal and Machinery */}
            {(gisMode === 'personal' || gisMode === 'maquinaria') && (
              <>
                <button
                  onClick={() => setShowTrails(!showTrails)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    showTrails 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow' 
                      : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                  }`}
                  title="Activar/Desactivar visualización de trazas punto a punto del recorrido"
                >
                  <Route size={14} />
                  <span>{showTrails ? 'Recorrido GPS ON' : 'Recorrido OFF'}</span>
                </button>

                {/* Filter by specific person/machine */}
                <select
                  value={selectedTrackingFilter}
                  onChange={e => setSelectedTrackingFilter(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                >
                  <option value="all">Ver toda la flota / equipo</option>
                  {gisMode === 'personal' && workersTelemetry.map(w => (
                    <option key={w.id} value={w.id}>{w.nombre} ({w.esProductivo ? '🟢 Productivo' : '🔴 Fuera'})</option>
                  ))}
                  {gisMode === 'maquinaria' && machineryTelemetry.map(m => (
                    <option key={m.id} value={m.id}>{m.codigo} - {m.nombre}</option>
                  ))}
                </select>
              </>
            )}

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

          {/* Mode Summary Indicator with Productive/Unproductive Badges */}
          <div className="hidden lg:flex items-center gap-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 px-3.5 py-1.5 rounded-2xl text-xs shadow-xl text-slate-800 dark:text-white">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verde = Tiempo Productivo</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Rojo = Improductivo / Fuera</span>
            </div>
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
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Clic para abrir métricas de productividad, telemetría y tiempos muertos</p>
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
                  {gisMode === 'personal' && 'Tracking de Cuadrillas & Tiempos Productivos'}
                  {gisMode === 'maquinaria' && 'Telemetría de Flota, Paradas & Detección de Averías'}
                  {gisMode === 'palmas' && `Censo Botánico Individual: ${selectedSuerte ? selectedSuerte.suerte.name : 'Palmar Principal'}`}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AgroGestión Telemetría v3.0
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

            {/* Content for Mode 3: Personal Tracking & Dwell Time Analysis */}
            {gisMode === 'personal' && (
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {workersTelemetry.map((w) => (
                    <div 
                      key={w.id}
                      onClick={() => { setSelectedEntity({ type: 'personal', ...w }); setSelectedTrackingFilter(w.id); }}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        w.alertaParada 
                          ? 'bg-rose-500/10 border-rose-500/40 hover:border-rose-500' 
                          : w.esProductivo 
                            ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500' 
                            : 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <User size={14} className={w.esProductivo ? "text-emerald-600" : "text-rose-600"} />
                          <strong className="text-slate-900 dark:text-white font-bold">{w.nombre}</strong>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          w.esProductivo ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-800 dark:text-rose-300'
                        }`}>
                          {w.esProductivo ? '🟢 En Lote' : '🔴 Fuera'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-300 mt-1.5">
                        <div>Productivo: <strong className="text-emerald-600 font-bold">{w.tiempoProductivo}</strong></div>
                        <div>Improductivo: <strong className="text-rose-600 font-bold">{w.tiempoImproductivo}</strong></div>
                        <div>Eficiencia: <strong className="text-slate-900 dark:text-white font-bold">{w.porcentajeEficiencia}%</strong></div>
                        <div>Detenido: <strong className={w.tiempoDetenidoActual > 25 ? "text-rose-600 font-bold" : "text-slate-700 dark:text-slate-300"}>{w.tiempoDetenidoActual} min</strong></div>
                      </div>

                      {w.alertaParada && (
                        <div className="mt-1.5 p-1.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-[10px] text-rose-800 dark:text-rose-200 font-semibold flex items-center gap-1">
                          <AlertTriangle size={12} className="shrink-0 text-rose-600" />
                          <span className="truncate">{w.alertaParada.tipo}: {w.tiempoDetenidoActual}m inmóvil</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content for Mode 4: Machinery Telemetry & Stop Dwell Analysis */}
            {gisMode === 'maquinaria' && (
              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {machineryTelemetry.map((m) => (
                    <div 
                      key={m.id}
                      onClick={() => { setSelectedEntity({ type: 'maquinaria', ...m }); setSelectedTrackingFilter(m.id); }}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        m.alertaParada?.severidad === 'Crítica'
                          ? 'bg-rose-500/10 border-rose-500/40 hover:border-rose-500'
                          : m.esProductivo
                            ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500'
                            : 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Tractor size={14} className={m.esProductivo ? "text-blue-600" : "text-amber-600"} />
                          <strong className="text-slate-900 dark:text-white font-bold">{m.codigo} - {m.nombre}</strong>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{m.vel}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-300 mt-1.5">
                        <div>Operador: <strong className="text-slate-900 dark:text-white">{m.op}</strong></div>
                        <div>Horómetro: <strong className="text-slate-900 dark:text-white">{m.horometro}</strong></div>
                        <div>T. Productivo: <strong className="text-emerald-600 font-bold">{m.tiempoProductivo}</strong></div>
                        <div>Detenido: <strong className={m.tiempoDetenidoActual > 25 ? "text-rose-600 font-bold" : "text-slate-700"}>{m.tiempoDetenidoActual} min</strong></div>
                      </div>

                      {m.alertaParada && (
                        <div className={`mt-1.5 p-1.5 rounded-xl text-[10px] font-semibold flex items-center gap-1 ${
                          m.alertaParada.severidad === 'Crítica' ? 'bg-rose-500/20 text-rose-800 dark:text-rose-200 border border-rose-500/40' : 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40'
                        }`}>
                          <AlertTriangle size={12} className="shrink-0" />
                          <span className="truncate">{m.alertaParada.tipo} ({m.tiempoDetenidoActual} min)</span>
                        </div>
                      )}
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
          <div className="md:col-span-5 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/70 p-4 rounded-3xl shadow-2xl space-y-2.5 text-slate-800 dark:text-slate-100">
            
            {/* If a specific entity (Worker, Machine, or Palm) is selected */}
            {selectedEntity ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    {selectedEntity.type === 'palma' && <Trees size={16} className="text-amber-500" />}
                    {selectedEntity.type === 'personal' && <User size={16} className={selectedEntity.esProductivo ? "text-emerald-500" : "text-rose-500"} />}
                    {selectedEntity.type === 'maquinaria' && <Tractor size={16} className={selectedEntity.esProductivo ? "text-blue-500" : "text-rose-500"} />}
                    {selectedEntity.type === 'calor' && <Flame size={16} className="text-rose-500" />}
                    <div>
                      <strong className="text-sm text-slate-900 dark:text-white font-bold block">
                        {selectedEntity.nombre || selectedEntity.title || selectedEntity.id}
                      </strong>
                      <span className="text-[10px] text-slate-500">{selectedEntity.cargo || selectedEntity.tipo || selectedEntity.codigo}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedEntity(null); setSelectedTrackingFilter('all'); }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Personal Detailed Card with Productivity & Dwell Anomaly */}
                {selectedEntity.type === 'personal' && (
                  <div className="space-y-2 text-[11px]">
                    
                    {/* Alerta de Inactividad / Dormido */}
                    {selectedEntity.alertaParada && (
                      <div className="p-2.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-rose-800 dark:text-rose-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertOctagon size={14} className="text-rose-600" />
                          <span>ALERTA DE PARADA ANÓMALA ({selectedEntity.tiempoDetenidoActual} min)</span>
                        </div>
                        <p className="text-[10px] opacity-95">{selectedEntity.alertaParada.mensaje}</p>
                      </div>
                    )}

                    {/* Sensor de Celular y Estado */}
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl space-y-1 border border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1"><Smartphone size={12} /> Sensor Celular:</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{selectedEntity.sensorMovimiento}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1"><BatteryCharging size={12} /> Batería GPS:</span>
                        <strong className="text-emerald-600 font-bold">{selectedEntity.bateria}%</strong>
                      </div>
                    </div>

                    {/* Métricas de Productividad */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">🟢 T. Productivo (Lote)</span>
                        <strong className="text-sm text-emerald-700 dark:text-emerald-300 font-extrabold">{selectedEntity.tiempoProductivo}</strong>
                      </div>
                      <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block">🔴 T. Improductivo (Fuera)</span>
                        <strong className="text-sm text-rose-700 dark:text-rose-300 font-extrabold">{selectedEntity.tiempoImproductivo}</strong>
                      </div>
                    </div>

                    {/* Waypoint activo seleccionado */}
                    {selectedEntity.activeWaypoint && (
                      <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[10px] text-cyan-800 dark:text-cyan-300 space-y-0.5">
                        <strong className="block">📍 Waypoint Inspeccionado ({selectedEntity.activeWaypoint.hora})</strong>
                        <div>Lugar: {selectedEntity.activeWaypoint.lugar} · Detenido: {selectedEntity.activeWaypoint.dwellMin} min</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Machine Detailed Card with Telemetry & Damage Alarms */}
                {selectedEntity.type === 'maquinaria' && (
                  <div className="space-y-2 text-[11px]">
                    
                    {/* Alerta de Falla Mecánica / Parada */}
                    {selectedEntity.alertaParada && (
                      <div className={`p-2.5 rounded-2xl border space-y-1 ${
                        selectedEntity.alertaParada.severidad === 'Crítica' 
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-200' 
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-200'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle size={14} />
                          <span>{selectedEntity.alertaParada.tipo.toUpperCase()} ({selectedEntity.tiempoDetenidoActual} min)</span>
                        </div>
                        <p className="text-[10px] opacity-95">{selectedEntity.alertaParada.mensaje}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-300">
                      <div>Operador: <strong className="text-slate-900 dark:text-white">{selectedEntity.op}</strong></div>
                      <div>Implemento: <strong className="text-slate-900 dark:text-white">{selectedEntity.implemento}</strong></div>
                      <div>Velocidad: <strong className="text-blue-600 font-bold">{selectedEntity.vel}</strong></div>
                      <div>Combustible: <strong className="text-emerald-600 font-bold">{selectedEntity.fuel}</strong></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">🟢 T. Productivo</span>
                        <strong className="text-sm text-emerald-700 dark:text-emerald-300 font-extrabold">{selectedEntity.tiempoProductivo}</strong>
                      </div>
                      <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold block">🔴 T. Improductivo / Parada</span>
                        <strong className="text-sm text-rose-700 dark:text-rose-300 font-extrabold">{selectedEntity.tiempoImproductivo}</strong>
                      </div>
                    </div>
                  </div>
                )}

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
              </div>
            ) : (
              /* Default Agronomic & Telemetry Legend */
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Telemetría & Eficiencia Operativa</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">En Vivo</span>
                </div>
                
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                    <span><strong>Trazas Verdes:</strong> Operación dentro de geocerca (Tiempo Productivo).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                    <span><strong>Trazas Rojas:</strong> Fuera de lote / Tiempos improductivos o desvíos.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                    <span><strong>Alertas Dwell (Paradas):</strong> Inactividad prolongada (&gt;25 min) o daño mecánico.</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  Haz clic en cualquier operario, tractor, camión o punto del recorrido para auditar sus paradas y tiempos muertos.
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
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Configuración del Sistema GIS & Telemetría</h3>
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
                Parámetros de Telemetría & Detección de Paradas
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Umbral Alerta Inactividad (Minutos)</label>
                  <input 
                    type="number" 
                    value={palmSettings.umbralInactividadMin || 25} 
                    onChange={e => setPalmSettings({ ...palmSettings, umbralInactividadMin: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">Distancia Siembra Palmas (m)</label>
                  <input 
                    type="number" 
                    value={palmSettings.distanciaSiembra} 
                    onChange={e => setPalmSettings({ ...palmSettings, distanciaSiembra: Number(e.target.value) })}
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
                <span className="font-bold text-slate-900 dark:text-white block">📡 Sensores de Telemetría & Acelerómetro:</span>
                <p className="text-slate-500 dark:text-slate-400">Integración con sensores móviles de campo, CAN bus de maquinaria y cálculo de tiempos productivos/improductivos en geocercas.</p>
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
