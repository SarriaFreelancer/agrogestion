import { Router } from 'express';
import { 
  getAIHealth, 
  calculateNdvi, 
  diagnoseDisease, 
  getIrrigationAdvisory, 
  predictYield 
} from './ai.controller.js';

const router = Router();

router.get('/health', getAIHealth);
router.post('/ndvi', calculateNdvi);
router.post('/diagnose', diagnoseDisease);
router.post('/irrigation-advisory', getIrrigationAdvisory);
router.post('/yield-prediction', predictYield);

export default router;
