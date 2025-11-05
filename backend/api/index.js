const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const app = express();
const mongoose = require('mongoose');

let cachedDb = null;

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true, index: true },
  credits: { type: Number, required: true, default: 0 },
}, { timestamps: true });

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

const ReferralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String, required: true },
  status: { type: String, enum: ['pending', 'converted'], default: 'pending' },
  credited: { type: Boolean, default: false },
  expiryDate: { type: Date, required: true },
}, { timestamps: true });

const PurchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  referralId: { type: mongoose.Schema.Types.ObjectId, ref: 'Referral' },
  creditsAwarded: { type: Number, default: 0 },
  referrerCreditsAwarded: { type: Number, default: 0 }, 
  referrerCredited: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Referral = mongoose.models.Referral || mongoose.model('Referral', ReferralSchema);
const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  referralCode: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function generateReferralCode() {
  return crypto.randomBytes(4).toString('hex');
}

function signJwt(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  });
}

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    console.log('Using existing database connection');
    return mongoose.connection;
  }
  
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set.');
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    console.log(' Database connection established');
    return mongoose.connection;
  } catch (error) {
    console.error(' Database connection error:', error.message);
    throw error;
  }
}


const allowedOrigins = [
  process.env.FRONTEND_URL, 
  'https://referral-hub-l1a3-git-main-mohishs-projects-43ec9c03.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (direct browser access, mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // Allow all origins for now (can be made more restrictive later)
    return callback(null, true);
  },
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ReferralHub API',
      version: '1.0.0',
      description: 'A comprehensive referral system API with user authentication, referral tracking, and credit management',
      contact: {
        name: 'ReferralHub Team',
        email: 'support@referralhub.com',
      },
    },
    servers: [
      {
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
          description: 'JWT token stored in HTTP-only cookie',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            referralCode: { type: 'string', example: 'abc123def' },
            credits: { type: 'number', example: 10 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Invalid credentials' },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: [], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);



app.get('/api-docs', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'ReferralHub API',
      version: '1.0.0',
      description: 'A comprehensive referral system API'
    },
    servers: [
      {
        url: req.protocol + '://' + req.get('host'),
        description: 'Current server'
      }
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'API is healthy'
            }
          }
        }
      },
      '/api/auth/register': {
        post: {
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    referralCode: { type: 'string' }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            '201': { description: 'User registered successfully' },
            '400': { description: 'Validation error' },
            '409': { description: 'Email already in use' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                  },
                  required: ['email', 'password']
                }
              }
            }
          },
          responses: {
            '200': { description: 'Login successful' },
            '401': { description: 'Invalid credentials' }
          }
        }
      }
    }
  });
});

app.use('/api-docs-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ReferralHub API Documentation',
}));

app.get('/api/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({ 
    status: 'ok', 
    message: 'Vercel Express API is running.',
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent') || 'unknown'
  });
});

app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({ 
    status: 'ok', 
    message: 'Vercel Express API is running.',
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent') || 'unknown'
  });
});

app.get('/api/debug/env', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    jwtSecretSet: !!process.env.JWT_SECRET,
    jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    jwtSecretFirst10: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'NOT_SET',
    mongoUriSet: !!process.env.MONGODB_URI,
    frontendUrl: process.env.FRONTEND_URL,
    corsOrigin: process.env.CORS_ORIGIN,
    cookieName: process.env.COOKIE_NAME,
    cookieSecure: process.env.COOKIE_SECURE,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN
  });
});

app.get('/api/test-jwt', (req, res) => {
  try {
    const testPayload = { userId: 'test123', timestamp: Date.now() };
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    
    console.log(`🔑 JWT Secret for signing: ${jwtSecret.substring(0, 10)}... (length: ${jwtSecret.length})`);
    
    const token = signJwt(testPayload);
    console.log(`🎫 Generated token: ${token.substring(0, 20)}...`);
    
    const decoded = jwt.verify(token, jwtSecret);
    console.log(` Token verified successfully:`, decoded);
    
    res.json({
      success: true,
      message: 'JWT working correctly',
      jwtSecretSet: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      jwtSecretFirst10: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'NOT_SET',
      tokenGenerated: !!token,
      tokenVerified: !!decoded,
      payload: testPayload,
      decoded: decoded,
      tokenPreview: token.substring(0, 50) + '...'
    });
  } catch (error) {
    console.error(' JWT Test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      jwtSecretSet: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      jwtSecretFirst10: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'NOT_SET'
    });
  }
});


