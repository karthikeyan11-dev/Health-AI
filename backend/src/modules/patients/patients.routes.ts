import { Router } from 'express';
import { patientsController } from './patients.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const patientsRouter = Router();

patientsRouter.get('/patients/overview', authenticate, patientsController.getPatientOverview);

export default patientsRouter;
