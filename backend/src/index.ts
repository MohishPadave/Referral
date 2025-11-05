import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { connectMongo } from './db/mongo';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import referralRoutes from './routes/referrals';
import purchaseRoutes from './routes/purchases';
import creditRoutes from './routes/credits';
const debugRoutes = process.env.NODE_ENV === 'development' ? require('./routes/debug').default : null;

async function main() {
  console.log(' Starting ReferralHub Backend...');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Port:', env.port);
  console.log('CORS Origin:', env.corsOrigin);
  console.log('MongoDB URI:', env.mongoUri ? 'Set ✓' : 'Missing ✗');
  console.log('JWT Secret:', env.jwtSecret ? 'Set ✓' : 'Missing ✗');

  if (!env.mongoUri) {
    console.error(' MONGODB_URI is required');
    process.exit(1);
  }
  if (!env.jwtSecret) {
    console.error(' JWT_SECRET is required');
    process.exit(1);
  }

  const app = express();
  app.set('trust proxy', 1);
  const corsOrigin = env.corsOrigin?.trim();
  console.log('Using CORS Origin:', corsOrigin);
    const corsOptions = {
    origin: (origin: any, callback: any) => {
      if (!origin) return callback(null, true);
            if (corsOrigin === '*') return callback(null, true);
            if (corsOrigin && origin === corsOrigin) return callback(null, true);
            if (process.env.NODE_ENV !== 'production') return callback(null, true);
            console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  };
  
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      mongodb: mongoConnected ? 'connected' : 'disconnected',
      port: env.port,
      corsOrigin: env.corsOrigin
    });
  });

  let mongoConnected = false;
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('MongoDB URI provided:', env.mongoUri ? 'Yes' : 'No');
    await connectMongo();
    console.log('✅ MongoDB connected successfully');
    mongoConnected = true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.error('App will continue without database functionality');
    mongoConnected = false;
  }

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ReferralHub API Documentation',
  }));

  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/referrals', referralRoutes);
  app.use('/purchases', purchaseRoutes);
  app.use('/credits', creditRoutes);
  
  if (debugRoutes) {
    app.use('/debug', debugRoutes);
  }

  app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  app.use((err: any, req: any, res: any, _next: any) => {
    console.error('Server Error:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        timestamp: new Date().toISOString()
      });
    }
  });

  const server = app.listen(env.port, '0.0.0.0', () => {
    console.log(` API running on http://0.0.0.0:${env.port}`);
    console.log(` API Documentation: http://0.0.0.0:${env.port}/api-docs`);
    console.log(` Railway should proxy to this port: ${env.port}`);
    console.log(' ReferralHub Backend started successfully!');
  });

  server.on('error', (error: any) => {
    console.error(' Server startup error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(` Port ${env.port} is already in use`);
    }
    process.exit(1);
  });

  process.on('uncaughtException', (error) => {
    console.error(' Uncaught Exception:', error);
    console.error('Stack:', error.stack);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(' Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log(' Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


