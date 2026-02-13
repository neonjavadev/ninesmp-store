#!/bin/bash

echo "🚀 NineSMP Store - Railway Deployment Setup"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the rank2 directory"
    exit 1
fi

echo "📋 Step 1: Checking Git setup..."
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
fi

echo "✅ Git repository ready"
echo ""

echo "📋 Step 2: Checking backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi
cd ..

echo ""
echo "📋 Step 3: Railway Deployment Instructions"
echo "=========================================="
echo ""
echo "1. Push to GitHub:"
echo "   gh repo create ninesmp-store --public --source=. --remote=origin"
echo "   git push -u origin main"
echo ""
echo "2. Go to https://railway.app and sign in with GitHub"
echo ""
echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
echo ""
echo "4. Select 'ninesmp-store' repository"
echo ""
echo "5. Configure the service:"
echo "   - Click 'Settings' → 'Service'"
echo "   - Set 'Root Directory' to: backend"
echo "   - Set 'Start Command' to: npm start"
echo ""
echo "6. Add these environment variables:"
echo "   (Click 'Variables' tab)"
echo ""
cat backend/.env.example
echo ""
echo "   Replace with your actual values from backend/.env"
echo ""
echo "7. Deploy! Railway will automatically build and deploy"
echo ""
echo "8. Copy your Railway URL (e.g., https://xxx.railway.app)"
echo ""
echo "=========================================="
echo "✅ Setup complete! Follow the instructions above."
echo ""
