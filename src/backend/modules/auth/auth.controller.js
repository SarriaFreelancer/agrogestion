

import { baseSchemas, GLOBAL_CONFIG_COLUMNS, GLOBAL_CONFIG_VALUES, GLOBAL_CONFIG_SEED, DEFAULT_ACCESS_CATEGORIES, DEFAULT_USERS, fieldTranslations, getEngineColumns, upsertSeedRows, getHost, getGlobalDb, getTableName, getPort, mapValue, resolveActualEngine, getMySqlConnection, getSqlServerConfig, getPostgresPool, getOracleConnectString } from '../../core/constants/schemas.js';
import oracledb from 'oracledb';
import sql from 'mssql';
import mysql from 'mysql2/promise';
import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';


export const login = async (req, res) => {
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
}

export const directorio = async (req, res) => {
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
}

