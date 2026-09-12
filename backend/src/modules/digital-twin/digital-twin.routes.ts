import { Router } from 'express';
import { digitalTwinController } from './digital-twin.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const digitalTwinRouter = Router();

// Protected Digital Twin endpoints matching OpenAPI definitions
digitalTwinRouter.post('/', authenticate, digitalTwinController.createDigitalTwin);
digitalTwinRouter.get('/:userId', authenticate, digitalTwinController.getDigitalTwin);
digitalTwinRouter.put('/:userId', authenticate, digitalTwinController.updateDigitalTwin);
digitalTwinRouter.get('/:userId/state', authenticate, digitalTwinController.getCurrentTwinState);
digitalTwinRouter.get('/:userId/history', authenticate, digitalTwinController.getHealthHistory);
digitalTwinRouter.get(
  '/:userId/trends',
  authenticate,
  digitalTwinController.getHealthTrendAnalysis,
);
digitalTwinRouter.get(
  '/:userId/snapshots',
  authenticate,
  digitalTwinController.getDigitalTwinSnapshots,
);
digitalTwinRouter.get(
  '/:userId/trajectory',
  authenticate,
  digitalTwinController.simulateTrajectory,
);
digitalTwinRouter.post('/:userId/simulate', authenticate, digitalTwinController.simulateTrajectory);

export default digitalTwinRouter;
