#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing deployment configuration...\n');

// Check if render.yaml exists
if (fs.existsSync('render.yaml')) {
  console.log('✅ render.yaml found');
} else {
  console.log('❌ render.yaml not found');
  process.exit(1);
}

// Check if backend package.json exists
if (fs.existsSync('backend/package.json')) {
  console.log('✅ backend/package.json found');
} else {
  console.log('❌ backend/package.json not found');
  process.exit(1);
}

// Check if frontend package.json exists
if (fs.existsSync('frontend/package.json')) {
  console.log('✅ frontend/package.json found');
} else {
  console.log('❌ frontend/package.json not found');
  process.exit(1);
}

// Check if backend server.js exists
if (fs.existsSync('backend/server.js')) {
  console.log('✅ backend/server.js found');
} else {
  console.log('❌ backend/server.js not found');
  process.exit(1);
}

// Check if frontend vite.config.js exists
if (fs.existsSync('frontend/vite.config.js')) {
  console.log('✅ frontend/vite.config.js found');
} else {
  console.log('❌ frontend/vite.config.js not found');
  process.exit(1);
}

// Check if API utility exists
if (fs.existsSync('frontend/src/utils/api.js')) {
  console.log('✅ frontend/src/utils/api.js found');
} else {
  console.log('❌ frontend/src/utils/api.js not found');
  process.exit(1);
}

console.log('\n🎉 All deployment files are present!');
console.log('\n📋 Next steps:');
console.log('1. Push your code to a Git repository');
console.log('2. Go to render.com and create a new Blueprint');
console.log('3. Connect your repository');
console.log('4. Deploy!');
console.log('\n📖 See DEPLOYMENT.md for detailed instructions'); 