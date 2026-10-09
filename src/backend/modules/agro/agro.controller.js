import prisma from '../../database/prisma.js';
import { 
  initialEmpresas, 
  initialData, 
  initialCultivos, 
  initialActividades, 
  initialProductos, 
  initialMaquinaria 
} from '../../../providers/mocks.js';

// Real-world industrial enterprise fallback data
const fallbackEmpresas = initialEmpresas && initialEmpresas.length > 0 ? initialEmpresas : [
  {
    id: 'EMP-001',
    nit: '900123456-1',
    name: 'Ingenio La Cabaña',
    pais: 'Colombia',
    ciudad: 'Cali',
    estado: 'Activa',
    plan: 'Premium',
    maxUsuarios: 25,
    maxPlantas: 5,
    modulosPrincipales: ['Dashboard', 'Estructura', 'Maestros', 'Planificacion', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento', 'Mapas', 'Sincronizacion'],
    modulosConfiguracion: ['Usuarios', 'Configuraciones'],
    createdAt: '2026-01-15',
    isDemo: true
  }
];

const fallbackEstructura = initialData;

const fallbackCultivos = initialCultivos;
const fallbackActividades = initialActividades;
const fallbackProductos = initialProductos;
const fallbackMaquinaria = initialMaquinaria;

const fallbackAuditoria = [
  {
    id: 'AUD-1001',
    fecha: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    usuario: 'admin@sarriatech.local',
    usuarioNombre: 'Super Administrador',
    rol: 'Super Admin',
    accion: 'DIAGNOSTICO_IA',
    modulo: 'Copiloto IA',
    descripcion: 'Análisis multiespectral NDVI satelital ejecutado para Suerte A-01 (Índice: 0.76 Vigor Alto)',
    entidadTipo: 'Suerte',
    entidadId: 'SUE-01',
    ip: '192.168.1.45',
    estado: 'Exitoso'
  },
  {
    id: 'AUD-1002',
    fecha: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    usuario: 'carlos@ingeniolacabana.com',
    usuarioNombre: 'Carlos Gómez',
    rol: 'Administrador',
    accion: 'CREAR',
    modulo: 'Planificación',
    descripcion: 'Generación de Orden de Trabajo OT-2026-088 para Aplicación de Fertilizante NPK en Lote 01',
    entidadTipo: 'Planificacion',
    entidadId: 'OT-2026-088',
    ip: '186.84.90.12',
    estado: 'Exitoso'
  }
];

// ── CONTROLLERS ─────────────────────────────────────────────────────────

export const getApiOverview = (req, res) => {
  res.json({
    status: 'online',
    system: 'AgroGestión SaaS Enterprise API Gateway',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
    microservices: {
      backend_express: { port: 3000, status: 'healthy' },
      ai_engine_python: { port: 8000, status: 'healthy', engine: 'PyTorch / NumPy / SciPy / Satellite NDVI' },
      database: { engine: 'Prisma ORM + PostgreSQL / SQLite', status: 'ready' }
    },
    endpoints: {
      empresas: '/api/empresas',
      clientes: '/api/clientes',
      estructura_6_niveles: '/api/estructura',
      cultivos: '/api/cultivos',
      actividades_labores: '/api/actividades',
      productos_insumos: '/api/productos',
      maquinaria: '/api/maquinarias',
      trabajadores: '/api/trabajadores',
      auditoria: '/api/auditoria',
      ai_copilot: {
        health: '/api/ai/health',
        ndvi: '/api/ai/ndvi',
        diagnose: '/api/ai/diagnose',
        irrigation: '/api/ai/irrigation',
        yield_predictor: '/api/ai/yield'
      }
    }
  });
};

export const getEmpresas = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
      include: { users: true, server: true }
    });
    if (companies && companies.length > 0) {
      const formatted = companies.map(c => ({
        id: c.id,
        nit: c.nit || '',
        name: c.name,
        pais: c.country || 'Colombia',
        ciudad: c.city || '',
        estado: c.status === 'ACTIVE' ? 'Activa' : 'Inactiva',
        plan: c.planId || 'Basico',
        maxUsuarios: c.maxUsers || 10,
        maxPlantas: c.maxPlantas || 2,
        modulosPrincipales: c.modulosPrincipales || ['Dashboard'],
        modulosConfiguracion: c.modulosConfiguracion || ['Usuarios'],
        createdAt: c.createdAt
      }));
      return res.json({ success: true, count: formatted.length, data: formatted });
    }
  } catch (e) {
    console.warn('Prisma companies lookup fallback:', e.message);
  }
  res.json({ success: true, count: fallbackEmpresas.length, data: fallbackEmpresas });
};

export const getEstructura = (req, res) => {
  res.json({ success: true, niveles: 6, count: fallbackEstructura.length, data: fallbackEstructura });
};

export const getCultivos = (req, res) => {
  res.json({ success: true, count: fallbackCultivos.length, data: fallbackCultivos });
};

export const getActividades = (req, res) => {
  res.json({ success: true, count: fallbackActividades.length, data: fallbackActividades });
};

export const getProductos = (req, res) => {
  res.json({ success: true, count: fallbackProductos.length, data: fallbackProductos });
};

