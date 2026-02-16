#!/bin/bash

# Even G2 Calendar Companion - Project Initialization Script
# This script initializes a complete React Native project structure

set -e  # Exit on error

echo "🚀 Even G2 Calendar Companion - Project Initialization"
echo "======================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm $(npm --version) detected"

# Check React Native CLI
echo ""
echo "📦 Checking React Native CLI..."
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx is not available${NC}"
    exit 1
fi

# Create project directory structure
echo ""
echo "📁 Creating project structure..."

# iOS folder structure
mkdir -p ios/EvenG2Calendar
mkdir -p ios/EvenG2Calendar.xcodeproj
mkdir -p ios/EvenG2Calendar.xcworkspace

# Android folder structure
mkdir -p android/app/src/main/java/com/eveng2calendar
mkdir -p android/app/src/main/res/values
mkdir -p android/app/src/main/res/drawable
mkdir -p android/gradle/wrapper

echo -e "${GREEN}✓${NC} Project structure created"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."

npm install --legacy-peer-deps

echo -e "${GREEN}✓${NC} Dependencies installed"

# iOS specific setup
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "🍎 Setting up iOS..."
    
    # Check if CocoaPods is installed
    if ! command -v pod &> /dev/null; then
        echo -e "${YELLOW}⚠${NC}  CocoaPods not found. Installing..."
        sudo gem install cocoapods
    fi
    
    echo "Installing iOS pods..."
    cd ios
    pod install
    cd ..
    
    echo -e "${GREEN}✓${NC} iOS setup complete"
else
    echo -e "${YELLOW}⚠${NC}  Skipping iOS setup (macOS required)"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env file created"
    echo -e "${YELLOW}⚠${NC}  Please configure .env with your Google Calendar credentials"
fi

# Create necessary directories
echo ""
echo "📁 Creating additional directories..."
mkdir -p __tests__/services
mkdir -p __tests__/components
mkdir -p __tests__/utils
mkdir -p src/components
mkdir -p src/hooks
mkdir -p src/store
mkdir -p src/config

echo -e "${GREEN}✓${NC} Additional directories created"

# Create index.js if it doesn't exist
if [ ! -f index.js ]; then
    echo ""
    echo "📝 Creating index.js..."
    cat > index.js << 'EOF'
/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
EOF
    echo -e "${GREEN}✓${NC} index.js created"
fi

# Create app.json if it doesn't exist
if [ ! -f app.json ]; then
    echo ""
    echo "📝 Creating app.json..."
    cat > app.json << 'EOF'
{
  "name": "EvenG2Calendar",
  "displayName": "Even G2 Calendar"
}
EOF
    echo -e "${GREEN}✓${NC} app.json created"
fi

# Print next steps
echo ""
echo "======================================================"
echo -e "${GREEN}✅ Project initialization complete!${NC}"
echo "======================================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure Google Calendar API:"
echo "   - Visit https://console.cloud.google.com"
echo "   - Create OAuth 2.0 credentials"
echo "   - Update .env file with your credentials"
echo ""
echo "2. Discover G2 BLE UUIDs:"
echo "   - Read docs/G2_BLE_UUID_DISCOVERY.md"
echo "   - Use nRF Connect app to scan your G2"
echo "   - Update src/types/ble.types.ts with real UUIDs"
echo ""
echo "3. Run the app:"
echo "   iOS:     npm run ios"
echo "   Android: npm run android"
echo ""
echo "4. Test on real G2 hardware:"
echo "   - Pair your G2 glasses"
echo "   - Grant calendar permissions"
echo "   - Test display functionality"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: docs/SETUP.md"
echo "   - Architecture: docs/ARCHITECTURE.md"
echo "   - BLE Protocol: docs/BLE_PROTOCOL.md"
echo ""
echo "🐛 Issues? https://github.com/harikapadia999/even-g2-calendar-companion/issues"
echo ""
