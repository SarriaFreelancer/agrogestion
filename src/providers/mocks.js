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
export const initialData = [
  { 
    id: 'ZON-01', 
    name: 'Zona Valle del Cauca (Norte)', 
    type: 'Sector', // Top node container
    plantaId: 'PLN-01',
    sectores: [
      {
        id: 'SEC-01',
        name: 'Sector Cañaverales 1',
        type: 'Sector',
        fincas: [
          { 
            id: 'FIN-01', 
            name: 'Hacienda El Paraíso', 
            type: 'Finca',
            location: '3.5284, -76.2981',
            lotes: [
              { 
                id: 'LOT-01', 
                name: 'Lote 01 (Variedad CC 01-1938)', 
                type: 'Lote',
                topography: 'Plana',
                suertes: [
                  { 
                    id: 'SUE-01', 
                    name: 'Suerte A-01 (Tablón Principal)', 
                    type: 'Suerte', 
                    hectareas: 15.5, 
                    plantas: 18500, 
                    toneladas: 1750, 
                    cultivo: 'Caña de Azúcar', 
                    estado: 'Activo', 
                    estadoProductivo: 'En Crecimiento Vigoroso', 
                    edadSuerteDias: 140, 
                    edadUltimaCosechaDias: 380, 
                    lat: 3.5285, 
                    lng: -76.2980,
                    geometria: [
                      [3.5280, -76.2985],
                      [3.5290, -76.2985],
                      [3.5290, -76.2975],
                      [3.5280, -76.2975]
                    ],
                    surcos: [
                      { id: 'SUR-01', name: 'Válvula / Surco 1-20', type: 'Surco', hectareas: 4.0, plantas: 4800 },
                      { id: 'SUR-02', name: 'Válvula / Surco 21-40', type: 'Surco', hectareas: 4.0, plantas: 4800 },
                      { id: 'SUR-03', name: 'Válvula / Surco 41-60', type: 'Surco', hectareas: 4.0, plantas: 4800 },
                      { id: 'SUR-04', name: 'Válvula / Surco 61-80 (Cabecera)', type: 'Surco', hectareas: 3.5, plantas: 4100 }
                    ]
                  },
                  { 
                    id: 'SUE-02', 
                    name: 'Suerte A-02 (Tablón Ribera)', 
                    type: 'Suerte', 
                    hectareas: 12.0, 
                    plantas: 14200, 
                    toneladas: 1320, 
                    cultivo: 'Caña de Azúcar', 
                    estado: 'Activo', 
                    estadoProductivo: 'Plantilla Reciente', 
                    edadSuerteDias: 45, 
                    edadUltimaCosechaDias: 45, 
                    lat: 3.5265, 
                    lng: -76.2960,
                    geometria: [
                      [3.5260, -76.2965],
                      [3.5270, -76.2965],
                      [3.5270, -76.2955],
                      [3.5260, -76.2955]
                    ],
                    surcos: [
                      { id: 'SUR-05', name: 'Válvula R-1', type: 'Surco', hectareas: 6.0, plantas: 7100 },
                      { id: 'SUR-06', name: 'Válvula R-2', type: 'Surco', hectareas: 6.0, plantas: 7100 }
                    ]
                  }
                ]
              },
              { 
                id: 'LOT-02', 
                name: 'Lote 02 (Variedad CC 85-92)', 
                type: 'Lote',
                topography: 'Plana',
                suertes: [
                  { 
                    id: 'SUE-03', 
                    name: 'Suerte B-01 (Maduración Cosecha)', 
                    type: 'Suerte', 
                    hectareas: 22.0, 
                    plantas: 26400, 
                    toneladas: 2600, 
                    cultivo: 'Caña de Azúcar', 
                    estado: 'Activo', 
                    estadoProductivo: 'Maduración Precosecha', 
                    edadSuerteDias: 330, 
                    edadUltimaCosechaDias: 330, 
                    lat: 3.5310, 
                    lng: -76.2940,
                    geometria: [
                      [3.5300, -76.2950],
                      [3.5320, -76.2950],
                      [3.5320, -76.2930],
                      [3.5300, -76.2930]
                    ],
                    surcos: [
                      { id: 'SUR-07', name: 'Sección Norte 1-40', type: 'Surco', hectareas: 11.0, plantas: 13200 },
                      { id: 'SUR-08', name: 'Sección Sur 41-80', type: 'Surco', hectareas: 11.0, plantas: 13200 }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    fincas: [
      { 
        id: 'FIN-01', 
        name: 'Hacienda El Paraíso', 
        type: 'Finca',
        location: '3.5284, -76.2981',
        lotes: [
          { 
            id: 'LOT-01', 
            name: 'Lote 01 (Variedad CC 01-1938)', 
            type: 'Lote',
            topography: 'Plana',
            suertes: [
              { 
                id: 'SUE-01', 
                name: 'Suerte A-01 (Tablón Principal)', 
                type: 'Suerte', 
                hectareas: 15.5, 
                plantas: 18500, 
                toneladas: 1750, 
                cultivo: 'Caña de Azúcar', 
                estado: 'Activo', 
                estadoProductivo: 'En Crecimiento Vigoroso', 
                edadSuerteDias: 140, 
                edadUltimaCosechaDias: 380, 
                lat: 3.5285, 
                lng: -76.2980,
                geometria: [
                  [3.5280, -76.2985],
                  [3.5290, -76.2985],
                  [3.5290, -76.2975],
                  [3.5280, -76.2975]
                ],
                surcos: [
                  { id: 'SUR-01', name: 'Válvula / Surco 1-20', type: 'Surco', hectareas: 4.0, plantas: 4800 },
                  { id: 'SUR-02', name: 'Válvula / Surco 21-40', type: 'Surco', hectareas: 4.0, plantas: 4800 },
                  { id: 'SUR-03', name: 'Válvula / Surco 41-60', type: 'Surco', hectareas: 4.0, plantas: 4800 },
                  { id: 'SUR-04', name: 'Válvula / Surco 61-80 (Cabecera)', type: 'Surco', hectareas: 3.5, plantas: 4100 }
                ]
              },
              { 
                id: 'SUE-02', 
                name: 'Suerte A-02 (Tablón Ribera)', 
                type: 'Suerte', 
                hectareas: 12.0, 
                plantas: 14200, 
                toneladas: 1320, 
                cultivo: 'Caña de Azúcar', 
                estado: 'Activo', 
                estadoProductivo: 'Plantilla Reciente', 
                edadSuerteDias: 45, 
                edadUltimaCosechaDias: 45, 
                lat: 3.5265, 
                lng: -76.2960,
                geometria: [
                  [3.5260, -76.2965],
                  [3.5270, -76.2965],
                  [3.5270, -76.2955],
                  [3.5260, -76.2955]
                ],
                surcos: [
                  { id: 'SUR-05', name: 'Válvula R-1', type: 'Surco', hectareas: 6.0, plantas: 7100 },
                  { id: 'SUR-06', name: 'Válvula R-2', type: 'Surco', hectareas: 6.0, plantas: 7100 }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  { 
    id: 'ZON-02', 
    name: 'Zona Cordillera Central (Café & Aguacate)', 
    type: 'Sector', 
    plantaId: 'PLN-02',
    fincas: [
      { 
        id: 'FIN-02', 
        name: 'Finca La Esperanza de Altura', 
        type: 'Finca',
        location: '4.8140, -75.6944',
        lotes: [
          {
            id: 'LOT-03',
            name: 'Lote Café Castillo Especial',
            type: 'Lote',
            topography: 'Ondulada',
            suertes: [
              { 
                id: 'SUE-04', 
                name: 'Suerte C-01 (Cafetal Producción)', 
                type: 'Suerte', 
                hectareas: 18.4, 
                plantas: 92000, 
                toneladas: 46, 
                cultivo: 'Café Arábica Especial', 
                estado: 'Activo', 
                estadoProductivo: 'Floración y Grano Verde', 
                edadSuerteDias: 780, 
                edadUltimaCosechaDias: 180, 
                lat: 4.8145, 
                lng: -75.6940,
                geometria: [
                  [4.8135, -75.6950],
                  [4.8155, -75.6950],
                  [4.8155, -75.6930],
                  [4.8135, -75.6930]
                ],
                surcos: [
                  { id: 'SUR-09', name: 'Sección Ladera Alta', type: 'Surco', hectareas: 9.2, plantas: 46000 },
                  { id: 'SUR-10', name: 'Sección Ladera Baja', type: 'Surco', hectareas: 9.2, plantas: 46000 }
                ]
              }
            ]
          },
          {
            id: 'LOT-04',
            name: 'Lote Aguacate Hass Exportación',
            type: 'Lote',
            topography: 'Ondulada',
            suertes: [
              { 
                id: 'SUE-05', 
                name: 'Suerte H-01 (Árboles 4 Años)', 
                type: 'Suerte', 
                hectareas: 14.0, 
                plantas: 5600, 
                toneladas: 168, 
                cultivo: 'Aguacate Hass', 
                estado: 'Activo', 
                estadoProductivo: 'Llenado de Fruto', 
                edadSuerteDias: 1450, 
                edadUltimaCosechaDias: 210, 
                lat: 4.8180, 
                lng: -75.6910,
                geometria: [],
                surcos: [
                  { id: 'SUR-11', name: 'Bloque Microaspersión 1', type: 'Surco', hectareas: 7.0, plantas: 2800 },
                  { id: 'SUR-12', name: 'Bloque Microaspersión 2', type: 'Surco', hectareas: 7.0, plantas: 2800 }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export const initialGrupos = [
  { id: 'GRP-01', name: 'Preparación de Suelos & Adecuación' },
  { id: 'GRP-02', name: 'Siembra & Transplante' },
  { id: 'GRP-03', name: 'Nutrición & Fertilización Edáfica/Foliar' },
  { id: 'GRP-04', name: 'Control Fitosanitario (Plagas & Malezas)' },
  { id: 'GRP-05', name: 'Riego, Drenajes & Balance Hídrico' },
  { id: 'GRP-06', name: 'Cosecha, Recolección & Alce' }
];

export const initialCultivos = [
  { id: 'CAN-01', codigo: 'CAN', name: 'Caña de Azúcar', estado: 'Activo', plantaId: 'PLN-01' },
  { id: 'CAF-01', codigo: 'CAF', name: 'Café Arábica Especial', estado: 'Activo', plantaId: 'PLN-02' },
  { id: 'AGU-01', codigo: 'AGU', name: 'Aguacate Hass', estado: 'Activo', plantaId: 'PLN-03' },
  { id: 'PAL-01', codigo: 'PAL', name: 'Palma de Aceite', estado: 'Activo', plantaId: 'PLN-01' },
  { id: 'MAI-01', codigo: 'MAI', name: 'Maíz Tecnificado', estado: 'Activo', plantaId: 'PLN-01' },
  { id: 'ARR-01', codigo: 'ARR', name: 'Arroz de Riego', estado: 'Activo', plantaId: 'PLN-02' }
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
    productosEstandar: [] 
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
    productosEstandar: ['PROD-01', 'PROD-02', 'PROD-03'] 
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
    productosEstandar: ['PROD-05', 'PROD-08'] 
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
    productosEstandar: [] 
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
    productosEstandar: [] 
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
    productosEstandar: [] 
  }
];

export const initialTiposProductos = [
  { id: 'tp1', nombre: 'Fertilizantes Edáficos (NPK)' },
  { id: 'tp2', nombre: 'Fertilizantes Foliares & Micronutrientes' },
  { id: 'tp3', nombre: 'Insecticidas & Acaricidas' },
  { id: 'tp4', nombre: 'Herbicidas Selectivos & No Selectivos' },
  { id: 'tp5', nombre: 'Fungicidas & Biocontroladores' },
  { id: 'tp6', nombre: 'Enmiendas & Acondicionadores de Suelo' },
  { id: 'tp7', nombre: 'Bioestimulantes & Reguladores' }
];

export const initialProductos = [
  { id: 'PROD-01', nombre: 'Urea Granulada 46% Nitrógeno', tipoId: 'tp1', unidadMedida: 'KG', stockActual: 8500, costoUnitario: 2.45 },
  { id: 'PROD-02', nombre: 'Fosfato Diamónico (DAP) 18-46-0', tipoId: 'tp1', unidadMedida: 'KG', stockActual: 6200, costoUnitario: 3.30 },
  { id: 'PROD-03', nombre: 'Cloruro de Potasio (KCl) 60% K2O', tipoId: 'tp1', unidadMedida: 'KG', stockActual: 7400, costoUnitario: 2.85 },
  { id: 'PROD-04', nombre: 'Glifosato 480 SL Herbicida Sistémico', tipoId: 'tp4', unidadMedida: 'Litros', stockActual: 1200, costoUnitario: 9.80 },
  { id: 'PROD-05', nombre: 'Coragen (Clorantraniliprol 200 SC)', tipoId: 'tp3', unidadMedida: 'Litros', stockActual: 180, costoUnitario: 88.00 },
  { id: 'PROD-06', nombre: 'Trichoderma harzianum Biocontrol', tipoId: 'tp5', unidadMedida: 'KG', stockActual: 320, costoUnitario: 24.50 },
  { id: 'PROD-07', nombre: 'Cal Dolomita Enmienda Calcio-Magnesio', tipoId: 'tp6', unidadMedida: 'KG', stockActual: 15000, costoUnitario: 0.18 },
  { id: 'PROD-08', nombre: 'Bioestimulante Algas Marinas + Aminoácidos', tipoId: 'tp7', unidadMedida: 'Litros', stockActual: 450, costoUnitario: 19.50 }
];

export const initialTrabajadores = [
  { id: 'TRAB-1', identificacion: '1144123456', nombre: 'Mauricio', apellido: 'Valencia', cargo: 'Ingeniero Agrónomo de Campo', estado: 'Activo', cuadrillaId: 'CUA-1' },
  { id: 'TRAB-2', identificacion: '94567890', nombre: 'Heriberto', apellido: 'Caicedo', cargo: 'Operador Máster de Cosechadora', estado: 'Activo', cuadrillaId: 'CUA-1' },
  { id: 'TRAB-3', identificacion: '1130987654', nombre: 'Julián', apellido: 'Rendón', cargo: 'Supervisor de Riego y Válvulas', estado: 'Activo', cuadrillaId: 'CUA-2' },
  { id: 'TRAB-4', identificacion: '6677889900', nombre: 'Rosa', apellido: 'Guerrero', cargo: 'Líder de Cuadrilla de Cosecha', estado: 'Activo', cuadrillaId: 'CUA-3' },
  { id: 'TRAB-5', identificacion: '3144556677', nombre: 'Alonso', apellido: 'Morales', cargo: 'Piloto Aplicador de Drone Agrícola', estado: 'Activo', cuadrillaId: 'CUA-2' }
];

export const initialCuadrillas = [
  { id: 'CUA-1', nombre: 'Cuadrilla Mecanizada de Cosecha & Preparación', jefe: 'TRAB-2' },
  { id: 'CUA-2', nombre: 'Cuadrilla Técnica de Riego & Drones', jefe: 'TRAB-5' },
  { id: 'CUA-3', nombre: 'Cuadrilla de Labores Manuales & Recolección', jefe: 'TRAB-4' }
];

export const initialMaquinaria = [
  { id: 'TRAC-01', name: 'Tractor John Deere 8320R (320 HP)', tipoId: 'tm1', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 85, horometroActual: 2450.5, ultimoMantenimientoHoras: 2300, frecuenciaMantenimiento: 250 },
  { id: 'TRAC-02', name: 'Tractor Massey Ferguson 6713 (130 HP)', tipoId: 'tm1', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 48, horometroActual: 1890.0, ultimoMantenimientoHoras: 1750, frecuenciaMantenimiento: 250 },
  { id: 'COS-01', name: 'Cosechadora de Caña Case IH Austoft 8810', tipoId: 'tm2', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 165, horometroActual: 3120.0, ultimoMantenimientoHoras: 3000, frecuenciaMantenimiento: 200 },
  { id: 'FUM-01', name: 'Fumigadora Autopropulsada John Deere 4730', tipoId: 'tm3', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 78, horometroActual: 1420.0, ultimoMantenimientoHoras: 1350, frecuenciaMantenimiento: 250 },
  { id: 'DRN-01', name: 'Drone Agrícola DJI Agras T40 Multiespectral', tipoId: 'tm3', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 55, horometroActual: 430.0, ultimoMantenimientoHoras: 400, frecuenciaMantenimiento: 100 },
  { id: 'VAG-01', name: 'Vagón Volquete Cañero 12T (Tándem)', tipoId: 'tm4', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 22, horometroActual: 0, ultimoMantenimientoHoras: 0, frecuenciaMantenimiento: 500 }
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

export const initialProveedores = [
  { id: 'PROV-1', nombre: 'Yara Colombia S.A. (Nutrición Vegetal)', tipo: 'Materia Prima', contacto: 'Andrés Morales', telefono: '+57 310 445 6789', email: 'contacto@yara.com', estado: 'Activo' },
  { id: 'PROV-2', nombre: 'Syngenta & FMC Agroquímica', tipo: 'Materia Prima', contacto: 'Laura Gómez', telefono: '+57 315 889 1234', email: 'ventas@syngenta.com', estado: 'Activo' },
  { id: 'PROV-3', nombre: 'Casa Toro John Deere (Maquinaria & Repuestos)', tipo: 'Servicios', contacto: 'Camilo Rodríguez', telefono: '+57 318 900 4567', email: 'repuestos@casatoro.com', estado: 'Activo' },
  { id: 'PROV-4', nombre: 'AgroAéreo Drones de Colombia', tipo: 'Ambos', contacto: 'Diana Castro', telefono: '+57 301 223 9988', email: 'operaciones@agroaereo.co', estado: 'Activo' }
];

export const emptyControlesAgro = [
  { 
    id: 'c1', 
    nombre: 'Evaluación de Barrenador (Diatraea spp.) en Caña',
    cultivo: 'Caña de Azúcar',
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
