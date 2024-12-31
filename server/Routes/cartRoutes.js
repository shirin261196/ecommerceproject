import express from 'express';
import { addItemToCart, clearCart, getCart, removeItemFromCart, updateItemQuantity } from '../controllers/cartController.js';
import  {userAuth}  from '../middleware/userAuth.js';



const cartRouter = express.Router();


cartRouter.post('/cart/add', userAuth,addItemToCart);
cartRouter.get('/cart/:userId',userAuth, getCart);
cartRouter.put('/cart/update', userAuth,updateItemQuantity);
cartRouter.delete('/cart/remove/:userId/:productId', userAuth, removeItemFromCart);
cartRouter.delete('/cart/clear/:userId', userAuth, clearCart);


export default cartRouter;