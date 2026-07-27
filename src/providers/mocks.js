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
  'Estándar': ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes'],
  'Premium': ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento', 'Mapas'],
  'Admin': ['ALL']
};

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
  estructuraNiveles: 4,
  estructuraNivelNombres: {
    nivel1: 'Sector',
    nivel2: 'Finca',
    nivel3: 'Lote',
    nivel4: 'Suerte'
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
    estado: 'Activo'
  }
]);

export const initialPlantas = [
  { id: 'PLN-01', codigo: 'PLN-01', name: 'Ingenio Central', status: 'ACTIVE', companyId: 1 },
  { id: 'PLN-02', codigo: 'PLN-02', name: 'Planta Sur', status: 'ACTIVE', companyId: 1 }
];

export const initialData = [
  { id: 'SEC-01', name: 'Sector Norte', type: 'Sector', plantaId: 'PLN-01',
    fincas: [
      { id: 'FIN-01', name: 'Finca La Esperanza', type: 'Finca',
        lotes: [
          { id: 'LOT-01', name: 'Lote 1', type: 'Lote',
            suertes: [
              { id: 'SUE-01', name: 'Suerte A', type: 'Suerte', hectareas: 15.5, plantas: 15500, tareas: 31, toneladas: 1550, cultivo: 'Caña', estado: 'Activo', estadoProductivo: 'Sembrado', edadSuerteDias: 120, edadUltimaCosechaDias: 0, geometria: [] },
              { id: 'SUE-02', name: 'Suerte B', type: 'Suerte', hectareas: 10.2, plantas: 10200, tareas: 20.4, toneladas: 1020, cultivo: 'Caña', estado: 'Inactivo', estadoProductivo: 'Previvero', edadSuerteDias: 10, edadUltimaCosechaDias: 365, geometria: [] }
            ]
          },
          { id: 'LOT-02', name: 'Lote 2', type: 'Lote',
            suertes: [
              { id: 'SUE-03', name: 'Suerte C', type: 'Suerte', hectareas: 22.0, plantas: 8800, tareas: 44, toneladas: 0, cultivo: 'Mango', estado: 'Activo', estadoProductivo: 'En Producción', edadSuerteDias: 200, edadUltimaCosechaDias: 150, geometria: [] }
            ]
          }
        ]
      }
    ]
  },
  { id: 'SEC-02', name: 'Sector Sur', type: 'Sector', plantaId: 'PLN-02',
    fincas: [
      { id: 'FIN-02', name: 'Finca El Tesoro', type: 'Finca', lotes: [] }
    ]
  }
];

export const initialGrupos = [
  { id: 'GRP-01', name: 'Aplicación de Insumos' },
  { id: 'GRP-02', name: 'Riego' },
  { id: 'GRP-03', name: 'Labores Culturales' }
];

export const initialCultivos = [
  { id: 'CAN-01', codigo: 'CAN', name: 'Caña', estado: 'Activo', plantaId: 'PLN-01' },
  { id: 'MAN-01', codigo: 'MAN', name: 'Mango', estado: 'Activo', plantaId: 'PLN-01' },
  { id: 'NAR-02', codigo: 'NAR', name: 'Naranja', estado: 'Activo', plantaId: 'PLN-02' }
];

export const initialActividades = [
  { id: 'a1', code: 'INS-01', name: 'Aplicación Insecticida', groupId: 'GRP-01', cultivo: 'Caña', tipo: 'Mecánica', clasificacion: 'Aplicación de insumos', unidadProduccion: 'Hectáreas', unidadMedida: 'Hectáreas', tarifaBase: 12.5, productosEstandar: ['p1'] },
  { id: 'a2', code: 'INS-02', name: 'Aplicación Fertilizante', groupId: 'GRP-01', cultivo: 'Caña', tipo: 'Manual', clasificacion: 'Aplicación de fertilizantes', unidadProduccion: 'Hectáreas', unidadMedida: 'Jornales', tarifaBase: 25, productosEstandar: ['p2'] },
  { id: 'a3', code: 'RIE-01', name: 'Riego por Goteo', groupId: 'GRP-02', cultivo: 'Todos', tipo: 'Manual Mecánica', clasificacion: 'Riego', unidadProduccion: 'Hectáreas', unidadMedida: 'Horas', tarifaBase: 5, productosEstandar: [] },
  { id: 'a4', code: 'LAB-01', name: 'Corte de Semilla', groupId: 'GRP-03', cultivo: 'Caña', tipo: 'Manual', clasificacion: 'Corte', unidadProduccion: 'Toneladas', unidadMedida: 'Toneladas', tarifaBase: 4.5, productosEstandar: [] }
];

