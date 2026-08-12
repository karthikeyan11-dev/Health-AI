import { Router } from 'express';
import { authController } from './auth.controller';

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/verify-otp', authController.verifyOtp);
authRouter.post('/auth/register', authController.register);
authRouter.post('/auth/verify-otp', authController.verifyOtp);

export default authRouter;
