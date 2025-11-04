// api/index.js - Vercel Serverless Function Entry Point

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const app = express();
const mongoose = require('mongoose');

// --- 1. Database Connection & Models ---
let cachedDb = null;

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true, index: true },
  credits: { type: Number, required: true, default: 0 },
}, { timestamps: true });

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Referral Schema
const ReferralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String, required: true },
  status: { type: String, enum: ['pending', 'converted'], default: 'pending' },
  credited: { type: Boolean, default: false },
  expiryDate: { type: Date, required: true },
}, { timestamps: true });

// Purchase Schema
const PurchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  referralId: { type: mongoose.Schema.Types.ObjectId, ref: 'Referral' },
  creditsAwarded: { type: Number, default: 0 }, // Credits awarded to purchaser
  referrerCreditsAwarded: { type: Number, default: 0 }, // Credits awarded to referrer
  referrerCredited: { type: Boolean, default: false },
}, { timestamps: true });

// Models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Referral = mongoose.models.Referral || mongoose.model('Referral', ReferralSchema);
const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);

// Validation Schemas
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  referralCode: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Utility Functions
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
    console.log('✅ Database connection established');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    throw error;
  }
}

// Don't initialize connection here - do it per request

// --- 2. Middleware Configuration ---

// Whitelist the Vercel Frontend URL (using ENV variable)
const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g., https://your-app-name.vercel.app
  'https://referral-hub-l1a3-git-main-mohishs-projects-43ec9c03.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true); 
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  credentials: true, // Crucial for cookies/sessions
}));

// Body parser middleware
app.use(express.json());
app.use(cookieParser());


// --- 3. Route Definitions ---

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Vercel Express API is running.' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Vercel Express API is running.' });
});

