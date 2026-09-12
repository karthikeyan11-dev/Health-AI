import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/verify-otp', authController.verifyOtp);
authRouter.post('/login', authController.login);
authRouter.post('/refresh-token', authController.refreshToken);
authRouter.get('/profile', authenticate, authController.getProfile);

export default authRouter;
