import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { isDatabaseConnected } from './config/db';
import authRoutes from './routes/auth';
import superadminRoutes from './routes/superadmin';
import organizationRoutes from './routes/organization';

export const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:4200'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/organization', organizationRoutes);

app.get('/', (_req, res) => {
  res.send({ message: 'Hello World from API' });
});

app.get('/api/health', (_req, res) => {
  res.status(200).send({
    status: 'ok',
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
  });
});
