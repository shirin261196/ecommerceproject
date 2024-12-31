import express from 'express';
import { cancelAdminOrder, cancelOrder,  changeOrderStatus, changeTrackingStatus, createOrder,fetchOrderHistory,listOrders, returnApprove, returnOrder} from '../controllers/orderController.js';
import { userAuth } from '../middleware/userAuth.js';
import { adminAuth } from '../middleware/adminAuth.js';





const orderRouter = express.Router();

orderRouter.post("/user/orders/create",userAuth, createOrder);
orderRouter.get("/user/orders", userAuth,fetchOrderHistory);

orderRouter.delete('/user/orders/:orderId',userAuth, cancelOrder)

orderRouter.put('/user/orders/:orderId/return',userAuth, returnOrder);

//admin routes
orderRouter.get('/admin/orders',adminAuth,listOrders)
orderRouter.patch('/admin/orders/:orderId/status',adminAuth,changeOrderStatus)
orderRouter.put('/admin/orders/:orderId/item/:productId/tracking-status',adminAuth, changeTrackingStatus);
orderRouter.delete('/admin/orders/:orderId',adminAuth, cancelAdminOrder)
orderRouter.put('/admin/orders/:orderId/items/:productId/approve-return',adminAuth, returnApprove)



export default orderRouter;

