

import { baseSchemas, GLOBAL_CONFIG_COLUMNS, GLOBAL_CONFIG_VALUES, GLOBAL_CONFIG_SEED, DEFAULT_ACCESS_CATEGORIES, DEFAULT_USERS, fieldTranslations, getEngineColumns, upsertSeedRows, getHost, getGlobalDb, getTableName, getPort, mapValue, resolveActualEngine, getMySqlConnection, getSqlServerConfig, getPostgresPool, getOracleConnectString } from '../../core/constants/schemas.js';
import oracledb from 'oracledb';
import sql from 'mssql';
import mysql from 'mysql2/promise';
import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';


export const testConnection = async (req, res) => {
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
}

export const initDb = async (req, res) => {
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
}

