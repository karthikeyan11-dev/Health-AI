import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const usersRouter = Router();

usersRouter.get('/users', authenticate, usersController.getUsers);
usersRouter.get('/users/:userId', authenticate, usersController.getUserById);

export default usersRouter;
