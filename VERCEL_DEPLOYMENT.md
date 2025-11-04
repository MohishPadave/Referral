# Vercel Deployment Guide

## 🚀 Deploy Backend to Vercel

### 1. Deploy Backend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set **Root Directory** to `backend`
5. Vercel will auto-detect the configuration from `vercel.json`

### 2. Set Environment Variables (Backend)
In Vercel dashboard → Settings → Environment Variables, add:

```
MONGODB_URI=mongodb+srv://mohishpadave_db_user:UU7s5GAXNs15ldoy@referral-system.dvipcce.mongodb.net/referrals?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-production-jwt-secret-change-this
JWT_EXPIRES_IN=7d
COOKIE_NAME=access_token
COOKIE_SECURE=true
CORS_ORIGIN=https://your-frontend-app.vercel.app
FRONTEND_URL=https://your-frontend-app.vercel.app
NODE_ENV=production
```

### 3. Test Backend Endpoints
After deployment, test:
- `https://referral-hub-git-main-mohishs-projects-43ec9c03.vercel.app/api/health`
- `https://referral-hub-git-main-mohishs-projects-43ec9c03.vercel.app/api/test`
- `https://referral-hub-git-main-mohishs-projects-43ec9c03.vercel.app/api`

## 🎨 Deploy Frontend to Vercel

### 1. Deploy Frontend
1. Create another new project in Vercel
2. Import the same GitHub repository
3. Set **Root Directory** to `frontend`
4. Vercel will auto-detect Next.js configuration

### 2. Set Environment Variables (Frontend)
In Vercel dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_API_BASE=https://referral-hub-git-main-mohishs-projects-43ec9c03.vercel.app
```

### 3. Update API URLs
After both deployments:
1. Update `CORS_ORIGIN` and `FRONTEND_URL` in backend environment variables
2. Update `NEXT_PUBLIC_API_BASE` in frontend environment variables
3. Update the hardcoded URL in `frontend/lib/api.ts`

## 🔄 Post-Deployment Steps

1. **Update API Configuration**: Replace `https://your-backend-app.vercel.app` with actual backend URL
2. **Update CORS**: Set correct frontend URL in backend environment variables
3. **Test Connection**: Use the test connection page to verify everything works
4. **Domain Setup**: Optionally set up custom domains in Vercel

## 📝 Key Differences from Railway

- **Serverless Functions**: Backend runs as serverless functions (not persistent server)
- **API Routes**: All endpoints are under `/api/` prefix
- **No Port Configuration**: Vercel handles routing automatically
- **Environment Variables**: Set in Vercel dashboard, not in code
- **Build Process**: Vercel handles builds automatically

## 🧪 Testing

Frontend: `https://referral-hub-l1a3-git-main-mohishs-projects-43ec9c03.vercel.app/test-connection`
Backend Health: `https://referral-hub-git-main-mohishs-projects-43ec9c03.vercel.app/api/health`