app.post('/api/auth/register', async (req, res) => {
  try {
    await connectToDatabase();
    
    const { email, password, referralCode } = RegisterSchema.parse(req.body);
    
    console.log(`👤 Registration attempt: ${email}, Referral Code: ${referralCode || 'NONE'}`);
    
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const existing = await User.findOne({ email }).session(session);
      if (existing) return res.status(409).json({ error: 'Email already in use' });

      const passwordHash = await bcrypt.hash(password, 12);
      let code = generateReferralCode();
      while (await User.findOne({ referralCode: code }).session(session)) {
        code = generateReferralCode();
      }

      const newUser = await User.create([{ email, passwordHash, referralCode: code, credits: 0 }], { session });
      const user = newUser[0];
      
      console.log(` User created: ${user.email} with referral code: ${user.referralCode}`);

      if (referralCode) {
        const referrer = await User.findOne({ referralCode }).session(session);
        if (referrer) {
          console.log(` Referrer found: ${referrer.email} (${referrer._id})`);
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30);
          const referralDoc = await Referral.create([
            { referrerId: referrer._id, referredUserId: user._id, referralCode, status: 'pending', credited: false, expiryDate: expiry },
          ], { session });
          console.log(` Referral relationship created: ${referralDoc[0]._id}`);
        } else {
          console.log(` No referrer found with code: ${referralCode}`);
        }
      }

      const token = signJwt({ userId: String(user._id) });
      const cookieName = process.env.COOKIE_NAME || 'access_token';
      const cookieSecure = process.env.COOKIE_SECURE === 'true';
      
      res
        .cookie(cookieName, token, {
          httpOnly: true,
          secure: cookieSecure,
          sameSite: 'none', 
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(201)
        .json({ 
          user: { id: String(user._id), email: user.email, referralCode: user.referralCode, credits: user.credits },
          token: token 
        });
    });
    session.endSession();
  } catch (err) {
    console.error('Registration error:', err);
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Registration failed' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    await connectToDatabase();
    
    const { email, password } = LoginSchema.parse(req.body);
    console.log(`🔐 Login attempt for: ${email}`);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(` User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      console.log(` Password mismatch for: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log(` User authenticated: ${email}`);
    
    const token = signJwt({ userId: String(user._id) });
    const cookieName = process.env.COOKIE_NAME || 'access_token';
    const cookieSecure = process.env.COOKIE_SECURE === 'true';
    
    console.log(`Setting cookie: ${cookieName}, secure: ${cookieSecure}`);
    console.log(`JWT token generated, length: ${token.length}`);
    
    res
      .cookie(cookieName, token, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: 'none', 
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ 
        user: { id: String(user._id), email: user.email, referralCode: user.referralCode, credits: user.credits },
        token: token, 
        debug: {
          jwtSecretSet: !!process.env.JWT_SECRET,
          cookieSecure: cookieSecure,
          cookieName: cookieName
        }
      });
  } catch (err) {
    console.error(' Login error:', err);
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const cookieName = process.env.COOKIE_NAME || 'access_token';
  const cookieSecure = process.env.COOKIE_SECURE === 'true';
  
  res.clearCookie(cookieName, { 
    httpOnly: true, 
    secure: cookieSecure, 
    sameSite: 'none' 
  }).json({ ok: true });
});

