# 🚀 Vercel Environment Variables Setup

## Critical: JWT Authentication Fix

The login redirect issue is caused by **JWT secret mismatch** between signing and verification. Follow these steps exactly:

## 1. Backend Environment Variables (Vercel Project Settings)

Go to your Vercel Dashboard → Your Backend Project → Settings → Environment Variables

Add these **EXACT** values:

```bash
# Database
MONGODB_URI=mongodb+srv://mohishpadave_db_user:UU7s5GAXNs15ldoy@referral-system.dvipcce.mongodb.net/referrals?retryWrites=true&w=majority

# JWT Configuration (CRITICAL - Must match exactly)
JWT_SECRET=5476f39ca548f02ac58055ba515a7dbc2c955028509596233f983e8e693ee3e3abbf3f88eebfd546ccbefb420c386b4e4d091d7d7a0f3e0bac98b82ea2949392
JWT_EXPIRES_IN=7d

# Cookie Configuration
COOKIE_NAME=access_token
COOKIE_SECURE=true

# CORS & Frontend
CORS_ORIGIN=https://referral-hub-l1a3-git-main-mohishs-projects-43ec9c03.vercel.app
FRONTEND_URL=https://referral-hub-l1a3-git-main-mohishs-projects-43ec9c03.vercel.app

# Environment
NODE_ENV=production
```

## 2. Frontend Environment Variables (Vercel Project Settings)

Go to your Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

Add this **EXACT** value:

```bash
# Backend API URL
NEXT_PUBLIC_API_BASE=https://referral-hub-git-main-mohishs-projects-43ec9c03.vercel.app
```

## 3. Verification Steps

After setting the environment variables:

### Step 1: Test Environment Variables
Visit: `https://referral-hub-git-main-mohishs-projects-43ec9c03.vercel.app/debug/env`

Expected response:
```json
{
  "environment": "production",
  "jwtSecretSet": true,
  "jwtSecretLength": 128,
  "jwtSecretFirst10": "5476f39ca5...",
  "mongoUriSet": true,
  "frontendUrl": "https://referral-hub-l1a3-git-main-mohishs-projects-43ec9c03.vercel.app",
  "corsOrigin": "https://referral-hub-l1a3-git-main-mohishs-projects-43ec9c03.vercel.app"
}
```

### Step 2: Test JWT Functionality
Visit: `https://referral-hub-git-main-mohishs-projects-43ec9c03.vercel.app/test-jwt`

Expected response:
```json
{
  "success": true,
  "message": "JWT working correctly",
  "jwtSecretSet": true,
  "jwtSecretLength": 128,
  "tokenGenerated": true,
  "tokenVerified": true
}
```

### Step 3: Test Login Flow
1. Go to your frontend login page
2. Try logging in
3. Check Vercel logs for detailed authentication flow

## 4. Common Issues & Solutions

### Issue: JWT Secret Not Set
- **Symptom**: `jwtSecretSet: false` in `/debug/env`
- **Solution**: Double-check the environment variable name is exactly `JWT_SECRET`

### Issue: JWT Secret Mismatch
- **Symptom**: Login succeeds but `/users/me` returns 401
- **Solution**: Ensure the JWT_SECRET is identical in both signing and verification

### Issue: CORS Errors
- **Symptom**: Network errors in browser console
- **Solution**: Verify CORS_ORIGIN matches your frontend URL exactly

### Issue: Cookie Not Set
- **Symptom**: No cookies in browser after login
- **Solution**: Ensure COOKIE_SECURE=true and sameSite='none' for cross-domain

## 5. Security Notes

- ✅ JWT_SECRET is 128 characters (very secure)
- ✅ COOKIE_SECURE=true for HTTPS
- ✅ sameSite='none' for cross-domain cookies
- ✅ httpOnly cookies prevent XSS attacks

## 6. Deployment Checklist

- [ ] Backend environment variables set in Vercel
- [ ] Frontend environment variables set in Vercel
- [ ] `/debug/env` shows correct values
- [ ] `/test-jwt` returns success
- [ ] Login flow works without redirect loop
- [ ] Dashboard loads after successful login

---

**🎯 The Key Fix**: The JWT_SECRET must be **exactly the same** in your Vercel environment variables as the one used in your code. Any mismatch will cause the 401 Unauthorized error on protected routes.