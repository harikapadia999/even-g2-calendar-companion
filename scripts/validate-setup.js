#!/usr/bin/env node

/**
 * Setup Validation Script
 * Checks if the project is properly configured
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description}`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  if (exists) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description}`, 'yellow');
    return false;
  }
}

function checkUUIDs() {
  const bleTypesPath = path.join(__dirname, '../src/types/ble.types.ts');
  
  if (!fs.existsSync(bleTypesPath)) {
    log('✗ BLE types file not found', 'red');
    return false;
  }
  
  const content = fs.readFileSync(bleTypesPath, 'utf8');
  
  // Check for placeholder UUIDs
  const hasPlaceholders = content.includes('0000fff0-0000-1000-8000-00805f9b34fb') ||
                          content.includes('YOUR_DISCOVERED_UUID');
  
  if (hasPlaceholders) {
    log('⚠ BLE UUIDs are still PLACEHOLDERS - you must discover real G2 UUIDs', 'yellow');
    log('  See docs/G2_BLE_UUID_DISCOVERY.md for instructions', 'yellow');
    return false;
  } else {
    log('✓ BLE UUIDs appear to be configured', 'green');
    return true;
  }
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  
  if (!fs.existsSync(envPath)) {
    log('✗ .env file not found', 'red');
    log('  Run: cp .env.example .env', 'yellow');
    return false;
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  
  if (content.includes('your_google_client_id_here')) {
    log('⚠ .env file has placeholder values', 'yellow');
    log('  Configure Google Calendar credentials', 'yellow');
    return false;
  }
  
  log('✓ .env file configured', 'green');
  return true;
}

function checkNodeModules() {
  const nodeModulesPath = path.join(__dirname, '../node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    log('✗ node_modules not found', 'red');
    log('  Run: npm install', 'yellow');
    return false;
  }
  
  // Check key dependencies
  const deps = [
    'react-native',
    'react-native-ble-plx',
    '@react-native-google-signin/google-signin',
    'react-native-calendar-events',
    'zustand',
    'date-fns',
  ];
  
  let allInstalled = true;
  deps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (!fs.existsSync(depPath)) {
      log(`✗ Missing dependency: ${dep}`, 'red');
      allInstalled = false;
    }
  });
  
  if (allInstalled) {
    log('✓ All dependencies installed', 'green');
  }
  
  return allInstalled;
}

function main() {
  log('\n==============================================', 'blue');
  log('Even G2 Calendar Companion - Setup Validation', 'blue');
  log('==============================================\n', 'blue');
  
  let score = 0;
  let total = 0;
  
  // Check project structure
  log('📁 Project Structure:', 'blue');
  total++; if (checkDirectory('src', 'src/ directory exists')) score++;
  total++; if (checkDirectory('src/services', 'src/services/ directory exists')) score++;
  total++; if (checkDirectory('src/types', 'src/types/ directory exists')) score++;
  total++; if (checkDirectory('src/utils', 'src/utils/ directory exists')) score++;
  total++; if (checkDirectory('docs', 'docs/ directory exists')) score++;
  
  log('\n📄 Core Files:', 'blue');
  total++; if (checkFile('package.json', 'package.json exists')) score++;
  total++; if (checkFile('tsconfig.json', 'tsconfig.json exists')) score++;
  total++; if (checkFile('App.tsx', 'App.tsx exists')) score++;
  total++; if (checkFile('index.js', 'index.js exists')) score++;
  total++; if (checkFile('app.json', 'app.json exists')) score++;
  
  log('\n🔧 Configuration:', 'blue');
  total++; if (checkFile('babel.config.js', 'babel.config.js exists')) score++;
  total++; if (checkFile('metro.config.js', 'metro.config.js exists')) score++;
  total++; if (checkFile('jest.config.js', 'jest.config.js exists')) score++;
  total++; if (checkEnvFile()) score++;
  
  log('\n📱 Platform Files:', 'blue');
  total++; if (checkDirectory('ios', 'ios/ directory exists')) score++;
  total++; if (checkDirectory('android', 'android/ directory exists')) score++;
  total++; if (checkFile('ios/Podfile', 'iOS Podfile exists')) score++;
  total++; if (checkFile('android/build.gradle', 'Android build.gradle exists')) score++;
  
  log('\n🔌 BLE Configuration:', 'blue');
  total++; if (checkUUIDs()) score++;
  
  log('\n📦 Dependencies:', 'blue');
  total++; if (checkNodeModules()) score++;
  
  log('\n📚 Documentation:', 'blue');
  total++; if (checkFile('README.md', 'README.md exists')) score++;
  total++; if (checkFile('docs/SETUP.md', 'Setup guide exists')) score++;
  total++; if (checkFile('docs/ARCHITECTURE.md', 'Architecture docs exist')) score++;
  total++; if (checkFile('docs/BLE_PROTOCOL.md', 'BLE protocol docs exist')) score++;
  total++; if (checkFile('docs/G2_BLE_UUID_DISCOVERY.md', 'UUID discovery guide exists')) score++;
  
  // Summary
  log('\n==============================================', 'blue');
  log(`Setup Score: ${score}/${total} (${Math.round(score/total*100)}%)`, 'blue');
  log('==============================================\n', 'blue');
  
  if (score === total) {
    log('🎉 Perfect! Your project is fully configured!', 'green');
    log('\nNext steps:', 'blue');
    log('1. Discover G2 BLE UUIDs (see docs/G2_BLE_UUID_DISCOVERY.md)');
    log('2. Update src/types/ble.types.ts with real UUIDs');
    log('3. Run: npm run ios (or npm run android)');
    log('4. Test on real G2 hardware\n');
  } else if (score >= total * 0.8) {
    log('👍 Good! Almost ready. Check items marked with ✗ above.', 'yellow');
  } else if (score >= total * 0.5) {
    log('⚠️  Partial setup. Several items need attention.', 'yellow');
    log('\nRun the initialization script:', 'yellow');
    log('  bash scripts/init-project.sh\n', 'yellow');
  } else {
    log('❌ Setup incomplete. Please follow the setup guide.', 'red');
    log('\nSee: docs/SETUP.md\n', 'red');
  }
  
  process.exit(score === total ? 0 : 1);
}

main();
