const fs = require('fs');
const path = require('path');

const code = fs.readFileSync('server.js', 'utf8');
const routes = [];

const routeRegex = /app\.(get|post|put|delete)\(['"]([^'"]+)['"],\s*async\s*\(req,\s*res\)\s*=>\s*\{/g;
let match;
let firstRouteStart = code.length;

while ((match = routeRegex.exec(code)) !== null) {
  const start = match.index;
  if (start < firstRouteStart) firstRouteStart = start;
  
  const method = match[1];
  const path = match[2];
  
  let braceCount = 1;
  let end = routeRegex.lastIndex;
  while (braceCount > 0 && end < code.length) {
    if (code[end] === '{') braceCount++;
    if (code[end] === '}') braceCount--;
    end++;
  }
  if (code[end] === ')') end++;
  if (code[end] === ';') end++;
  
  routes.push({
    method,
    path,
    start,
    end,
    code: code.slice(start, end)
  });
}

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

const helpersCode = code.slice(0, firstRouteStart);

const schemasBlock = helpersCode.slice(
  helpersCode.indexOf('const tableMap'),
  helpersCode.indexOf('function resolveActualEngine')
);
fs.writeFileSync('src/backend/core/constants/schemas.js', 
  `export ` + schemasBlock.replace(/const /g, 'export const '));

const dbBlock = helpersCode.slice(helpersCode.indexOf('function resolveActualEngine'));
fs.writeFileSync('src/backend/config/database.config.js', 
`import mysql from 'mysql2/promise';
import sql from 'mssql';
import oracledb from 'oracledb';
import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
const { Pool } = pg;
import { baseSchemas, GLOBAL_CONFIG_COLUMNS, GLOBAL_CONFIG_SEED, GLOBAL_CONFIG_VALUES, DEFAULT_ACCESS_CATEGORIES, DEFAULT_USERS, fieldTranslations } from '../core/constants/schemas.js';

` + dbBlock.replace(/function /g, 'export function ').replace(/async export function /g, 'export async function '));


function createRouteModule(name, pathPrefix, moduleRoutes, imports) {
  let controllerContent = imports + '\n\n';
  let routesContent = `import express from 'express';\nimport * as controller from './${name}.controller.js';\n\nconst router = express.Router();\n\n`;
  
  moduleRoutes.forEach((routeSpec) => {
    const routeDef = routes.find(r => r.path === routeSpec.path && r.method === routeSpec.method);
    if (!routeDef) {
      console.error(`Route not found: ${routeSpec.method} ${routeSpec.path}`);
      return;
    }
    
    const fnCode = routeDef.code.replace(
      /app\.(get|post|put|delete)\(['"][^'"]+['"],\s*async\s*\(req,\s*res\)\s*=>\s*\{/, 
      `export const ${routeSpec.name} = async (req, res) => {`
    ).replace(/\}\);?$/, '}');
    
    controllerContent += fnCode + '\n\n';
    
    let relativePath = routeDef.path.replace(pathPrefix, '');
    if (relativePath === '') relativePath = '/';
    if (!relativePath.startsWith('/')) relativePath = '/' + relativePath;
    
    routesContent += `router.${routeDef.method}('${relativePath}', controller.${routeSpec.name});\n`;
  });
  
  routesContent += `\nexport default router;\n`;
  
  fs.writeFileSync(`src/backend/modules/${name}/${name}.controller.js`, controllerContent);
  fs.writeFileSync(`src/backend/modules/${name}/${name}.routes.js`, routesContent);
}

const commonImports = `
import { resolveActualEngine, getMySqlConnection, getSqlServerConfig, getPostgresPool, getOracleConnectString, getEngineColumns, upsertSeedRows, getHost, getGlobalDb, getTableName, getPort, mapValue } from '../../config/database.config.js';
import { baseSchemas, GLOBAL_CONFIG_COLUMNS, GLOBAL_CONFIG_VALUES, GLOBAL_CONFIG_SEED, DEFAULT_ACCESS_CATEGORIES, DEFAULT_USERS, fieldTranslations } from '../../core/constants/schemas.js';
import oracledb from 'oracledb';
import sql from 'mssql';
import mysql from 'mysql2/promise';
import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
`;

createRouteModule('admin', '/api/global-admins', [
  { method: 'get', path: '/api/global-admins', name: 'getAdmins' },
  { method: 'post', path: '/api/global-admins', name: 'createAdmin' },
  { method: 'put', path: '/api/global-admins/:id', name: 'updateAdmin' },
  { method: 'delete', path: '/api/global-admins/:id', name: 'deleteAdmin' },
], commonImports);

createRouteModule('clients', '/api/clientes', [
  { method: 'get', path: '/api/clientes', name: 'getClients' },
  { method: 'post', path: '/api/clientes', name: 'createClient' },
  { method: 'put', path: '/api/clientes/:id', name: 'updateClient' },
  { method: 'delete', path: '/api/clientes/:id', name: 'deleteClient' },
  { method: 'put', path: '/api/clientes/:id/db-config', name: 'updateClientDbConfig' },
], commonImports);

createRouteModule('auth', '/api', [
  { method: 'post', path: '/api/login', name: 'login' },
  { method: 'post', path: '/api/directorio', name: 'directorio' },
], commonImports);

createRouteModule('tenant', '/api', [
  { method: 'post', path: '/api/test-connection', name: 'testConnection' },
  { method: 'post', path: '/api/init-db', name: 'initDb' },
], commonImports);

createRouteModule('sync', '/api', [
  { method: 'post', path: '/api/sync-data', name: 'syncData' },
  { method: 'post', path: '/api/load-data', name: 'loadData' },
], commonImports);

const appJs = `import express from 'express';
import cors from 'cors';
import saasRoutes from '../routes/saas.routes.js';
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
app.use('/api', authRoutes); // login, directorio
app.use('/api', tenantRoutes); // test-connection, init-db
app.use('/api/global-admins', adminRoutes);
app.use('/api/clientes', clientsRoutes);
app.use('/api', syncRoutes); // sync-data, load-data

export default app;
`;
fs.writeFileSync('src/backend/app.js', appJs);

const serverJs = `import app from './src/backend/app.js';

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

console.log('Backend extracted via AST precisely!');
