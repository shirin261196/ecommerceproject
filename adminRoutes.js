import express from 'express';
import { getAllUsers, toggleUserStatus } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js'; // Admin authorization middleware

const adminRouter = express.Router();

adminRouter.get('/users', adminAuth, getAllUsers); // Get all users
adminRouter.put('/users/:id', adminAuth, toggleUserStatus); // Update a user


export default adminRouter;
