const http = require('http');

const PORT = Number(process.env.PORT) || 4000;

console.log(' Starting basic HTTP server...');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/health') {
    const response = {
      ok: true,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      port: PORT,
      message: 'Basic server is healthy'
    };
    res.writeHead(200);
    res.end(JSON.stringify(response));
  } else if (req.url === '/test') {
    const response = {
      message: 'Basic server is working!',
      timestamp: new Date().toISOString()
    };
    res.writeHead(200);
    res.end(JSON.stringify(response));
  } else if (req.url === '/') {
    const response = {
      message: 'ReferralHub API - Basic Server',
      endpoints: ['/health', '/test'],
      timestamp: new Date().toISOString()
    };
    res.writeHead(200);
    res.end(JSON.stringify(response));
  } else {
    const response = {
      error: 'Endpoint not found',
      timestamp: new Date().toISOString()
    };
    res.writeHead(404);
    res.end(JSON.stringify(response));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(` Basic server running on http://0.0.0.0:${PORT}`);
  console.log(` Health check: http://0.0.0.0:${PORT}/health`);
  console.log(` Test endpoint: http://0.0.0.0:${PORT}/test`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(` Port ${PORT} is already in use`);
  }
  process.exit(1);
});

server.on('listening', () => {
  console.log(' Server is listening and ready to accept connections');
});

process.on('SIGTERM', () => {
  console.log(' SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log(' Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log(' Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error(' Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(' Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});