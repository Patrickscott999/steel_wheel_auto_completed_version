const express = require('express');
const router = express.Router();

// Import services
const { db, storage, authenticateUser } = require('../services/firebase');
const { generateInvoicePdf } = require('../services/pdf');
const { sendInvoiceEmail } = require('../services/email');
const admin = require('firebase-admin');

// Create new invoice
router.post('/', authenticateUser, async (req, res) => {
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
    
    // Generate PDF
    const invoiceData = {
      ...req.body,
      invoiceAmount: parseFloat(invoiceAmount)
    };
    
    const pdfBuffer = await generateInvoicePdf(invoiceData);
    
    // Upload to Firebase Storage
    const { fileName, downloadUrl } = await require('../services/firebase').uploadPdf(pdfBuffer, req.user.uid);
    
    // Save to Firestore
    const invoiceRef = await db.collection('invoices').add({
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid
    });
    
    // Send email with Resend
    const emailData = await sendInvoiceEmail({
      customerName,
      customerEmail,
      downloadUrl,
      vehicleYear, 
      vehicleColor,
      vehicleMake,
      vehicleModel,
      chassisNo,
      engineNo,
      invoiceAmount: parseFloat(invoiceAmount)
    });
    
    res.status(201).json({
      message: 'Invoice created and sent successfully',
      invoiceId: invoiceRef.id,
      pdfUrl: downloadUrl,
      emailId: emailData.id
    });
    
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice', details: error.message });
  }
});

// Get all invoices for the authenticated user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const invoicesSnapshot = await db.collection('invoices')
      .where('createdBy', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const invoices = [];
    invoicesSnapshot.forEach(doc => {
      invoices.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices', details: error.message });
  }
});

// Get a specific invoice by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
    
    if (!invoiceDoc.exists) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Check if the requesting user is the creator of the invoice
    const invoiceData = invoiceDoc.data();
    if (invoiceData.createdBy !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized access to invoice' });
    }
    
    res.json({
      id: invoiceDoc.id,
      ...invoiceData
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice', details: error.message });
  }
});

// Delete an invoice
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
    
    if (!invoiceDoc.exists) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Check if the requesting user is the creator of the invoice
    const invoiceData = invoiceDoc.data();
    if (invoiceData.createdBy !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized access to invoice' });
    }
    
    // Extract file path from the URL to delete from storage
    if (invoiceData.pdfUrl) {
      const fileName = invoiceData.pdfUrl.split('/').pop().split('?')[0];
      try {
        // Delete from storage
        await storage.file(`invoices/${fileName}`).delete();
      } catch (storageError) {
        console.warn('Error deleting file from storage:', storageError);
        // Continue with deletion even if file removal fails
      }
    }
    
    // Delete from Firestore
    await db.collection('invoices').doc(invoiceId).delete();
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice', details: error.message });
  }
});

// Resend invoice email
router.post('/:id/resend', authenticateUser, async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoiceDoc = await db.collection('invoices').doc(invoiceId).get();
    
    if (!invoiceDoc.exists) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Check if the requesting user is the creator of the invoice
    const invoiceData = invoiceDoc.data();
    if (invoiceData.createdBy !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized access to invoice' });
    }
    
    // Resend email
    const emailData = await sendInvoiceEmail({
      customerName: invoiceData.customerName,
      customerEmail: invoiceData.customerEmail,
      downloadUrl: invoiceData.pdfUrl,
      vehicleYear: invoiceData.vehicleYear,
      vehicleColor: invoiceData.vehicleColor,
      vehicleMake: invoiceData.vehicleMake,
      vehicleModel: invoiceData.vehicleModel,
      chassisNo: invoiceData.chassisNo,
      engineNo: invoiceData.engineNo,
      invoiceAmount: invoiceData.invoiceAmount
    });
    
    res.json({
      message: 'Invoice email resent successfully',
      emailId: emailData.id
    });
  } catch (error) {
    console.error('Error resending invoice email:', error);
    res.status(500).json({ error: 'Failed to resend invoice email', details: error.message });
  }
});

module.exports = router;
