#!/bin/bash
set -e

echo "🚀 Starting Render build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm ci

# Build shared types first
echo "🔧 Building shared types..."
cd shared
npm ci
npm run build
cd ..

# Build backend
echo "🏗️ Building backend..."
cd backend
npm ci
npm run build
cd ..

echo "✅ Render build complete!"