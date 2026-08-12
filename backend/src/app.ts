import express, { type Request, type Response, type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import authRouter from './modules/auth/auth.routes';

const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', authRouter);

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
