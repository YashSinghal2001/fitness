import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
const xss = require('xss-clean');

// Route Imports
import adminRoutes from './routes/adminRoutes';
import clientRoutes from './routes/clientRoutes';
import dailyLogRoutes from './routes/dailyLogRoutes';
import nutritionRoutes from './routes/nutritionRoutes';
import photoRoutes from './routes/photoRoutes';

// Controller Imports for specific route mounting
import { getReportingStats, getBodyMeasurements, updateBodyMeasurements } from './controllers/progressController';
import { getClientReports } from './controllers/clientController';

// Middleware Imports
import { errorHandler } from './middleware/errorMiddleware';
import { globalLimiter } from './middleware/rateLimitMiddleware';
import AppError from './utils/AppError';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

const app = express();

// Production Safety
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy for secure cookies & rate limiting
}

// Global Middleware

// CORS - Must be first to handle preflight requests
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
app.use('/api', globalLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss());

// Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       'duration',
//       'ratingsQuantity',
//       'ratingsAverage',
//       'maxGroupSize',
//       'difficulty',
//       'price',
//     ],
//   })
// );

// Route Mounting
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/daily', dailyLogRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/photos', photoRoutes);

// Custom Route Mounting to match specific requirements
// /api/weekly -> Client Reports (Weekly Summaries)
app.get('/api/weekly', getClientReports);

// /api/measurements -> Progress Controller (Get/Update)
const measurementsRouter = express.Router();
measurementsRouter.route('/')
  .get(getBodyMeasurements as any)
  .put(updateBodyMeasurements as any);
app.use('/api/measurements', measurementsRouter);

// /api/reports -> Progress Controller (Reporting Stats)
app.get('/api/reports', getReportingStats as any);

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
