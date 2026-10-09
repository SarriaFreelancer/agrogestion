export const THEME_CONFIG = {
  'Verde Agro': { primary: '#10B981', light: '#34D399', dark: '#059669', bg: 'linear-gradient(135deg, #090d16 0%, #0d131f 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(18, 25, 38, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' },
  'Azul Océano': { primary: '#1565C0', light: '#42A5F5', dark: '#0D47A1', bg: 'linear-gradient(135deg, #090d16 0%, #0b1528 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(18, 25, 38, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' },
  'Tierra Café': { primary: '#795548', light: '#A1887F', dark: '#4E342E', bg: 'linear-gradient(135deg, #090d16 0%, #17110e 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(18, 25, 38, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' },
  'Púrpura Real': { primary: '#6A1B9A', light: '#9C27B0', dark: '#4A148C', bg: 'linear-gradient(135deg, #090d16 0%, #150a1e 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(18, 25, 38, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' },
  'Naranja Atardecer': { primary: '#E65100', light: '#FF9800', dark: '#BF360C', bg: 'linear-gradient(135deg, #090d16 0%, #1c0e06 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(18, 25, 38, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' },
  'Gris Carbón': { primary: '#263238', light: '#455A64', dark: '#102027', bg: 'linear-gradient(135deg, #090d16 0%, #111619 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(18, 25, 38, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' },
  'Modo Nocturno': { primary: '#4F46E5', light: '#818CF8', dark: '#3730A3', bg: '#000000', text: '#ffffff', muted: '#aaaaaa', glass: 'rgba(25, 25, 25, 0.95)', border: 'rgba(255,255,255,0.15)', input: '#1a1a1a' },
  'Noche Clásica': { primary: '#000000', light: '#1a1a1a', dark: '#000000', bg: '#000000', text: '#F9FAFB', muted: '#9CA3AF', glass: '#050505', border: 'rgba(255, 255, 255, 0.1)', input: 'rgba(255, 255, 255, 0.05)' },
  'Blanco Completo': { primary: '#0f172a', light: '#333333', dark: '#000000', bg: '#ffffff', text: '#000000', muted: '#6B7280', glass: 'rgba(255, 255, 255, 0.95)', border: 'rgba(0, 0, 0, 0.1)', input: 'rgba(0, 0, 0, 0.05)' },
  'Tema Principal': { primary: '#1565C0', light: '#42A5F5', dark: '#0D47A1', bg: 'linear-gradient(135deg, #090d16 0%, #111827 100%)', text: '#F9FAFB', muted: '#9CA3AF', glass: 'rgba(17, 24, 39, 0.75)', border: 'rgba(255, 255, 255, 0.08)', input: 'rgba(255, 255, 255, 0.04)' }
};

export const PLAN_CONFIG = {
  'Basico': ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes'],
  'Intermedio': ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento'],
  'Premium': ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento', 'Mapas', 'Sincronizacion'],
  'Empresarial': ['ALL']
};

export const MODULES_PRINCIPALES = [
  { key: 'Dashboard', label: 'Dashboard' },
  { key: 'Estructura', label: 'Estructura Agrícola (6 Niveles)' },
  { key: 'Maestros', label: 'Maestros' },
  { key: 'Planificacion', label: 'Planificación' },
  { key: 'Ejecucion', label: 'Ejecución (Campo)' },
  { key: 'Reportes', label: 'Reportes & BI' },
  { key: 'Monitoreo', label: 'Monitoreo & Sanidad' },
  { key: 'Mantenimiento', label: 'Mantenimiento' },
  { key: 'Sincronizacion', label: 'Sincronización' },
  { key: 'Mapas', label: 'Mapas GIS' }
];

export const MODULES_CONFIGURACION = [
  { key: 'Usuarios', label: 'Usuarios' },
  { key: 'Configuraciones', label: 'Configuraciones' },
  { key: 'GestionEmpresas', label: 'Gestión Empresas' }
];

export const initialEmpresas = [
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
    createdAt: '2026-01-15'
  },
  {
    id: 'EMP-002',
    nit: '800654321-7',
    name: 'AgroSur S.A.S.',
    pais: 'Colombia',
    ciudad: 'Palmira',
    estado: 'Activa',
    plan: 'Intermedio',
    maxUsuarios: 15,
    maxPlantas: 3,
    modulosPrincipales: ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento'],
    modulosConfiguracion: ['Usuarios'],
    createdAt: '2026-03-20'
  },
  {
    id: 'EMP-003',
    nit: '901987654-3',
    name: 'Frutas del Pacífico & Cía',
    pais: 'Colombia',
    ciudad: 'Buenaventura',
    estado: 'Activa',
    plan: 'Empresarial',
    maxUsuarios: 50,
    maxPlantas: 8,
    modulosPrincipales: ['Dashboard', 'Estructura', 'Maestros', 'Planificacion', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento', 'Mapas', 'Sincronizacion'],
    modulosConfiguracion: ['Usuarios', 'Configuraciones', 'GestionEmpresas'],
    createdAt: '2026-02-10'
  }
];

