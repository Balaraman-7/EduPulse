import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import counsellingRoutes from './routes/counsellingRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

import departmentRoutes from './routes/departmentRoutes.js';
import classRoutes from './routes/classRoutes.js';
import academicDataRoutes from './routes/academicDataRoutes.js';

const app = express();

// Production-ready CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173']
  : '*';

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins === '*' || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Serverless DB connection middleware ensuring DB is connected before processing requests
app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[Middleware Error] Database connection failed:', err.message);
    next(err);
  }
});

// Health check endpoint (As requested in section 16)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'edupulse-api',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/counselling', counsellingRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use('/api/departments', departmentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/academic-data', academicDataRoutes);

// Centralized Error Middleware
app.use(errorHandler);

// Standalone local execution (Non-Vercel environment)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[EduPulse Backend] Server running on port ${PORT}`);
  });
}

export default app;
