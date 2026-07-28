import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
export const tableMap = {
  Cultivo: 'cultivos',
  Trabajador: 'trabajadores',
  Actividad: 'actividades',
  Producto: 'productos',
  Maquinaria: 'maquinarias',
  Proveedor: 'proveedores',
  Sector: 'sectores',
  Cuadrilla: 'cuadrillas',
  Unidad: 'unidades',
  TipoProducto: 'tipos_producto',
  GrupoActividad: 'grupos_actividad',
  TipoMaquinaria: 'tipos_maquinaria',
  Planificacion: 'planificaciones',
  Configuracion: 'configuraciones',
  Ejecucion: 'ejecuciones',
  EjecucionInsumo: 'ejecucion_insumos',
  EjecucionMaquinaria: 'ejecucion_maquinaria',
  EjecucionManoObra: 'ejecucion_mano_obra',
  Monitoreo: 'monitoreos',
  Informe: 'informes',
  Finca: 'fincas',
  Lote: 'lotes',
  Suerte: 'suertes',
  Cliente: 'clientes',
  ConfiguracionGlobal: 'configuracion_global',
  Usuario: 'usuarios',
  CategoriaAcceso: 'categorias_acceso'
};

export const baseSchemas = {
  cultivos: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255), estado VARCHAR(50)',
  trabajadores: 'codigo VARCHAR(100) PRIMARY KEY, identificacion VARCHAR(100), nombre VARCHAR(255), apellido VARCHAR(255), cargo VARCHAR(100), estado VARCHAR(50), cuadrilla_codigo VARCHAR(255)',
  actividades: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255), grupo_codigo VARCHAR(255), cultivo VARCHAR(255), tipo VARCHAR(100), clasificacion VARCHAR(100), unidad_produccion VARCHAR(100), unidad_medida VARCHAR(100), tarifa_base FLOAT, productos_estandar TEXT',
  controles_agro: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255), descripcion TEXT, frecuencia VARCHAR(50), activo INT, variables TEXT',
  productos: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255), tipo_codigo VARCHAR(255), unidad_medida VARCHAR(100), stock_actual FLOAT, costo_unitario FLOAT',
  maquinarias: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255), tipo_codigo VARCHAR(255), estado VARCHAR(100), propia_alquilada VARCHAR(100), tarifa FLOAT, horometro_actual FLOAT',
  proveedores: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255), tipo VARCHAR(100), contacto VARCHAR(255), telefono VARCHAR(100), correo VARCHAR(255), estado VARCHAR(50)',
  sectores: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255), tipo VARCHAR(100), planta_cliente VARCHAR(255)',
  fincas: 'codigo VARCHAR(100) PRIMARY KEY, sector_codigo VARCHAR(100), nombre VARCHAR(255)',
  lotes: 'codigo VARCHAR(100) PRIMARY KEY, finca_codigo VARCHAR(100), nombre VARCHAR(255)',
  suertes: 'codigo VARCHAR(100) PRIMARY KEY, lote_codigo VARCHAR(100), nombre VARCHAR(255), hectareas FLOAT, plantas FLOAT, cultivo VARCHAR(100), estado VARCHAR(50)',
  cuadrillas: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255), jefe_codigo VARCHAR(255)',
  unidades: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255)',
  tipos_producto: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255)',
  grupos_actividad: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255)',
  tipos_maquinaria: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255)',
  planificaciones: 'codigo VARCHAR(100) PRIMARY KEY, estado VARCHAR(50), orden_code VARCHAR(100), fecha VARCHAR(50), lote_codigo VARCHAR(100), actividad_codigo VARCHAR(100), ha_planificadas FLOAT, tarifa_actividad FLOAT, total_presupuestado FLOAT, contratista_codigo VARCHAR(100)',
  configuraciones: 'codigo VARCHAR(100) PRIMARY KEY, clave VARCHAR(100), valor VARCHAR(500), tipo VARCHAR(100)',
  usuarios: 'codigo VARCHAR(100) PRIMARY KEY, cliente_codigo VARCHAR(100), empresa_id VARCHAR(100), planta_id VARCHAR(100), nombres VARCHAR(255), apellidos VARCHAR(255), cedula VARCHAR(100), correo VARCHAR(255), contrasena VARCHAR(255), rol VARCHAR(100), categoria_codigo VARCHAR(100), modulos TEXT, estado VARCHAR(50), fecha_ingreso VARCHAR(50)',
  categorias_acceso: 'codigo VARCHAR(100) PRIMARY KEY, cliente_codigo VARCHAR(100), nombre VARCHAR(255), descripcion TEXT, permisos TEXT, modulos TEXT, estado VARCHAR(50)',
  configuracion_global: 'codigo VARCHAR(100) PRIMARY KEY, config_insumos INT, config_mao INT, config_maq INT, validar_insumos INT, validar_maquinaria INT, validar_nomina INT, bloquear_stock_negativo INT, registrar_gps_monitoreo INT, registrar_gps_insumos INT, registrar_gps_maquinaria INT, registrar_gps_mano_obra INT, mostrar_alertas_monitoreo INT, permitir_muestras_monitoreo INT, permitir_observaciones_monitoreo INT, validar_variables_requeridas_monitoreo INT, frecuencia_monitoreo VARCHAR(50), estructura_niveles INT, estructura_nivel_nombres TEXT, maestro_mao INT, maestro_maq INT, maestro_ins INT, maestro_actividad INT, maestro_tp_act INT, maestro_proveedores INT, maestro_cultivos INT, maestro_controles INT, maestro_grupos INT, maestro_tipos_maquinaria INT, maestro_cuadrillas INT, maestro_unidades INT, maestro_tipos_productos INT, empresa VARCHAR(255), logo VARCHAR(255), pais VARCHAR(100), zona_horaria VARCHAR(100), moneda VARCHAR(10), unidad_area VARCHAR(50), decimales INT',
  clientes: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255), plan VARCHAR(100), estado VARCHAR(50)',
  ejecuciones: 'codigo VARCHAR(100) PRIMARY KEY, planificacion_codigo VARCHAR(100), fecha VARCHAR(50), hectareas_ejecutadas FLOAT, observaciones VARCHAR(500)',
  ejecucion_insumos: 'codigo VARCHAR(100) PRIMARY KEY, ejecucion_codigo VARCHAR(100), producto_codigo VARCHAR(100), cantidad FLOAT, costo_unitario FLOAT',
  ejecucion_maquinaria: 'codigo VARCHAR(100) PRIMARY KEY, ejecucion_codigo VARCHAR(100), maquinaria_codigo VARCHAR(100), horas FLOAT, tarifa FLOAT',
  ejecucion_mano_obra: 'codigo VARCHAR(100) PRIMARY KEY, ejecucion_codigo VARCHAR(100), trabajador_codigo VARCHAR(100), labor VARCHAR(255), cantidad FLOAT, tarifa FLOAT',
  monitoreos: 'codigo VARCHAR(100) PRIMARY KEY, fecha VARCHAR(50), sector_codigo VARCHAR(100), tipo VARCHAR(100), observaciones VARCHAR(500)',
  informes: 'codigo VARCHAR(100) PRIMARY KEY, nombre VARCHAR(255), tipo VARCHAR(100), configuracion TEXT'
};

