import React, { createContext, useContext, useRef, useState } from 'react';
import { apiUrl } from '@/utils/api';
import { confirmDialog, swalError, swalSuccess } from '@/utils/swal';

const AgroContext = createContext();

const THEME_CONFIG = {
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

const hexToRgb = (hex) => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;

  const parsed = Number.parseInt(value, 16);
  return `${(parsed >> 16) & 255} ${(parsed >> 8) & 255} ${parsed & 255}`;
};

const PLAN_CONFIG = {
  'Estándar': ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes'],
  'Premium': ['Dashboard', 'Estructura', 'Maestros', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento', 'Mapas'],
  'Admin': ['ALL']
};

const GLOBAL_CONFIG_DEFAULTS = {
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

const ACCESS_PERMISSION_KEYS = [
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

const DEFAULT_ACCESS_CATEGORIES = (clientCode = 'GLOBAL') => ([
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
      ver_dashboard: 1,
      ver_estructura: 1,
      ver_maestros: 1,
      ver_planificacion: 1,
      ver_ejecucion: 1,
      ver_reportes: 1,
      ver_monitoreo: 1,
      ver_mantenimiento: 1,
      ver_usuarios: 1,
      crear_usuario: 1,
      editar_usuario: 1,
      eliminar_usuario: 1,
      asignar_modulos: 1,
      gestionar_categorias: 1,
      administrar_config: 1,
      gestionar_clientes: 0,
      crear_actividad: 1,
      editar_actividad: 1,
      eliminar_actividad: 1,
      generar_reporte: 1,
      crear_reporte: 1,
      editar_reporte: 1,
      eliminar_reporte: 1
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
      ver_dashboard: 1,
      ver_estructura: 1,
      ver_maestros: 0,
      ver_planificacion: 0,
      ver_ejecucion: 0,
      ver_reportes: 1,
      ver_monitoreo: 0,
      ver_mantenimiento: 0,
      ver_usuarios: 0,
      crear_usuario: 0,
      editar_usuario: 0,
      eliminar_usuario: 0,
      asignar_modulos: 0,
      gestionar_categorias: 0,
      administrar_config: 0,
      gestionar_clientes: 0,
      crear_actividad: 0,
      editar_actividad: 0,
      eliminar_actividad: 0,
      generar_reporte: 1,
      crear_reporte: 0,
      editar_reporte: 0,
      eliminar_reporte: 0
    },
    modulos: ['Dashboard', 'Estructura', 'Reportes'],
    estado: 'Activo'
  }
]);

const DEFAULT_USERS = (clientCode = 'GLOBAL') => ([
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

const buildDatabaseConfig = (client) => ({
  databaseName: client.databaseName || `agroData_${client.id}`,
  databaseUser: client.databaseUser || `${client.id}_user`,
  databasePassword: client.databasePassword || '',
  databaseEngine: client.databaseEngine || 'SQL Server',
  connectionData: client.connectionData || {},
  status: client.status || 'Activo',
  suspendedReason: client.suspendedReason || ''
});

const normalizeClient = (client) => ({
  ...client,
  ...buildDatabaseConfig(client)
});

const DEFAULT_CLIENTS = {
  'std-01': normalizeClient({ id: 'std-01', name: 'Cliente Estándar Demo', plan: 'Estándar', modules: PLAN_CONFIG['Estándar'], theme: 'Tema Principal' }),
  'prm-01': normalizeClient({ id: 'prm-01', name: 'Cliente Premium Demo', plan: 'Premium', modules: PLAN_CONFIG['Premium'], theme: 'Azul Océano' }),
  'adm': normalizeClient({ id: 'adm', name: 'Administrador Global', plan: 'Admin', modules: PLAN_CONFIG['Admin'], theme: 'Modo Nocturno', databaseName: 'agroData_admin_global', databaseUser: 'admin_global' })
};

const initialData = [
  { id: 'SEC-01', name: 'Sector Norte', type: 'Sector', plantaCliente: 'Ingenio Central',
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
  { id: 'SEC-02', name: 'Sector Sur', type: 'Sector', plantaCliente: 'Planta Sur',
    fincas: [
      { id: 'FIN-02', name: 'Finca El Tesoro', type: 'Finca', lotes: [] }
    ]
  }
];

const initialGrupos = [
  { id: 'GRP-01', name: 'Aplicación de Insumos' },
  { id: 'g2', id: 'GRP-02', name: 'Riego' },
  { id: 'g3', id: 'GRP-03', name: 'Labores Culturales' }
];

const initialCultivos = [
  { id: 'cult-1', id: 'CAN', name: 'Caña', estado: 'Activo' },
  { id: 'cult-2', id: 'MAN', name: 'Mango', estado: 'Activo' },
  { id: 'cult-3', id: 'NAR', name: 'Naranja', estado: 'Activo' }
];

const initialActividades = [
  { id: 'a1', code: 'INS-01', name: 'Aplicación Insecticida', groupId: 'g1', cultivo: 'Caña', tipo: 'Mecánica', clasificacion: 'Aplicación de insumos', unidadProduccion: 'Hectáreas', unidadMedida: 'Hectáreas', tarifaBase: 12.5, productosEstandar: ['p1'] },
  { id: 'a2', code: 'INS-02', name: 'Aplicación Fertilizante', groupId: 'g1', cultivo: 'Caña', tipo: 'Manual', clasificacion: 'Aplicación de fertilizantes', unidadProduccion: 'Hectáreas', unidadMedida: 'Jornales', tarifaBase: 25, productosEstandar: ['p2'] },
  { id: 'a3', code: 'RIE-01', name: 'Riego por Goteo', groupId: 'g2', cultivo: 'Todos', tipo: 'Manual Mecánica', clasificacion: 'Riego', unidadProduccion: 'Hectáreas', unidadMedida: 'Horas', tarifaBase: 5, productosEstandar: [] },
  { id: 'a4', code: 'LAB-01', name: 'Corte de Semilla', groupId: 'g3', cultivo: 'Caña', tipo: 'Manual', clasificacion: 'Corte', unidadProduccion: 'Toneladas', unidadMedida: 'Toneladas', tarifaBase: 4.5, productosEstandar: [] }
];

const initialTiposProductos = [
  { id: 'tp1', nombre: 'Insecticidas' },
  { id: 'tp2', nombre: 'Fertilizantes' },
  { id: 'tp3', nombre: 'Herbicidas' },
  { id: 'tp4', nombre: 'Fungicidas' },
  { id: 'tp5', nombre: 'Otros' }
];

const initialProductos = [
  { id: 'PROD-01', nombre: 'Insecticida Alfa', tipoId: 'tp1', unidadMedida: 'Litros', stockActual: 100, costoUnitario: 15.5 },
  { id: 'PROD-02', nombre: 'Fertilizante NPK', tipoId: 'tp2', unidadMedida: 'KG', stockActual: 500, costoUnitario: 2.3 }
];

const initialTrabajadores = [
  { id: 'TRAB-1', identificacion: '12345678', nombre: 'Juan', apellido: 'Pérez', cargo: 'Jornalero', estado: 'Activo', cuadrillaId: 'CUA-1' },
  { id: 'TRAB-2', identificacion: '87654321', nombre: 'Carlos', apellido: 'Gómez', cargo: 'Operador', estado: 'Activo', cuadrillaId: 'CUA-1' },
  { id: 'TRAB-3', identificacion: '11223344', nombre: 'Luis', apellido: 'Martínez', cargo: 'Jornalero', estado: 'Activo', cuadrillaId: '' }
];

const initialCuadrillas = [
  { id: 'C-01', nombre: 'Cuadrilla Corte 1', jefe: 'TRAB-2' }
];

const initialMaquinaria = [
  { id: 'TRAC-01', name: 'Tractor John Deere', tipoId: 'tm1', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 45, horometroActual: 1250.5 },
  { id: 'VAG-01', name: 'Vagón de Carga', tipoId: 'tm2', status: 'Operativo', propiaAlquilada: 'Propia', tarifa: 15, horometroActual: 0 }
];

const initialUnidades = [
  { id: 'HA', name: 'Hectáreas' },
  { id: 'HR', name: 'Horas' },
  { id: 'JOR', name: 'Jornales' },
  { id: 'PLT', name: 'Plantas' },
  { id: 'TON', name: 'Toneladas' },
  { id: 'MTS', name: 'Metros' }
];

const emptyTiposMaquinaria = [
  { id: 'tipo1', nombre: 'Tractor' },
  { id: 'tipo2', nombre: 'Cosechadora' },
  { id: 'tipo3', nombre: 'Implemento' },
  { id: 'tipo4', nombre: 'Vagón' },
  { id: 'tipo5', nombre: 'Alzadora' }
];

const initialProveedores = [
  { id: 'PROV-1', nombre: 'AgroQuímicos S.A.', tipo: 'Materia Prima', contacto: 'Juan Pérez', telefono: '555-1234', email: 'contacto@agroquimicos.com', estado: 'Activo' },
  { id: 'PROV-2', nombre: 'Servicios Agrícolas Ltda.', tipo: 'Servicios', contacto: 'María Gómez', telefono: '555-5678', email: 'info@serviciosagricolas.com', estado: 'Activo' },
  { id: 'PROV-3', nombre: 'AgroTotal Solutions', tipo: 'Ambos', contacto: 'Carlos Rodríguez', telefono: '555-9012', email: 'ventas@agrototal.com', estado: 'Activo' }
];

const emptyControlesAgro = [
  { id: 'c1', id: 'INC-PLAGAS', 
    nombre: 'Monitoreo de Plagas',
    variables: [
      { id: 'v1', nombre: 'Población', tipo: 'numérico', min: 0, max: 100, rangos: [
        { min: 0, max: 10, mensaje: 'Bajo', color: '#4caf50' },
        { min: 11, max: 30, mensaje: 'Moderado', color: '#ffeb3b' },
        { min: 31, max: 100, mensaje: 'Crítico', color: '#f44336' }
      ]}
    ]
  }
];

const createEmptyInstanceData = (clientCode = 'GLOBAL') => ({
  globalPlanta: 'Todas',
  globalCultivo: 'Todos',
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
  usuarios: JSON.parse(JSON.stringify(DEFAULT_USERS(clientCode))),
  categoriasAcceso: JSON.parse(JSON.stringify(DEFAULT_ACCESS_CATEGORIES(clientCode))),
  lastSync: null,
});

const INSTANCE_CACHE = new Map();

const cloneValue = (value) => (value === undefined ? value : JSON.parse(JSON.stringify(value)));

const DEFAULT_INSTANCE_STATE = createEmptyInstanceData();

const normalizeRows = (rows) => (Array.isArray(rows) ? rows : []);

const rowToObject = (row = {}) => ({
  ...row,
  id: row.id ?? row.codigo ?? row.code ?? '',
  code: row.code ?? row.codigo ?? row.id ?? '',
  name: row.name ?? row.nombre ?? '',
});

const parseMaybeJson = (value, fallback = []) => {
  if (value === null || value === undefined || value === '') return fallback;
  if (Array.isArray(value) || (value !== null && typeof value === 'object')) return value;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const mapLoadedModelRows = (model, rows) => {
  const list = normalizeRows(rows);

  switch (model) {
    case 'Cultivo':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        name: row.nombre ?? row.name ?? '',
        estado: row.estado ?? 'Activo'
      }));
    case 'GrupoActividad':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        name: row.nombre ?? row.name ?? ''
      }));
    case 'Actividad':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        code: row.codigo ?? row.code ?? row.id ?? '',
        name: row.nombre ?? row.name ?? '',
        groupId: row.grupo_codigo ?? row.groupId ?? '',
        cultivo: row.cultivo ?? 'Todos',
        tipo: row.tipo ?? 'Manual',
        clasificacion: row.clasificacion ?? 'N/A',
        unidadProduccion: row.unidad_produccion ?? row.unidadProduccion ?? 'Hectáreas',
        unidadMedida: row.unidad_medida ?? row.unidadMedida ?? 'Hectáreas',
        tarifaBase: Number(row.tarifa_base ?? row.tarifaBase ?? 0),
        productosEstandar: (() => {
          const value = row.productos_estandar ?? row.productosEstandar ?? [];
          if (Array.isArray(value)) return value;
          if (typeof value === 'string' && value.trim()) {
            try { return JSON.parse(value); } catch { return []; }
          }
          return [];
        })()
      }));
    case 'Producto':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        nombre: row.nombre ?? row.name ?? '',
        tipoId: row.tipo_codigo ?? row.tipoId ?? '',
        unidadMedida: row.unidad_medida ?? row.unidadMedida ?? '',
        stockActual: Number(row.stock_actual ?? row.stockActual ?? 0),
        costoUnitario: Number(row.costo_unitario ?? row.costoUnitario ?? 0)
      }));
    case 'Maquinaria':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        name: row.nombre ?? row.name ?? '',
        tipoId: row.tipo_codigo ?? row.tipoId ?? '',
        status: row.estado ?? row.status ?? 'Operativo',
        propiaAlquilada: row.propia_alquilada ?? row.propiaAlquilada ?? 'Propia',
        tarifa: Number(row.tarifa ?? 0),
        horometroActual: Number(row.horometro_actual ?? row.horometroActual ?? 0)
      }));
    case 'Trabajador':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        identificacion: row.identificacion ?? '',
        nombre: row.nombre ?? '',
        apellido: row.apellido ?? '',
        cargo: row.cargo ?? 'Jornalero',
        estado: row.estado ?? 'Activo',
        cuadrillaId: row.cuadrilla_codigo ?? row.cuadrillaId ?? ''
      }));
    case 'Proveedor':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        nombre: row.nombre ?? '',
        tipo: row.tipo ?? '',
        contacto: row.contacto ?? '',
        telefono: row.telefono ?? '',
        email: row.correo ?? row.email ?? '',
        estado: row.estado ?? 'Activo'
      }));
    case 'Cuadrilla':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        nombre: row.nombre ?? '',
        jefe: row.jefe_codigo ?? row.jefe ?? ''
      }));
    case 'Unidad':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        name: row.nombre ?? row.name ?? ''
      }));
    case 'TipoProducto':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        nombre: row.nombre ?? row.name ?? ''
      }));
    case 'TipoMaquinaria':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        nombre: row.nombre ?? row.name ?? ''
      }));
    case 'ControlesAgro':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        nombre: row.nombre ?? '',
        descripcion: row.descripcion ?? '',
        frecuencia: row.frecuencia ?? 'Semanal',
        activo: Number(row.activo ?? 1) === 1,
        variables: parseMaybeJson(row.variables, [])
      }));
    case 'Usuario':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        code: row.codigo ?? row.code ?? row.id ?? '',
        clienteCodigo: row.cliente_codigo ?? row.clienteCodigo ?? '',
        nombres: row.nombres ?? '',
        apellidos: row.apellidos ?? '',
        cedula: row.cedula ?? '',
        correo: row.correo ?? row.email ?? '',
        contrasena: row.contrasena ?? row.password ?? '',
        rol: row.rol ?? 'Usuario General',
        categoriaCodigo: row.categoria_codigo ?? row.categoriaCodigo ?? '',
        modulos: parseMaybeJson(row.modulos, []),
        estado: row.estado ?? 'Activo',
        fechaIngreso: row.fecha_ingreso ?? row.fechaIngreso ?? ''
      }));
    case 'CategoriaAcceso':
      return list.map(row => ({
        id: String(row.codigo ?? row.id ?? row.code ?? Date.now().toString()),
        code: row.codigo ?? row.code ?? row.id ?? '',
        clienteCodigo: row.cliente_codigo ?? row.clienteCodigo ?? '',
        nombre: row.nombre ?? row.name ?? '',
        descripcion: row.descripcion ?? '',
        permisos: parseMaybeJson(row.permisos, {}),
        modulos: parseMaybeJson(row.modulos, []),
        estado: row.estado ?? 'Activo'
      }));
    case 'ConfiguracionGlobal': {
      const row = list.find(item => String(item.codigo || item.id || '').toUpperCase() === 'GLOBAL') || list[0];
      if (!row) return { ...GLOBAL_CONFIG_DEFAULTS };
      const loaded = {};
      Object.entries(row).forEach(([key, value]) => {
        if (key === 'codigo') return;
        loaded[key] = typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))
          ? (() => { try { return JSON.parse(value); } catch { return value; } })()
          : value;
      });
      return loaded;
    }
    default:
      return list.map(rowToObject);
  }
};

