import { Router } from 'express';
import { authController } from './auth.controller';

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/verify-otp', authController.verifyOtp);
authRouter.post('/login', authController.login);
authRouter.post('/auth/register', authController.register);
authRouter.post('/auth/verify-otp', authController.verifyOtp);
authRouter.post('/auth/login', authController.login);

authRouter.get('/profile', authController.getProfile);
authRouter.get('/auth/profile', authController.getProfile);

export default authRouter;