export const fieldTranslations = {
  name: 'nombre',
  status: 'estado',
  email: 'correo',
  groupId: 'grupo_codigo',
  tipoId: 'tipo_codigo',
  cuadrillaId: 'cuadrilla_codigo',
  jefeId: 'jefe_codigo',
  propiaAlquilada: 'propia_alquilada',
  horometroActual: 'horometro_actual',
  tarifaBase: 'tarifa_base',
  stockActual: 'stock_actual',
  costoUnitario: 'costo_unitario',
  unidadMedida: 'unidad_medida',
  unidadProduccion: 'unidad_produccion',
  productosEstandar: 'productos_estandar',
  type: 'tipo',
  plantaCliente: 'planta_cliente',
  ordenCode: 'orden_code',
  loteId: 'lote_codigo',
  actividadId: 'actividad_codigo',
  contratistaId: 'contratista_codigo',
  planificacionCodigo: 'planificacion_codigo',
  ejecucionCodigo: 'ejecucion_codigo',
  productoCodigo: 'producto_codigo',
  maquinariaCodigo: 'maquinaria_codigo',
  trabajadorCodigo: 'trabajador_codigo',
  clienteCodigo: 'cliente_codigo',
  categoriaCodigo: 'categoria_codigo',
  contrasena: 'contrasena',
  password: 'contrasena',
  nombres: 'nombres',
  apellidos: 'apellidos',
  cedula: 'cedula',
  permisos: 'permisos',
  modulos: 'modulos',
  sectorCodigo: 'sector_codigo',
  fincaCodigo: 'finca_codigo',
  loteCodigo: 'lote_codigo',
  suerteCodigo: 'suerte_codigo',
  cantidad: 'cantidad',
  horas: 'horas',
  tarifa: 'tarifa',
  labor: 'labor',
  observaciones: 'observaciones',
  clave: 'clave',
  valor: 'valor',
  configuracion: 'configuracion',
  descripcion: 'descripcion',
  frecuencia: 'frecuencia',
  activo: 'activo',
  variables: 'variables',
  hectareasEjecutadas: 'hectareas_ejecutadas',
  fecha: 'fecha',
  fechaIngreso: 'fecha_ingreso'
};

