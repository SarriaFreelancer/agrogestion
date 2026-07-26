import express from 'express';
import * as controller from './tenant.controller.js';

const router = express.Router();

router.post('/test-connection', controller.testConnection);
router.post('/init-db', controller.initDb);

export default router;
