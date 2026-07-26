const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('server.js', 'utf8');
const lines = content.split('\n');

function getBlock(startStr, endStr) {
  const start = lines.findIndex(l => l.includes(startStr));
  let end = lines.length;
  if (endStr) {
    for (let i = start + 1; i < lines.length; i++) {
      if (lines[i].includes(endStr)) {
        end = i;
        break;
      }
    }
  }
  return { start, end };
}

function extract(startStr, endStr) {
  const { start, end } = getBlock(startStr, endStr);
  return lines.slice(start, end).join('\n');
}

// 1. Create Directories
const dirs = [
  'src/backend/config',
  'src/backend/core/constants',
  'src/backend/core/middleware',
  'src/backend/modules/auth',
  'src/backend/modules/sync',
  'src/backend/modules/tenant',
  'src/backend/modules/clients',
  'src/backend/modules/admin',
];
dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));

// 2. Extract Schemas & Constants
const schemasContent = 
`export ` + extract('const tableMap = {', 'const DEFAULT_USERS = ') + `\nexport ` + extract('const DEFAULT_USERS = ', 'function resolveActualEngine');
fs.writeFileSync('src/backend/core/constants/schemas.js', schemasContent.replace(/const /g, 'export const '));

// 3. Extract DB Config
const dbConfigContent = 
`import mysql from 'mysql2/promise';
import sql from 'mssql';
import oracledb from 'oracledb';
import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
const { Pool } = pg;
import { baseSchemas, GLOBAL_CONFIG_COLUMNS, GLOBAL_CONFIG_SEED, DEFAULT_ACCESS_CATEGORIES, DEFAULT_USERS } from '../core/constants/schemas.js';

` + extract('function resolveActualEngine', 'app.post(\'/api/test-connection\'');
fs.writeFileSync('src/backend/config/database.config.js', dbConfigContent.replace(/function /g, 'export function ').replace(/async export function /g, 'export async function '));

// 4. Extract Auth Controller
const authController = 
`import { resolveActualEngine, getMySqlConnection, getSqlServerConfig, getPostgresPool, getOracleConnectString } from '../../config/database.config.js';
import oracledb from 'oracledb';
import sql from 'mssql';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export const login = async (req, res) => {
` + extract('app.post(\'/api/login\', async (req, res) => {', 'app.get(\'/api/global-admins\'').split('\n').slice(1, -2).join('\n') + `\n};`;
fs.writeFileSync('src/backend/modules/auth/auth.controller.js', authController);

// Auth Routes
const authRoutes = 
`import express from 'express';
import { login } from './auth.controller.js';
const router = express.Router();
router.post('/', login);
export default router;`;
fs.writeFileSync('src/backend/modules/auth/auth.routes.js', authRoutes);

// 5. Extract Tenant Controller
const testConn = extract('app.post(\'/api/test-connection\', async (req, res) => {', 'app.post(\'/api/directorio\'').split('\n').slice(1, -2).join('\n');
const dirConn = extract('app.post(\'/api/directorio\', async (req, res) => {', 'app.post(\'/api/login\'').split('\n').slice(1, -2).join('\n');
const initDb = extract('app.post(\'/api/init-db\', async (req, res) => {', 'const START_PORT').split('\n').slice(1, -2).join('\n');

const tenantController = 
`import { resolveActualEngine, getMySqlConnection, getSqlServerConfig, getPostgresPool, getOracleConnectString, getEngineColumns, upsertSeedRows, getHost } from '../../config/database.config.js';
import { baseSchemas, GLOBAL_CONFIG_COLUMNS, GLOBAL_CONFIG_VALUES, GLOBAL_CONFIG_SEED, DEFAULT_ACCESS_CATEGORIES, DEFAULT_USERS } from '../../core/constants/schemas.js';
import oracledb from 'oracledb';
import sql from 'mssql';

export const testConnection = async (req, res) => {
${testConn}
};

export const directorio = async (req, res) => {
${dirConn}
};

export const initDb = async (req, res) => {
${initDb}
};
`;
fs.writeFileSync('src/backend/modules/tenant/tenant.controller.js', tenantController);

const tenantRoutes = 
`import express from 'express';
import { testConnection, directorio, initDb } from './tenant.controller.js';
const router = express.Router();
router.post('/test-connection', testConnection);
router.post('/directorio', directorio);
router.post('/init-db', initDb);
export default router;`;
fs.writeFileSync('src/backend/modules/tenant/tenant.routes.js', tenantRoutes);

