import express from 'express';
import * as controller from './sync.controller.js';

const router = express.Router();

router.post('/sync-data', controller.syncData);
router.post('/load-data', controller.loadData);

export default router;
