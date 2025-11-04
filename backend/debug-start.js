#!/usr/bin/env node

console.log('🔍 Debug Start Script');
console.log('====================');
console.log('Timestamp:', new Date().toISOString());
console.log('Node Version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Memory Usage:', process.memoryUsage());
console.log('');

console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ set' : '✗ missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ set' : '✗ missing');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || 'not set');
console.log('');

console.log('File System Check:');
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'dist/index.js',
  'dist/minimal-server.js',
  'src/basic-server.js',
  'package.json'
];

filesToCheck.forEach(file => {
  try {
    const exists = fs.existsSync(file);
    const stats = exists ? fs.statSync(file) : null;
    console.log(`${file}: ${exists ? '✓ exists' : '✗ missing'}${stats ? ` (${stats.size} bytes)` : ''}`);
  } catch (error) {
    console.log(`${file}: ❌ error checking - ${error.message}`);
  }
});

console.log('');
console.log('Starting basic server...');

// Start the basic server
require('./src/basic-server.js');