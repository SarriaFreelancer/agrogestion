import express from 'express';
import * as controller from './agro.controller.js';

const router = express.Router();

router.get('/', controller.getApiOverview);
router.get('/overview', controller.getApiOverview);
router.get('/empresas', controller.getEmpresas);
router.get('/estructura', controller.getEstructura);
router.get('/cultivos', controller.getCultivos);
router.get('/actividades', controller.getActividades);
router.get('/productos', controller.getProductos);
router.get('/maquinarias', controller.getMaquinarias);
router.get('/auditoria', controller.getAuditoria);
router.get('/dashboard/kpis', controller.getDashboardKpis);

// GIS & Telemetry Reporting
router.get('/gis/reportes', controller.getGisReportes);
router.post('/gis/reportes', controller.createGisReporte);
router.delete('/gis/reportes/:id', controller.deleteGisReporte);

export default router;

