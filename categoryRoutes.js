import express from 'express';
import { addCategory, getCategories, editCategory, deleteCategory } from '../controllers/categoryController.js';
import adminAuth from '../middleware/adminAuth.js';

const categoryRouter = express.Router();

// Get all categories
categoryRouter.get('/category', adminAuth, getCategories);

// Add new category
categoryRouter.post('/category', adminAuth, addCategory);

// Edit category
categoryRouter.put('/category/:id', adminAuth, editCategory);

// Delete category
categoryRouter.delete('/category/:id', adminAuth, deleteCategory);

export default categoryRouter;