export const getHost = (connectionData = {}) => (
  connectionData.server ||
  connectionData.endpoint ||
  connectionData.serverName ||
  connectionData.instanceConnectionName ||
  ''
);

export const getPort = (port, fallback) => Number.parseInt(port, 10) || fallback;

export const normalizeProviderEngine = (value = '') => {
  const normalized = String(value).toLowerCase();
  if (normalized.includes('postgres')) return 'PostgreSQL';
  if (normalized.includes('sqlserver') || normalized.includes('sql server')) return 'SQL Server';
  if (normalized.includes('oracle')) return 'Oracle';
  if (normalized.includes('maria')) return 'MySQL';
  if (normalized.includes('mysql')) return 'MySQL';
  return 'MySQL';
};

export const resolveActualEngine = (engine, connectionData = {}) => {
  if (engine === 'AWS RDS' || engine === 'Google Cloud SQL') {
    return normalizeProviderEngine(connectionData.engineType || 'MySQL');
  }

  if (engine === 'Azure SQL') {
    return 'SQL Server';
  }

  return engine;
};

export const getOracleConnectString = (connectionData = {}) => {
  const host = getHost(connectionData);
  const port = connectionData.port;
  const { database, sid, tnsName } = connectionData;

  if (connectionData.connectionType === 'SID') {
    return `${host}:${port}/${sid}`;
  }

  if (connectionData.connectionType === 'TNS') {
    return `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${host})(PORT=${port}))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=${tnsName})))`;
  }

  return `${host}:${port}/${database || 'xe'}`;
};

export const getMySqlConnection = (connectionData, databaseOverride = null) => mysql.createConnection({
  host: getHost(connectionData),
  port: getPort(connectionData.port, 3306),
  user: connectionData.username,
  password: connectionData.password,
  database: databaseOverride || connectionData.database || undefined,
  connectTimeout: 5000
});

export const getSqlServerConfig = (connectionData) => ({
  user: connectionData.username,
  password: connectionData.password,
  database: connectionData.database || 'master',
  server: getHost(connectionData),
  port: getPort(connectionData.port, 1433),
  options: {
    encrypt: connectionData.encrypt ?? false,
    trustServerCertificate: connectionData.trustServerCertificate ?? true,
    connectTimeout: 5000
  }
});

export const getPostgresPool = (connectionData) => new Pool({
  host: getHost(connectionData),
  port: getPort(connectionData.port, 5432),
  user: connectionData.username,
  password: connectionData.password,
  database: connectionData.database,
  ssl: connectionData.ssl === false ? false : (connectionData.ssl === true || connectionData.ssl === 'true' ? { rejectUnauthorized: false } : undefined),
  connectionTimeoutMillis: 5000
});

export const mapValue = (val) => {
  if (val === true) return 1;
  if (val === false) return 0;
  if (Array.isArray(val) || (val !== null && typeof val === 'object')) return JSON.stringify(val);
  return val;
};

export const getTableName = (model) => tableMap[model] || `${model.toLowerCase()}s`;

