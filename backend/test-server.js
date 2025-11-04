#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing server locally...');

// Test the basic server
const PORT = Number(process.env.PORT) || 4000;

console.log('Starting basic server on port:', PORT);

// Start the basic server
require('./src/basic-server.js');

// Wait a moment then test the endpoints
setTimeout(() => {
  console.log('\n🔍 Testing endpoints...');
  
  // Test health endpoint
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Health check status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Health check response:', response);
        
        if (response.ok) {
          console.log('✅ Server is working correctly!');
        } else {
          console.log('❌ Server health check failed');
        }
      } catch (error) {
        console.log('❌ Failed to parse response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request failed:', error.message);
  });

  req.end();
}, 2000);