function verifyToken(req, res, next) {
  const cookieName = process.env.COOKIE_NAME || 'access_token';
  let token = req.cookies[cookieName];
    if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log(`🔍 Token found in Authorization header`);
    }
  }
  
  console.log(`Token verification - Cookie name: ${cookieName}`);
  console.log(`Token found: ${!!token}`);
  console.log(`All cookies:`, Object.keys(req.cookies || {}));
  console.log(`Authorization header:`, !!req.headers.authorization);
  
  if (!token) {
    console.log(`No token provided in cookie or Authorization header`);
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log(` Token verified for user: ${decoded.userId}`);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(` Token verification failed:`, error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/auth/test', verifyToken, (req, res) => {
  console.log(' Auth test endpoint called for user:', req.userId);
  res.json({ 
    success: true, 
    message: 'Authentication working', 
    userId: req.userId,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/users/me', verifyToken, async (req, res) => {
  try {
    console.log(' /users/me called for user:', req.userId);
    await connectToDatabase();
    const user = await User.findById(req.userId);
    if (!user) {
      console.log(' User not found in database:', req.userId);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(' User found:', user.email);
    res.json({ user: { id: user._id, email: user.email, referralCode: user.referralCode, credits: user.credits } });
  } catch (error) {
    console.error(' Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

app.get('/api/users/dashboard', verifyToken, async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;
    const referrals = await Referral.find({ referrerId: userId }).select('referredUserId status');
    const totalReferred = referrals.length;
    const convertedCount = referrals.filter((r) => r.status === 'converted').length;
    const user = await User.findById(userId);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    res.json({
      stats: {
        totalReferred,
        convertedCount,
        totalCredits: user?.credits ?? 0,
        referralLink: `${frontendUrl}/signup?ref=${user?.referralCode}`,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});


app.post('/api/purchases', verifyToken, async (req, res) => {
  try {
    await connectToDatabase();
    const { amount } = req.body;
    
    console.log(`💳 Purchase attempt by user: ${req.userId}, amount: $${amount}`);
    
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const purchaser = await User.findById(req.userId).session(session);
      if (!purchaser) {
        throw new Error('User not found');
      }
      
      console.log(` Purchaser: ${purchaser.email}`);
      
      const referralRelationship = await Referral.findOne({ 
        referredUserId: req.userId,
        status: 'pending' 
      }).session(session);
      
      let referrerCreditsAwarded = 0;
      let purchaserCreditsAwarded = 0;
      let referrerCredited = false;
      
      if (referralRelationship) {
        console.log(` Found referral relationship: ${referralRelationship._id}`);
        
        const referrer = await User.findById(referralRelationship.referrerId).session(session);
        if (referrer) {
          console.log(` Referrer found: ${referrer.email}`);
          
          referrer.credits += 2;
          await referrer.save({ session });
          referrerCreditsAwarded = 2;
          referrerCredited = true;
          
          console.log(` Referrer ${referrer.email} received 2 credits. New total: ${referrer.credits}`);
          
          purchaser.credits += 2;
          await purchaser.save({ session });
          purchaserCreditsAwarded = 2;
          
          console.log(` Purchaser ${purchaser.email} received 2 credits. New total: ${purchaser.credits}`);
          
          referralRelationship.status = 'converted';
          referralRelationship.credited = true;
          await referralRelationship.save({ session });
          
          console.log(` Referral relationship marked as converted`);
        }
      } else {
        console.log(`No pending referral found for user ${purchaser.email}`);
        console.log(` Regular purchase - no referral credits awarded`);
      }
      
      const purchaseData = {
        userId: req.userId,
        amount: amount,
        referralId: referralRelationship?._id,
        creditsAwarded: purchaserCreditsAwarded, 
        referrerCreditsAwarded: referrerCreditsAwarded, 
        referrerCredited: referrerCredited
      };
      
      console.log(' Creating purchase record:', purchaseData);
      await Purchase.create([purchaseData], { session });
      
      console.log(` Purchase completed. Purchaser credits: ${purchaserCreditsAwarded}, Referrer credits: ${referrerCreditsAwarded}`);
    });
    
    session.endSession();
    
    const updatedUser = await User.findById(req.userId);
    
    res.json({ 
      success: true, 
      message: 'Purchase successful', 
      credits: updatedUser.credits,
      referralProcessed: true
    });
  } catch (error) {
    console.error(' Purchase error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Purchase failed',
      details: error.message 
    });
  }
});

app.get('/api/purchases/history', verifyToken, async (req, res) => {
  try {
    await connectToDatabase();
    const purchases = await Purchase.find({ userId: req.userId })
      .populate('referralId')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ purchases });
  } catch (error) {
    console.error(' Purchase history error:', error);
    res.status(500).json({ error: 'Failed to get purchase history' });
  }
});

app.get('/api/referrals/history', verifyToken, async (req, res) => {
  try {
    await connectToDatabase();
    
    const referralsMade = await Referral.find({ referrerId: req.userId })
      .populate('referredUserId', 'email')
      .sort({ createdAt: -1 });
    
    const referralsReceived = await Referral.find({ referredUserId: req.userId })
      .populate('referrerId', 'email')
      .sort({ createdAt: -1 });
    
    res.json({ 
      referralsMade,
      referralsReceived
    });
  } catch (error) {
    console.error(' Referral history error:', error);
    res.status(500).json({ error: 'Failed to get referral history' });
  }
});

app.post('/api/test/referral-system', async (req, res) => {
  try {
    await connectToDatabase();
    
    console.log(' Testing referral system...');
    
    const session = await mongoose.startSession();
    let testResults = {};
    
    await session.withTransaction(async () => {
      const referrerEmail = `referrer${Date.now()}@test.com`;
      const referrerPassword = await bcrypt.hash('password123', 12);
      let referrerCode = generateReferralCode();
      
      const referrer = await User.create([{
        email: referrerEmail,
        passwordHash: referrerPassword,
        referralCode: referrerCode,
        credits: 0
      }], { session });
      
      testResults.referrer = {
        id: referrer[0]._id,
        email: referrer[0].email,
        referralCode: referrer[0].referralCode,
        initialCredits: referrer[0].credits
      };
      
      const referredEmail = `referred${Date.now()}@test.com`;
      const referredPassword = await bcrypt.hash('password123', 12);
      let referredCode = generateReferralCode();
      
      const referred = await User.create([{
        email: referredEmail,
        passwordHash: referredPassword,
        referralCode: referredCode,
        credits: 0
      }], { session });
      
      testResults.referred = {
        id: referred[0]._id,
        email: referred[0].email,
        referralCode: referred[0].referralCode,
        initialCredits: referred[0].credits
      };
      
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      
      const referralRelation = await Referral.create([{
        referrerId: referrer[0]._id,
        referredUserId: referred[0]._id,
        referralCode: referrerCode,
        status: 'pending',
        credited: false,
        expiryDate: expiry
      }], { session });
      
      testResults.referralRelation = {
        id: referralRelation[0]._id,
        status: referralRelation[0].status,
        credited: referralRelation[0].credited
      };
      
      const purchaseAmount = 10;
      
      const foundReferral = await Referral.findOne({
        referredUserId: referred[0]._id,
        status: 'pending'
      }).session(session);
      
      if (foundReferral) {
        const referrerToUpdate = await User.findById(foundReferral.referrerId).session(session);
        referrerToUpdate.credits += 2;
        await referrerToUpdate.save({ session });
        
        const referredToUpdate = await User.findById(referred[0]._id).session(session);
        referredToUpdate.credits += 2;
        await referredToUpdate.save({ session });
        
        foundReferral.status = 'converted';
        foundReferral.credited = true;
        await foundReferral.save({ session });
        
        await Purchase.create([{
          userId: referred[0]._id,
          amount: purchaseAmount,
          referralId: foundReferral._id,
          creditsAwarded: 2, 
          referrerCreditsAwarded: 2, 
          referrerCredited: true
        }], { session });
        
        testResults.purchase = {
          amount: purchaseAmount,
          referrerCreditsAfter: referrerToUpdate.credits,
          purchaserCreditsAfter: referredToUpdate.credits,
          referralStatus: foundReferral.status
        };
      }
    });
    
    session.endSession();
    
    res.json({
      success: true,
      message: 'Referral system test completed',
      results: testResults
    });
    
  } catch (error) {
    console.error(' Referral system test error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      details: error.message 
    });
  }
});

app.get('/api/credits/activity', verifyToken, async (req, res) => {
  try {
    res.json(['Recent purchase: +2 credits', 'Referral converted: +2 credits']);
  } catch (error) {
    console.error('Credits activity error:', error);
    res.status(500).json({ error: 'Failed to get credits activity' });
  }
});

app.get('/api/credits/history', verifyToken, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error(' Credits history error:', error);
    res.status(500).json({ error: 'Failed to get credits history' });
  }
});

app.post('/api/credits/redeem', verifyToken, async (req, res) => {
  try {
    const { amount, item } = req.body;
    await connectToDatabase();
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.credits < amount) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }
    
    user.credits -= amount;
    await user.save();
    
    res.json({ success: true, message: `Redeemed ${item}`, remainingCredits: user.credits });
  } catch (error) {
    console.error(' Credits redeem error:', error);
    res.status(500).json({ error: 'Failed to redeem credits' });
  }
});

app.get('/api/referrals/leaderboard', verifyToken, async (req, res) => {
  try {
    await connectToDatabase();
    
    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: 'referrals',
          localField: '_id',
          foreignField: 'referrerId',
          as: 'referrals'
        }
      },
      {
        $addFields: {
          referralCount: { $size: '$referrals' },
          convertedCount: {
            $size: {
              $filter: {
                input: '$referrals',
                cond: { $eq: ['$$this.status', 'converted'] }
              }
            }
          }
        }
      },
      {
        $match: { referralCount: { $gt: 0 } }
      },
      {
        $sort: { convertedCount: -1, referralCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          email: 1,
          credits: 1,
          referralCount: 1,
          convertedCount: 1
        }
      }
    ]);
    
    res.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'API Endpoint Not Found' });
});

module.exports = app;