export const initialTiposProductos = [
  { id: 'tp1', nombre: 'Insecticidas' },
  { id: 'tp2', nombre: 'Fertilizantes' },
  { id: 'tp3', nombre: 'Herbicidas' },
  { id: 'tp4', nombre: 'Fungicidas' },
  { id: 'tp5', nombre: 'Otros' }
];

export const initialProductos = [
  { id: 'PROD-01', nombre: 'Insecticida Alfa', tipoId: 'tp1', unidadMedida: 'Litros', stockActual: 100, costoUnitario: 15.5 },
  { id: 'PROD-02', nombre: 'Fertilizante NPK', tipoId: 'tp2', unidadMedida: 'KG', stockActual: 500, costoUnitario: 2.3 }
];

export const initialTrabajadores = [
  { id: 'TRAB-1', identificacion: '12345678', nombre: 'Juan', apellido: 'Pérez', cargo: 'Jornalero', estado: 'Activo', cuadrillaId: 'CUA-1' },
  { id: 'TRAB-2', identificacion: '87654321', nombre: 'Carlos', apellido: 'Gómez', cargo: 'Operador', estado: 'Activo', cuadrillaId: 'CUA-1' },
  { id: 'TRAB-3', identificacion: '11223344', nombre: 'Luis', apellido: 'Martínez', cargo: 'Jornalero', estado: 'Activo', cuadrillaId: '' }
];

export const initialCuadrillas = [
  { id: 'CUA-1', nombre: 'Cuadrilla Corte 1', jefe: 'TRAB-2' }
];

export const initialMaquinaria = [
  { id: 'TRAC-01', name: 'Tractor John Deere', tipoId: 'tm1', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 45, horometroActual: 1250.5 },
  { id: 'VAG-01', name: 'Vagón de Carga', tipoId: 'tm2', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 15, horometroActual: 0 }
];

export const initialUnidades = [
  { id: 'HA', name: 'Hectáreas' },
  { id: 'HR', name: 'Horas' },
  { id: 'JOR', name: 'Jornales' },
  { id: 'PLT', name: 'Plantas' },
  { id: 'TON', name: 'Toneladas' },
  { id: 'MTS', name: 'Metros' }
];

export const emptyTiposMaquinaria = [
  { id: 'tm1', nombre: 'Tractor' },
  { id: 'tm2', nombre: 'Cosechadora' },
  { id: 'tm3', nombre: 'Implemento' },
  { id: 'tm4', nombre: 'Vagón' },
  { id: 'tm5', nombre: 'Alzadora' }
];

export const initialProveedores = [
  { id: 'PROV-1', nombre: 'AgroQuímicos S.A.', tipo: 'Materia Prima', contacto: 'Juan Pérez', telefono: '555-1234', email: 'contacto@agroquimicos.com', estado: 'Activo' },
  { id: 'PROV-2', nombre: 'Servicios Agrícolas Ltda.', tipo: 'Servicios', contacto: 'María Gómez', telefono: '555-5678', email: 'info@serviciosagricolas.com', estado: 'Activo' },
  { id: 'PROV-3', nombre: 'AgroTotal Solutions', tipo: 'Ambos', contacto: 'Carlos Rodríguez', telefono: '555-9012', email: 'ventas@agrototal.com', estado: 'Activo' }
];

export const emptyControlesAgro = [
  { id: 'c1', nombre: 'Monitoreo de Plagas',
    variables: [
      { id: 'v1', nombre: 'Población', tipo: 'numérico', min: 0, max: 100, rangos: [
        { min: 0, max: 10, mensaje: 'Bajo', color: '#4caf50' },
        { min: 11, max: 30, mensaje: 'Moderado', color: '#ffeb3b' },
        { min: 31, max: 100, mensaje: 'Crítico', color: '#f44336' }
      ]}
    ]
  }
];

export const createEmptyInstanceData = (clientCode = 'GLOBAL') => ({
  globalPlanta: 'Todas',
  globalCultivo: 'Todos',
  plantas: [...initialPlantas],
  sectores: [],
  cultivos: [],
  gruposActividades: [],
  actividades: [],
  trabajadores: [],
  proveedores: [],
  maquinarias: [],
  tiposMaquinaria: [],
  controlesAgro: [],
  configuraciones: { ...GLOBAL_CONFIG_DEFAULTS },
  registrosControles: [],
  mantenimientos: [],
  planificaciones: [],
  syncQueue: [],
  movimientosInventario: [],
  categoriasAcceso: [],
  usuarios: []
});
