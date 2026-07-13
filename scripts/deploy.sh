#!/bin/bash
# ============================================
# PremiumMarket 自动部署脚本
# 用法: ./scripts/deploy.sh [environment]
# ============================================

set -e

ENVIRONMENT="${1:-production}"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "========================================="
echo "  🚀 PremiumMarket Deploy Script"
echo "  Environment: $ENVIRONMENT"
echo "  Time:        $TIMESTAMP"
echo "========================================="

# Step 1: Run checks
echo ""
echo "📦 Step 1: Installing dependencies..."
npm ci --no-audit --no-fund

echo ""
echo "🔧 Step 2: Generating Prisma client..."
npx prisma generate

echo ""
echo "🔍 Step 3: Type checking..."
npx tsc --noEmit

echo ""
echo "🏗️  Step 4: Building..."
npm run build

# Step 5: Deploy (if Vercel CLI is installed)
if command -v vercel &> /dev/null; then
  echo ""
  echo "🚀 Step 5: Deploying to Vercel..."
  if [ "$ENVIRONMENT" = "production" ]; then
    vercel --prod --confirm
  else
    vercel --confirm
  fi
  echo "✅ Deployment complete!"
else
  echo ""
  echo "⚠️  Vercel CLI not found. Build succeeded but deployment skipped."
  echo "   Install with: npm i -g vercel"
fi

# Step 6: Health check
echo ""
echo "🔍 Step 6: Running health check..."
sleep 10
node scripts/health-check.js

echo ""
echo "========================================="
echo "  ✅ Deployment finished at $(date)"
echo "========================================="
