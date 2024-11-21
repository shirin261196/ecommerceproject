import dotenv from 'dotenv';
import express, { Router } from 'express';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter  from './routes/productRoute.js'
import adminRouter from './routes/adminRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';

dotenv.config();

// App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// API endpoints
app.use('/', userRouter);
app.use('/admin', productRouter); // Fixed leading slash
app.use('/admin', adminRouter);
app.use('/admin',categoryRouter);

  
app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.listen(port, () => console.log(`Server started on PORT: ${port}`));
