# 📚 ReferralHub Documentation

## 🚀 Quick Start

### Development Servers

1. **Backend API Server**
   ```bash
   cd backend
   npm run dev
   ```
   - Server: http://localhost:4000
   - Health Check: http://localhost:4000/health

2. **Frontend Application**
   ```bash
   cd frontend
   npm run dev
   ```
   - Application: http://localhost:3001

3. **API Documentation (Swagger)**
   - URL: http://localhost:4000/api-docs
   - Interactive API documentation with request/response examples

4. **Component Library (Storybook)**
   ```bash
   cd frontend
   npm run storybook
   ```
   - URL: http://localhost:6006
   - Interactive component documentation and testing

---

## 📖 API Documentation (Swagger)

### Available at: http://localhost:4000/api-docs

The Swagger documentation includes:

#### 🔐 Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

#### 👤 User Endpoints
- `GET /users/me` - Get current user info
- `GET /users/dashboard` - Get dashboard statistics

#### 💳 Purchase Endpoints
- `POST /purchases` - Simulate purchase (triggers referral credits)

#### 🔗 Referral Endpoints
- `GET /referrals` - Get user referrals
- `GET /referrals/leaderboard` - Get top referrers

#### 💰 Credit Endpoints
- `POST /credits/redeem` - Redeem credits
- `GET /credits/history` - Get credit history
- `GET /credits/activity` - Get activity feed

### Features:
- **Interactive Testing** - Try API endpoints directly from the documentation
- **Request/Response Examples** - See exactly what data to send and expect
- **Authentication Support** - Test authenticated endpoints with cookie auth
- **Schema Documentation** - Detailed data models and validation rules

---

## 🎨 Component Library (Storybook)

### Available at: http://localhost:6006

The Storybook documentation includes:

#### 🧩 Core Components

##### Button Component
- **Variants**: Primary, Secondary, Outline, Ghost
- **Sizes**: Small, Medium, Large
- **States**: Loading, Disabled, Full Width
- **Interactive Controls** - Test all props and states

##### Input Component
- **Types**: Text, Email, Password, Number
- **Features**: Icons, Validation, Error States
- **Dark Mode Support**
- **Form Examples**

##### StatCard Component
- **Color Themes**: Blue, Green, Purple, Orange
- **Features**: Icons, Trend Indicators, Animations
- **Dashboard Layout Examples**

#### 📱 Layout Components
- **Layout** - Main application wrapper with header
- **CopyReferral** - Social sharing component
- **Leaderboard** - Top referrers display
- **ActivityFeed** - Recent activity timeline

### Features:
- **Interactive Controls** - Modify component props in real-time
- **Dark Mode Toggle** - Test components in both themes
- **Accessibility Testing** - Built-in a11y addon
- **Documentation** - Auto-generated docs from TypeScript props
- **Visual Testing** - See all component states and variants

---

## 🏗️ Architecture Overview

### Backend Stack
- **Framework**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HttpOnly cookies
- **Validation**: Zod schemas
- **Documentation**: Swagger/OpenAPI 3.0

### Frontend Stack
- **Framework**: Next.js + React + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Documentation**: Storybook

### Key Features
- **Secure Authentication** - JWT tokens in HttpOnly cookies
- **Referral System** - Unique codes, tracking, and rewards
- **Credit Management** - Earn, track, and redeem credits
- **Real-time Updates** - Dashboard refreshes after actions
- **Dark Mode** - System-wide theme support
- **Responsive Design** - Mobile-first approach
- **Data Integrity** - Transaction-safe operations

---

## 🔧 Development Workflow

### 1. API Development
1. Add new endpoints to routes
2. Implement controllers with proper validation
3. Add Swagger documentation
4. Test via Swagger UI at http://localhost:4000/api-docs

### 2. Component Development
1. Create component in `/components`
2. Add TypeScript interfaces
3. Create Storybook story in `ComponentName.stories.tsx`
4. Test via Storybook at http://localhost:6006

### 3. Testing Flow
1. **API Testing** - Use Swagger UI for endpoint testing
2. **Component Testing** - Use Storybook for visual testing
3. **Integration Testing** - Test full flow in the application
4. **Accessibility Testing** - Use Storybook a11y addon

---

## 📋 Available Scripts

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```

### Frontend
```bash
npm run dev        # Start Next.js development server
npm run build      # Build for production
npm start          # Start production server
npm run storybook  # Start Storybook development server
npm run build-storybook  # Build Storybook for deployment
```

---

## 🌐 URLs Summary

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend App** | http://localhost:3001 | Main application |
| **Backend API** | http://localhost:4000 | REST API server |
| **API Docs** | http://localhost:4000/api-docs | Swagger documentation |
| **Storybook** | http://localhost:6006 | Component library |
| **Health Check** | http://localhost:4000/health | API health status |

---

## 🎯 Next Steps

1. **Explore the API** - Visit http://localhost:4000/api-docs
2. **Browse Components** - Visit http://localhost:6006
3. **Test the Application** - Visit http://localhost:3001
4. **Review the Code** - Check the implementation details

Happy coding! 🚀