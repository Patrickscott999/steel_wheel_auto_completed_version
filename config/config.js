/**
 * Application configuration
 * Loads environment variables with sensible defaults
 */

require('dotenv').config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },
  
  // Firebase configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? 
      process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  },
  
  // Email configuration
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'Steel Wheel Auto Ltd. <invoices@steelwheelauto.com>',
    companyEmail: process.env.COMPANY_EMAIL || 'steelwheelauto@gmail.com'
  },
  
  // PDF configuration
  pdf: {
    bankInfo: process.env.BANK_INFO || 'Payment should be made to: Steel Wheel Auto Limited, Account #12345678, Bank of Jamaica.'
  }
};