const buildSnapshot = (source) => ({
  globalCultivo: source.globalCultivo,
  sectores: cloneValue(source.sectores),
  cultivos: cloneValue(source.cultivos),
  gruposActividades: cloneValue(source.gruposActividades),
  actividades: cloneValue(source.actividades),
  trabajadores: cloneValue(source.trabajadores),
  proveedores: cloneValue(source.proveedores),
  maquinarias: cloneValue(source.maquinarias),
  tiposMaquinaria: cloneValue(source.tiposMaquinaria),
  configuraciones: cloneValue(source.configuraciones),
  cuadrillas: cloneValue(source.cuadrillas),
  unidades: cloneValue(source.unidades),
  tiposProductos: cloneValue(source.tiposProductos),
  productos: cloneValue(source.productos),
  controlesAgro: cloneValue(source.controlesAgro),
  registrosControles: cloneValue(source.registrosControles),
  mantenimientos: cloneValue(source.mantenimientos),
  planificaciones: cloneValue(source.planificaciones),
  syncQueue: cloneValue(source.syncQueue),
  movimientosInventario: cloneValue(source.movimientosInventario),
  usuarios: cloneValue(source.usuarios),
  categoriasAcceso: cloneValue(source.categoriasAcceso),
  lastSync: source.lastSync
});

