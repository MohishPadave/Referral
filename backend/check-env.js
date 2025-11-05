
console.log('Environment Check');
console.log('==================');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ set' : '✗ missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ set' : '✗ missing');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || 'not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');

if (process.env.CORS_ORIGIN) {
  const corsOrigin = process.env.CORS_ORIGIN.trim();
  if (corsOrigin !== '*') {
    try {
      new URL(corsOrigin);
      console.log('CORS_ORIGIN format: ✓ valid URL');
    } catch (e) {
      console.log('CORS_ORIGIN format: ✗ invalid URL format');
      console.log('  Raw value:', JSON.stringify(process.env.CORS_ORIGIN));
      console.log('  Trimmed value:', JSON.stringify(corsOrigin));
    }
  }
}

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.log('\n Missing required environment variables:');
  missing.forEach(key => console.log(`  - ${key}`));
  process.exit(1);
} else {
  console.log('\n All required environment variables are set');
}