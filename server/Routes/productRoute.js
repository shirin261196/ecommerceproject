import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import upload from '../middleware/multer.js';
import {
  addProduct,
  listProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  deleteImage,
  restoreProduct,
} from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post(
  '/add',
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
  ]),
  addProduct
);

productRouter.get('/list', listProducts);

productRouter.get('/:id', adminAuth, getProductById);

productRouter.delete('/:id', adminAuth, deleteProduct);

productRouter.put('/:id', adminAuth, upload.array('images', 3), updateProduct);

productRouter.post('/delete-image', adminAuth, deleteImage);

productRouter.put('/restore/:id',adminAuth,restoreProduct);

export default productRouter;
