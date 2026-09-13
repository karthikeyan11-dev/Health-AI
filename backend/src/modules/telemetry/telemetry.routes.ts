import { Router } from 'express';
import { telemetryController } from './telemetry.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const telemetryRouter: Router = Router();

// Ingestion endpoints
telemetryRouter.post('/ingest', authenticate, telemetryController.ingestTelemetry);
telemetryRouter.post('/readings', authenticate, telemetryController.ingestTelemetry);

// Query endpoints
telemetryRouter.get('/latest', authenticate, telemetryController.getLatestTelemetry);
telemetryRouter.get('/readings/latest', authenticate, telemetryController.getLatestTelemetry);

// Historical readings
telemetryRouter.get('/history', authenticate, telemetryController.getHistoricalReadings);
telemetryRouter.get('/readings/history', authenticate, telemetryController.getHistoricalReadings);

export default telemetryRouter;