export const GLOBAL_CONFIG_DEFAULTS = {
  config_insumos: 1,
  config_mao: 1,
  config_maq: 1,
  validarInsumos: 1,
  validarMaquinaria: 1,
  validarNomina: 1,
  bloquearStockNegativo: 0,
  registrarGpsMonitoreo: 1,
  registrarGpsInsumos: 1,
  registrarGpsMaquinaria: 1,
  registrarGpsManoObra: 1,
  mostrarAlertasMonitoreo: 1,
  permitirMuestrasMonitoreo: 1,
  permitirObservacionesMonitoreo: 1,
  validarVariablesRequeridasMonitoreo: 1,
  frecuenciaMonitoreo: 'Semanal',
  estructuraNiveles: 6,
  estructuraNivelNombres: {
    nivel1: 'Zona / Región',
    nivel2: 'Sector',
    nivel3: 'Finca / Hacienda',
    nivel4: 'Lote / Bloque',
    nivel5: 'Suerte / Tablón',
    nivel6: 'Surco / Sección'
  },
  maestro_mao: 1,
  maestro_maq: 1,
  maestro_ins: 1,
  modoOscuro: 0,
  maestro_actividad: 1,
  maestro_tp_act: 1,
  maestro_proveedores: 1,
  maestro_cultivos: 1,
  maestro_controles: 1,
  maestro_grupos: 1,
  maestro_tipos_maquinaria: 1,
  maestro_cuadrillas: 1,
  maestro_unidades: 1,
  maestro_tipos_productos: 1
};

export const ACCESS_PERMISSION_KEYS = [
  'ver_dashboard',
  'ver_estructura',
  'ver_maestros',
  'ver_planificacion',
  'ver_ejecucion',
  'ver_reportes',
  'ver_monitoreo',
  'ver_mantenimiento',
  'ver_usuarios',
  'crear_usuario',
  'editar_usuario',
  'eliminar_usuario',
  'asignar_modulos',
  'gestionar_categorias',
  'administrar_config',
  'gestionar_clientes',
  'crear_actividad',
  'editar_actividad',
  'eliminar_actividad',
  'generar_reporte',
  'crear_reporte',
  'editar_reporte',
  'eliminar_reporte'
];

