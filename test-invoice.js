// Test script for invoice generation
require('dotenv').config();
const fetch = require('node-fetch');

async function testInvoiceCreation() {
  try {
    // You'll need to get a valid Firebase ID token for testing
    // This can be done by implementing a login flow or using Firebase Admin to create a custom token
    const idToken = 'YOUR_FIREBASE_ID_TOKEN'; // Replace with actual token
    
    const invoiceData = {
      customerName: "John Doe",
      customerEmail: "test@example.com", // Use a test email
      customerAddress: "123 Main Street, Kingston, Jamaica",
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      vehicleYear: "2023",
      vehicleColor: "Silver",
      chassisNo: "ABC123456789",
      engineNo: "XYZ123456789",
      invoiceAmount: 2500000, // JMD $2,500,000
      invoiceDate: new Date().toISOString().split('T')[0] // Today's date
    };
    
    const response = await fetch('http://localhost:3000/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(invoiceData)
    });
    
    const result = await response.json();
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Invoice created successfully!');
      console.log('PDF URL:', result.pdfUrl);
      console.log('Email ID:', result.emailId);
    } else {
      console.error('❌ Failed to create invoice:', result.error);
    }
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Uncomment to run the test
// testInvoiceCreation();

console.log('To run this test:');
console.log('1. Make sure your server is running: npm run server:dev');
console.log('2. Replace YOUR_FIREBASE_ID_TOKEN with a valid token');
console.log('3. Uncomment the testInvoiceCreation() function call');
console.log('4. Run: node test-invoice.js');
