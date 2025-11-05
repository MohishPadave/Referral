
echo "Starting deployment process..."

export NODE_ENV=production

echo " Installing dependencies..."
npm ci --include=dev

echo " Building application..."
npm run build

echo "🧹 Removing dev dependencies..."
npm prune --omit=dev

echo " Starting application..."
npm start