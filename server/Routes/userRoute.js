import express from 'express';
import { 
    registerUser, 
    verifyOtp, 
    resendOtp, 
    loginUser, 
    getUserProfile,
    adminLogin,
    forgotPassword,
    resetPassword
} from '../controllers/userController.js';
import { userAuth } from '../middleware/userAuth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/verify-otp', verifyOtp);
userRouter.post('/resend-otp', resendOtp);
userRouter.post('/forgot-password',forgotPassword);
userRouter.post('/reset-password',resetPassword);
userRouter.post('/login', loginUser);
userRouter.get('/user/me', userAuth, getUserProfile);
userRouter.post('/admin/login', adminLogin);

export default userRouter;
