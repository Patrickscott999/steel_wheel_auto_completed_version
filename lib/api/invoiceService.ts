// Invoice API service for connecting to the backend
import { getIdToken } from '../firebase';

// API base URL - pointing to our Express backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Types
export interface InvoiceFormData {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  chassisNumber: string; // Note: backend uses chassisNo
  engineNumber: string; // Note: backend uses engineNo
  amount: string; // Note: backend uses invoiceAmount
}

export interface Invoice {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  chassisNo: string;
  engineNo: string;
  invoiceAmount: number;
  invoiceDate: string;
  pdfUrl: string;
  createdAt: string;
  createdBy: string;
}

// Helper function to get authorization headers
const getAuthHeaders = async () => {
  const token = await getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Create a new invoice
export const createInvoice = async (invoiceData: InvoiceFormData): Promise<Invoice> => {
  try {
    // Transform form data to match backend expectations
    const payload = {
      customerName: invoiceData.customerName,
      customerEmail: invoiceData.customerEmail,
      customerAddress: invoiceData.customerAddress,
      vehicleMake: invoiceData.vehicleMake,
      vehicleModel: invoiceData.vehicleModel,
      vehicleYear: invoiceData.vehicleYear,
      vehicleColor: invoiceData.vehicleColor,
      chassisNo: invoiceData.chassisNumber,
      engineNo: invoiceData.engineNumber,
      invoiceAmount: parseFloat(invoiceData.amount),
      invoiceDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    };

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create invoice');
    }

    return response.json();
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    throw new Error(`Invoice creation failed: ${error.message}`);
  }
};

// Get all invoices
export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch invoices');
    }

    return response.json();
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }
};

// Get a specific invoice
export const getInvoice = async (invoiceId: string): Promise<Invoice> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch invoice');
    }

    return response.json();
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    throw new Error(`Failed to fetch invoice: ${error.message}`);
  }
};

// Delete an invoice
export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete invoice');
    }
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    throw new Error(`Failed to delete invoice: ${error.message}`);
  }
};

// Resend an invoice email
export const resendInvoiceEmail = async (invoiceId: string): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/resend`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to resend invoice email');
    }

    return response.json();
  } catch (error: any) {
    console.error('Error resending invoice email:', error);
    throw new Error(`Failed to resend invoice email: ${error.message}`);
  }
};
