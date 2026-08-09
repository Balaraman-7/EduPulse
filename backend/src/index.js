import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'EduPulse Backend API', timestamp: new Date() });
});

// Central Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[EduPulse Backend] Server running on port ${PORT}`);
});
