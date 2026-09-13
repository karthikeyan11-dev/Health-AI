import express, { type Request, type Response, type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import { Config } from './config/env.config';
import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';
import patientsRouter from './modules/patients/patients.routes';
import cardiovascularRouter from './modules/cardiovascular/cardiovascular.routes';
import stressRouter from './modules/stress/stress.routes';
import digitalTwinRouter from './modules/digital-twin/digital-twin.routes';

const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: Config.CORS_ORIGIN === '*' ? '*' : Config.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', usersRouter);
app.use('/api/v1', patientsRouter);
app.use('/api/v1/cardiovascular', cardiovascularRouter);
app.use('/api/v1/stress', stressRouter);
app.use('/api/v1/digital-twin', digitalTwinRouter);

app.get('/api/v1/health/liveness', (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Backend service is alive and healthy',
    data: {
      timestamp: new Date().toISOString(),
      service: 'health-ai-backend',
      axiosVersion: axios.VERSION,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: 'req_init',
    },
  });
});

export default app;
