import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { RegisterSchema, LoginSchema } from '../validation/schemas';
import { User } from '../models/User';
import { Referral } from '../models/Referral';
import { signJwt } from '../utils/jwt';
import { env } from '../config/env';

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString('hex');
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, referralCode } = RegisterSchema.parse(req.body);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Registration attempt: ${email}, Referral Code: ${referralCode || 'NONE'}`);
    }
    
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log(` User created: ${user.email} with referral code: ${user.referralCode}`);
      }

      if (referralCode) {
        const referrer = await User.findOne({ referralCode }).session(session);
        if (referrer) {
          if (process.env.NODE_ENV === 'development') {
            console.log(` Referrer found: ${referrer.email} (${referrer._id})`);
          }
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30);
          const referralDoc = await Referral.create([
            { referrerId: referrer._id, referredUserId: user._id, referralCode, status: 'pending', credited: false, expiryDate: expiry },
          ], { session });
          if (process.env.NODE_ENV === 'development') {
            console.log(` Referral relationship created: ${referralDoc[0]._id}`);
          }
        } else if (process.env.NODE_ENV === 'development') {
          console.log(` No referrer found with code: ${referralCode}`);
        }
      }

      const token = signJwt({ userId: String(user._id) });
      res
        .cookie(env.cookieName, token, {
          httpOnly: true,
          secure: env.cookieSecure,
          sameSite: env.cookieSameSite,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(201)
        .json({ user: { id: String(user._id), email: user.email, referralCode: user.referralCode, credits: user.credits } });
    });
    session.endSession();
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signJwt({ userId: String(user._id) });
    res
      .cookie(env.cookieName, token, {
        httpOnly: true,
        secure: env.cookieSecure,
        sameSite: env.cookieSameSite,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ user: { id: String(user._id), email: user.email, referralCode: user.referralCode, credits: user.credits } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Login failed' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(env.cookieName, { httpOnly: true, secure: env.cookieSecure, sameSite: env.cookieSameSite }).json({ ok: true });
}


