import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import adminRouter from './routes/adminRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import pkg from 'cloudinary'; // Import Cloudinary
import googleAuth from './googleAuth.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import cartRouter from './routes/cartRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import addressRouter from './routes/addressRoutes.js';
import offerRouter from './routes/offerRoutes.js';
import couponRouter from './routes/couponRoutes.js';
import reportRouter from './routes/reportRoutes.js';
import wishlistRouter from './routes/wishlistRoutes.js';
import walletRouter from './routes/walletRouter.js';

const { v2: cloudinary } = pkg;


// Load environment variables
dotenv.config();

// Initialize Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary Config Initialized');

// App Config
const app = express();
// Middlewares

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      // Allow requests without an origin (e.g., Postman or server-to-server calls)
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, origin); // Reflect the origin in the response
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials like cookies and tokens
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 4000;
connectDB();



googleAuth(app);
// Mount routes
app.use('/', userRouter); // For user-related routes
app.use('/admin', adminRouter); // For admin-related routes

// The product route needs multer's fields handling for file uploads
app.use('/admin/products', productRouter);

 // For product-related routes

app.use('/admin/category', categoryRouter); // For category-related routes

app.use('/user',cartRouter);

app.use('/',orderRouter);

app.use('/user',addressRouter)
app.use('/admin/offers',offerRouter)
app.use('/',couponRouter)

app.use('/api/reports',reportRouter)
app.use('/user',wishlistRouter)
app.use('/user',walletRouter)

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.use(errorMiddleware);

app.listen(port, () => console.log(`Server started on PORT: ${port}`));
