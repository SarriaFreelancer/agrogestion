import express from 'express';
import * as controller from './clients.controller.js';

const router = express.Router();

router.get('/', controller.getClients);
router.post('/', controller.createClient);
router.put('/:id', controller.updateClient);
router.delete('/:id', controller.deleteClient);
router.put('/:id/db-config', controller.updateClientDbConfig);

export default router;