// 6. Admin Controller
const getAdmins = extract('app.get(\'/api/global-admins\'', 'app.post(\'/api/global-admins\'').split('\n').slice(1, -2).join('\n');
const postAdmins = extract('app.post(\'/api/global-admins\'', 'app.put(\'/api/global-admins/:id\'').split('\n').slice(1, -2).join('\n');
const putAdmins = extract('app.put(\'/api/global-admins/:id\'', 'app.delete(\'/api/global-admins/:id\'').split('\n').slice(1, -2).join('\n');
const delAdmins = extract('app.delete(\'/api/global-admins/:id\'', 'app.get(\'/api/clientes\'').split('\n').slice(1, -2).join('\n');

const adminController = 
`import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export const getAdmins = async (req, res) => {
${getAdmins}
};
export const createAdmin = async (req, res) => {
${postAdmins}
};
export const updateAdmin = async (req, res) => {
${putAdmins}
};
export const deleteAdmin = async (req, res) => {
${delAdmins}
};
`;
fs.writeFileSync('src/backend/modules/admin/admin.controller.js', adminController);

const adminRoutes = 
`import express from 'express';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from './admin.controller.js';
const router = express.Router();
router.get('/', getAdmins);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);
export default router;`;
fs.writeFileSync('src/backend/modules/admin/admin.routes.js', adminRoutes);

// 7. Clients Controller
const getClients = extract('app.get(\'/api/clientes\'', 'app.post(\'/api/clientes\'').split('\n').slice(1, -2).join('\n');
const postClients = extract('app.post(\'/api/clientes\'', 'app.put(\'/api/clientes/:codigo\'').split('\n').slice(1, -2).join('\n');
const putClients = extract('app.put(\'/api/clientes/:codigo\'', 'app.delete(\'/api/clientes/:codigo\'').split('\n').slice(1, -2).join('\n');
const delClients = extract('app.delete(\'/api/clientes/:codigo\'', 'app.post(\'/api/sync-data\'').split('\n').slice(1, -2).join('\n');

const clientsController = 
`import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export const getClients = async (req, res) => {
${getClients}
};
export const createClient = async (req, res) => {
${postClients}
};
export const updateClient = async (req, res) => {
${putClients}
};
export const deleteClient = async (req, res) => {
${delClients}
};
`;
fs.writeFileSync('src/backend/modules/clients/clients.controller.js', clientsController);

const clientsRoutes = 
`import express from 'express';
import { getClients, createClient, updateClient, deleteClient } from './clients.controller.js';
const router = express.Router();
router.get('/', getClients);
router.post('/', createClient);
router.put('/:codigo', updateClient);
router.delete('/:codigo', deleteClient);
export default router;`;
fs.writeFileSync('src/backend/modules/clients/clients.routes.js', clientsRoutes);

// 8. Sync Controller
const syncData = extract('app.post(\'/api/sync-data\'', 'app.post(\'/api/load-data\'').split('\n').slice(1, -2).join('\n');
const loadData = extract('app.post(\'/api/load-data\'', 'app.post(\'/api/init-db\'').split('\n').slice(1, -2).join('\n');

const syncController = 
`import { resolveActualEngine, getMySqlConnection, getSqlServerConfig, getPostgresPool, getOracleConnectString } from '../../config/database.config.js';
import { tableMap } from '../../core/constants/schemas.js';
import oracledb from 'oracledb';
import sql from 'mssql';

export const syncData = async (req, res) => {
${syncData}
};

export const loadData = async (req, res) => {
${loadData}
};
`;
fs.writeFileSync('src/backend/modules/sync/sync.controller.js', syncController);

const syncRoutes = 
`import express from 'express';
import { syncData, loadData } from './sync.controller.js';
const router = express.Router();
router.post('/sync-data', syncData);
router.post('/load-data', loadData);
export default router;`;
fs.writeFileSync('src/backend/modules/sync/sync.routes.js', syncRoutes);

// 9. Create App.js
const appJs = 
`import express from 'express';
import cors from 'cors';
import saasRoutes from './routes/saas.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import tenantRoutes from './modules/tenant/tenant.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import clientsRoutes from './modules/clients/clients.routes.js';
import syncRoutes from './modules/sync/sync.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// Legacy
app.use('/api/saas', saasRoutes);

// Modular Monolith Routes
app.use('/api/login', authRoutes); // Because it was directly /api/login
app.use('/api', tenantRoutes); // /api/test-connection, /api/directorio, /api/init-db
app.use('/api/global-admins', adminRoutes);
app.use('/api/clientes', clientsRoutes);
app.use('/api', syncRoutes); // /api/sync-data, /api/load-data

export default app;
`;
fs.writeFileSync('src/backend/app.js', appJs);

// 10. Create Server.js (Entry Point)
const serverJs = 
`import app from './src/backend/app.js';

const START_PORT = 3000;
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(\`Servidor Backend corriendo en http://localhost:\${port}\`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(\`El puerto \${port} está ocupado, intentando con el \${port + 1}...\`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
};

startServer(START_PORT);
`;
fs.writeFileSync('server.js', serverJs);

console.log('Backend extracted successfully!');
