import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { isDatabaseConnected } from './config/db';
import authRoutes from './routes/auth';
import superadminRoutes from './routes/superadmin';
import organizationRoutes from './routes/organization';
import verificationRoutes from './routes/public/verification.routes';

export const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim().replace(/\/$/, ''))
  : ['http://localhost:4200'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => allowed === origin.replace(/\/$/, ''));
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/verify', verificationRoutes);

app.get('/', (_req, res) => {
  res.send({ message: 'Hello World from API' });
});

app.get('/api/health', (_req, res) => {
  res.status(200).send({
    status: 'ok',
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
  });
});