export const getEngineColumns = (cols, engineType) => {
  if (engineType === 'MySQL') {
    return `${cols}, fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
  }

  if (engineType === 'SQL Server') {
    return `${cols}, fecha_creacion DATETIME DEFAULT GETDATE(), fecha_actualizacion DATETIME DEFAULT GETDATE()`;
  }

  return `${cols}, fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
};

export const GLOBAL_CONFIG_SEED = {
  codigo: 'GLOBAL',
  config_insumos: 1,
  config_mao: 1,
  config_maq: 1,
  validar_insumos: 1,
  validar_maquinaria: 1,
  validar_nomina: 1,
  bloquear_stock_negativo: 0,
  registrar_gps_monitoreo: 1,
  registrar_gps_insumos: 1,
  registrar_gps_maquinaria: 1,
  registrar_gps_mano_obra: 1,
  mostrar_alertas_monitoreo: 1,
  permitir_muestras_monitoreo: 1,
  permitir_observaciones_monitoreo: 1,
  validar_variables_requeridas_monitoreo: 1,
  frecuencia_monitoreo: 'Semanal',
  estructura_niveles: 4,
  estructura_nivel_nombres: JSON.stringify({
    nivel1: 'Sector',
    nivel2: 'Finca',
    nivel3: 'Lote',
    nivel4: 'Suerte'
  }),
  maestro_mao: 1,
  maestro_maq: 1,
  maestro_ins: 1,
  maestro_actividad: 1,
  maestro_tp_act: 1,
  maestro_proveedores: 1,
  maestro_cultivos: 1,
  maestro_controles: 1,
  maestro_grupos: 1,
  maestro_tipos_maquinaria: 1,
  maestro_cuadrillas: 1,
  maestro_unidades: 1,
  maestro_tipos_productos: 1,
  empresa: 'AgroGestión',
  logo: '',
  pais: 'Colombia',
  zona_horaria: 'America/Bogota',
  moneda: 'COP',
  unidad_area: 'ha',
  decimales: 2
};

export const DEFAULT_PERMISSION_SET = {
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
  gestionar_clientes: 1,
  crear_actividad: 1,
  editar_actividad: 1,
  eliminar_actividad: 1,
  // Master view permissions
  ver_maestro_actividades: 1,
  ver_maestro_insumos: 1,
  ver_maestro_maquinaria: 1,
  ver_maestro_trabajadores: 1,
  ver_maestro_controles: 1,
  ver_unidades: 1,
  generar_reporte: 1,
  crear_reporte: 1,
  editar_reporte: 1,
  eliminar_reporte: 1
};

export const DEFAULT_ACCESS_CATEGORIES = (clientCode = 'GLOBAL') => ([
  {
    codigo: 'SUPER_ADMIN',
    cliente_codigo: clientCode,
    nombre: 'Super Admin',
    descripcion: 'Acceso total al sistema y a todas las funciones.',
    permisos: DEFAULT_PERMISSION_SET,
    modulos: ['ALL'],
    estado: 'Activo'
  },
  {
    codigo: 'ADMIN',
    cliente_codigo: clientCode,
    nombre: 'Administrador',
    descripcion: 'Gestiona la operaciÃ³n del cliente y sus usuarios.',
    permisos: {
      ...DEFAULT_PERMISSION_SET,
      gestionar_clientes: 0
    },
    modulos: ['Dashboard', 'Estructura', 'Maestros', 'Planificacion', 'Ejecucion', 'Reportes', 'Monitoreo', 'Mantenimiento', 'Sincronizacion', 'Mapas', 'Usuarios', 'Configuraciones'],
    estado: 'Activo'
  },
  {
    codigo: 'USUARIO_GENERAL',
    cliente_codigo: clientCode,
    nombre: 'Usuario General',
    descripcion: 'Acceso limitado a los mÃ³dulos asignados.',
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

export const DEFAULT_USERS = (clientCode = 'GLOBAL') => ([
  {
    codigo: 'USR-0001',
    cliente_codigo: clientCode,
    nombres: 'Super',
    apellidos: 'Administrador',
    cedula: '0000000000',
    correo: 'admin@sarriatech.com',
    contrasena: 'Admin123',
    rol: 'Super Admin',
    categoria_codigo: 'SUPER_ADMIN',
    modulos: ['ALL'],
    estado: 'Activo'
  }
]);

export const GLOBAL_CONFIG_COLUMNS = Object.keys(GLOBAL_CONFIG_SEED);
export const GLOBAL_CONFIG_VALUES = GLOBAL_CONFIG_COLUMNS.map((key) => GLOBAL_CONFIG_SEED[key]);

export const upsertSeedRows = async ({ connection, actualEngine, table, rows }) => {
  if (!rows.length) return;

  if (actualEngine === 'MySQL') {
    for (const row of rows) {
      const keys = Object.keys(row);
      const columns = keys.map((key) => fieldTranslations[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase());
      const values = keys.map((key) => mapValue(row[key]));
      const updateClause = columns.filter((col) => col !== 'codigo').map((col) => `${col}=VALUES(${col})`).join(', ');
      await connection.execute(
        `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')}) ON DUPLICATE KEY UPDATE ${updateClause}`,
        values
      );
    }
    return;
  }

  if (actualEngine === 'SQL Server') {
    for (const row of rows) {
      const keys = Object.keys(row);
      const columns = keys.map((key) => fieldTranslations[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase());
      const values = keys.map((key) => mapValue(row[key]));
      const request = connection.request();
      columns.forEach((col, index) => request.input(col, values[index]));
      const sourceCols = columns.map((col) => `@${col} AS ${col}`).join(', ');
      const updateClause = columns.filter((col) => col !== 'codigo').map((col) => `target.${col} = source.${col}`).join(', ');
      const insertCols = columns.join(', ');
      const insertVals = columns.map((col) => `source.${col}`).join(', ');
      await request.query(`
        MERGE ${table} AS target
        USING (SELECT ${sourceCols}) AS source
        ON target.codigo = source.codigo
        WHEN MATCHED THEN UPDATE SET ${updateClause}
        WHEN NOT MATCHED THEN INSERT (${insertCols}) VALUES (${insertVals});
      `);
    }
    return;
  }

  if (actualEngine === 'PostgreSQL') {
    for (const row of rows) {
      const keys = Object.keys(row);
      const columns = keys.map((key) => fieldTranslations[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase());
      const values = keys.map((key) => mapValue(row[key]));
      const updates = columns.filter((col) => col !== 'codigo').map((col) => `${col} = EXCLUDED.${col}`).join(', ');
      await connection.query(
        `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map((_, index) => `$${index + 1}`).join(', ')}) ON CONFLICT (codigo) DO UPDATE SET ${updates}`,
        values
      );
    }
    return;
  }

  if (actualEngine === 'Oracle') {
    for (const row of rows) {
      const keys = Object.keys(row);
      const columns = keys.map((key) => fieldTranslations[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase());
      const bindValues = {};
      keys.forEach((key) => {
        bindValues[key] = mapValue(row[key]);
      });
      const placeholders = keys.map((key) => `:${key}`).join(', ');
      try {
        await connection.execute(`DELETE FROM ${table} WHERE codigo = :codigo`, { codigo: row.codigo }, { autoCommit: true });
      } catch {}
      await connection.execute(
        `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
        bindValues,
        { autoCommit: true }
      );
    }
  }
};

export let globalDb;
export async function getGlobalDb() {
  if (!globalDb) {
    globalDb = await open({
      filename: './global_registry.db',
      driver: sqlite3.Database
    });
    await globalDb.exec(`
      CREATE TABLE IF NOT EXISTS clientes (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255),
        databaseEngine VARCHAR(50),
        databaseName VARCHAR(255),
        databaseUser VARCHAR(255),
        databasePassword VARCHAR(255),
        connectionData TEXT,
        status VARCHAR(50) DEFAULT 'Activo'
      );
      CREATE TABLE IF NOT EXISTS usuarios_clientes (
        id VARCHAR(100) PRIMARY KEY,
        correo VARCHAR(255) UNIQUE,
        contrasena VARCHAR(255),
        nombres VARCHAR(255),
        apellidos VARCHAR(255),
        rol VARCHAR(100) DEFAULT 'Admin Global',
        estado VARCHAR(50) DEFAULT 'Activo'
      );
      CREATE TABLE IF NOT EXISTS usuarios_directorio (
        correo VARCHAR(255) PRIMARY KEY,
        cliente_codigo VARCHAR(100)
      );
    `);
    
    // Asegurarse de que el admin global exista o actualizarlo
    await globalDb.run(`
      INSERT OR REPLACE INTO usuarios_clientes (id, correo, contrasena, nombres, apellidos, rol)
      VALUES ('USR-GLOBAL-01', 'admin@sarriatech.com', 'Admin123', 'Super', 'Administrador', 'Admin Global')
    `);
  }
  return globalDb;
}

// Initialize global DB on start
getGlobalDb().catch(console.error);

// --- Endpoints de Admins Globales (max 5) ---