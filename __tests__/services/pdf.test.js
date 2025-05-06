const { generateInvoicePdf } = require('../../services/pdf');
const { PDFDocument } = require('pdf-lib');

// Mock pdf-lib
jest.mock('pdf-lib', () => {
  const mockDrawText = jest.fn();
  const mockDrawImage = jest.fn();
  const mockEmbedPng = jest.fn().mockResolvedValue({
    scale: jest.fn().mockReturnValue({ width: 100, height: 100 })
  });
  
  const mockPage = {
    getSize: jest.fn().mockReturnValue({ width: 595, height: 842 }),
    drawText: mockDrawText,
    drawImage: mockDrawImage,
    drawLine: jest.fn(),
    drawRectangle: jest.fn()
  };
  
  return {
    PDFDocument: {
      create: jest.fn().mockResolvedValue({
        addPage: jest.fn().mockReturnValue(mockPage),
        embedFont: jest.fn().mockResolvedValue({
          encode: jest.fn()
        }),
        embedPng: mockEmbedPng,
        save: jest.fn().mockResolvedValue(Buffer.from('mock-pdf-content'))
      })
    },
    StandardFonts: {
      Helvetica: 'Helvetica',
      HelveticaBold: 'Helvetica-Bold'
    },
    rgb: jest.fn().mockReturnValue('rgb-color')
  };
});

describe('PDF Generation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should generate a PDF from invoice data', async () => {
    const invoiceData = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, Kingston, Jamaica',
      vehicleMake: 'Toyota',
      vehicleModel: 'Corolla',
      vehicleYear: 2020,
      licensePlate: 'ABC123',
      service: 'Oil Change',
      price: 5000,
      invoiceNumber: 'INV-001',
      invoiceDate: '2025-05-05'
    };
    
    const pdfBuffer = await generateInvoicePdf(invoiceData);
    
    // Verify PDF was created
    expect(PDFDocument.create).toHaveBeenCalled();
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    
    // Verify customer information was added
    const { drawText } = PDFDocument.create().addPage();
    expect(drawText).toHaveBeenCalledWith(expect.stringContaining('STEEL WHEEL AUTO LIMITED'), expect.anything());
    expect(drawText).toHaveBeenCalledWith(expect.stringContaining('John Doe'), expect.anything());
    
    // Verify logo was embedded
    const { embedPng } = PDFDocument.create();
    expect(embedPng).toHaveBeenCalled();
  });
  
  it('should correctly format the price in words', async () => {
    const invoiceData = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, Kingston, Jamaica',
      vehicleMake: 'Toyota',
      vehicleModel: 'Corolla',
      vehicleYear: 2020,
      licensePlate: 'ABC123',
      service: 'Oil Change',
      price: 5000,
      invoiceNumber: 'INV-001',
      invoiceDate: '2025-05-05'
    };
    
    await generateInvoicePdf(invoiceData);
    
    // Verify price in words was displayed
    const { drawText } = PDFDocument.create().addPage();
    expect(drawText).toHaveBeenCalledWith(expect.stringContaining('Five Thousand'), expect.anything());
  });
});
