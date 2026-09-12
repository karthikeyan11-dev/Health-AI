import { Router } from 'express';
import { stressController } from './stress.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const stressRouter = Router();

// Protected stress assessment endpoints matching OpenAPI definitions
stressRouter.post('/assess', authenticate, stressController.assessStress);
stressRouter.get('/current', authenticate, stressController.getCurrentStress);
stressRouter.get('/history', authenticate, stressController.getStressHistory);

export default stressRouter;
