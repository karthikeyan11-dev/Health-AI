import { Router } from 'express';
import { cardiovascularController } from './cardiovascular.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const cardiovascularRouter = Router();

// Protected assessment endpoints matching OpenAPI definitions
cardiovascularRouter.post('/assess', authenticate, cardiovascularController.assessRisk);
cardiovascularRouter.get('/current', authenticate, cardiovascularController.getCurrentRisk);
cardiovascularRouter.get('/history', authenticate, cardiovascularController.getRiskHistory);

export default cardiovascularRouter;
