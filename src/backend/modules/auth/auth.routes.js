import express from 'express';
import * as controller from './auth.controller.js';

const router = express.Router();

router.post('/login', controller.login);
router.post('/directorio', controller.directorio);

export default router;
