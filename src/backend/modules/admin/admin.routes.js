import express from 'express';
import * as controller from './admin.controller.js';

const router = express.Router();

router.get('/', controller.getAdmins);
router.post('/', controller.createAdmin);
router.put('/:id', controller.updateAdmin);
router.delete('/:id', controller.deleteAdmin);

export default router;