export function AgroProvider({ children }) {
  const [clients, setClients] = useState(DEFAULT_CLIENTS);
  const [currentClient, setCurrentClient] = useState(() => {
    try {
      const saved = localStorage.getItem('agro_currentClient');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return normalizeClient(DEFAULT_CLIENTS['std-01']);
  });

  const [plantas, setPlantas] = useState([{ id: 'p1', name: 'Planta Principal', status: 'Activo' }]);
  const [globalPlanta, setGlobalPlanta] = useState('Todas');
  const [globalCultivo, setGlobalCultivo] = useState('Todos');
  const [sectores, setSectores] = useState(initialData);
  const [cultivos, setCultivos] = useState(initialCultivos);
  const [gruposActividades, setGruposActividades] = useState(initialGrupos);
  const [actividades, setActividades] = useState(initialActividades);
  const [maquinarias, setMaquinarias] = useState(initialMaquinaria);
  const [tiposMaquinaria, setTiposMaquinaria] = useState(emptyTiposMaquinaria);
  const [trabajadores, setTrabajadores] = useState(initialTrabajadores);
  const [proveedores, setProveedores] = useState(initialProveedores);
  const [configuraciones, setConfiguraciones] = useState({ ...GLOBAL_CONFIG_DEFAULTS });
  const [cuadrillas, setCuadrillas] = useState(initialCuadrillas);
  const [unidades, setUnidades] = useState(initialUnidades);
  const [tiposProductos, setTiposProductos] = useState(initialTiposProductos);
  const [productos, setProductos] = useState(initialProductos);
  const [controlesAgro, setControlesAgro] = useState(emptyControlesAgro);
  const [registrosControles, setRegistrosControles] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [planificaciones, setPlanificaciones] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [movimientosInventario, setMovimientosInventario] = useState([]);
  const [usuarios, setUsuarios] = useState(() => DEFAULT_USERS(currentClient.id));
  const [categoriasAcceso, setCategoriasAcceso] = useState(() => DEFAULT_ACCESS_CATEGORIES(currentClient.id));
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agro_currentUser');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return null;
  });

  // Persistence hooks
  React.useEffect(() => {
    if (currentUser) {
      localStorage.setItem('agro_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('agro_currentUser');
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (currentClient) {
      localStorage.setItem('agro_currentClient', JSON.stringify(currentClient));
    }
  }, [currentClient]);
  const initialClientIdRef = useRef(currentClient.id);
  const isHydratingRef = useRef(false);

  const applyInstanceState = (snapshot) => {
    isHydratingRef.current = true;
    setGlobalPlanta(snapshot.globalPlanta ?? 'Todas');
    setGlobalCultivo(snapshot.globalCultivo ?? 'Todos');
    setSectores(cloneValue(snapshot.sectores ?? DEFAULT_INSTANCE_STATE.sectores));
    setCultivos(cloneValue(snapshot.cultivos ?? DEFAULT_INSTANCE_STATE.cultivos));
    setGruposActividades(cloneValue(snapshot.gruposActividades ?? DEFAULT_INSTANCE_STATE.gruposActividades));
    setActividades(cloneValue(snapshot.actividades ?? DEFAULT_INSTANCE_STATE.actividades));
    setTrabajadores(cloneValue(snapshot.trabajadores ?? DEFAULT_INSTANCE_STATE.trabajadores));
    setProveedores(cloneValue(snapshot.proveedores ?? DEFAULT_INSTANCE_STATE.proveedores));
    setMaquinarias(cloneValue(snapshot.maquinarias ?? DEFAULT_INSTANCE_STATE.maquinarias));
    setTiposMaquinaria(cloneValue(snapshot.tiposMaquinaria ?? DEFAULT_INSTANCE_STATE.tiposMaquinaria));
    setConfiguraciones({ ...GLOBAL_CONFIG_DEFAULTS, ...(snapshot.configuraciones ?? {}) });
    setCuadrillas(cloneValue(snapshot.cuadrillas ?? DEFAULT_INSTANCE_STATE.cuadrillas));
    setUnidades(cloneValue(snapshot.unidades ?? DEFAULT_INSTANCE_STATE.unidades));
    setTiposProductos(cloneValue(snapshot.tiposProductos ?? DEFAULT_INSTANCE_STATE.tiposProductos));
    setProductos(cloneValue(snapshot.productos ?? DEFAULT_INSTANCE_STATE.productos));
    setControlesAgro(cloneValue(snapshot.controlesAgro ?? DEFAULT_INSTANCE_STATE.controlesAgro));
    setRegistrosControles(cloneValue(snapshot.registrosControles ?? []));
    setMantenimientos(cloneValue(snapshot.mantenimientos ?? []));
    setPlanificaciones(cloneValue(snapshot.planificaciones ?? []));
    setSyncQueue(cloneValue(snapshot.syncQueue ?? []));
    setMovimientosInventario(cloneValue(snapshot.movimientosInventario ?? []));
    setUsuarios(cloneValue(snapshot.usuarios ?? DEFAULT_INSTANCE_STATE.usuarios));
    setCategoriasAcceso(cloneValue(snapshot.categoriasAcceso ?? DEFAULT_INSTANCE_STATE.categoriasAcceso));
    setLastSync(snapshot.lastSync ?? null);
    setTimeout(() => {
      isHydratingRef.current = false;
    }, 0);
  };

  const hydrateFromDatabase = async (client) => {
    const connectionData = client.connectionData || {};
    if (!client.databaseEngine || !Object.keys(connectionData).length) {
      return null;
    }

    const models = [
      'ConfiguracionGlobal',
      'Cultivo',
      'GrupoActividad',
      'Actividad',
      'Trabajador',
      'Proveedor',
      'Cuadrilla',
      'Unidad',
      'TipoProducto',
      'TipoMaquinaria',
      'Maquinaria',
      'Producto',
      'ControlesAgro',
      'Usuario',
      'CategoriaAcceso'
    ];

    if (!client.databaseEngine) return [];
    const results = await Promise.all(models.map(async (model) => {
      try {
        const result = await apiService.loadData(client.databaseEngine, connectionData, model);
        return [model, result.success ? result.data : []];
      } catch (error) {
        console.error(`Error cargando ${model} desde BD:`, error);
        return [model, []];
      }
    }));

    const snapshot = { ...DEFAULT_INSTANCE_STATE };

    results.forEach(([model, rows]) => {
      const mapped = mapLoadedModelRows(model, rows);
      switch (model) {
        case 'ConfiguracionGlobal':
          snapshot.configuraciones = { ...GLOBAL_CONFIG_DEFAULTS, ...mapped };
          break;
        case 'Cultivo':
          snapshot.cultivos = mapped;
          break;
        case 'GrupoActividad':
          snapshot.gruposActividades = mapped;
          break;
        case 'Actividad':
          snapshot.actividades = mapped;
          break;
        case 'Trabajador':
          snapshot.trabajadores = mapped;
          break;
        case 'Proveedor':
          snapshot.proveedores = mapped;
          break;
        case 'Cuadrilla':
          snapshot.cuadrillas = mapped;
          break;
        case 'Unidad':
          snapshot.unidades = mapped;
          break;
        case 'TipoProducto':
          snapshot.tiposProductos = mapped;
          break;
        case 'TipoMaquinaria':
          snapshot.tiposMaquinaria = mapped;
          break;
        case 'Maquinaria':
          snapshot.maquinarias = mapped;
          break;
        case 'Producto':
          snapshot.productos = mapped;
          break;
        case 'ControlesAgro':
          snapshot.controlesAgro = mapped;
          break;
        case 'Usuario':
          snapshot.usuarios = mapped;
          break;
        case 'CategoriaAcceso':
          snapshot.categoriasAcceso = mapped;
          break;
        default:
          break;
      }
    });

    if (!snapshot.categoriasAcceso.length) {
      snapshot.categoriasAcceso = DEFAULT_ACCESS_CATEGORIES(client.id);
    }

    if (!snapshot.usuarios.length) {
      snapshot.usuarios = DEFAULT_USERS(client.id);
    }

    return snapshot;
  };

  const parseDatabaseValue = (value) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'number') return value;
    if (value === '0' || value === '1') return Number(value);
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const normalizeConfigValue = (value) => {
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (value === true) return 1;
    if (value === false) return 0;
    return value;
  };

  const updateConfiguracion = (key, value) => {
    const normalizedValue = normalizeConfigValue(value);
    const next = { ...configuraciones, [key]: normalizedValue };
    setConfiguraciones(next);
    syncToDatabase('ConfiguracionGlobal', 'edit', {
      codigo: 'GLOBAL',
      ...next
    });
  };

  React.useEffect(() => {
    const loadConfiguracionesFromDatabase = async () => {
      const connectionData = currentClient.connectionData || {};
      if (!currentClient.databaseEngine || !Object.keys(connectionData).length) return;
      try {
        const result = await apiService.loadData(currentClient.databaseEngine, connectionData, 'ConfiguracionGlobal');
        if (result.success && Array.isArray(result.data)) {
          const row = result.data.find(item => String(item.codigo || item.id || '').toUpperCase() === 'GLOBAL') || result.data[0];
          if (row) {
            const loadedConfig = {};
            Object.entries(row).forEach(([key, value]) => {
              if (key === 'codigo') return;
              loadedConfig[key] = parseDatabaseValue(value);
            });
            setConfiguraciones(prev => ({ ...prev, ...loadedConfig }));
          }
        }
      } catch (error) {
        console.error('Error al cargar configuraciones desde la base de datos:', error);
      }
    };

    loadConfiguracionesFromDatabase();
  }, [currentClient]);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const loadInstance = async () => {
      const cached = INSTANCE_CACHE.get(currentClient.id);
      if (cached) {
        applyInstanceState(cached);
        return;
      }

      const hydrated = await hydrateFromDatabase(currentClient);
      if (cancelled) return;

      if (hydrated) {
        INSTANCE_CACHE.set(currentClient.id, buildSnapshot(hydrated));
        applyInstanceState(hydrated);
        return;
      }

      const defaultSnapshot = currentClient.id === initialClientIdRef.current
        ? buildSnapshot({
            globalPlanta,
            globalCultivo,
            sectores,
            cultivos,
            gruposActividades,
            actividades,
            trabajadores,
            proveedores,
            maquinarias,
            tiposMaquinaria,
            configuraciones,
            cuadrillas,
            unidades,
            tiposProductos,
            productos,
            controlesAgro,
            registrosControles,
            mantenimientos,
            planificaciones,
            syncQueue,
            movimientosInventario,
            usuarios,
            categoriasAcceso,
            lastSync
          })
        : buildSnapshot(createEmptyInstanceData(currentClient.id));

      INSTANCE_CACHE.set(currentClient.id, defaultSnapshot);
    };

    loadInstance();

    return () => {
      cancelled = true;
    };
  }, [currentClient.id, currentClient.databaseEngine, currentClient.connectionData]);

  React.useEffect(() => {
    if (isHydratingRef.current) return;
    INSTANCE_CACHE.set(currentClient.id, buildSnapshot({
      globalPlanta,
      globalCultivo,
      sectores,
      cultivos,
      gruposActividades,
      actividades,
      trabajadores,
      proveedores,
      maquinarias,
      tiposMaquinaria,
      configuraciones,
      cuadrillas,
      unidades,
      tiposProductos,
      productos,
      controlesAgro,
      registrosControles,
      mantenimientos,
      planificaciones,
      syncQueue,
      movimientosInventario,
      usuarios,
      categoriasAcceso,
      lastSync
    }));
  }, [
    currentClient.id,
    globalPlanta,
    globalCultivo,
    sectores,
    cultivos,
    gruposActividades,
    actividades,
    trabajadores,
    proveedores,
    maquinarias,
    tiposMaquinaria,
    configuraciones,
    cuadrillas,
    unidades,
    tiposProductos,
    productos,
    controlesAgro,
    registrosControles,
    mantenimientos,
    planificaciones,
    syncQueue,
    movimientosInventario,
    usuarios,
    categoriasAcceso,
    lastSync
  ]);

  

  const addClient = (key, clientData) => {
    const modules = PLAN_CONFIG[clientData.plan] || PLAN_CONFIG['Estándar'];
    const newClient = normalizeClient({ ...clientData, modules, theme: clientData.theme || 'Tema Principal' });
    setClients(prev => ({
      ...prev,
      [key]: newClient
    }));
    INSTANCE_CACHE.set(newClient.id, buildSnapshot(createEmptyInstanceData(newClient.id)));
  };

  const updateClient = (key, plan, customModules = null, theme = null, databaseConfig = {}) => {
    const client = normalizeClient(clients[key]);
    const modules = customModules || PLAN_CONFIG[plan] || PLAN_CONFIG['Estándar'];
    const finalTheme = theme || client.theme || 'Tema Principal';
    const updatedClient = normalizeClient({
      ...client,
      ...databaseConfig,
      plan,
      modules,
      theme: finalTheme
    });

    setClients(prev => ({
      ...prev,
      [key]: updatedClient
    }));

    // Sincronizar con el estado de sesión si es el cliente activo
    if (currentClient.id === client.id) {
      setCurrentClient(updatedClient);
    }
  };

  const editClient = (key, updates) => {
    const client = normalizeClient(clients[key]);
    const updatedClient = normalizeClient({ ...client, ...updates });

    setClients(prev => ({
      ...prev,
      [key]: updatedClient
    }));

    if (currentClient.id === client.id) {
      setCurrentClient(updatedClient);
    }
    
    syncToDatabase('Cliente', 'edit', { id: updatedClient.id, nombre: updatedClient.name, plan: updatedClient.plan, estado: updatedClient.status || 'Activo' });
  };

  const suspendClient = (key, reason = 'Pago pendiente') => {
    editClient(key, { status: 'Suspendido', suspendedReason: reason });
  };

  const reactivateClient = (key) => {
    editClient(key, { status: 'Activo', suspendedReason: '' });
  };

  const deleteClient = async (key) => {
    const client = clients[key];
    if (!client || client.modules?.includes('ALL')) {
      alert('No se puede eliminar el administrador global.');
      return;
    }

    if (currentClient.id === client.id) {
      alert('No puede eliminar la instancia en sesión activa.');
      return;
    }

    if (!(await confirmDialog(`¿Eliminar el cliente ${client.name}?`, { title: 'Eliminar cliente' }))) return;

    setClients(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    INSTANCE_CACHE.delete(client.id);
  };

  const resetClientData = async (key) => {
    const client = normalizeClient(clients[key]);
    if (!client || !(await confirmDialog(`¿Reiniciar los datos operativos de ${client.name}?`, { title: 'Reiniciar datos operativos', icon: 'warning', confirmButtonText: 'Sí, reiniciar' }))) return;

    const emptyData = createEmptyInstanceData(client.id);
    INSTANCE_CACHE.set(client.id, buildSnapshot(emptyData));

    if (currentClient.id === client.id) {
      applyInstanceState(emptyData);
    }
  };

  

  React.useEffect(() => {
    const themeData = THEME_CONFIG[currentClient.theme || 'Tema Principal'] || THEME_CONFIG['Tema Principal'];
    if (themeData) {
      document.documentElement.style.setProperty('--primary-color', themeData.primary);
      document.documentElement.style.setProperty('--primary-light', themeData.light);
      document.documentElement.style.setProperty('--primary-dark', themeData.dark);
      document.documentElement.style.setProperty('--primary-rgb', hexToRgb(themeData.primary));
      document.documentElement.style.setProperty('--primary-light-rgb', hexToRgb(themeData.light));
      const isLightMode = configuraciones?.modoOscuro === 0 || currentClient.theme === 'Blanco Completo';
      const isBlanco = currentClient.theme === 'Blanco Completo';
      const isNoche = currentClient.theme === 'Noche Clásica';
      const isPizarra = currentClient.theme === 'Tema Principal';

      if (isBlanco) {
        document.documentElement.style.setProperty('--primary-rgb', isLightMode ? '15 23 42' : '255 255 255');
        document.documentElement.style.setProperty('--primary-light-rgb', isLightMode ? '30 41 59' : '200 200 200');
        document.documentElement.style.setProperty('--bg-gradient', isLightMode ? '#ffffff' : '#000000');
        document.documentElement.style.setProperty('--sidebar-bg', isLightMode ? '#f9fafb' : '#050505');
        document.documentElement.style.setProperty('--glass-bg', isLightMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(10, 10, 10, 0.8)');
        document.documentElement.style.setProperty('--glass-border', isLightMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)');
        document.documentElement.style.setProperty('--input-bg', isLightMode ? '#ffffff' : 'rgba(255, 255, 255, 0.05)');
        document.documentElement.style.setProperty('--text-main', isLightMode ? '#000000' : '#ffffff');
        document.documentElement.style.setProperty('--text-muted', isLightMode ? '#4b5563' : '#9ca3af');
        document.documentElement.style.setProperty('--sidebar-text', isLightMode ? '#000000' : '#ffffff');
        document.documentElement.style.setProperty('--sidebar-text-muted', isLightMode ? '#4b5563' : '#9ca3af');
      } else if (isNoche) {
        document.documentElement.style.setProperty('--primary-rgb', isLightMode ? '15 23 42' : '0 0 0');
        document.documentElement.style.setProperty('--primary-light-rgb', isLightMode ? '30 41 59' : '26 26 26');
        document.documentElement.style.setProperty('--bg-gradient', isLightMode ? '#e5e7eb' : '#000000');
        document.documentElement.style.setProperty('--sidebar-bg', isLightMode ? '#ffffff' : '#000000');
        document.documentElement.style.setProperty('--glass-bg', isLightMode ? 'rgba(255, 255, 255, 0.7)' : '#050505');
        document.documentElement.style.setProperty('--glass-border', isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)');
        document.documentElement.style.setProperty('--input-bg', isLightMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.05)');
        document.documentElement.style.setProperty('--text-main', isLightMode ? '#111827' : '#F9FAFB');
        document.documentElement.style.setProperty('--text-muted', isLightMode ? '#6b7280' : '#9ca3af');
        document.documentElement.style.setProperty('--sidebar-text', isLightMode ? '#111827' : '#ffffff');
        document.documentElement.style.setProperty('--sidebar-text-muted', isLightMode ? '#4b5563' : 'rgba(255, 255, 255, 0.7)');
      } else {
        if (isLightMode) {
          // Soft primary background, strong primary sidebar
          document.documentElement.style.setProperty('--bg-gradient', 'linear-gradient(135deg, rgb(var(--primary-rgb) / 0.05) 0%, rgb(var(--primary-rgb) / 0.15) 100%)');
          document.documentElement.style.setProperty('--sidebar-bg', isPizarra ? '#111827' : 'color-mix(in srgb, var(--primary-dark) 50%, #000000)');
          document.documentElement.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.7)');
          document.documentElement.style.setProperty('--glass-border', 'rgb(var(--primary-rgb) / 0.2)');
          document.documentElement.style.setProperty('--input-bg', 'rgba(255, 255, 255, 0.9)');
          document.documentElement.style.setProperty('--text-main', '#374151');
          document.documentElement.style.setProperty('--text-muted', '#6b7280');
          document.documentElement.style.setProperty('--sidebar-text', '#ffffff');
          document.documentElement.style.setProperty('--sidebar-text-muted', 'rgba(255, 255, 255, 0.7)');
        } else {
          // Dark background restores original beautiful theme values
          document.documentElement.style.setProperty('--bg-gradient', themeData.bg);
          document.documentElement.style.setProperty('--sidebar-bg', isPizarra ? '#111827' : 'color-mix(in srgb, var(--primary-dark) 40%, #000000)'); 
          document.documentElement.style.setProperty('--glass-bg', themeData.glass);
          document.documentElement.style.setProperty('--glass-border', themeData.border);
          document.documentElement.style.setProperty('--input-bg', themeData.input);
          document.documentElement.style.setProperty('--text-main', themeData.text);
          document.documentElement.style.setProperty('--text-muted', themeData.muted);
          document.documentElement.style.setProperty('--sidebar-text', '#ffffff');
          document.documentElement.style.setProperty('--sidebar-text-muted', 'rgba(255, 255, 255, 0.7)');
        }
      }
      
      // Override text contrast specifically for Blanco/Noche
      const isBlackBg = isNoche || (isBlanco && !isLightMode);
      document.documentElement.style.setProperty('--text-contrast', isBlackBg ? '#ffffff' : (isLightMode ? '#1f2937' : '#ffffff'));
    }
  }, [currentClient.theme, configuraciones?.modoOscuro]);

  const processSync = async () => {
    if (!isOnline || syncQueue.length === 0) return;
    console.log("Sincronizando...", syncQueue);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncQueue([]);
    setLastSync(new Date().toISOString());
    swalSuccess("Sincronización exitosa con el servidor.");
  };

  const normalizeModuleList = (modules) => {
    if (Array.isArray(modules)) return modules;
    if (typeof modules === 'string' && modules.trim()) {
      try {
        const parsed = JSON.parse(modules);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [modules];
      }
    }
    return [];
  };

  const getUserCategory = (user) => categoriasAcceso.find(category => (
    category.codigo === user?.categoriaCodigo ||
    category.id === user?.categoriaCodigo ||
    category.code === user?.categoriaCodigo
  ));

  const isSuperAdminUser = (user = currentUser) => (
    user?.isGlobalAdmin === true ||
    user?.rol === 'Admin Global' ||
    user?.rol === 'Super Admin' ||
    normalizeModuleList(user?.modulos).includes('ALL') ||
    user?.categoriaCodigo === 'SUPER_ADMIN'
  );

  // Verifica si el usuario es admin de cliente (Administrador, no global)
  const isClientAdmin = (user = currentUser) => (
    !user?.isGlobalAdmin &&
    (user?.rol === 'Administrador' || user?.rol === 'Super Admin' || user?.categoriaCodigo === 'SUPER_ADMIN' || user?.categoriaCodigo === 'ADMIN')
  );

  const hasActionPermission = (permissionKey) => {
    if (!currentUser) return false;
    if (isSuperAdminUser(currentUser)) return true;

    const category = getUserCategory(currentUser);
    const categoryPermission = Number(category?.permisos?.[permissionKey]) === 1;
    const userPermission = Number(currentUser?.permisos?.[permissionKey]) === 1;

    return categoryPermission || userPermission;
  };

  const normalizeUsuario = (usuario) => {
    const codigo = usuario.codigo || usuario.code || usuario.id || `USR-${Date.now()}`;
    const modulos = normalizeModuleList(usuario.modulos);
    return {
      id: String(codigo),
      code: codigo,
      codigo,
      isGlobalAdmin: usuario.isGlobalAdmin ?? false,
      clienteCodigo: usuario.clienteCodigo || usuario.cliente_codigo || currentClient.id,
      nombres: usuario.nombres || '',
      apellidos: usuario.apellidos || '',
      cedula: usuario.cedula || '',
      correo: usuario.correo || usuario.email || '',
      contrasena: usuario.contrasena || usuario.password || '',
      rol: usuario.rol || 'Usuario General',
      categoriaCodigo: usuario.categoriaCodigo || usuario.categoria_codigo || 'USUARIO_GENERAL',
      modulos: modulos.length ? modulos : ['Dashboard'],
      estado: usuario.estado || 'Activo',
      fechaIngreso: usuario.fechaIngreso || usuario.fecha_ingreso || ''
    };
  };

  const normalizeCategoria = (categoria) => ({
    id: String(categoria.codigo || categoria.code || categoria.id || `CAT-${Date.now()}`),
    code: categoria.codigo || categoria.code || categoria.id || `CAT-${Date.now()}`,
    codigo: categoria.codigo || categoria.code || categoria.id || `CAT-${Date.now()}`,
    clienteCodigo: categoria.clienteCodigo || categoria.cliente_codigo || currentClient.id,
    nombre: categoria.nombre || categoria.name || '',
    descripcion: categoria.descripcion || '',
    permisos: {
      ...ACCESS_PERMISSION_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
      ...(categoria.permisos || {})
    },
    modulos: normalizeModuleList(categoria.modulos),
    estado: categoria.estado || 'Activo'
  });

  

  const registerUser = async (usuarioData) => {
    const correo = String(usuarioData.correo || usuarioData.email || '').trim().toLowerCase();
    if (!correo) {
      swalError('El correo electrónico es obligatorio.');
      return { success: false };
    }

    const duplicate = usuarios.some(item => String(item.correo || '').trim().toLowerCase() === correo);
    if (duplicate) {
      swalError('Ya existe un usuario registrado con ese correo para este cliente.');
      return { success: false };
    }

    const role = usuarioData.rol || usuarioData.role || 'Usuario General';
    const defaultCategory = role === 'Super Admin'
      ? 'SUPER_ADMIN'
      : role === 'Administrador'
        ? 'ADMIN'
        : 'USUARIO_GENERAL';

    const modulos = normalizeModuleList(usuarioData.modulos);
    const normalized = normalizeUsuario({
      ...usuarioData,
      correo,
      contrasena: usuarioData.contrasena || usuarioData.password || '',
      rol: role,
      categoriaCodigo: usuarioData.categoriaCodigo || defaultCategory,
      modulos: modulos.length ? modulos : (role === 'Super Admin' ? ['ALL'] : role === 'Administrador' ? ['Dashboard', 'Estructura', 'Maestros', 'Planificacion', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento', 'Sincronizacion', 'Mapas', 'Usuarios', 'Configuraciones'] : ['Dashboard']),
      clienteCodigo: currentClient.id
    });

    setUsuarios(prev => [...prev, normalized]);
    syncToDatabase('Usuario', 'add', normalized);
    setCurrentUser({ ...normalized });
    swalSuccess(`Usuario ${normalized.nombres || normalized.correo} creado correctamente.`);
    return { success: true, user: normalized };
  };

  

  

  const [orderCounter, setOrderCounter] = useState(1);

  const calcLoteHa = (lote) => lote.suertes?.reduce((acc, s) => acc + (Number(s.hectareas) || 0), 0) || 0;
  const calcFincaHa = (finca) => finca.lotes?.reduce((acc, l) => acc + calcLoteHa(l), 0) || 0;
  const calcSectorHa = (sector) => sector.fincas?.reduce((acc, f) => acc + calcFincaHa(f), 0) || 0;
  const calcTotalHa = () => sectores.reduce((acc, s) => acc + calcSectorHa(s), 0);

  const calcLotesActivos = () => {
    let count = 0;
    sectores.forEach(s => {
      s.fincas?.forEach(f => {
        f.lotes?.forEach(l => {
          const hasActiveSuerte = l.suertes?.some(suerte => 
            suerte.estado === 'Activo' && (globalCultivo === 'Todos' || suerte.cultivo === globalCultivo)
          );
          if (hasActiveSuerte) count++;
        });
      });
    });
    return count;
  };

  const addCultivo = (cultivo) => {
    const newCultivo = { ...cultivo, id: Date.now().toString(), estado: cultivo.estado || 'Activo' };
    setCultivos([...cultivos, newCultivo]);
    syncToDatabase('Cultivo', 'add', newCultivo);
  };
  const editCultivo = (id, newProps) => {
    const previous = cultivos.find(c => c.id === id);
    setCultivos(cultivos.map(c => c.id === id ? { ...c, ...newProps } : c));

    if (previous?.name && newProps.name && previous.name !== newProps.name) {
      setSectores(updateCultivoInNodes(sectores, previous.name, newProps.name));
      setActividades(actividades.map(a => a.cultivo === previous.name ? { ...a, cultivo: newProps.name } : a));
      if (globalCultivo === previous.name) setGlobalCultivo(newProps.name);
    }
  };
  const deleteCultivo = async (id) => {
    const cultivo = cultivos.find(c => c.id === id);
    if (!cultivo) return;

    const isUsedInActividades = actividades.some(a => a.cultivo === cultivo.name);
    const isUsedInEstructura = hasCultivoInNodes(sectores, cultivo.name);

    if (isUsedInActividades || isUsedInEstructura) {
      alert('No se puede eliminar un cultivo usado en actividades o estructura agrícola.');
      return;
    }

    if (await confirmDialog('¿Eliminar cultivo?', { title: 'Eliminar cultivo' })) {
      setCultivos(cultivos.filter(c => c.id !== id));
      if (globalCultivo === cultivo.name) setGlobalCultivo('Todos');
    }
  };

  const addPlanificacion = (plan) => { setPlanificaciones(prev => [...prev, plan]); syncToDatabase('Planificacion', 'add', plan); };
  const updatePlanificacion = (id, newProps) => {
    setPlanificaciones(prev => prev.map(p => p.id === id ? { ...p, ...newProps } : p));
    syncToDatabase('Planificacion', 'edit', { id, ...newProps });
  };
  const deletePlanificacion = (id) => {
    setPlanificaciones(prev => prev.filter(p => p.id !== id));
    syncToDatabase('Planificacion', 'delete', { id });
  };

  const generarOrden = (id) => {
    const newCode = `M${orderCounter}`;
    setOrderCounter(prev => prev + 1);
    setPlanificaciones(prev => prev.map(p => p.id === id ? { ...p, ordenCode: newCode, estado: 'Orden Generada' } : p));
    syncToDatabase('Planificacion', 'edit', { id, ordenCode: newCode, estado: 'Orden Generada' });
  };

  const desvincularOrden = (id) => {
    setPlanificaciones(prev => prev.map(p => p.id === id ? { ...p, ordenCode: null, estado: 'Borrador' } : p));
    syncToDatabase('Planificacion', 'edit', { id, ordenCode: null, estado: 'Borrador' });
  };

  const ejecutarPlanificacion = (id, nuevasHaEjecutadas, laborDetalle = [], extraData = {}) => {
    setPlanificaciones(prevPlan => prevPlan.map(p => {
      if (p.id === id) {
        let costoInsumos = 0;
        if (extraData.insumos) {
          extraData.insumos.forEach(ins => {
            const prod = productos.find(pr => pr.id === ins.id || pr.nombre === ins.nombre);
            if (prod) {
              const costo = (Number(ins.cantidad) || 0) * (prod.costoUnitario || 0);
              costoInsumos += costo;
              setProductos(prevProd => prevProd.map(pr => pr.id === prod.id ? { ...pr, stockActual: (pr.stockActual || 0) - (Number(ins.cantidad) || 0) } : pr));
              setMovimientosInventario(prevMov => [...prevMov, { id: Date.now() + Math.random(), fecha: new Date().toISOString(), productoId: prod.id, tipo: 'Salida', cantidad: ins.cantidad, motivo: `Aplicación ${p.actividadNombre} en ${p.estructuraNombre}`, costoUnitario: prod.costoUnitario || 0 }]);
            }
          });
        }
        let costoMO = laborDetalle.reduce((acc, l) => acc + (Number(l.total) || 0), 0);
        let costoMaq = 0;
        if (extraData.maquinariaId) {
          const maq = maquinarias.find(m => m.id === extraData.maquinariaId);
          if (maq) {
            const horas = (Number(extraData.horometroFinal) || 0) - (Number(extraData.horometroInicial) || 0);
            costoMaq = Math.max(0, horas) * (maq.tarifa || 0);
          }
        }
        const nuevaEjecucion = { ...extraData, id: Date.now().toString(), fecha: new Date().toLocaleDateString(), haEjecutadas: nuevasHaEjecutadas, laborDetalle, costoTotal: costoInsumos + costoMO + costoMaq, costosDesglose: { insumos: costoInsumos, manoObra: costoMO, maquinaria: costoMaq } };
        const totalEjecutado = (p.hectareasEjecutadas || 0) + Number(nuevasHaEjecutadas);
        const nuevoEstado = totalEjecutado >= (p.hectareasPlaneadas || 0) ? 'Completada' : 'En Ejecución';
        if (!isOnline) {
          setSyncQueue(prev => [...prev, { id: Date.now().toString(), module: 'Planificacion', action: 'Ejecutar', info: `Orden ${p.ordenCode} - ${nuevasHaEjecutadas} ha`, timestamp: new Date().toISOString(), data: { id, nuevasHaEjecutadas, laborDetalle, extraData } }]);
        } else {
          syncToDatabase('Ejecucion', 'add', { id: nuevaEjecucion.id, planificacionCodigo: p.id, fecha: nuevaEjecucion.fecha, hectareasEjecutadas: nuevasHaEjecutadas, observaciones: extraData.observaciones || '' });
          if (extraData.insumos) {
            extraData.insumos.forEach((ins, idx) => syncToDatabase('EjecucionInsumo', 'add', { id: `${nuevaEjecucion.id}-ins-${idx}`, ejecucionCodigo: nuevaEjecucion.id, productoCodigo: ins.id || ins.nombre, cantidad: ins.cantidad, costoUnitario: ins.costoUnitario || 0 }));
          }
          if (extraData.maquinariaId) {
            const horas = Math.max(0, (Number(extraData.horometroFinal) || 0) - (Number(extraData.horometroInicial) || 0));
            syncToDatabase('EjecucionMaquinaria', 'add', { id: `${nuevaEjecucion.id}-maq`, ejecucionCodigo: nuevaEjecucion.id, maquinariaCodigo: extraData.maquinariaId, horas, tarifa: horas > 0 ? costoMaq / horas : 0 });
          }
          laborDetalle.forEach((l, idx) => {
            syncToDatabase('EjecucionManoObra', 'add', { id: `${nuevaEjecucion.id}-mo-${idx}`, ejecucionCodigo: nuevaEjecucion.id, trabajadorCodigo: l.trabajadorId || 'N/A', labor: l.labor || '', cantidad: l.cantidad || 0, tarifa: l.tarifa || 0 });
          });
        }
        if (extraData.maquinariaId && extraData.horometroFinal) {
          setMaquinarias(prevMaq => prevMaq.map(m => m.id === extraData.maquinariaId ? { ...m, horometroActual: Number(extraData.horometroFinal) } : m));
        }
        return { ...p, ejecuciones: [...(p.ejecuciones || []), nuevaEjecucion], hectareasEjecutadas: totalEjecutado, estado: nuevoEstado };
      }
      return p;
    }));
  };

  const addActividad = (act) => { const n = { ...act, id: act.id || Date.now().toString() }; setActividades([...actividades, n]); syncToDatabase('Actividad', 'add', n); };
  const editActividad = (id, newProps) => { setActividades(actividades.map(a => a.id === id ? { ...a, ...newProps } : a)); syncToDatabase('Actividad', 'edit', { id, ...newProps }); };
  const deleteActividad = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar actividad' })) { setActividades(actividades.filter(a => a.id !== id)); syncToDatabase('Actividad', 'delete', { id }); } };
  const addGrupo = (g) => { const n = { ...g, id: g.id || Date.now().toString() }; setGruposActividades([...gruposActividades, n]); syncToDatabase('GrupoActividad', 'add', n); };
  const editGrupo = (id, newProps) => { setGruposActividades(gruposActividades.map(g => g.id === id ? { ...g, ...newProps } : g)); syncToDatabase('GrupoActividad', 'edit', { id, ...newProps }); };
  const deleteGrupo = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar grupo' })) { setGruposActividades(gruposActividades.filter(g => g.id !== id)); syncToDatabase('GrupoActividad', 'delete', { id }); } };
  const addTrabajador = (t) => { const n = { ...t, id: t.id || Date.now().toString() }; setTrabajadores([...trabajadores, n]); syncToDatabase('Trabajador', 'add', n); };
  const editTrabajador = (id, newProps) => { setTrabajadores(trabajadores.map(t => t.id === id ? { ...t, ...newProps } : t)); syncToDatabase('Trabajador', 'edit', { id, ...newProps }); };
  const deleteTrabajador = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar trabajador' })) { setTrabajadores(trabajadores.filter(t => t.id !== id)); syncToDatabase('Trabajador', 'delete', { id }); } };
  const addProveedor = (p) => { const n = { ...p, id: p.id || Date.now().toString() }; setProveedores([...proveedores, n]); syncToDatabase('Proveedor', 'add', n); };
  const editProveedor = (id, newProps) => { setProveedores(proveedores.map(p => p.id === id ? { ...p, ...newProps } : p)); syncToDatabase('Proveedor', 'edit', { id, ...newProps }); };
  const deleteProveedor = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar proveedor' })) { setProveedores(proveedores.filter(p => p.id !== id)); syncToDatabase('Proveedor', 'delete', { id }); } };
  const addCuadrilla = (c) => { const n = { ...c, id: c.id || Date.now().toString() }; setCuadrillas([...cuadrillas, n]); syncToDatabase('Cuadrilla', 'add', n); };
  const editCuadrilla = (id, newProps) => { setCuadrillas(cuadrillas.map(c => c.id === id ? { ...c, ...newProps } : c)); syncToDatabase('Cuadrilla', 'edit', { id, ...newProps }); };
  const deleteCuadrilla = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar cuadrilla' })) { setCuadrillas(cuadrillas.filter(c => c.id !== id)); syncToDatabase('Cuadrilla', 'delete', { id }); } };
  const addMaquinaria = (m) => { const n = { ...m, id: m.id || Date.now().toString() }; setMaquinarias([...maquinarias, n]); syncToDatabase('Maquinaria', 'add', n); };
  const editMaquinaria = (id, newProps) => { setMaquinarias(maquinarias.map(m => m.id === id ? { ...m, ...newProps } : m)); syncToDatabase('Maquinaria', 'edit', { id, ...newProps }); };
  const deleteMaquinaria = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar maquinaria' })) { setMaquinarias(maquinarias.filter(m => m.id !== id)); syncToDatabase('Maquinaria', 'delete', { id }); } };
  const addTipoMaquinaria = (t) => { const n = { ...t, id: t.id || Date.now().toString() }; setTiposMaquinaria([...tiposMaquinaria, n]); syncToDatabase('TipoMaquinaria', 'add', n); };
  const editTipoMaquinaria = (id, newProps) => { setTiposMaquinaria(tiposMaquinaria.map(t => t.id === id ? { ...t, ...newProps } : t)); syncToDatabase('TipoMaquinaria', 'edit', { id, ...newProps }); };
  const deleteTipoMaquinaria = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar tipo de maquinaria' })) { setTiposMaquinaria(tiposMaquinaria.filter(t => t.id !== id)); syncToDatabase('TipoMaquinaria', 'delete', { id }); } };
  const addUnidad = (u) => { const n = { ...u, id: u.id || Date.now().toString() }; setUnidades([...unidades, n]); syncToDatabase('Unidad', 'add', n); };
  const editUnidad = (id, newProps) => { setUnidades(unidades.map(u => u.id === id ? { ...u, ...newProps } : u)); syncToDatabase('Unidad', 'edit', { id, ...newProps }); };
  const deleteUnidad = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar unidad' })) { setUnidades(unidades.filter(u => u.id !== id)); syncToDatabase('Unidad', 'delete', { id }); } };
  const addTipoProducto = (tp) => { const n = { ...tp, id: tp.id || Date.now().toString() }; setTiposProductos([...tiposProductos, n]); syncToDatabase('TipoProducto', 'add', n); };
  const editTipoProducto = (id, newProps) => { setTiposProductos(tiposProductos.map(tp => tp.id === id ? { ...tp, ...newProps } : tp)); syncToDatabase('TipoProducto', 'edit', { id, ...newProps }); };
  const deleteTipoProducto = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar tipo de producto' })) { setTiposProductos(tiposProductos.filter(tp => tp.id !== id)); syncToDatabase('TipoProducto', 'delete', { id }); } };
  const addProducto = (p) => { const n = { ...p, id: p.id || Date.now().toString() }; setProductos([...productos, n]); syncToDatabase('Producto', 'add', n); };
  const editProducto = (id, newProps) => { setProductos(productos.map(p => p.id === id ? { ...p, ...newProps } : p)); syncToDatabase('Producto', 'edit', { id, ...newProps }); };
  const deleteProducto = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar producto' })) { setProductos(productos.filter(p => p.id !== id)); syncToDatabase('Producto', 'delete', { id }); } };

  const ajustarStock = (id, cantidad, tipo = 'entrada') => {
    setProductos(productos.map(p => {
      if (p.id === id) {
        const factor = tipo === 'entrada' ? 1 : -1;
        return { ...p, stockActual: (p.stockActual || 0) + (Number(cantidad) * factor) };
      }
      return p;
    }));
  };

  const addControlAgro = (c) => {
    const n = { ...c, id: c.id || Date.now().toString() };
    setControlesAgro([...controlesAgro, n]);
    syncToDatabase('ControlesAgro', 'add', n);
  };
  const editControlAgro = (id, newProps) => {
    setControlesAgro(controlesAgro.map(c => c.id === id ? { ...c, ...newProps } : c));
    syncToDatabase('ControlesAgro', 'edit', { id, ...newProps });
  };
  const deleteControlAgro = async (id) => {
    if (await confirmDialog('¿Eliminar?', { title: 'Eliminar control' })) {
      setControlesAgro(controlesAgro.filter(c => c.id !== id));
      syncToDatabase('ControlesAgro', 'delete', { id });
    }
  };
  const addRegistroControl = (r) => { 
    const nuevo = { ...r, id: Date.now().toString(), fecha: new Date().toISOString() };
    setRegistrosControles([...registrosControles, nuevo]); 
    syncToDatabase('Monitoreo', 'add', { id: nuevo.id, fecha: nuevo.fecha, sectorCodigo: nuevo.sectorId || 'N/A', tipo: nuevo.tipo || 'General', observaciones: nuevo.observaciones || '' });
  };
  const editRegistroControl = (id, updatedReg) => { setRegistrosControles(registrosControles.map(r => r.id === id ? { ...updatedReg, id } : r)); syncToDatabase('Monitoreo', 'edit', { id: id, ...updatedReg }); };
  const deleteRegistroControl = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar registro de monitoreo' })) { setRegistrosControles(registrosControles.filter(r => r.id !== id)); syncToDatabase('Monitoreo', 'delete', { id }); } };
  const addMantenimiento = (m) => {
    const nuevo = { ...m, id: Date.now().toString(), fechaRegistro: new Date().toISOString() };
    setMantenimientos([...mantenimientos, nuevo]);
    setMaquinarias(maquinarias.map(maq => maq.id === m.maquinariaId ? { ...maq, ultimoMantenimientoHoras: m.horometer } : maq));
  };
  const deleteMantenimiento = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar mantenimiento' })) setMantenimientos(mantenimientos.filter(m => m.id !== id)); };

  const addUsuario = (usuario) => {
    const nuevo = normalizeUsuario(usuario);
    setUsuarios(prev => [...prev, nuevo]);
    syncToDatabase('Usuario', 'add', nuevo);
    return nuevo;
  };

  const editUsuario = (id, newProps) => {
    setUsuarios(prev => prev.map(usuario => {
      if (usuario.id !== id && usuario.codigo !== id && usuario.code !== id) return usuario;
      const updated = normalizeUsuario({ ...usuario, ...newProps, id: usuario.id, codigo: usuario.codigo });
      if (currentUser && (currentUser.id === usuario.id || currentUser.codigo === usuario.codigo || currentUser.code === usuario.code)) {
        setCurrentUser(updated);
      }
      syncToDatabase('Usuario', 'edit', updated);
      return updated;
    }));
  };

  const deleteUsuario = async (id) => {
    const usuario = usuarios.find(item => item.id === id || item.codigo === id || item.code === id);
    if (!usuario) return;
    if (currentUser && (currentUser.id === usuario.id || currentUser.codigo === usuario.codigo || currentUser.code === usuario.code)) {
      swalError('No puedes eliminar el usuario con el que estás autenticado.');
      return;
    }
    if (await confirmDialog(`¿Eliminar el usuario ${usuario.nombres} ${usuario.apellidos}?`, { title: 'Eliminar usuario' })) {
      setUsuarios(prev => prev.filter(item => item.id !== id && item.codigo !== id && item.code !== id));
      syncToDatabase('Usuario', 'delete', { id: usuario.codigo || usuario.id || id });
    }
  };

  const addCategoriaAcceso = (categoria) => {
    const nueva = normalizeCategoria(categoria);
    setCategoriasAcceso(prev => [...prev, nueva]);
    syncToDatabase('CategoriaAcceso', 'add', nueva);
    return nueva;
  };

  const editCategoriaAcceso = (id, newProps) => {
    setCategoriasAcceso(prev => prev.map(categoria => {
      if (categoria.id !== id && categoria.codigo !== id && categoria.code !== id) return categoria;
      const updated = normalizeCategoria({ ...categoria, ...newProps, id: categoria.id, codigo: categoria.codigo });
      syncToDatabase('CategoriaAcceso', 'edit', updated);
      return updated;
    }));
  };

  const deleteCategoriaAcceso = async (id) => {
    const categoria = categoriasAcceso.find(item => item.id === id || item.codigo === id || item.code === id);
    if (!categoria) return;
    const enUso = usuarios.some(usuario => usuario.categoriaCodigo === categoria.codigo || usuario.categoriaCodigo === categoria.id || usuario.categoriaCodigo === categoria.code);
    if (enUso) {
      swalError('No se puede eliminar una categoría que ya tiene usuarios asignados.');
      return;
    }
    if (await confirmDialog(`¿Eliminar la categoría ${categoria.nombre}?`, { title: 'Eliminar categoría' })) {
      setCategoriasAcceso(prev => prev.filter(item => item.id !== id && item.codigo !== id && item.code !== id));
      syncToDatabase('CategoriaAcceso', 'delete', { id: categoria.codigo || categoria.id || id });
    }
  };

  const updateNode = (nodes, id, newProps) => {
    return nodes.map(node => {
      if (node.id === id) return { ...node, ...newProps };
      if (node.fincas) return { ...node, fincas: updateNode(node.fincas, id, newProps) };
      if (node.lotes) return { ...node, lotes: updateNode(node.lotes, id, newProps) };
      if (node.suertes) return { ...node, suertes: updateNode(node.suertes, id, newProps) };
      return node;
    });
  };

  const updateCultivoInNodes = (nodes, oldName, newName) => nodes.map(node => ({
    ...node,
    cultivo: node.cultivo === oldName ? newName : node.cultivo,
    fincas: node.fincas ? updateCultivoInNodes(node.fincas, oldName, newName) : node.fincas,
    lotes: node.lotes ? updateCultivoInNodes(node.lotes, oldName, newName) : node.lotes,
    suertes: node.suertes ? updateCultivoInNodes(node.suertes, oldName, newName) : node.suertes
  }));

  const hasCultivoInNodes = (nodes, cultivoName) => nodes.some(node => (
    node.cultivo === cultivoName ||
    (node.fincas && hasCultivoInNodes(node.fincas, cultivoName)) ||
    (node.lotes && hasCultivoInNodes(node.lotes, cultivoName)) ||
    (node.suertes && hasCultivoInNodes(node.suertes, cultivoName))
  ));

  const updateEstructura = (id, newProps) => setSectores(updateNode(sectores, id, newProps));

  const addElementoEstructura = (parentId, parentType, elemento) => {
    const newNode = { ...elemento, id: elemento.id || Date.now().toString(), type: elemento.type };
    setSectores(addNode(sectores, parentId, newNode, parentType));
    
    if (newNode.type === 'Finca') {
        syncToDatabase('Finca', 'add', { id: newNode.id, sectorCodigo: parentId, nombre: newNode.name });
    } else if (newNode.type === 'Lote') {
        syncToDatabase('Lote', 'add', { id: newNode.id, fincaCodigo: parentId, nombre: newNode.name });
    } else if (newNode.type === 'Suerte') {
        syncToDatabase('Suerte', 'add', { id: newNode.id, loteCodigo: parentId, nombre: newNode.name, hectareas: newNode.hectareas || 0, plantas: newNode.plantas || 0, cultivo: newNode.cultivo || '', estado: newNode.estado || 'Activo' });
    }
  };

  const addSector = (sector) => {
    const s = { ...sector, id: sector.id || Date.now().toString(), type: 'Sector', plantaCliente: sector.plantaCliente || 'N/A', fincas: [], suertes: [] };
    setSectores([...sectores, s]);
    syncToDatabase('Sector', 'add', s);
  };

  const addNode = (nodes, parentId, newNode, parentType) => {
    return nodes.map(node => {
      if (node.id === parentId) {
        if (newNode.type === 'Suerte') return { ...node, suertes: [...(node.suertes || []), newNode] };
        if (newNode.type === 'Finca') return { ...node, fincas: [...(node.fincas || []), { ...newNode, lotes: [], suertes: [] }] };
        if (newNode.type === 'Lote') return { ...node, lotes: [...(node.lotes || []), { ...newNode, suertes: [] }] };
      }
      if (node.fincas) return { ...node, fincas: addNode(node.fincas, parentId, newNode, parentType) };
      if (node.lotes) return { ...node, lotes: addNode(node.lotes, parentId, newNode, parentType) };
      return node;
    });
  };

  const removeNode = (nodes, id) => nodes.filter(node => node.id !== id).map(node => ({ ...node, fincas: node.fincas ? removeNode(node.fincas, id) : undefined, lotes: node.lotes ? removeNode(node.lotes, id) : undefined, suertes: node.suertes ? removeNode(node.suertes, id) : undefined }));
  const deleteEstructura = async (id) => { if (await confirmDialog('¿Eliminar?', { title: 'Eliminar estructura' })) setSectores(removeNode(sectores, id)); };

  return (
    <AgroContext.Provider value={{ 
      globalPlanta, setGlobalPlanta, plantas, setPlantas, globalCultivo, setGlobalCultivo, cultivos, addCultivo, editCultivo, deleteCultivo, sectores, updateEstructura, addSector, addElementoEstructura, calcLoteHa, calcFincaHa, calcSectorHa, calcTotalHa, calcLotesActivos, gruposActividades, addGrupo, editGrupo, deleteGrupo, actividades, addActividad, editActividad, deleteActividad, trabajadores, addTrabajador, editTrabajador, deleteTrabajador, proveedores, addProveedor, editProveedor, deleteProveedor, cuadrillas, addCuadrilla, editCuadrilla, deleteCuadrilla, unidades, addUnidad, editUnidad, deleteUnidad, maquinarias, addMaquinaria, editMaquinaria, deleteMaquinaria, tiposMaquinaria, addTipoMaquinaria, editTipoMaquinaria, deleteTipoMaquinaria, tiposProductos, addTipoProducto, editTipoProducto, deleteTipoProducto, productos, addProducto, editProducto, deleteProducto, ajustarStock, planificaciones, addPlanificacion, updatePlanificacion, deletePlanificacion, generarOrden, desvincularOrden, ejecutarPlanificacion, configuraciones, setConfiguraciones, updateConfiguracion, controlesAgro, addControlAgro, editControlAgro, deleteControlAgro, registrosControles, addRegistroControl, editRegistroControl, deleteRegistroControl, mantenimientos, addMantenimiento, deleteMantenimiento, usuarios, addUsuario, editUsuario, deleteUsuario, categoriasAcceso, addCategoriaAcceso, editCategoriaAcceso, deleteCategoriaAcceso, currentUser, isOnline, syncQueue, lastSync, processSync, setSyncQueue, currentClient, clients, addClient, updateClient, editClient, deleteClient, suspendClient, reactivateClient, resetClientData,
      PLAN_CONFIG, THEME_CONFIG, setCurrentClient, setClients,
      movimientosInventario, setMovimientosInventario
    }}>
      {children}
    </AgroContext.Provider>
  );
}

export function useAgro() { return useContext(AgroContext); }
