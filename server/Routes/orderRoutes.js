import express from 'express';
import { approveReturn, cancelAdminOrder, cancelOrder,  changeOrderStatus, changeTrackingStatus, confirmPayment, createOrder,fetchOrderHistory,getWalletBalance,listOrders, processRefund, requestReturn} from '../controllers/orderController.js';
import { userAuth } from '../middleware/userAuth.js';
import { adminAuth } from '../middleware/adminAuth.js';





const orderRouter = express.Router();

orderRouter.post("/user/orders/create",userAuth, createOrder);
orderRouter.post("/user/orders/confirm",userAuth,confirmPayment);
orderRouter.get("/user/orders", userAuth,fetchOrderHistory);
orderRouter.get('/user/wallet/balance',userAuth,getWalletBalance)
orderRouter.delete('/user/orders/:orderId',userAuth, cancelOrder)

orderRouter.put('/user/orders/:orderId/return',userAuth, requestReturn);

//admin routes
orderRouter.get('/admin/orders',adminAuth,listOrders)
orderRouter.patch('/admin/orders/:orderId/status',adminAuth,changeOrderStatus)
orderRouter.put('/admin/orders/:orderId/item/:productId/tracking-status',adminAuth, changeTrackingStatus);
orderRouter.delete('/admin/orders/:orderId',adminAuth, cancelAdminOrder)
orderRouter.put('/admin/orders/:orderId/items/:itemId/approve-return',adminAuth, approveReturn)
orderRouter.post('/admin/orders/:orderId/process-refund',userAuth,adminAuth,processRefund);



export default orderRouter;

