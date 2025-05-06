// Test server that mocks Firebase functionality for testing
require('./setup-test-env'); // Load and configure environment variables

const express = require('express');
const cors = require('cors');
const config = require('./config/config');

// Create Express app
const app = express();

// Enable CORS
app.use(cors(config.server.cors));
app.use(express.json());

// Mock data store
const mockDB = {
  invoices: []
};

// Mock authentication middleware
const authenticateUser = (req, res, next) => {
  // For testing, we'll simulate an authenticated user
  req.user = {
    uid: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User'
  };
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', mode: 'TEST MODE', timestamp: new Date().toISOString() });
});

// Create invoice endpoint
app.post('/api/invoices', authenticateUser, (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerAddress,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      chassisNo,
      engineNo,
      invoiceAmount,
      invoiceDate,
    } = req.body;
    
    // Validate required fields
    const requiredFields = [
      'customerName', 'customerEmail', 'customerAddress', 
      'vehicleMake', 'vehicleModel', 'vehicleYear', 'vehicleColor', 
      'chassisNo', 'engineNo', 'invoiceAmount', 'invoiceDate'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      });
    }
    
    // Create mock invoice
    const invoiceId = `invoice-${Date.now()}`;
    const downloadUrl = `https://example.com/mock-invoice-${invoiceId}.pdf`;
    
    const invoice = {
      id: invoiceId,
      customerName,
      customerEmail,
      customerAddress,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      chassisNo,
      engineNo,
      invoiceAmount: parseFloat(invoiceAmount),
      invoiceDate,
      pdfUrl: downloadUrl,
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid
    };
    
    // Store in mock database
    mockDB.invoices.push(invoice);
    
    // Log email for testing
    console.log('\n📧 MOCK EMAIL SENT');
    console.log(`To: ${customerEmail}, ${config.email.companyEmail}`);
    console.log(`Subject: Your Invoice from Steel Wheel Auto Ltd.`);
    console.log(`Invoice URL: ${downloadUrl}`);
    console.log(`Vehicle: ${vehicleYear} ${vehicleColor} ${vehicleMake} ${vehicleModel}`);
    console.log(`Amount: JMD $${parseFloat(invoiceAmount).toLocaleString()}\n`);
    
    res.status(201).json({
      message: 'Invoice created and sent successfully (TEST MODE)',
      invoiceId: invoiceId,
      pdfUrl: downloadUrl,
      emailId: `mock-email-${Date.now()}`
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice', details: error.message });
  }
});

// Get all invoices endpoint
app.get('/api/invoices', authenticateUser, (req, res) => {
  res.json(mockDB.invoices);
});

// Get specific invoice endpoint
app.get('/api/invoices/:id', authenticateUser, (req, res) => {
  const invoice = mockDB.invoices.find(inv => inv.id === req.params.id);
  
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  
  res.json(invoice);
});

// Delete invoice endpoint
app.delete('/api/invoices/:id', authenticateUser, (req, res) => {
  const invoiceIndex = mockDB.invoices.findIndex(inv => inv.id === req.params.id);
  
  if (invoiceIndex === -1) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  
  mockDB.invoices.splice(invoiceIndex, 1);
  res.json({ message: 'Invoice deleted successfully' });
});

// 404 route
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint '${req.originalUrl}' was not found`
  });
});

// Start the server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`
┌────────────────────────────────────────────────────┐
│                                                    │
│   🧪 TEST SERVER RUNNING IN MOCK MODE              │
│                                                    │
│   - Port: ${PORT}                                  │
│   - Mode: Test (No Firebase connection)            │
│   - Time: ${new Date().toLocaleString()}           │
│                                                    │
│   This server simulates the API without requiring  │
│   real Firebase credentials.                       │
│                                                    │
│   Ready to accept requests!                        │
│                                                    │
└────────────────────────────────────────────────────┘
  `);
});
