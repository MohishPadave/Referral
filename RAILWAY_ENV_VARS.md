# Railway Environment Variables

Set these environment variables in your Railway project dashboard:

## Required Variables

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://mohishpadave_db_user:UU7s5GAXNs15ldoy@referral-system.dvipcce.mongodb.net/referrals?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-production-jwt-secret-change-this
CORS_ORIGIN=https://referral-hub-l1a3-git-main-mohishs-projects-43ec9c03.vercel.app
```

## Optional Variables (with defaults)

```
JWT_EXPIRES_IN=7d
COOKIE_NAME=access_token
COOKIE_SECURE=true
PORT=4000
FRONTEND_URL=https://referral-hub-l1a3-git-main-mohishs-projects-43ec9c03.vercel.app
```

## How to Set in Railway

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to the "Variables" tab
4. Add each environment variable listed above

## Important Notes

- **CORS_ORIGIN** must match your Vercel frontend URL exactly
- **JWT_SECRET** should be a long, random string in production
- **MONGODB_URI** should be your actual MongoDB connection string
- **NODE_ENV** should be set to "production"

## Verify Setup

After setting the variables, redeploy your service and check the logs to ensure:
1. Environment variables are loaded correctly
2. CORS origin matches your frontend URL
3. MongoDB connection is successful