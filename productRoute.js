import express from "express";
import {listProducts,addProduct,removeProduct,singleProduct} from '../controllers/productController.js'
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

productRouter.post('/products',adminAuth,upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1}]),addProduct);
productRouter.delete('/products',adminAuth,removeProduct);
productRouter.get('/products/:id',adminAuth,singleProduct);
productRouter.get('/products',listProducts);

export default productRouter