

import { baseSchemas, GLOBAL_CONFIG_COLUMNS, GLOBAL_CONFIG_VALUES, GLOBAL_CONFIG_SEED, DEFAULT_ACCESS_CATEGORIES, DEFAULT_USERS, fieldTranslations, getEngineColumns, upsertSeedRows, getHost, getGlobalDb, getTableName, getPort, mapValue, resolveActualEngine, getMySqlConnection, getSqlServerConfig, getPostgresPool, getOracleConnectString } from '../../core/constants/schemas.js';
import oracledb from 'oracledb';
import sql from 'mssql';
import mysql from 'mysql2/promise';
import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';


export const getClients = async (req, res) => {
  try {
    const db = await getGlobalDb();
    const clientes = await db.all(`SELECT * FROM clientes ORDER BY name`);
    res.json({ success: true, data: clientes });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export const createClient = async (req, res) => {
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
}

export const updateClient = async (req, res) => {
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
}

export const deleteClient = async (req, res) => {
  try {
    const db = await getGlobalDb();
    await db.run(`DELETE FROM clientes WHERE id = ?`, [req.params.id]);
    await db.run(`DELETE FROM usuarios_directorio WHERE cliente_codigo = ?`, [req.params.id]);
    res.json({ success: true, message: 'Cliente eliminado.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export const updateClientDbConfig = async (req, res) => {
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
}

