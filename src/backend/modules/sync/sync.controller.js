

import { baseSchemas, GLOBAL_CONFIG_COLUMNS, GLOBAL_CONFIG_VALUES, GLOBAL_CONFIG_SEED, DEFAULT_ACCESS_CATEGORIES, DEFAULT_USERS, fieldTranslations, getEngineColumns, upsertSeedRows, getHost, getGlobalDb, getTableName, getPort, mapValue, resolveActualEngine, getMySqlConnection, getSqlServerConfig, getPostgresPool, getOracleConnectString } from '../../core/constants/schemas.js';
import oracledb from 'oracledb';
import sql from 'mssql';
import mysql from 'mysql2/promise';
import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';


export const syncData = async (req, res) => {
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
}

export const loadData = async (req, res) => {
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
}

