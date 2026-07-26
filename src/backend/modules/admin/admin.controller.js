

import { baseSchemas, GLOBAL_CONFIG_COLUMNS, GLOBAL_CONFIG_VALUES, GLOBAL_CONFIG_SEED, DEFAULT_ACCESS_CATEGORIES, DEFAULT_USERS, fieldTranslations, getEngineColumns, upsertSeedRows, getHost, getGlobalDb, getTableName, getPort, mapValue, resolveActualEngine, getMySqlConnection, getSqlServerConfig, getPostgresPool, getOracleConnectString } from '../../core/constants/schemas.js';
import oracledb from 'oracledb';
import sql from 'mssql';
import mysql from 'mysql2/promise';
import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';


export const getAdmins = async (req, res) => {
  try {
    const db = await getGlobalDb();
    const admins = await db.all(`SELECT id, correo, nombres, apellidos, rol, estado FROM usuarios_clientes ORDER BY id`);
    res.json({ success: true, data: admins });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

export const createAdmin = async (req, res) => {
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
}

export const updateAdmin = async (req, res) => {
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
}

export const deleteAdmin = async (req, res) => {
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
}

