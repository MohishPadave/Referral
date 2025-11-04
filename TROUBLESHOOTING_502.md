# 502 Error Troubleshooting Guide

## Current Status
- ✅ Build successful
- ✅ Health check working
- ❌ 502 errors on API requests
- ❌ Connection refused errors

## Potential Causes & Solutions

### 1. **Test with Minimal Server**
Try deploying with the minimal server to isolate the issue:

1. Temporarily rename `railway.json` to `railway.json.backup`
2. Rename `railway-minimal.json` to `railway.json`
3. Redeploy and test if `/health` and `/test` endpoints work

### 2. **MongoDB Connection Issues**
The app might be crashing due to MongoDB connection problems:

**Check Railway Environment Variables:**
```
MONGODB_URI=mongodb+srv://mohishpadave_db_user:UU7s5GAXNs15ldoy@referral-system.dvipcce.mongodb.net/referrals?retryWrites=true&w=majority
```

**Test MongoDB Connection:**
- Verify the connection string works from your local machine
- Check if MongoDB Atlas allows connections from Railway's IP ranges
- Consider adding `0.0.0.0/0` to MongoDB Atlas IP whitelist temporarily

### 3. **Environment Variables**
Ensure these are set in Railway:
```
NODE_ENV=production
PORT=4000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<secure-random-string>
CORS_ORIGIN=https://referral-hub-l1a3-git-main-mohishs-projects-43ec9c03.vercel.app
```

### 4. **Memory/Resource Issues**
Railway might be killing the process due to resource constraints:
- Check Railway metrics for memory usage
- Consider upgrading Railway plan if on free tier

### 5. **Route Import Issues**
One of the route files might have import/export issues causing crashes:
- Test with minimal server first
- Gradually add routes back to identify problematic ones

## Debugging Steps

### Step 1: Deploy Minimal Server
```bash
# In Railway, temporarily use railway-minimal.json
# This will deploy a basic server with just /health and /test endpoints
```

### Step 2: Check Deploy Logs
Look for:
- Environment variable loading
- MongoDB connection attempts
- Any uncaught exceptions
- Process exit codes

### Step 3: Test Endpoints
Once minimal server is deployed:
- Test: `https://your-railway-url.railway.app/health`
- Test: `https://your-railway-url.railway.app/test`

### Step 4: Gradually Add Functionality
If minimal server works:
1. Switch back to full server
2. Comment out MongoDB connection
3. Test again
4. Gradually uncomment features

## Quick Fixes to Try

1. **Increase Health Check Timeout**
   ```json
   "healthcheckTimeout": 600
   ```

2. **Add More Logging**
   The updated server now has better error logging

3. **Simplify CORS**
   Temporarily set `CORS_ORIGIN=*` to rule out CORS issues

4. **Check MongoDB Atlas**
   - Ensure IP whitelist includes Railway IPs
   - Verify connection string is correct
   - Test connection from external tool

## If All Else Fails

1. **Create New Railway Service**
   Sometimes Railway services get into bad states

2. **Use Different Database**
   Temporarily switch to a different MongoDB instance

3. **Check Railway Status**
   Visit Railway status page for any ongoing issues