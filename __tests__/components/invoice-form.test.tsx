import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InvoiceForm } from '@/components/invoice-form';
import * as invoiceService from '@/lib/api/invoiceService';

// Mock the invoice service
jest.mock('@/lib/api/invoiceService', () => ({
  createInvoice: jest.fn(),
}));

describe('InvoiceForm Component', () => {
  const mockOnInvoiceGenerated = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the invoice form with all fields', () => {
    render(<InvoiceForm onInvoiceGenerated={mockOnInvoiceGenerated} />);
    
    // Customer section
    expect(screen.getByLabelText(/customer name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/customer address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/customer email/i)).toBeInTheDocument();
    
    // Vehicle section
    expect(screen.getByLabelText(/vehicle make/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vehicle model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vehicle year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/license plate/i)).toBeInTheDocument();
    
    // Services section and submit button
    expect(screen.getByLabelText(/service description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate invoice/i })).toBeInTheDocument();
  });
  
  it('validates form fields before submission', async () => {
    render(<InvoiceForm onInvoiceGenerated={mockOnInvoiceGenerated} />);
    
    // Submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /generate invoice/i }));
    
    // Check that validation errors appear
    await waitFor(() => {
      expect(screen.getByText(/customer name is required/i)).toBeInTheDocument();
      expect(invoiceService.createInvoice).not.toHaveBeenCalled();
    });
  });
  
  it('submits form data and calls onInvoiceGenerated when valid', async () => {
    const mockInvoiceData = {
      id: '123456',
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
      invoiceDate: '2025-05-05',
    };
    
    (invoiceService.createInvoice as jest.Mock).mockResolvedValue(mockInvoiceData);
    
    render(<InvoiceForm onInvoiceGenerated={mockOnInvoiceGenerated} />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/customer name/i), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText(/customer email/i), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/customer address/i), {
      target: { value: '123 Main St, Kingston, Jamaica' }
    });
    
    fireEvent.change(screen.getByLabelText(/vehicle make/i), {
      target: { value: 'Toyota' }
    });
    
    fireEvent.change(screen.getByLabelText(/vehicle model/i), {
      target: { value: 'Corolla' }
    });
    
    fireEvent.change(screen.getByLabelText(/vehicle year/i), {
      target: { value: '2020' }
    });
    
    fireEvent.change(screen.getByLabelText(/license plate/i), {
      target: { value: 'ABC123' }
    });
    
    fireEvent.change(screen.getByLabelText(/service description/i), {
      target: { value: 'Oil Change' }
    });
    
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '5000' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /generate invoice/i }));
    
    // Check that the service was called with correct data and callback triggered
    await waitFor(() => {
      expect(invoiceService.createInvoice).toHaveBeenCalledWith(expect.objectContaining({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        vehicleMake: 'Toyota',
        price: 5000
      }));
      expect(mockOnInvoiceGenerated).toHaveBeenCalledWith(mockInvoiceData);
    });
  });
});
