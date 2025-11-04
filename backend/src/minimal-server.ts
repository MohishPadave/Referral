import express from 'express';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

console.log('🚀 Starting minimal server...');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Basic middleware
app.use(express.json());

// Add basic CORS headers manually
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Simple health check
app.get('/health', (_req, res) => {
  console.log('Health check requested');
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    port: PORT,
    message: 'Minimal server is healthy'
  });
});

// Simple test endpoint
app.get('/test', (_req, res) => {
  console.log('Test endpoint requested');
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  console.log('Root endpoint requested');
  res.json({ 
    message: 'ReferralHub API - Minimal Server',
    endpoints: ['/health', '/test'],
    timestamp: new Date().toISOString()
  });
});

// Catch all other routes
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('❌ Error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
console.log(`🔄 Attempting to start server on port ${PORT}...`);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on http://0.0.0.0:${PORT}`);
  console.log(`🌐 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://0.0.0.0:${PORT}/test`);
});

server.on('error', (error: any) => {
  console.error('❌ Server startup error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
  process.exit(1);
});

server.on('listening', () => {
  console.log('🎉 Server is listening and ready to accept connections');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});