export const DEFAULT_ACCESS_CATEGORIES = (clientCode = 'GLOBAL') => ([
  {
    id: 'SUPER_ADMIN',
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    descripcion: 'Acceso total al sistema y a todas las funciones.',
    clienteCodigo: clientCode,
    permisos: ACCESS_PERMISSION_KEYS.reduce((acc, key) => ({ ...acc, [key]: 1 }), {}),
    modulos: ['ALL'],
    estado: 'Activo'
  },
  {
    id: 'ADMIN',
    code: 'ADMIN',
    name: 'Administrador',
    descripcion: 'Gestiona la operación del cliente y sus usuarios.',
    clienteCodigo: clientCode,
    permisos: {
      ver_dashboard: 1, ver_estructura: 1, ver_maestros: 1, ver_planificacion: 1,
      ver_ejecucion: 1, ver_reportes: 1, ver_monitoreo: 1, ver_mantenimiento: 1,
      ver_usuarios: 1, crear_usuario: 1, editar_usuario: 1, eliminar_usuario: 1,
      asignar_modulos: 1, gestionar_categorias: 1, administrar_config: 1,
      gestionar_clientes: 0, crear_actividad: 1, editar_actividad: 1, eliminar_actividad: 1,
      generar_reporte: 1, crear_reporte: 1, editar_reporte: 1, eliminar_reporte: 1
    },
    modulos: ['Dashboard', 'Estructura', 'Maestros', 'Planificacion', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento', 'Sincronizacion', 'Mapas', 'Usuarios', 'Configuraciones'],
    estado: 'Activo'
  },
  {
    id: 'USUARIO_GENERAL',
    code: 'USUARIO_GENERAL',
    name: 'Usuario General',
    descripcion: 'Acceso limitado a los módulos asignados.',
    clienteCodigo: clientCode,
    permisos: {
      ver_dashboard: 1, ver_estructura: 1, ver_maestros: 0, ver_planificacion: 0,
      ver_ejecucion: 0, ver_reportes: 1, ver_monitoreo: 0, ver_mantenimiento: 0,
      ver_usuarios: 0, crear_usuario: 0, editar_usuario: 0, eliminar_usuario: 0,
      asignar_modulos: 0, gestionar_categorias: 0, administrar_config: 0,
      gestionar_clientes: 0, crear_actividad: 0, editar_actividad: 0, eliminar_actividad: 0,
      generar_reporte: 1, crear_reporte: 0, editar_reporte: 0, eliminar_reporte: 0
    },
    modulos: ['Dashboard', 'Estructura', 'Reportes'],
    estado: 'Activo'
  }
]);

export const DEFAULT_USERS = (clientCode = 'GLOBAL') => ([
  {
    id: 'USR-0001',
    code: 'USR-0001',
    codigo: 'USR-0001',
    clienteCodigo: clientCode,
    nombres: 'Super',
    apellidos: 'Administrador',
    cedula: '0000000000',
    correo: 'admin@sarriatech.local',
    contrasena: 'Admin123!',
    rol: 'Super Admin',
    categoriaCodigo: 'SUPER_ADMIN',
    modulos: ['ALL'],
    estado: 'Activo',
    empresaId: '',
    plantaId: 'Todas'
  },
  {
    id: 'USR-0002',
    code: 'USR-0002',
    codigo: 'USR-0002',
    clienteCodigo: clientCode,
    nombres: 'Carlos',
    apellidos: 'Gómez',
    cedula: '1234567890',
    correo: 'carlos@ingeniolacabana.com',
    contrasena: 'User123!',
    rol: 'Administrador',
    categoriaCodigo: 'ADMIN',
    modulos: ['Dashboard', 'Estructura', 'Maestros', 'Planificacion', 'Ejecucion', 'Reportes', 'Monitoreo', 'Usuarios', 'Configuraciones'],
    estado: 'Activo',
    empresaId: 'EMP-001',
    plantaId: 'Todas'
  },
  {
    id: 'USR-0003',
    code: 'USR-0003',
    codigo: 'USR-0003',
    clienteCodigo: clientCode,
    nombres: 'María',
    apellidos: 'López',
    cedula: '0987654321',
    correo: 'maria@ingeniolacabana.com',
    contrasena: 'User123!',
    rol: 'Usuario General',
    categoriaCodigo: 'USUARIO_GENERAL',
    modulos: ['Dashboard', 'Estructura', 'Reportes'],
    estado: 'Activo',
    empresaId: 'EMP-001',
    plantaId: 'PLN-01'
  },
  {
    id: 'USR-0004',
    code: 'USR-0004',
    codigo: 'USR-0004',
    clienteCodigo: clientCode,
    nombres: 'Pedro',
    apellidos: 'Martínez',
    cedula: '5566778899',
    correo: 'pedro@agrosur.com',
    contrasena: 'User123!',
    rol: 'Administrador',
    categoriaCodigo: 'ADMIN',
    modulos: ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes', 'Usuarios'],
    estado: 'Activo',
    empresaId: 'EMP-002',
    plantaId: 'Todas'
  }
]);

export const initialPlantas = [
  { id: 'PLN-01', codigo: 'PLN-01', name: 'Ingenio Central & Destilería', status: 'ACTIVE', companyId: 1 },
  { id: 'PLN-02', codigo: 'PLN-02', name: 'Planta de Beneficio Sur', status: 'ACTIVE', companyId: 1 },
  { id: 'PLN-03', codigo: 'PLN-03', name: 'Empacadora Exportación Aguacate', status: 'ACTIVE', companyId: 2 }
];

// 6 Hierarchical Levels: Zona -> Sector -> Finca -> Lote -> Suerte -> Surco
// Ubicación Real en Polígono Solicitado (4 Puntos Google Maps):
// NW: 3.472741, -76.448375 | NE: 3.476317, -76.436972
// SE: 3.472044, -76.435268 | SW: 3.468162, -76.447196
export const initialData = [
  { 
    id: 'ZON-01', 
    codigo: 'ZON-01',
    name: 'Zona Valle del Cauca (Sector Agroindustrial)', 
    type: 'Sector', 
    plantaId: 'PLN-01',
    isDemo: true,
    origen: 'DEMO',
    sectores: [
      {
        id: 'SEC-01',
        codigo: 'SEC-01',
        name: 'Sector Agrícola Central & Cañaduzal',
        type: 'Sector',
        isDemo: true,
        origen: 'DEMO',
        fincas: [
          { 
            id: 'FIN-01', 
            codigo: 'FIN-01',
            name: 'Hacienda Campo Verde (Polígono Matriz)', 
            type: 'Finca',
            location: '3.4723, -76.4418',
            isDemo: true,
            origen: 'DEMO',
            lotes: [
              { 
                id: 'LOT-01', 
                codigo: 'LOT-01',
                name: 'Lote 01 (Franja Norte - Caña CC 01-1938)', 
                type: 'Lote',
                topography: 'Plana Aluvial',
                isDemo: true,
                origen: 'DEMO',
                suertes: [
                  { 
                    id: 'SUE-01', 
                    codigo: 'SUE-01',
                    name: 'Suerte 101 (Tablón Noroccidente)', 
                    type: 'Suerte', 
                    hectareas: 16.5, 
                    plantas: 19800, 
                    toneladas: 1850, 
                    cultivo: 'Caña de Azúcar', 
                    estado: 'Activo', 
                    estadoProductivo: 'En Crecimiento Vigoroso', 
                    edadSuerteDias: 140, 
                    edadUltimaCosechaDias: 380, 
                    lat: 3.472053, 
                    lng: -76.446638,
                    isDemo: true,
                    origen: 'DEMO',
                    geometria: [
                      [3.472741, -76.448375],
                      [3.473635, -76.445524],
                      [3.471384, -76.444869],
                      [3.470452, -76.447786]
                    ],
                    surcos: [
                      { id: 'SUR-01', name: 'Válvula N1-A (Surco 1-25)', type: 'Surco', hectareas: 4.1, plantas: 4950, isDemo: true },
                      { id: 'SUR-02', name: 'Válvula N1-B (Surco 26-50)', type: 'Surco', hectareas: 4.1, plantas: 4950, isDemo: true },
                      { id: 'SUR-03', name: 'Válvula N1-C (Surco 51-75)', type: 'Surco', hectareas: 4.1, plantas: 4950, isDemo: true },
                      { id: 'SUR-04', name: 'Válvula N1-D (Cabecera 76-100)', type: 'Surco', hectareas: 4.2, plantas: 4950, isDemo: true }
                    ]
                  },
                  { 
                    id: 'SUE-02', 
                    codigo: 'SUE-02',
                    name: 'Suerte 102 (Tablón Norte Centro-Occidente)', 
                    type: 'Suerte', 
                    hectareas: 16.8, 
                    plantas: 20160, 
                    toneladas: 1900, 
                    cultivo: 'Caña de Azúcar', 
                    estado: 'Activo', 
                    estadoProductivo: 'Plantilla Reciente', 
                    edadSuerteDias: 45, 
                    edadUltimaCosechaDias: 45, 
                    lat: 3.472966, 
                    lng: -76.443755,
                    isDemo: true,
                    origen: 'DEMO',
                    geometria: [
                      [3.473635, -76.445524],
                      [3.474529, -76.442673],
                      [3.472316, -76.441953],
                      [3.471384, -76.444869]
                    ],
                    surcos: [
                      { id: 'SUR-05', name: 'Válvula N2-A (Línea Principal)', type: 'Surco', hectareas: 8.4, plantas: 10080, isDemo: true },
                      { id: 'SUR-06', name: 'Válvula N2-B (Línea Drenaje)', type: 'Surco', hectareas: 8.4, plantas: 10080, isDemo: true }
                    ]
                  },
                  { 
                    id: 'SUE-03', 
                    codigo: 'SUE-03',
                    name: 'Suerte 103 (Tablón Norte Centro-Oriente)', 
                    type: 'Suerte', 
                    hectareas: 16.2, 
                    plantas: 19440, 
                    toneladas: 1800, 
                    cultivo: 'Caña de Azúcar', 
                    estado: 'Activo', 
                    estadoProductivo: 'Semillero Básico Certificado', 
                    edadSuerteDias: 90, 
                    edadUltimaCosechaDias: 90, 
                    lat: 3.473879, 
                    lng: -76.440871,
                    isDemo: true,
                    origen: 'DEMO',
                    geometria: [
                      [3.474529, -76.442673],
                      [3.475423, -76.439823],
                      [3.473248, -76.439036],
                      [3.472316, -76.441953]
                    ],
                    surcos: [
                      { id: 'SUR-07', name: 'Módulo Semilla Élite N3-A', type: 'Surco', hectareas: 8.1, plantas: 9720, isDemo: true },
                      { id: 'SUR-08', name: 'Módulo Semilla Élite N3-B', type: 'Surco', hectareas: 8.1, plantas: 9720, isDemo: true }
                    ]
                  },
                  { 
                    id: 'SUE-04', 
                    codigo: 'SUE-04',
                    name: 'Suerte 104 (Tablón Nororiente)', 
                    type: 'Suerte', 
                    hectareas: 16.0, 
                    plantas: 19200, 
                    toneladas: 1780, 
                    cultivo: 'Caña de Azúcar', 
                    estado: 'Activo', 
                    estadoProductivo: 'Maduración Precosecha', 
                    edadSuerteDias: 330, 
                    edadUltimaCosechaDias: 330, 
                    lat: 3.474792, 
                    lng: -76.437988,
                    isDemo: true,
                    origen: 'DEMO',
                    geometria: [
                      [3.475423, -76.439823],
                      [3.476317, -76.436972],
                      [3.474181, -76.436120],
                      [3.473248, -76.439036]
                    ],
                    surcos: [
                      { id: 'SUR-09', name: 'Sección Norte 1-50', type: 'Surco', hectareas: 8.0, plantas: 9600, isDemo: true },
                      { id: 'SUR-10', name: 'Sección Sur 51-100', type: 'Surco', hectareas: 8.0, plantas: 9600, isDemo: true }
                    ]
                  }
                ]
              },
              { 
                id: 'LOT-02', 
                codigo: 'LOT-02',
                name: 'Lote 02 (Franja Sur - Caña CC 85-92 & Palma)', 
                type: 'Lote',
                topography: 'Plana Aluvial',
                isDemo: true,
                origen: 'DEMO',
                suertes: [
                  { 
                    id: 'SUE-05', 
                    codigo: 'SUE-05',
                    name: 'Suerte 201 (Tablón Suroccidente)', 
                    type: 'Suerte', 
                    hectareas: 15.8, 
                    plantas: 18960, 
                    toneladas: 1750, 
                    cultivo: 'Caña de Azúcar', 
                    estado: 'Activo', 
                    estadoProductivo: 'Soca 1 en Macollamiento', 
                    edadSuerteDias: 210, 
                    edadUltimaCosechaDias: 560, 
                    lat: 3.469782, 
                    lng: -76.446016,
                    isDemo: true,
                    origen: 'DEMO',
                    geometria: [
                      [3.470452, -76.447786],
                      [3.471384, -76.444869],
                      [3.469133, -76.444214],
                      [3.468162, -76.447196]
                    ],
                    surcos: [
                      { id: 'SUR-11', name: 'Válvula S1-A', type: 'Surco', hectareas: 7.9, plantas: 9480, isDemo: true },
                      { id: 'SUR-12', name: 'Válvula S1-B', type: 'Surco', hectareas: 7.9, plantas: 9480, isDemo: true }
                    ]
                  },
                  { 
                    id: 'SUE-06', 
                    codigo: 'SUE-06',
                    name: 'Suerte 202 (Tablón Sur Centro-Occidente)', 
                    type: 'Suerte', 
                    hectareas: 16.0, 
                    plantas: 19200, 
                    toneladas: 1790, 
                    cultivo: 'Caña de Azúcar', 
                    estado: 'Activo', 
                    estadoProductivo: 'En Crecimiento Vigoroso', 
                    edadSuerteDias: 160, 
                    edadUltimaCosechaDias: 420, 
                    lat: 3.470734, 
                    lng: -76.443067,
                    isDemo: true,
                    origen: 'DEMO',
                    geometria: [
                      [3.471384, -76.444869],
                      [3.472316, -76.441953],
                      [3.470103, -76.441232],
                      [3.469133, -76.444214]
                    ],
                    surcos: [
                      { id: 'SUR-13', name: 'Cabecera Sur S2-A', type: 'Surco', hectareas: 8.0, plantas: 9600, isDemo: true },
                      { id: 'SUR-14', name: 'Cola Sur S2-B', type: 'Surco', hectareas: 8.0, plantas: 9600, isDemo: true }
                    ]
                  },
                  { 
                    id: 'SUE-07', 
                    codigo: 'SUE-07',
                    name: 'Suerte 203 (Tablón Sur Centro-Oriente - Palma)', 
                    type: 'Suerte', 
                    hectareas: 15.5, 
                    plantas: 2216, 
                    toneladas: 310, 
                    cultivo: 'Palma de Aceite', 
                    estado: 'Activo', 
                    estadoProductivo: 'Plena Producción y Cosecha', 
                    edadSuerteDias: 2550, 
                    edadUltimaCosechaDias: 25, 
                    lat: 3.471685, 
                    lng: -76.440118,
                    isDemo: true,
                    origen: 'DEMO',
                    geometria: [
                      [3.472316, -76.441953],
                      [3.473248, -76.439036],
                      [3.471073, -76.438250],
                      [3.470103, -76.441232]
                    ],
                    surcos: [
                      { id: 'SUR-15', name: 'Bloque Microaspersión Palma S3-A', type: 'Surco', hectareas: 7.75, plantas: 1108, isDemo: true },
                      { id: 'SUR-16', name: 'Bloque Microaspersión Palma S3-B', type: 'Surco', hectareas: 7.75, plantas: 1108, isDemo: true }
                    ]
                  },
                  { 
                    id: 'SUE-08', 
                    codigo: 'SUE-08',
                    name: 'Suerte 204 (Tablón Suroriente - Palma)', 
                    type: 'Suerte', 
                    hectareas: 15.2, 
                    plantas: 2173, 
                    toneladas: 304, 
                    cultivo: 'Palma de Aceite', 
                    estado: 'Activo', 
                    estadoProductivo: 'Plena Producción y Cosecha', 
                    edadSuerteDias: 2400, 
                    edadUltimaCosechaDias: 30, 
                    lat: 3.472637, 
                    lng: -76.437169,
                    isDemo: true,
                    origen: 'DEMO',
                    geometria: [
                      [3.473248, -76.439036],
                      [3.474181, -76.436120],
                      [3.472044, -76.435268],
                      [3.471073, -76.438250]
                    ],
                    surcos: [
                      { id: 'SUR-17', name: 'Bloque Microaspersión Palma S4-A', type: 'Surco', hectareas: 7.6, plantas: 1086, isDemo: true },
                      { id: 'SUR-18', name: 'Bloque Microaspersión Palma S4-B', type: 'Surco', hectareas: 7.6, plantas: 1087, isDemo: true }
                    ]
                  }
                ]
              }
            ]
          },
          { 
            id: 'FIN-02', 
            codigo: 'FIN-02',
            name: 'Hacienda San Isidro (Franja Oriental)', 
            type: 'Finca',
            location: '3.4745, -76.4310',
            isDemo: true,
            origen: 'DEMO',
            lotes: [
              { 
                id: 'LOT-03', 
                codigo: 'LOT-03',
                name: 'Lote 03 (Maíz Tecnificado & Rotación)', 
                type: 'Lote',
                topography: 'Plana Aluvial',
                isDemo: true,
                origen: 'DEMO',
                suertes: [
                  { 
                    id: 'SUE-09', 
                    codigo: 'SUE-09',
                    name: 'Suerte 301 (Pivote Central Maíz Oriente)', 
                    type: 'Suerte', 
                    hectareas: 22.0, 
                    plantas: 110000, 
                    toneladas: 165, 
                    cultivo: 'Maíz Tecnificado', 
                    estado: 'Activo', 
                    estadoProductivo: 'Llenado de Grano y Espiga', 
                    edadSuerteDias: 70, 
                    edadUltimaCosechaDias: 70, 
                    lat: 3.4745, 
                    lng: -76.4310,
                    isDemo: true,
                    origen: 'DEMO',
                    geometria: [
                      [3.476317, -76.436972],
                      [3.477200, -76.430000],
                      [3.473000, -76.428500],
                      [3.472044, -76.435268]
                    ],
                    surcos: [
                      { id: 'SUR-19', name: 'Pivote Riego Oriente 1', type: 'Surco', hectareas: 11.0, plantas: 55000, isDemo: true },
                      { id: 'SUR-20', name: 'Pivote Riego Oriente 2', type: 'Surco', hectareas: 11.0, plantas: 55000, isDemo: true }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'SEC-02',
        codigo: 'SEC-02',
        name: 'Sector Ladera & Piedemonte (Aguacate & Café)',
        type: 'Sector',
        isDemo: true,
        origen: 'DEMO',
        fincas: [
          {
            id: 'FIN-03',
            codigo: 'FIN-03',
            name: 'Finca El Mirador de la Cumbre',
            type: 'Finca',
            location: '3.4850, -76.4450',
            isDemo: true,
            origen: 'DEMO',
            lotes: [
              {
                id: 'LOT-04',
                codigo: 'LOT-04',
                name: 'Lote 04 (Aguacate Hass Exportación)',
                type: 'Lote',
                topography: 'Ondulada',
                isDemo: true,
                origen: 'DEMO',
                suertes: [
                  {
                    id: 'SUE-10',
                    codigo: 'SUE-10',
                    name: 'Suerte 401 (Aguacate Hass Lote Alto)',
                    type: 'Suerte',
                    hectareas: 14.0,
                    plantas: 3500,
                    toneladas: 210,
                    cultivo: 'Aguacate Hass',
                    estado: 'Activo',
                    estadoProductivo: 'Llenado de Fruto y Calibre Exportación',
                    edadSuerteDias: 1450,
                    edadUltimaCosechaDias: 210,
                    lat: 3.4850,
                    lng: -76.4450,
                    isDemo: true,
                    origen: 'DEMO',
                    geometria: [
                      [3.4880, -76.4490],
                      [3.4890, -76.4410],
                      [3.4830, -76.4400],
                      [3.4820, -76.4480]
                    ],
                    surcos: [
                      { id: 'SUR-21', name: 'Línea de Goteo Aguacate 1', type: 'Surco', hectareas: 7.0, plantas: 1750, isDemo: true },
                      { id: 'SUR-22', name: 'Línea de Goteo Aguacate 2', type: 'Surco', hectareas: 7.0, plantas: 1750, isDemo: true }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    fincas: []
  }
];

export const initialGrupos = [
  { id: 'GRP-01', name: 'Preparación de Suelos & Adecuación', isDemo: true },
  { id: 'GRP-02', name: 'Siembra & Transplante', isDemo: true },
  { id: 'GRP-03', name: 'Nutrición & Fertilización Edáfica/Foliar', isDemo: true },
  { id: 'GRP-04', name: 'Control Fitosanitario (Plagas & Malezas)', isDemo: true },
  { id: 'GRP-05', name: 'Riego, Drenajes & Balance Hídrico', isDemo: true },
  { id: 'GRP-06', name: 'Cosecha, Recolección & Alce', isDemo: true }
];

export const initialCultivos = [
  { id: 'CAN-01', codigo: 'CAN', name: 'Caña de Azúcar', estado: 'Activo', plantaId: 'PLN-01', isDemo: true },
  { id: 'CAF-01', codigo: 'CAF', name: 'Café Arábica Especial', estado: 'Activo', plantaId: 'PLN-02', isDemo: true },
  { id: 'AGU-01', codigo: 'AGU', name: 'Aguacate Hass', estado: 'Activo', plantaId: 'PLN-03', isDemo: true },
  { id: 'PAL-01', codigo: 'PAL', name: 'Palma de Aceite', estado: 'Activo', plantaId: 'PLN-01', isDemo: true },
  { id: 'MAI-01', codigo: 'MAI', name: 'Maíz Tecnificado', estado: 'Activo', plantaId: 'PLN-01', isDemo: true },
  { id: 'ARR-01', codigo: 'ARR', name: 'Arroz de Riego', estado: 'Activo', plantaId: 'PLN-02', isDemo: true }
];

export const initialActividades = [
  { 
    id: 'a1', 
    code: 'LAB-PREP-01', 
    name: 'Subsolado Profundo y Rastra Pesada', 
    groupId: 'GRP-01', 
    cultivo: 'Caña de Azúcar', 
    tipo: 'Mecánica', 
    clasificacion: 'Preparación de Suelos', 
    unidadProduccion: 'Hectáreas', 
    unidadMedida: 'Horas', 
    tarifaBase: 85.0, 
    productosEstandar: [],
    isDemo: true
  },
  { 
    id: 'a2', 
    code: 'LAB-FERT-01', 
    name: 'Fertilización Edáfica NPK de Fondo (Urea + DAP + KCl)', 
    groupId: 'GRP-03', 
    cultivo: 'Todos', 
    tipo: 'Mecánica / Manual', 
    clasificacion: 'Nutrición Vegetal', 
    unidadProduccion: 'Hectáreas', 
    unidadMedida: 'Hectáreas', 
    tarifaBase: 35.0, 
    productosEstandar: ['PROD-01', 'PROD-02', 'PROD-03'],
    isDemo: true
  },
  { 
    id: 'a3', 
    code: 'LAB-FITO-01', 
    name: 'Control Fitosanitario Barrenador (Coragen + Bioestimulante)', 
    groupId: 'GRP-04', 
    cultivo: 'Caña de Azúcar', 
    tipo: 'Mecánica (Drone / Fumigadora)', 
    clasificacion: 'Sanidad Vegetal', 
    unidadProduccion: 'Hectáreas', 
    unidadMedida: 'Hectáreas', 
    tarifaBase: 42.0, 
    productosEstandar: ['PROD-05', 'PROD-08'],
    isDemo: true
  },
  { 
    id: 'a4', 
    code: 'LAB-RIE-01', 
    name: 'Riego por Goteo y Balance Hídrico Programado', 
    groupId: 'GRP-05', 
    cultivo: 'Todos', 
    tipo: 'Manual Mecánica', 
    clasificacion: 'Riego', 
    unidadProduccion: 'Hectáreas', 
    unidadMedida: 'Horas', 
    tarifaBase: 12.0, 
    productosEstandar: [],
    isDemo: true
  },
  { 
    id: 'a5', 
    code: 'LAB-COS-01', 
    name: 'Cosecha Mecanizada y Alce de Caña a Tren Cañero', 
    groupId: 'GRP-06', 
    cultivo: 'Caña de Azúcar', 
    tipo: 'Mecánica', 
    clasificacion: 'Cosecha', 
    unidadProduccion: 'Toneladas', 
    unidadMedida: 'Toneladas', 
    tarifaBase: 6.8, 
    productosEstandar: [],
    isDemo: true
  },
  { 
    id: 'a6', 
    code: 'LAB-RECOL-01', 
    name: 'Recolección Selectiva de Café Grano Rojo Maduro', 
    groupId: 'GRP-06', 
    cultivo: 'Café Arábica Especial', 
    tipo: 'Manual', 
    clasificacion: 'Recolección', 
    unidadProduccion: 'Kilogramos', 
    unidadMedida: 'Jornales', 
    tarifaBase: 0.28, 
    productosEstandar: [],
    isDemo: true
  }
];

export const initialTiposProductos = [
  { id: 'tp1', nombre: 'Fertilizantes Edáficos (NPK)', isDemo: true },
  { id: 'tp2', nombre: 'Fertilizantes Foliares & Micronutrientes', isDemo: true },
  { id: 'tp3', nombre: 'Insecticidas & Acaricidas', isDemo: true },
  { id: 'tp4', nombre: 'Herbicidas Selectivos & No Selectivos', isDemo: true },
  { id: 'tp5', nombre: 'Fungicidas & Biocontroladores', isDemo: true },
  { id: 'tp6', nombre: 'Enmiendas & Acondicionadores de Suelo', isDemo: true },
  { id: 'tp7', nombre: 'Bioestimulantes & Reguladores', isDemo: true }
];

export const initialProductos = [
  { id: 'PROD-01', codigo: 'PROD-01', nombre: 'Urea Granulada 46% Nitrógeno', tipoId: 'tp1', unidadMedida: 'KG', stockActual: 8500, costoUnitario: 2.45, isDemo: true },
  { id: 'PROD-02', codigo: 'PROD-02', nombre: 'Fosfato Diamónico (DAP) 18-46-0', tipoId: 'tp1', unidadMedida: 'KG', stockActual: 6200, costoUnitario: 3.30, isDemo: true },
  { id: 'PROD-03', codigo: 'PROD-03', nombre: 'Cloruro de Potasio (KCl) 60% K2O', tipoId: 'tp1', unidadMedida: 'KG', stockActual: 7400, costoUnitario: 2.85, isDemo: true },
  { id: 'PROD-04', codigo: 'PROD-04', nombre: 'Glifosato 480 SL Herbicida Sistémico', tipoId: 'tp4', unidadMedida: 'Litros', stockActual: 1200, costoUnitario: 9.80, isDemo: true },
  { id: 'PROD-05', codigo: 'PROD-05', nombre: 'Coragen (Clorantraniliprol 200 SC)', tipoId: 'tp3', unidadMedida: 'Litros', stockActual: 180, costoUnitario: 88.00, isDemo: true },
  { id: 'PROD-06', codigo: 'PROD-06', nombre: 'Trichoderma harzianum Biocontrol', tipoId: 'tp5', unidadMedida: 'KG', stockActual: 320, costoUnitario: 24.50, isDemo: true },
  { id: 'PROD-07', codigo: 'PROD-07', nombre: 'Cal Dolomita Enmienda Calcio-Magnesio', tipoId: 'tp6', unidadMedida: 'KG', stockActual: 15000, costoUnitario: 0.18, isDemo: true },
  { id: 'PROD-08', codigo: 'PROD-08', nombre: 'Bioestimulante Algas Marinas + Aminoácidos', tipoId: 'tp7', unidadMedida: 'Litros', stockActual: 450, costoUnitario: 19.50, isDemo: true }
];

export const initialTrabajadores = [
  { id: 'TRAB-1', identificacion: '1144123456', nombre: 'Mauricio', apellido: 'Valencia', cargo: 'Ingeniero Agrónomo de Campo', estado: 'Activo', cuadrillaId: 'CUA-1', isDemo: true },
  { id: 'TRAB-2', identificacion: '94567890', nombre: 'Heriberto', apellido: 'Caicedo', cargo: 'Operador Máster de Cosechadora', estado: 'Activo', cuadrillaId: 'CUA-1', isDemo: true },
  { id: 'TRAB-3', identificacion: '1130987654', nombre: 'Julián', apellido: 'Rendón', cargo: 'Supervisor de Riego y Válvulas', estado: 'Activo', cuadrillaId: 'CUA-2', isDemo: true },
  { id: 'TRAB-4', identificacion: '6677889900', nombre: 'Rosa', apellido: 'Guerrero', cargo: 'Líder de Cuadrilla de Cosecha', estado: 'Activo', cuadrillaId: 'CUA-3', isDemo: true },
  { id: 'TRAB-5', identificacion: '3144556677', nombre: 'Alonso', apellido: 'Morales', cargo: 'Piloto Aplicador de Drone Agrícola', estado: 'Activo', cuadrillaId: 'CUA-2', isDemo: true }
];

export const initialCuadrillas = [
  { id: 'CUA-1', nombre: 'Cuadrilla Mecanizada de Cosecha & Preparación', jefe: 'TRAB-2', isDemo: true },
  { id: 'CUA-2', nombre: 'Cuadrilla Técnica de Riego & Drones', jefe: 'TRAB-5', isDemo: true },
  { id: 'CUA-3', nombre: 'Cuadrilla de Labores Manuales & Recolección', jefe: 'TRAB-4', isDemo: true }
];

export const initialMaquinaria = [
  { id: 'TRAC-01', codigo: 'TRAC-01', name: 'Tractor John Deere 8320R (320 HP)', tipoId: 'tm1', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 85, horometroActual: 2450.5, ultimoMantenimientoHoras: 2300, frecuenciaMantenimiento: 250, isDemo: true },
  { id: 'TRAC-02', codigo: 'TRAC-02', name: 'Tractor Massey Ferguson 6713 (130 HP)', tipoId: 'tm1', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 48, horometroActual: 1890.0, ultimoMantenimientoHoras: 1750, frecuenciaMantenimiento: 250, isDemo: true },
  { id: 'COS-01', codigo: 'COS-01', name: 'Cosechadora de Caña Case IH Austoft 8810', tipoId: 'tm2', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 165, horometroActual: 3120.0, ultimoMantenimientoHoras: 3000, frecuenciaMantenimiento: 200, isDemo: true },
  { id: 'FUM-01', codigo: 'FUM-01', name: 'Fumigadora Autopropulsada John Deere 4730', tipoId: 'tm3', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 78, horometroActual: 1420.0, ultimoMantenimientoHoras: 1350, frecuenciaMantenimiento: 250, isDemo: true },
  { id: 'DRN-01', codigo: 'DRN-01', name: 'Drone Agrícola DJI Agras T40 Multiespectral', tipoId: 'tm3', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 55, horometroActual: 430.0, ultimoMantenimientoHoras: 400, frecuenciaMantenimiento: 100, isDemo: true },
  { id: 'VAG-01', codigo: 'VAG-01', name: 'Vagón Volquete Cañero 12T (Tándem)', tipoId: 'tm4', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 22, horometroActual: 0, ultimoMantenimientoHoras: 0, frecuenciaMantenimiento: 500, isDemo: true }
];

export const initialUnidades = [
  { id: 'HA', name: 'Hectáreas' },
  { id: 'HR', name: 'Horas Máquina' },
  { id: 'JOR', name: 'Jornales' },
  { id: 'TON', name: 'Toneladas' },
  { id: 'KG', name: 'Kilogramos' },
  { id: 'LT', name: 'Litros' },
  { id: 'PLT', name: 'Plantas / Árboles' },
  { id: 'MTS', name: 'Metros Lineales' }
];

export const emptyTiposMaquinaria = [
  { id: 'tm1', nombre: 'Tractor Agrícola' },
  { id: 'tm2', nombre: 'Cosechadora Combinada' },
  { id: 'tm3', nombre: 'Pulverizadora / Drone' },
  { id: 'tm4', nombre: 'Vagón / Remolque' },
  { id: 'tm5', nombre: 'Alzadora Hidráulica' },
  { id: 'tm6', nombre: 'Implemento (Rastra/Subsolador)' }
];
export const initialTiposMaquinaria = emptyTiposMaquinaria;

export const initialProveedores = [
  { id: 'PROV-1', nombre: 'Yara Colombia S.A. (Nutrición Vegetal)', tipo: 'Materia Prima', contacto: 'Andrés Morales', telefono: '+57 310 445 6789', email: 'contacto@yara.com', estado: 'Activo', isDemo: true },
  { id: 'PROV-2', nombre: 'Syngenta & FMC Agroquímica', tipo: 'Materia Prima', contacto: 'Laura Gómez', telefono: '+57 315 889 1234', email: 'ventas@syngenta.com', estado: 'Activo', isDemo: true },
  { id: 'PROV-3', nombre: 'Casa Toro John Deere (Maquinaria & Repuestos)', tipo: 'Servicios', contacto: 'Camilo Rodríguez', telefono: '+57 318 900 4567', email: 'repuestos@casatoro.com', estado: 'Activo', isDemo: true },
  { id: 'PROV-4', nombre: 'AgroAéreo Drones de Colombia', tipo: 'Ambos', contacto: 'Diana Castro', telefono: '+57 301 223 9988', email: 'operaciones@agroaereo.co', estado: 'Activo', isDemo: true }
];

export const emptyControlesAgro = [
  { 
    id: 'c1', 
    nombre: 'Evaluación de Barrenador (Diatraea spp.) en Caña',
    cultivo: 'Caña de Azúcar',
    isDemo: true,
    variables: [
      { id: 'v1', nombre: 'Porcentaje de Intensidad de Infestación (%)', tipo: 'numérico', min: 0, max: 100, rangos: [
        { min: 0, max: 2.5, mensaje: 'Nivel Seguro / Aceptable', color: '#10B981' },
        { min: 2.6, max: 5.0, mensaje: 'Umbral Económico de Daño (Alerta)', color: '#F59E0B' },
        { min: 5.1, max: 100, mensaje: 'Infestación Crítica (Aplicación Inmediata)', color: '#EF4444' }
      ]},
      { id: 'v2', nombre: 'Presencia de Crisálidas / Larvas Vivas', tipo: 'opcion', opciones: ['Ausente', 'Baja', 'Alta'] }
    ]
  },
  { 
    id: 'c2', 
    nombre: 'Monitoreo de Roya y Broca en Café',
    cultivo: 'Café Arábica Especial',
    isDemo: true,
    variables: [
      { id: 'v3', nombre: 'Incidencia de Broca en Fruto (%)', tipo: 'numérico', min: 0, max: 100, rangos: [
        { min: 0, max: 2.0, mensaje: 'Bajo Control (<2%)', color: '#10B981' },
        { min: 2.1, max: 5.0, mensaje: 'Alerta (>2%) Control Etológico', color: '#F59E0B' },
        { min: 5.1, max: 100, mensaje: 'Crítico (>5%) Control Biológico/Químico', color: '#EF4444' }
      ]}
    ]
  }
];

export const createEmptyInstanceData = (clientCode = 'GLOBAL') => ({
  globalPlanta: 'Todas',
  globalCultivo: 'Todos',
  plantas: [...initialPlantas],
  empresas: [...initialEmpresas],
  sectores: [...initialData],
  cultivos: [...initialCultivos],
  gruposActividades: [...initialGrupos],
  actividades: [...initialActividades],
  trabajadores: [...initialTrabajadores],
  proveedores: [...initialProveedores],
  maquinarias: [...initialMaquinaria],
  tiposMaquinaria: [...emptyTiposMaquinaria],
  controlesAgro: [...emptyControlesAgro],
  configuraciones: { ...GLOBAL_CONFIG_DEFAULTS },
  registrosControles: [],
  mantenimientos: [],
  planificaciones: [],
  syncQueue: [],
  movimientosInventario: [],
  categoriasAcceso: [...DEFAULT_ACCESS_CATEGORIES(clientCode)],
  usuarios: [...DEFAULT_USERS(clientCode)]
});
