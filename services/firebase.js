// Firebase service integration
const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const config = require('../config/config');

// Initialize Firebase app if not already initialized
function initializeFirebase() {
  if (!admin.apps.length) {
    // Validate required Firebase config
    if (!config.firebase.projectId || !config.firebase.clientEmail || !config.firebase.privateKey) {
      throw new Error('Missing required Firebase configuration. Check your environment variables.');
    }
    
    // Properly format private key from environment variable
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : config.firebase.privateKey;
      
    const firebaseConfig = {
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: privateKey,
      }),
      storageBucket: config.firebase.storageBucket
    };

    admin.initializeApp(firebaseConfig);
  }

  return {
    db: admin.firestore(),
    storage: getStorage().bucket(),
    auth: admin.auth()
  };
}

// Export initialized Firebase services
const { db, storage, auth } = initializeFirebase();

module.exports = {
  admin,
  db,
  storage,
  auth,
  
  // Authentication middleware
  authenticateUser: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
      }
      
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  },

  // Upload PDF to Firebase Storage
  uploadPdf: async (pdfBuffer, userId) => {
    const fileName = `invoices/${userId}_${Date.now()}.pdf`;
    const file = storage.file(fileName);
    
    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
      },
    });
    
    // Get download URL (expires in 1 year)
    const [downloadUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    });
    
    return { fileName, downloadUrl };
  }
};
