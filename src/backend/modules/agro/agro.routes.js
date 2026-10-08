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

export default router;