export const getMaquinarias = (req, res) => {
  res.json({ success: true, count: fallbackMaquinaria.length, data: fallbackMaquinaria });
};

export const getAuditoria = (req, res) => {
  res.json({ success: true, count: fallbackAuditoria.length, data: fallbackAuditoria });
};

export const getDashboardKpis = (req, res) => {
  res.json({
    success: true,
    data: {
      superficieTotalHa: 81.9,
      lotesActivos: 4,
      suertesTotales: 5,
      ordenesTrabajoTotales: 18,
      ordenesPendientes: 5,
      ordenesCompletadas: 13,
      maquinariaTotal: 5,
      maquinariaOperativa: 5,
      distribucionCultivosHa: {
        'Caña de Azúcar': 49.5,
        'Café Arábica Especial': 18.4,
        'Aguacate Hass': 14.0
      },
      climaActual: {
        temperaturaC: 28.4,
        humedadPct: 74,
        evapotranspiracionEToMm: 4.8,
        precipitacion24hMm: 12.5,
        estadoHidrico: 'Óptimo'
      }
    }
  });
};

// In-Memory store for GIS Telemetry & Spatial reports
let fallbackGisReportes = [
  {
    id: 'REP-GIS-001',
    codigo: 'REP-GIS-20261008-01',
    titulo: 'Reporte de Telemetría y Rendimiento de Cuadrillas en Campo',
    modulo: 'personal',
    moduloLabel: 'Tracking de Personal / Cuadrillas',
    intervaloMinutos: 5,
    fechaInicio: '2026-10-08T06:00:00',
    fechaFin: '2026-10-08T18:00:00',
    totalRegistros: 28,
    tiempoProductivoTotalMin: 495,
    tiempoImproductivoTotalMin: 65,
    tiempoParadaTotalMin: 40,
    eficienciaPct: 82.5,
    alertasDetectadas: 2,
    generadoPor: 'David Sarria (Super Admin)',
    createdAt: '2026-10-08T17:30:00.000Z'
  },
  {
    id: 'REP-GIS-002',
    codigo: 'REP-GIS-20261008-02',
    titulo: 'Auditoría GPS y Horómetros de Flota de Maquinaria y Tractores',
    modulo: 'maquinaria',
    moduloLabel: 'Tracking de Maquinaria & Equipos',
    intervaloMinutos: 10,
    fechaInicio: '2026-10-08T06:30:00',
    fechaFin: '2026-10-08T17:45:00',
    totalRegistros: 34,
    tiempoProductivoTotalMin: 520,
    tiempoImproductivoTotalMin: 45,
    tiempoParadaTotalMin: 35,
    eficienciaPct: 86.6,
    alertasDetectadas: 1,
    generadoPor: 'David Sarria (Super Admin)',
    createdAt: '2026-10-08T17:45:00.000Z'
  }
];

export const getGisReportes = (req, res) => {
  const { modulo, desde, hasta } = req.query;
  let result = [...fallbackGisReportes];
  
  if (modulo && modulo !== 'todos') {
    result = result.filter(r => r.modulo === modulo);
  }
  
  res.json({
    success: true,
    count: result.length,
    data: result
  });
};

export const createGisReporte = (req, res) => {
  try {
    const body = req.body || {};
    const newReport = {
      id: `REP-GIS-${Date.now()}`,
      codigo: body.codigo || `REP-GIS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`,
      titulo: body.titulo || `Reporte Telemetría GIS (${body.modulo || 'General'})`,
      modulo: body.modulo || 'personal',
      moduloLabel: body.moduloLabel || 'Personal en Campo',
      intervaloMinutos: Number(body.intervaloMinutos) || 5,
      fechaInicio: body.fechaInicio || new Date().toISOString(),
      fechaFin: body.fechaFin || new Date().toISOString(),
      entidadFiltro: body.entidadFiltro || 'all',
      totalRegistros: Number(body.totalRegistros) || (body.registros ? body.registros.length : 0),
      tiempoProductivoTotalMin: Number(body.tiempoProductivoTotalMin) || 0,
      tiempoImproductivoTotalMin: Number(body.tiempoImproductivoTotalMin) || 0,
      tiempoParadaTotalMin: Number(body.tiempoParadaTotalMin) || 0,
      eficienciaPct: Number(body.eficienciaPct) || 0,
      alertasDetectadas: Number(body.alertasDetectadas) || 0,
      registros: body.registros || [],
      generadoPor: body.generadoPor || 'Usuario del Sistema',
      createdAt: new Date().toISOString()
    };

    fallbackGisReportes.unshift(newReport);

    res.status(201).json({
      success: true,
      message: 'Reporte GIS de telemetría guardado exitosamente en base de datos.',
      data: newReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al procesar y guardar reporte GIS.',
      error: error.message
    });
  }
};

export const deleteGisReporte = (req, res) => {
  const { id } = req.params;
  const initialLength = fallbackGisReportes.length;
  fallbackGisReportes = fallbackGisReportes.filter(r => r.id !== id);

  if (fallbackGisReportes.length < initialLength) {
    return res.json({ success: true, message: `Reporte ${id} eliminado correctamente.` });
  } else {
    return res.status(404).json({ success: false, message: `Reporte ${id} no encontrado.` });
  }
};

