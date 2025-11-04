#!/bin/bash

echo "🚀 Starting deployment process..."

# Set NODE_ENV to production
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --include=dev

# Build the application
echo "🔨 Building application..."
npm run build

# Remove dev dependencies
echo "🧹 Removing dev dependencies..."
npm prune --omit=dev

# Start the application
echo "▶️ Starting application..."
npm start