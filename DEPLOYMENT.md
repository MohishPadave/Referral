# Deployment Guide

This guide covers deploying the Referral System with the frontend on Vercel and backend on Railway.

## Prerequisites

- GitHub account
- Vercel account (connected to GitHub)
- Railway account (connected to GitHub)
- MongoDB Atlas database (already configured)

## Backend Deployment (Railway)

### 1. Push Code to GitHub

First, ensure your code is pushed to a GitHub repository:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Railway

1. Go to [Railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Choose the `backend` folder as the root directory
5. Railway will automatically detect it's a Node.js project

### 3. Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```
MONGODB_URI=mongodb+srv://mohishpadave_db_user:UU7s5GAXNs15ldoy@referral-system.dvipcce.mongodb.net/referrals?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
JWT_EXPIRES_IN=7d
COOKIE_NAME=access_token
COOKIE_SECURE=true
CORS_ORIGIN=https://your-frontend-domain.vercel.app
PORT=4000
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

**Important:** 
- Change `JWT_SECRET` to a secure random string
- Update `CORS_ORIGIN` and `FRONTEND_URL` with your actual Vercel domain

### 4. Custom Domain (Optional)

1. In Railway dashboard, go to Settings → Domains
2. Generate a Railway domain or add your custom domain
3. Note the domain URL for frontend configuration

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Set the root directory to `frontend`
5. Vercel will auto-detect Next.js settings

### 2. Configure Environment Variables

In Vercel dashboard, go to Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_BASE=https://your-railway-backend-domain.railway.app
```

Replace `your-railway-backend-domain` with your actual Railway domain.

### 3. Update Backend CORS

After getting your Vercel domain, update the Railway environment variables:

```
CORS_ORIGIN=https://your-vercel-domain.vercel.app
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

## Post-Deployment Steps

### 1. Test the Deployment

1. Visit your Vercel frontend URL
2. Test user registration and login
3. Test referral link generation and usage
4. Test purchase simulation
5. Verify API documentation at `https://your-railway-domain.railway.app/api-docs`

### 2. Update README

Update the README.md with your live URLs:

- Frontend: `https://your-vercel-domain.vercel.app`
- Backend API: `https://your-railway-domain.railway.app`
- API Docs: `https://your-railway-domain.railway.app/api-docs`

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `CORS_ORIGIN` in Railway matches your Vercel domain exactly
2. **API Connection**: Verify `NEXT_PUBLIC_API_BASE` in Vercel points to correct Railway URL
3. **Database Connection**: Check MongoDB Atlas allows connections from Railway IPs (0.0.0.0/0)
4. **Build Failures**: Check build logs in Railway/Vercel dashboards

### Environment Variables Checklist

**Railway (Backend):**
- [ ] MONGODB_URI
- [ ] JWT_SECRET (changed from default)
- [ ] CORS_ORIGIN (Vercel domain)
- [ ] FRONTEND_URL (Vercel domain)
- [ ] COOKIE_SECURE=true
- [ ] NODE_ENV=production

**Vercel (Frontend):**
- [ ] NEXT_PUBLIC_API_BASE (Railway domain)

### Security Notes

1. **JWT_SECRET**: Use a strong, unique secret in production
2. **COOKIE_SECURE**: Set to `true` in production for HTTPS
3. **CORS**: Only allow your frontend domain
4. **MongoDB**: Restrict IP access if possible

## Monitoring

- **Railway**: Monitor logs and metrics in Railway dashboard
- **Vercel**: Check function logs and analytics in Vercel dashboard
- **MongoDB**: Monitor database performance in Atlas dashboard

## Scaling

- **Railway**: Upgrade plan for more resources if needed
- **Vercel**: Automatic scaling for frontend
- **Database**: Monitor MongoDB Atlas usage and upgrade if needed