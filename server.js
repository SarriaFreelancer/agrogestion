import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import sql from 'mssql';
import oracledb from 'oracledb';
import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const { Pool } = pg;
const app = express();

import saasRoutes from './src/backend/routes/saas.routes.js';

app.use(cors());
app.use(express.json());

// Montamos el nuevo módulo de rutas SaaS
app.use('/api/saas', saasRoutes);

const tableMap = {
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

const baseSchemas = {
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
  usuarios: 'codigo VARCHAR(100) PRIMARY KEY, cliente_codigo VARCHAR(100), nombres VARCHAR(255), apellidos VARCHAR(255), cedula VARCHAR(100), correo VARCHAR(255), contrasena VARCHAR(255), rol VARCHAR(100), categoria_codigo VARCHAR(100), modulos TEXT, estado VARCHAR(50), fecha_ingreso VARCHAR(50)',
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

const fieldTranslations = {
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

const getHost = (connectionData = {}) => (
  connectionData.server ||
  connectionData.endpoint ||
  connectionData.serverName ||
  connectionData.instanceConnectionName ||
  ''
);

const getPort = (port, fallback) => Number.parseInt(port, 10) || fallback;

const normalizeProviderEngine = (value = '') => {
  const normalized = String(value).toLowerCase();
  if (normalized.includes('postgres')) return 'PostgreSQL';
  if (normalized.includes('sqlserver') || normalized.includes('sql server')) return 'SQL Server';
  if (normalized.includes('oracle')) return 'Oracle';
  if (normalized.includes('maria')) return 'MySQL';
  if (normalized.includes('mysql')) return 'MySQL';
  return 'MySQL';
};

const resolveActualEngine = (engine, connectionData = {}) => {
  if (engine === 'AWS RDS' || engine === 'Google Cloud SQL') {
    return normalizeProviderEngine(connectionData.engineType || 'MySQL');
  }

  if (engine === 'Azure SQL') {
    return 'SQL Server';
  }

  return engine;
};

const getOracleConnectString = (connectionData = {}) => {
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

const getMySqlConnection = (connectionData, databaseOverride = null) => mysql.createConnection({
  host: getHost(connectionData),
  port: getPort(connectionData.port, 3306),
  user: connectionData.username,
  password: connectionData.password,
  database: databaseOverride || connectionData.database || undefined,
  connectTimeout: 5000
});

const getSqlServerConfig = (connectionData) => ({
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

const getPostgresPool = (connectionData) => new Pool({
  host: getHost(connectionData),
  port: getPort(connectionData.port, 5432),
  user: connectionData.username,
  password: connectionData.password,
  database: connectionData.database,
  ssl: connectionData.ssl === false ? false : (connectionData.ssl === true || connectionData.ssl === 'true' ? { rejectUnauthorized: false } : undefined),
  connectionTimeoutMillis: 5000
});

const mapValue = (val) => {
  if (val === true) return 1;
  if (val === false) return 0;
  if (Array.isArray(val) || (val !== null && typeof val === 'object')) return JSON.stringify(val);
  return val;
};

const getTableName = (model) => tableMap[model] || `${model.toLowerCase()}s`;

const getEngineColumns = (cols, engineType) => {
  if (engineType === 'MySQL') {
    return `${cols}, fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
  }

  if (engineType === 'SQL Server') {
    return `${cols}, fecha_creacion DATETIME DEFAULT GETDATE(), fecha_actualizacion DATETIME DEFAULT GETDATE()`;
  }

  return `${cols}, fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
};

const GLOBAL_CONFIG_SEED = {
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

const DEFAULT_PERMISSION_SET = {
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

const DEFAULT_ACCESS_CATEGORIES = (clientCode = 'GLOBAL') => ([
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

const DEFAULT_USERS = (clientCode = 'GLOBAL') => ([
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

const GLOBAL_CONFIG_COLUMNS = Object.keys(GLOBAL_CONFIG_SEED);
const GLOBAL_CONFIG_VALUES = GLOBAL_CONFIG_COLUMNS.map((key) => GLOBAL_CONFIG_SEED[key]);

const upsertSeedRows = async ({ connection, actualEngine, table, rows }) => {
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

let globalDb;
async function getGlobalDb() {
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
app.get('/api/global-admins', async (req, res) => {
  try {
    const db = await getGlobalDb();
    const admins = await db.all(`SELECT id, correo, nombres, apellidos, rol, estado FROM usuarios_clientes ORDER BY id`);
    res.json({ success: true, data: admins });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/global-admins', async (req, res) => {
  try {
    const db = await getGlobalDb();
    const count = await db.get(`SELECT COUNT(*) as total FROM usuarios_clientes`);
    if (count.total >= 5) {
      return res.status(400).json({ success: false, message: 'Límite máximo de 5 administradores globales alcanzado.' });
    }
    const { id, correo, contrasena, nombres, apellidos } = req.body;
    if (!correo || !contrasena) return res.status(400).json({ success: false, message: 'Correo y contraseña son obligatorios.' });
    await db.run(
      `INSERT INTO usuarios_clientes (id, correo, contrasena, nombres, apellidos, rol) VALUES (?, ?, ?, ?, ?, 'Admin Global')`,
      [id || `USR-GLOBAL-${Date.now()}`, correo, contrasena, nombres || '', apellidos || '']
    );
    res.json({ success: true, message: 'Administrador global creado.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/api/global-admins/:id', async (req, res) => {
  try {
    const db = await getGlobalDb();
    const { correo, contrasena, nombres, apellidos, estado } = req.body;
    await db.run(
      `UPDATE usuarios_clientes SET correo=?, contrasena=?, nombres=?, apellidos=?, estado=? WHERE id=?`,
      [correo, contrasena, nombres, apellidos, estado || 'Activo', req.params.id]
    );
    res.json({ success: true, message: 'Administrador global actualizado.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/global-admins/:id', async (req, res) => {
  try {
    if (req.params.id === 'USR-GLOBAL-01') {
      return res.status(403).json({ success: false, message: 'No se puede eliminar el administrador principal.' });
    }
    const db = await getGlobalDb();
    await db.run(`DELETE FROM usuarios_clientes WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Administrador global eliminado.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// --- Endpoints de Clientes ---
app.get('/api/clientes', async (req, res) => {
  try {
    const db = await getGlobalDb();
    const clientes = await db.all(`SELECT * FROM clientes ORDER BY name`);
    res.json({ success: true, data: clientes });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const db = await getGlobalDb();
    const { id, name, databaseEngine, databaseName, databaseUser, databasePassword, connectionData } = req.body;
    if (!id || !name) return res.status(400).json({ success: false, message: 'ID y nombre son obligatorios.' });
    await db.run(
      `INSERT INTO clientes (id, name, databaseEngine, databaseName, databaseUser, databasePassword, connectionData, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Activo')`,
      [id, name, databaseEngine || '', databaseName || '', databaseUser || '', databasePassword || '', JSON.stringify(connectionData || {})]
    );
    res.json({ success: true, message: 'Cliente creado.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const db = await getGlobalDb();
    const { name, databaseEngine, databaseName, databaseUser, databasePassword, connectionData, status } = req.body;
    await db.run(
      `UPDATE clientes SET name=?, databaseEngine=?, databaseName=?, databaseUser=?, databasePassword=?, connectionData=?, status=? WHERE id=?`,
      [name, databaseEngine, databaseName, databaseUser, databasePassword, JSON.stringify(connectionData || {}), status || 'Activo', req.params.id]
    );
    res.json({ success: true, message: 'Cliente actualizado.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const db = await getGlobalDb();
    await db.run(`DELETE FROM clientes WHERE id = ?`, [req.params.id]);
    await db.run(`DELETE FROM usuarios_directorio WHERE cliente_codigo = ?`, [req.params.id]);
    res.json({ success: true, message: 'Cliente eliminado.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Registrar correo en directorio (para que un usuario de cliente pueda hacer login)
app.post('/api/directorio', async (req, res) => {
  try {
    const db = await getGlobalDb();
    const { correo, cliente_codigo } = req.body;
    if (!correo || !cliente_codigo) return res.status(400).json({ success: false, message: 'Faltan datos.' });
    await db.run(
      `INSERT OR REPLACE INTO usuarios_directorio (correo, cliente_codigo) VALUES (?, ?)`,
      [correo, cliente_codigo]
    );
    res.json({ success: true, message: 'Usuario registrado en directorio.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Actualizar configuración de BD de un cliente (acceso para admin de cliente)
app.put('/api/clientes/:id/db-config', async (req, res) => {
  try {
    const db = await getGlobalDb();
    const { databaseEngine, databaseName, databaseUser, databasePassword, connectionData } = req.body;
    await db.run(
      `UPDATE clientes SET databaseEngine=?, databaseName=?, databaseUser=?, databasePassword=?, connectionData=? WHERE id=?`,
      [databaseEngine, databaseName, databaseUser, databasePassword, JSON.stringify(connectionData || {}), req.params.id]
    );
    const updated = await db.get(`SELECT * FROM clientes WHERE id=?`, [req.params.id]);
    res.json({ success: true, message: 'Configuración de base de datos actualizada.', data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Faltan credenciales' });

  try {
    const db = await getGlobalDb();

    // 1. Verificar si es un usuario administrador global (cliente global)
    const adminUser = await db.get(`SELECT * FROM usuarios_clientes WHERE correo = ?`, [email]);
    if (adminUser) {
      if (adminUser.contrasena === password) {
        return res.json({
          success: true,
          user: {
            id: adminUser.id,
            nombres: adminUser.nombres,
            apellidos: adminUser.apellidos,
            correo: adminUser.correo,
            rol: adminUser.rol
          },
          isGlobalAdmin: true
        });
      }
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    // 2. Si no es admin global, buscar en el directorio a qué cliente pertenece
    const dirEntry = await db.get(`SELECT cliente_codigo FROM usuarios_directorio WHERE correo = ?`, [email]);
    if (!dirEntry) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // 3. Obtener los datos de conexión del cliente
    const client = await db.get(`SELECT * FROM clientes WHERE id = ?`, [dirEntry.cliente_codigo]);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    if (client.status === 'Suspendido') {
      return res.status(403).json({ success: false, message: 'El cliente está suspendido' });
    }

    // 4. Conectarse a la BD del cliente y verificar la contraseña
    const connectionData = JSON.parse(client.connectionData || '{}');
    const actualEngine = resolveActualEngine(client.databaseEngine, connectionData);
    
    let isValid = false;
    let userData = null;

    if (actualEngine === 'MySQL') {
      const conn = await getMySqlConnection(connectionData, client.databaseName);
      const [rows] = await conn.execute(`SELECT * FROM usuarios WHERE correo = ?`, [email]);
      await conn.end();
      if (rows.length && rows[0].contrasena === password) {
        isValid = true;
        userData = rows[0];
      }
    } else if (actualEngine === 'SQL Server') {
      const pool = await sql.connect(getSqlServerConfig(connectionData));
      const request = pool.request();
      request.input('correo', email);
      const result = await request.query(`SELECT * FROM usuarios WHERE correo = @correo`);
      await sql.close();
      if (result.recordset.length && result.recordset[0].contrasena === password) {
        isValid = true;
        userData = result.recordset[0];
      }
    } else if (actualEngine === 'PostgreSQL') {
      const pool = getPostgresPool(connectionData);
      const conn = await pool.connect();
      try {
        const result = await conn.query(`SELECT * FROM usuarios WHERE correo = $1`, [email]);
        if (result.rows.length && result.rows[0].contrasena === password) {
          isValid = true;
          userData = result.rows[0];
        }
      } finally {
        conn.release();
        await pool.end();
      }
    }

    if (isValid && userData) {
      return res.json({
        success: true,
        user: {
          id: userData.codigo,
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          correo: userData.correo,
          rol: userData.rol,
          categoriaCodigo: userData.categoria_codigo,
          modulos: userData.modulos
        },
        client: {
          id: client.id,
          name: client.name,
          databaseEngine: client.databaseEngine,
          databaseName: client.databaseName,
          connectionData: connectionData
        },
        isGlobalAdmin: false
      });
    }

    return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });

  } catch (error) {
    console.error('Error en /api/login:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/api/test-connection', async (req, res) => {
  const { engine, connectionData = {} } = req.body;
  const actualEngine = resolveActualEngine(engine, connectionData);
  if (engine === 'Global') return res.json({ success: true, message: 'Global SQLite connected' });
  
  const host = getHost(connectionData);
  if (!host && actualEngine !== 'Firebase' && actualEngine !== 'Global') {
    return res.status(400).json({ success: false, message: 'Host no configurado para el motor de base de datos' });
  }
  const port = connectionData.port;

  try {
    switch (actualEngine) {
      case 'MySQL': {
        const connection = await getMySqlConnection(connectionData);
        await connection.end();
        return res.json({ success: true, message: `Conexión exitosa a MySQL en ${host}:${port || 3306}.` });
      }
      case 'SQL Server': {
        await sql.connect(getSqlServerConfig(connectionData));
        await sql.close();
        return res.json({ success: true, message: `Conexión exitosa a SQL Server en ${host}:${port || 1433}.` });
      }
      case 'PostgreSQL': {
        const pool = getPostgresPool(connectionData);
        const client = await pool.connect();
        client.release();
        await pool.end();
        return res.json({ success: true, message: `Conexión exitosa a PostgreSQL en ${host}:${port || 5432}.` });
      }
      case 'Oracle': {
        const connection = await oracledb.getConnection({
          user: connectionData.username,
          password: connectionData.password,
          connectString: getOracleConnectString(connectionData)
        });
        await connection.close();
        return res.json({ success: true, message: `Conexión exitosa a Oracle en ${host}:${port || 1521}.` });
      }
      default:
        return res.status(400).json({ success: false, message: `Motor de base de datos no soportado para prueba real: ${engine}` });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: `Error de conexión: ${error.message}` });
  }
});

app.post('/api/sync-data', async (req, res) => {
  const { engine, connectionData, model, action, data } = req.body;
  if (engine !== 'Global' && !connectionData) return res.status(400).json({ success: false, message: 'Faltan datos de conexión' });

  const actualEngine = engine === 'Global' ? 'Global' : resolveActualEngine(engine, connectionData);
  const host = engine !== 'Global' ? getHost(connectionData) : '';
  const { port, username, password, database, sid, tnsName } = connectionData || {};
  const tableName = engine === 'Global' && model === 'UsuarioGlobal' ? 'usuarios_clientes' : getTableName(model);

  try {
    if (!host && actualEngine !== 'Firebase' && actualEngine !== 'Global') {
      return res.status(400).json({ success: false, message: 'Host no configurado para el motor de base de datos' });
    }

    if (actualEngine === 'Global') {
      const db = await getGlobalDb();
      if (action === 'add' || action === 'edit') {
        const isAdd = action === 'add';
        const filteredData = { ...data };
        const codigo = filteredData.codigo || filteredData.id || filteredData.code;
        if (codigo) filteredData.id = codigo;
        delete filteredData.codigo;
        delete filteredData.code;

        const keys = Object.keys(filteredData);
        const columns = keys.map(k => fieldTranslations[k] || k.replace(/([A-Z])/g, '_$1').toLowerCase());
        const values = keys.map(k => mapValue(filteredData[k]));
        
        if (isAdd) {
          const placeholders = columns.map(() => '?').join(', ');
          await db.run(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`, values);
        } else {
          if (columns.length === 0) return res.json({ success: true, message: 'Nada que actualizar' });
          const setClause = columns.map(c => `${c} = ?`).join(', ');
          await db.run(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`, [...values, filteredData.id]);
        }
      } else if (action === 'delete') {
        const id = data.codigo || data.id || data.code;
        await db.run(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
      }
      return res.json({ success: true, message: `Acción ${action} en Global exitosa` });
    }

    if (action === 'add') {
      const filteredData = { ...data };
      const idToUse = filteredData.codigo || filteredData.id || filteredData.code;
      if (idToUse) filteredData.codigo = idToUse;
      delete filteredData.id;
      delete filteredData.code;

      const simpleKeys = Object.keys(filteredData);
      const columns = simpleKeys.map((key) => fieldTranslations[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase());
      const colNames = columns.join(', ');
      const values = simpleKeys.map((key) => mapValue(filteredData[key]));

      switch (actualEngine) {
        case 'MySQL': {
          const placeholders = columns.map(() => '?').join(', ');
          const connection = await mysql.createConnection({
            host,
            port: getPort(port, 3306),
            user: username,
            password,
            database
          });
          await connection.execute(`INSERT INTO ${tableName} (${colNames}) VALUES (${placeholders})`, values);
          await connection.end();
          return res.json({ success: true, message: 'Insertado en MySQL' });
        }
        case 'SQL Server': {
          const pool = await sql.connect(getSqlServerConfig(connectionData));
          const request = pool.request();
          columns.forEach((col, index) => request.input(col, values[index]));
          const paramNames = columns.map((col) => `@${col}`).join(', ');
          await request.query(`INSERT INTO ${tableName} (${colNames}) VALUES (${paramNames})`);
          await sql.close();
          return res.json({ success: true, message: 'Insertado en SQL Server' });
        }
        case 'PostgreSQL': {
          const pool = getPostgresPool(connectionData);
          const client = await pool.connect();
          try {
            const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
            await client.query(`INSERT INTO ${tableName} (${colNames}) VALUES (${placeholders})`, values);
          } finally {
            client.release();
            await pool.end();
          }
          return res.json({ success: true, message: 'Insertado en PostgreSQL' });
        }
        case 'Oracle': {
          const connection = await oracledb.getConnection({
            user: username,
            password,
            connectString: getOracleConnectString(connectionData)
          });
          const placeholders = columns.map((_, index) => `:${index + 1}`).join(', ');
          await connection.execute(`INSERT INTO ${tableName} (${colNames}) VALUES (${placeholders})`, values, { autoCommit: true });
          await connection.close();
          return res.json({ success: true, message: 'Insertado en Oracle' });
        }
        default:
          return res.status(400).json({ success: false, message: `Motor ${engine} no implementado para sync` });
      }
    }

    if (action === 'edit' || action === 'delete') {
      const filteredData = { ...data };
      const codigo = filteredData.codigo || filteredData.id || filteredData.code;
      if (codigo) filteredData.codigo = codigo;
      delete filteredData.id;
      delete filteredData.code;

      const simpleKeys = Object.keys(filteredData);
      const columns = simpleKeys.map((key) => fieldTranslations[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase());
      const values = simpleKeys.map((key) => mapValue(filteredData[key]));

      switch (actualEngine) {
        case 'MySQL': {
          const connection = await getMySqlConnection(connectionData, database);
          if (action === 'edit') {
            if (columns.length === 0) return res.json({ success: true, message: 'Nada que actualizar' });
            const setClause = columns.map((col) => `${col} = ?`).join(', ');
            await connection.execute(`UPDATE ${tableName} SET ${setClause} WHERE codigo = ?`, [...values, codigo]);
          } else {
            await connection.execute(`DELETE FROM ${tableName} WHERE codigo = ?`, [codigo]);
          }
          await connection.end();
          return res.json({ success: true, message: `Acción ${action} en MySQL exitosa` });
        }
        case 'SQL Server': {
          const pool = await sql.connect(getSqlServerConfig(connectionData));
          const request = pool.request();
          request.input('pk_codigo', codigo);
          if (action === 'edit') {
            columns.forEach((col, index) => request.input(col, values[index]));
            const setClause = columns.map((col) => `${col} = @${col}`).join(', ');
            await request.query(`UPDATE ${tableName} SET ${setClause} WHERE codigo = @pk_codigo`);
          } else {
            await request.query(`DELETE FROM ${tableName} WHERE codigo = @pk_codigo`);
          }
          await sql.close();
          return res.json({ success: true, message: `Acción ${action} en SQL Server exitosa` });
        }
        case 'PostgreSQL': {
          const pool = getPostgresPool(connectionData);
          const client = await pool.connect();
          try {
            if (action === 'edit') {
              if (columns.length === 0) return res.json({ success: true, message: 'Nada que actualizar' });
              const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
              await client.query(`UPDATE ${tableName} SET ${setClause} WHERE codigo = $${columns.length + 1}`, [...values, codigo]);
            } else {
              await client.query(`DELETE FROM ${tableName} WHERE codigo = $1`, [codigo]);
            }
          } finally {
            client.release();
            await pool.end();
          }
          return res.json({ success: true, message: `Acción ${action} en PostgreSQL exitosa` });
        }
        case 'Oracle':
          return res.status(400).json({ success: false, message: `Motor ${engine} edición parcial soportada` });
        default:
          return res.status(400).json({ success: false, message: `Motor ${engine} edición parcial soportada` });
      }
    }

    return res.json({ success: true, message: 'Acción recibida pero no procesada' });
  } catch (error) {
    console.error(`Error en BD (${action}):`, error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/load-data', async (req, res) => {
  const { engine, connectionData, model } = req.body;
  if (engine !== 'Global' && !connectionData) return res.status(400).json({ success: false, message: 'Faltan datos de conexión' });
  if (!model) return res.status(400).json({ success: false, message: 'Falta el modelo a cargar' });

  const actualEngine = engine === 'Global' ? 'Global' : resolveActualEngine(engine, connectionData);
  const host = engine !== 'Global' ? getHost(connectionData) : '';
  const { port, username, password, database, sid, tnsName } = connectionData || {};
  const tableName = engine === 'Global' && model === 'UsuarioGlobal' ? 'usuarios_clientes' : getTableName(model);

  try {
    if (actualEngine === 'Global') {
      const db = await getGlobalDb();
      const rows = await db.all(`SELECT * FROM ${tableName}`);
      return res.json({ success: true, data: rows });
    }

    if (!host && actualEngine !== 'Firebase') {
      return res.status(400).json({ success: false, message: 'Host no configurado para el motor de base de datos' });
    }

    switch (actualEngine) {
      case 'MySQL': {
        const connection = await getMySqlConnection(connectionData, database);
        const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
        await connection.end();
        return res.json({ success: true, data: rows });
      }
      case 'SQL Server': {
        const pool = await sql.connect(getSqlServerConfig(connectionData));
        const result = await pool.request().query(`SELECT * FROM ${tableName}`);
        await sql.close();
        return res.json({ success: true, data: result.recordset });
      }
      case 'PostgreSQL': {
        const pool = getPostgresPool(connectionData);
        const client = await pool.connect();
        try {
          const result = await client.query(`SELECT * FROM ${tableName}`);
          return res.json({ success: true, data: result.rows });
        } finally {
          client.release();
          await pool.end();
        }
      }
      case 'Oracle': {
        const connection = await oracledb.getConnection({
          user: username,
          password,
          connectString: getOracleConnectString(connectionData)
        });
        const result = await connection.execute(`SELECT * FROM ${tableName}`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        await connection.close();
        return res.json({ success: true, data: result.rows });
      }
      default:
        return res.status(400).json({ success: false, message: `Motor ${engine} no implementado para carga` });
    }
  } catch (error) {
    console.error('Error cargando datos desde BD:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/init-db', async (req, res) => {
  const { engine, connectionData = {} } = req.body;
  if (!connectionData) return res.status(400).json({ success: false, message: 'Faltan datos de conexión' });

  const actualEngine = resolveActualEngine(engine, connectionData);
  const host = getHost(connectionData);
  const { port, username, password, database, sid, tnsName } = connectionData;

  try {
    if (!host && actualEngine !== 'Firebase' && actualEngine !== 'Global') {
      return res.status(400).json({ success: false, message: 'Host no configurado para el motor de base de datos' });
    }

    switch (actualEngine) {
      case 'MySQL': {
        const connection = await getMySqlConnection(connectionData, database);
        for (const [table, columnsBase] of Object.entries(baseSchemas)) {
          await connection.execute(`CREATE TABLE IF NOT EXISTS ${table} (${getEngineColumns(columnsBase, 'MySQL')})`);
        }
        const mysqlUpdateClause = GLOBAL_CONFIG_COLUMNS
          .filter((column) => column !== 'codigo')
          .map((column) => `${column}=VALUES(${column})`)
          .join(', ');
        await connection.execute(
          `INSERT INTO configuracion_global (${GLOBAL_CONFIG_COLUMNS.join(', ')}) VALUES (${GLOBAL_CONFIG_COLUMNS.map(() => '?').join(', ')}) ON DUPLICATE KEY UPDATE ${mysqlUpdateClause}`,
          GLOBAL_CONFIG_VALUES
        );
        await upsertSeedRows({
          connection,
          actualEngine,
          table: 'categorias_acceso',
          rows: DEFAULT_ACCESS_CATEGORIES(database || 'GLOBAL')
        });
        await upsertSeedRows({
          connection,
          actualEngine,
          table: 'usuarios',
          rows: DEFAULT_USERS(database || 'GLOBAL')
        });
        await connection.end();
        return res.json({ success: true, message: 'Tablas creadas en MySQL exitosamente' });
      }
      case 'SQL Server': {
        const pool = await sql.connect(getSqlServerConfig(connectionData));
        const request = pool.request();
        for (const [table, columnsBase] of Object.entries(baseSchemas)) {
          await request.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='${table}' and xtype='U')
            CREATE TABLE ${table} (${getEngineColumns(columnsBase, 'SQL Server')})
          `);
        }
        GLOBAL_CONFIG_COLUMNS.forEach((column) => request.input(column, GLOBAL_CONFIG_SEED[column]));
        const sqlServerUpdateClause = GLOBAL_CONFIG_COLUMNS
          .filter((column) => column !== 'codigo')
          .map((column) => `target.${column} = source.${column}`)
          .join(', ');
        const sqlServerInsertCols = GLOBAL_CONFIG_COLUMNS.join(', ');
        const sqlServerInsertVals = GLOBAL_CONFIG_COLUMNS.map((column) => `source.${column}`).join(', ');
        await request.query(`
          MERGE configuracion_global AS target
          USING (SELECT ${GLOBAL_CONFIG_COLUMNS.map((column) => `@${column} AS ${column}`).join(', ')}) AS source
          ON target.codigo = source.codigo
          WHEN MATCHED THEN UPDATE SET ${sqlServerUpdateClause}
          WHEN NOT MATCHED THEN INSERT (${sqlServerInsertCols}) VALUES (${sqlServerInsertVals});
        `);
        await upsertSeedRows({
          connection: pool,
          actualEngine,
          table: 'categorias_acceso',
          rows: DEFAULT_ACCESS_CATEGORIES(database || 'GLOBAL')
        });
        await upsertSeedRows({
          connection: pool,
          actualEngine,
          table: 'usuarios',
          rows: DEFAULT_USERS(database || 'GLOBAL')
        });
        await sql.close();
        return res.json({ success: true, message: 'Tablas creadas en SQL Server exitosamente' });
      }
      case 'PostgreSQL': {
        const pool = getPostgresPool(connectionData);
        const client = await pool.connect();
        try {
          for (const [table, columnsBase] of Object.entries(baseSchemas)) {
            await client.query(`CREATE TABLE IF NOT EXISTS ${table} (${getEngineColumns(columnsBase, 'PostgreSQL')})`);
          }
          const pgUpdates = GLOBAL_CONFIG_COLUMNS
            .filter((column) => column !== 'codigo')
            .map((column) => `${column} = EXCLUDED.${column}`)
            .join(', ');
          await client.query(
            `INSERT INTO configuracion_global (${GLOBAL_CONFIG_COLUMNS.join(', ')}) VALUES (${GLOBAL_CONFIG_COLUMNS.map((_, index) => `$${index + 1}`).join(', ')}) ON CONFLICT (codigo) DO UPDATE SET ${pgUpdates}`,
            GLOBAL_CONFIG_VALUES
          );
          await upsertSeedRows({
            connection: client,
            actualEngine,
            table: 'categorias_acceso',
            rows: DEFAULT_ACCESS_CATEGORIES(database || 'GLOBAL')
          });
          await upsertSeedRows({
            connection: client,
            actualEngine,
            table: 'usuarios',
            rows: DEFAULT_USERS(database || 'GLOBAL')
          });
        } finally {
          client.release();
          await pool.end();
        }
        return res.json({ success: true, message: 'Tablas creadas en PostgreSQL exitosamente' });
      }
      case 'Oracle': {
        const connection = await oracledb.getConnection({
          user: username,
          password,
          connectString: getOracleConnectString(connectionData)
        });
        for (const [table, columnsBase] of Object.entries(baseSchemas)) {
          try {
            await connection.execute(`CREATE TABLE ${table} (${getEngineColumns(columnsBase, 'Oracle')})`);
          } catch (error) {
            if (error.errorNum !== 955) throw error;
          }
        }
        await connection.execute('DELETE FROM configuracion_global WHERE codigo = :codigo', { codigo: 'GLOBAL' });
        const oracleInsertCols = GLOBAL_CONFIG_COLUMNS.join(', ');
        const oracleInsertVals = GLOBAL_CONFIG_COLUMNS.map((column) => `:${column}`).join(', ');
        await connection.execute(
          `INSERT INTO configuracion_global (${oracleInsertCols}) VALUES (${oracleInsertVals})`,
          GLOBAL_CONFIG_SEED,
          { autoCommit: true }
        );
        await upsertSeedRows({
          connection,
          actualEngine,
          table: 'categorias_acceso',
          rows: DEFAULT_ACCESS_CATEGORIES(database || 'GLOBAL')
        });
        await upsertSeedRows({
          connection,
          actualEngine,
          table: 'usuarios',
          rows: DEFAULT_USERS(database || 'GLOBAL')
        });
        await connection.close();
        return res.json({ success: true, message: 'Tablas creadas en Oracle exitosamente' });
      }
      default:
        return res.status(400).json({ success: false, message: `Motor ${engine} no soportado para inicialización de base de datos` });
    }
  } catch (error) {
    console.error('Error inicializando BD:', error);
    return res.status(500).json({ success: false, message: `Fallo al inicializar base de datos: ${error.message}` });
  }
});

const START_PORT = 3000;
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${port}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`El puerto ${port} está ocupado, intentando con el ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
};

startServer(START_PORT);
