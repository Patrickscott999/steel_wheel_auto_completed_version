// This script helps set up the correct environment variables for testing
require('dotenv').config();

// Map the Next.js environment variables to the ones our backend expects
process.env.FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
process.env.FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

// Check which variables are missing
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_STORAGE_BUCKET',
  'RESEND_API_KEY'
];

const missing = requiredVars.filter(name => !process.env[name]);

if (missing.length > 0) {
  console.log('⚠️ Missing environment variables:');
  missing.forEach(name => console.log(`  - ${name}`));
  console.log('\nPlease add these to your .env file. For testing purposes, you can:');
  console.log('1. Use a service account JSON file from Firebase Console');
  console.log('2. For quick testing, you can set dummy values just to start the server\n');
  
  // For testing purposes, set dummy values for missing variables
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    console.log('Setting dummy FIREBASE_CLIENT_EMAIL for testing');
    process.env.FIREBASE_CLIENT_EMAIL = 'test@example.com';
  }
  
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    console.log('Setting dummy FIREBASE_PRIVATE_KEY for testing');
    process.env.FIREBASE_PRIVATE_KEY = 'dummy-key';
  }
} else {
  console.log('✅ All required environment variables are set!');
}

// Update our config module to use these environment variables
const config = require('./config/config');

console.log('\nEnvironment variables status:');
console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅' : '❌');
console.log('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅' : '❌');
console.log('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅' : '❌');
console.log('- FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET ? '✅' : '❌');
console.log('- RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅' : '❌');

console.log('\nNote: For actual production use, you need real Firebase service account credentials.');
