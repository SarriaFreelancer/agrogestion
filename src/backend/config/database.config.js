import mysql from 'mysql2/promise';
import sql from 'mssql';
import oracledb from 'oracledb';
import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
const { Pool } = pg;
import { baseSchemas, GLOBAL_CONFIG_COLUMNS, GLOBAL_CONFIG_SEED, GLOBAL_CONFIG_VALUES, DEFAULT_ACCESS_CATEGORIES, DEFAULT_USERS, fieldTranslations } from '../core/constants/schemas.js';


