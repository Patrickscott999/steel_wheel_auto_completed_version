const request = require('supertest');
const express = require('express');
const { generateInvoicePdf } = require('../../services/pdf');
const { sendInvoiceEmail } = require('../../services/email');
const { firestore } = require('../../services/firebase');

// Mock dependencies
jest.mock('../../services/pdf', () => ({
  generateInvoicePdf: jest.fn().mockResolvedValue(Buffer.from('fake-pdf-content')),
}));

jest.mock('../../services/email', () => ({
  sendInvoiceEmail: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
}));

jest.mock('../../services/firebase', () => {
  const mockDoc = jest.fn();
  const mockCollection = jest.fn(() => ({ doc: mockDoc }));
  const mockSet = jest.fn().mockResolvedValue(true);
  const mockGet = jest.fn().mockResolvedValue({
    exists: true,
    data: () => ({
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      invoiceDate: '2025-05-05',
      price: 5000
    })
  });
  
  mockDoc.mockReturnValue({
    set: mockSet,
    get: mockGet
  });
  
  return {
    firestore: {
      collection: mockCollection
    }
  };
});

// Mock auth middleware
jest.mock('../../middleware/auth', () => ({
  verifyToken: (req, res, next) => {
    req.user = {
      uid: 'test-user-id',
      email: 'test@example.com'
    };
    next();
  }
}));

describe('Invoice API Endpoints', () => {
  let app;
  
  beforeAll(() => {
    // Create a new express app instance for testing
    app = express();
    app.use(express.json());
    
    // Import and attach routes
    const routes = require('../../routes/invoices');
    app.use('/api/invoices', routes);
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('POST /api/invoices', () => {
    const validInvoiceData = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, Kingston, Jamaica',
      vehicleMake: 'Toyota',
      vehicleModel: 'Corolla',
      vehicleYear: 2020,
      licensePlate: 'ABC123',
      service: 'Oil Change',
      price: 5000,
      invoiceDate: '2025-05-05'
    };
    
    it('should create a new invoice and return 201 status', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send(validInvoiceData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('invoiceNumber');
      expect(generateInvoicePdf).toHaveBeenCalled();
      expect(sendInvoiceEmail).toHaveBeenCalled();
    });
    
    it('should return 400 for invalid input data', async () => {
      const invalidData = { ...validInvoiceData };
      delete invalidData.customerName; // Remove required field
      
      const response = await request(app)
        .post('/api/invoices')
        .send(invalidData);
      
      expect(response.status).toBe(400);
      expect(generateInvoicePdf).not.toHaveBeenCalled();
      expect(sendInvoiceEmail).not.toHaveBeenCalled();
    });
  });
  
  describe('GET /api/invoices/:id', () => {
    it('should retrieve an existing invoice by ID', async () => {
      const response = await request(app)
        .get('/api/invoices/test-invoice-id');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('customerName', 'John Doe');
    });
    
    it('should return 404 for non-existent invoice', async () => {
      // Override mock to return non-existent document
      const { firestore } = require('../../services/firebase');
      const mockDoc = firestore.collection().doc;
      mockDoc.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({
          exists: false
        })
      });
      
      const response = await request(app)
        .get('/api/invoices/non-existent-id');
      
      expect(response.status).toBe(404);
    });
  });
});
