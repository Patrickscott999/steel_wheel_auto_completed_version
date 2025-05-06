const { sendInvoiceEmail } = require('../../services/email');
const { Resend } = require('resend');

// Mock the Resend library
jest.mock('resend', () => {
  const mockEmails = {
    send: jest.fn().mockResolvedValue({ id: 'mock-email-id', status: 'success' })
  };
  
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: mockEmails
    }))
  };
});

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should send an invoice email to customer and company', async () => {
    const invoiceData = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      invoiceNumber: 'INV-001',
      invoiceDate: '2025-05-05',
      price: 5000
    };
    
    const pdfBuffer = Buffer.from('mock-pdf-content');
    
    const result = await sendInvoiceEmail(invoiceData, pdfBuffer);
    
    // Verify Resend was initialized
    expect(Resend).toHaveBeenCalled();
    
    // Verify email was sent
    const mockResendInstance = new Resend();
    expect(mockResendInstance.emails.send).toHaveBeenCalledTimes(1);
    
    // Verify correct recipients
    const sendArgs = mockResendInstance.emails.send.mock.calls[0][0];
    expect(sendArgs.to).toContain('john@example.com');
    expect(sendArgs.bcc).toContain('steelwheelauto@gmail.com');
    
    // Verify email has subject with invoice number
    expect(sendArgs.subject).toContain('INV-001');
    
    // Verify PDF attachment was included
    expect(sendArgs.attachments).toHaveLength(1);
    expect(sendArgs.attachments[0].filename).toContain('invoice');
    
    // Verify result has email ID
    expect(result).toHaveProperty('id', 'mock-email-id');
  });
  
  it('should handle errors when sending email', async () => {
    // Override mock to simulate error
    const mockError = new Error('Failed to send email');
    const mockResendInstance = new Resend();
    mockResendInstance.emails.send.mockRejectedValueOnce(mockError);
    
    const invoiceData = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      invoiceNumber: 'INV-001'
    };
    
    const pdfBuffer = Buffer.from('mock-pdf-content');
    
    // Test that the service handles errors properly
    await expect(sendInvoiceEmail(invoiceData, pdfBuffer)).rejects.toThrow('Failed to send email');
  });
});