// Environment Variables Debug endpoint
app.get('/debug/env', (req, res) => {
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

// JWT Test endpoint
app.get('/test-jwt', (req, res) => {
  try {
    const testPayload = { userId: 'test123', timestamp: Date.now() };
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    
    console.log(`🔑 JWT Secret for signing: ${jwtSecret.substring(0, 10)}... (length: ${jwtSecret.length})`);
    
    const token = signJwt(testPayload);
    console.log(`🎫 Generated token: ${token.substring(0, 20)}...`);
    
    // Verify the token immediately with the same secret
    const decoded = jwt.verify(token, jwtSecret);
    console.log(`✅ Token verified successfully:`, decoded);
    
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
    console.error('❌ JWT Test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      jwtSecretSet: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      jwtSecretFirst10: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'NOT_SET'
    });
  }
});

// Auth Routes
app.post('/auth/register', async (req, res) => {
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
      
      console.log(`✅ User created: ${user.email} with referral code: ${user.referralCode}`);

      if (referralCode) {
        const referrer = await User.findOne({ referralCode }).session(session);
        if (referrer) {
          console.log(`✅ Referrer found: ${referrer.email} (${referrer._id})`);
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30);
          const referralDoc = await Referral.create([
            { referrerId: referrer._id, referredUserId: user._id, referralCode, status: 'pending', credited: false, expiryDate: expiry },
          ], { session });
          console.log(`✅ Referral relationship created: ${referralDoc[0]._id}`);
        } else {
          console.log(`❌ No referrer found with code: ${referralCode}`);
        }
      }

      const token = signJwt({ userId: String(user._id) });
      const cookieName = process.env.COOKIE_NAME || 'access_token';
      const cookieSecure = process.env.COOKIE_SECURE === 'true';
      
      res
        .cookie(cookieName, token, {
          httpOnly: true,
          secure: cookieSecure,
          sameSite: 'none', // Changed to 'none' for cross-domain
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(201)
        .json({ 
          user: { id: String(user._id), email: user.email, referralCode: user.referralCode, credits: user.credits },
          token: token // Also return token in response for debugging
        });
    });
    session.endSession();
  } catch (err) {
    console.error('Registration error:', err);
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    await connectToDatabase();
    
    const { email, password } = LoginSchema.parse(req.body);
    console.log(`🔐 Login attempt for: ${email}`);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      console.log(`❌ Password mismatch for: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log(`✅ User authenticated: ${email}`);
    
    const token = signJwt({ userId: String(user._id) });
    const cookieName = process.env.COOKIE_NAME || 'access_token';
    const cookieSecure = process.env.COOKIE_SECURE === 'true';
    
    console.log(`🍪 Setting cookie: ${cookieName}, secure: ${cookieSecure}`);
    console.log(`🔑 JWT token generated, length: ${token.length}`);
    
    res
      .cookie(cookieName, token, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: 'none', // Changed to 'none' for cross-domain
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ 
        user: { id: String(user._id), email: user.email, referralCode: user.referralCode, credits: user.credits },
        token: token, // Also return token in response for debugging
        debug: {
          jwtSecretSet: !!process.env.JWT_SECRET,
          cookieSecure: cookieSecure,
          cookieName: cookieName
        }
      });
  } catch (err) {
    console.error('❌ Login error:', err);
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/auth/logout', (req, res) => {
  const cookieName = process.env.COOKIE_NAME || 'access_token';
  const cookieSecure = process.env.COOKIE_SECURE === 'true';
  
  res.clearCookie(cookieName, { 
    httpOnly: true, 
    secure: cookieSecure, 
    sameSite: 'none' // Changed to 'none' for cross-domain
  }).json({ ok: true });
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const cookieName = process.env.COOKIE_NAME || 'access_token';
  let token = req.cookies[cookieName];
  
  // Also check Authorization header as fallback
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log(`🔍 Token found in Authorization header`);
    }
  }
  
  console.log(`🔍 Token verification - Cookie name: ${cookieName}`);
  console.log(`🔍 Token found: ${!!token}`);
  console.log(`🔍 All cookies:`, Object.keys(req.cookies || {}));
  console.log(`🔍 Authorization header:`, !!req.headers.authorization);
  
  if (!token) {
    console.log(`❌ No token provided in cookie or Authorization header`);
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log(`✅ Token verified for user: ${decoded.userId}`);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(`❌ Token verification failed:`, error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Simple auth test endpoint
app.get('/auth/test', verifyToken, (req, res) => {
  console.log('🧪 Auth test endpoint called for user:', req.userId);
  res.json({ 
    success: true, 
    message: 'Authentication working', 
    userId: req.userId,
    timestamp: new Date().toISOString()
  });
});

// User endpoints
app.get('/users/me', verifyToken, async (req, res) => {
  try {
    console.log('👤 /users/me called for user:', req.userId);
    await connectToDatabase();
    const user = await User.findById(req.userId);
    if (!user) {
      console.log('❌ User not found in database:', req.userId);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('✅ User found:', user.email);
    res.json({ user: { id: user._id, email: user.email, referralCode: user.referralCode, credits: user.credits } });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

app.get('/users/dashboard', verifyToken, async (req, res) => {
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

// Purchase endpoint
app.post('/purchases', verifyToken, async (req, res) => {
  try {
    await connectToDatabase();
    const { amount } = req.body;
    
    console.log(`💳 Purchase attempt by user: ${req.userId}, amount: $${amount}`);
    
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // Get the purchasing user
      const purchaser = await User.findById(req.userId).session(session);
      if (!purchaser) {
        throw new Error('User not found');
      }
      
      console.log(`👤 Purchaser: ${purchaser.email}`);
      
      // Find if this user was referred by someone
      const referralRelationship = await Referral.findOne({ 
        referredUserId: req.userId,
        status: 'pending' // Only process pending referrals
      }).session(session);
      
      let referrerCreditsAwarded = 0;
      let purchaserCreditsAwarded = 0;
      let referrerCredited = false;
      
      if (referralRelationship) {
        console.log(`🔗 Found referral relationship: ${referralRelationship._id}`);
        
        // Get the referrer
        const referrer = await User.findById(referralRelationship.referrerId).session(session);
        if (referrer) {
          console.log(`👑 Referrer found: ${referrer.email}`);
          
          // Give 2 credits to the referrer
          referrer.credits += 2;
          await referrer.save({ session });
          referrerCreditsAwarded = 2;
          referrerCredited = true;
          
          console.log(`✅ Referrer ${referrer.email} received 2 credits. New total: ${referrer.credits}`);
          
          // ALSO give 2 credits to the purchaser (referred user)
          purchaser.credits += 2;
          await purchaser.save({ session });
          purchaserCreditsAwarded = 2;
          
          console.log(`✅ Purchaser ${purchaser.email} received 2 credits. New total: ${purchaser.credits}`);
          
          // Mark the referral as converted and credited
          referralRelationship.status = 'converted';
          referralRelationship.credited = true;
          await referralRelationship.save({ session });
          
          console.log(`✅ Referral relationship marked as converted`);
        }
      } else {
        console.log(`ℹ️ No pending referral found for user ${purchaser.email}`);
        console.log(`💰 Regular purchase - no referral credits awarded`);
      }
      
      // Create purchase record
      const purchaseData = {
        userId: req.userId,
        amount: amount,
        referralId: referralRelationship?._id,
        creditsAwarded: purchaserCreditsAwarded, // Credits awarded to purchaser
        referrerCreditsAwarded: referrerCreditsAwarded, // Credits awarded to referrer
        referrerCredited: referrerCredited
      };
      
      console.log('📝 Creating purchase record:', purchaseData);
      await Purchase.create([purchaseData], { session });
      
      console.log(`💰 Purchase completed. Purchaser credits: ${purchaserCreditsAwarded}, Referrer credits: ${referrerCreditsAwarded}`);
    });
    
    session.endSession();
    
    // Get updated user data
    const updatedUser = await User.findById(req.userId);
    
    res.json({ 
      success: true, 
      message: 'Purchase successful', 
      credits: updatedUser.credits,
      referralProcessed: true
    });
  } catch (error) {
    console.error('❌ Purchase error:', error);
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

// Get purchase history (for debugging)
app.get('/purchases/history', verifyToken, async (req, res) => {
  try {
    await connectToDatabase();
    const purchases = await Purchase.find({ userId: req.userId })
      .populate('referralId')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ purchases });
  } catch (error) {
    console.error('❌ Purchase history error:', error);
    res.status(500).json({ error: 'Failed to get purchase history' });
  }
});

// Get referral history (for debugging)
app.get('/referrals/history', verifyToken, async (req, res) => {
  try {
    await connectToDatabase();
    
    // Referrals made by this user (people they referred)
    const referralsMade = await Referral.find({ referrerId: req.userId })
      .populate('referredUserId', 'email')
      .sort({ createdAt: -1 });
    
    // Referrals where this user was referred
    const referralsReceived = await Referral.find({ referredUserId: req.userId })
      .populate('referrerId', 'email')
      .sort({ createdAt: -1 });
    
    res.json({ 
      referralsMade,
      referralsReceived
    });
  } catch (error) {
    console.error('❌ Referral history error:', error);
    res.status(500).json({ error: 'Failed to get referral history' });
  }
});

// Test referral system (for debugging)
app.post('/test/referral-system', async (req, res) => {
  try {
    await connectToDatabase();
    
    console.log('🧪 Testing referral system...');
    
    const session = await mongoose.startSession();
    let testResults = {};
    
    await session.withTransaction(async () => {
      // Create referrer user
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
      
      // Create referred user
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
      
      // Create referral relationship
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
      
      // Simulate purchase by referred user
      const purchaseAmount = 10;
      
      // Find the referral relationship (simulate the purchase logic)
      const foundReferral = await Referral.findOne({
        referredUserId: referred[0]._id,
        status: 'pending'
      }).session(session);
      
      if (foundReferral) {
        // Give credits to referrer
        const referrerToUpdate = await User.findById(foundReferral.referrerId).session(session);
        referrerToUpdate.credits += 2;
        await referrerToUpdate.save({ session });
        
        // Give credits to purchaser (referred user)
        const referredToUpdate = await User.findById(referred[0]._id).session(session);
        referredToUpdate.credits += 2;
        await referredToUpdate.save({ session });
        
        // Mark referral as converted
        foundReferral.status = 'converted';
        foundReferral.credited = true;
        await foundReferral.save({ session });
        
        // Create purchase record
        await Purchase.create([{
          userId: referred[0]._id,
          amount: purchaseAmount,
          referralId: foundReferral._id,
          creditsAwarded: 2, // Credits to purchaser
          referrerCreditsAwarded: 2, // Credits to referrer
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
    console.error('❌ Referral system test error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      details: error.message 
    });
  }
});

// Catch-all route for unhandled endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'API Endpoint Not Found' });
});

// --- 4. Export the App Instance (THE KEY FOR VERCEL) ---
module.exports = app;

// DO NOT use app.listen()