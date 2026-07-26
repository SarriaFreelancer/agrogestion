import express from 'express';
import { getMigrationStats, runMigration, getServers } from '../controllers/saas.controller.js';

const router = express.Router();

// Estadísticas de migración y listado
router.get('/migrations', getMigrationStats);

// Ejecutar migración
router.post('/migrations/run', runMigration);

// Listado de servidores SaaS configurados
router.get('/servers', getServers);

export default router;
