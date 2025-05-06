// PDF generation service
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// Helper to convert number to words
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  function convertLessThanThousand(n) {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  }
  
  let result = '';
  let chunk = 0;
  const chunks = ['', ' Thousand', ' Million', ' Billion'];
  
  while (num > 0) {
    if (num % 1000 !== 0) {
      result = convertLessThanThousand(num % 1000) + chunks[chunk] + (result ? ' ' + result : '');
    }
    num = Math.floor(num / 1000);
    chunk++;
  }
  
  return result;
}

// Base64 encoded Steel Wheel Auto logo
const steelWheelLogoBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAMAAAC3Ycb+AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURUdwTBMZORIYNRcbMRIYNhIYNhIYNhIYNhIYNhIYNhIYNRIYNhIYNhIYNg8aNBEZNh8TLhIYNhEZNRIYNxIYNhEZNhIYNhIYNhIYNhEYNxIYNhEYNhIYNhIYNhIZNxIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhEXNRIYNhIYNhIXNRIYNRMZNRIYNhIYNxIYNhIYNhIYNhIYNhIYNxIYNhIYNhIYNhIYNhEZNRIYNhEZNhIYNhIYNhEYNhIYNhIYNhIZNhIYNhIYNhIYNhIYNhIYNhIXNhAWNRIYNhIYNhIYNhIYNhIYNg8YNhIYNhEYNRIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhEYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhEYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhEXNhIYNhIYNhIYNhIYNhIYNhIYNhEXNhIYNhIYNhEYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhEYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhIYNhEYNhIYNhIYNhIYNhIYNhIYNhIYNgMDA58AAAEAdFJOUwD/A/7+AvwB/Pv9+vz7+v36/f3+/v77/vr+/Pv9+/z8/P79/fz9+/v9+/r+/vv8/vv+/fv8+/r+/f7+/v78/f37/v78/f78/f7+/f78/Pv8+/7+/v38/fz+/vz8/f7+/v7+/v7+/vz+/f78/fz7/v38/f7+/vz+//z+/vz8/f7+/vz8/v78/vz9/v7+/v79/vz+/v7+/f78/f78/f79/P38/v3+/v77/f78/vz9/f78/P7+/f7+/vz9/v79/fr8/v7+/v3+/v7+/v3+/vz+/v3+/fr9/f38/v38/vz+/v36/v7+/v3+/v7+/fz+/vr+/Pz+/P7+/v77/f7+/v3+/f7+/v38/v7+/Pz+/v7+/vz+/f38/v3+/v7+/v7+/v7+/v7+/vz+/v7+/v7+/v7++/7+/v7+/v7+/v7+/v78/v7+/v7+/v79/v7+/v7+/v78/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+h6CNfAAAAeZJREFUeNrswYEAAAAAgKD9qRepAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZsEMAv0P3+UAAAAASUVORK5CYII=';

// Generate PDF from invoice data
async function generateInvoicePdf(invoiceData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Add Steel Wheel Auto logo
  try {
    // Convert base64 to binary
    const logoImageBytes = Buffer.from(steelWheelLogoBase64, 'base64');
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    const logoDims = logoImage.scale(0.25); // Scale the logo appropriately
    
    // Position in top right corner
    page.drawImage(logoImage, {
      x: width - logoDims.width - 50,
      y: height - logoDims.height - 50,
      width: logoDims.width,
      height: logoDims.height,
    });
  } catch (error) {
    console.error('Error adding logo to invoice:', error);
  }
  
  // Add header
  page.drawText('STEEL WHEEL AUTO LIMITED', {
    x: 50,
    y: height - 50,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('INVOICE', {
    x: 50,
    y: height - 80,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  const date = new Date(invoiceData.invoiceDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  page.drawText(`Date: ${date}`, {
    x: 50,
    y: height - 110,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Customer information
  page.drawText('CUSTOMER INFORMATION', {
    x: 50,
    y: height - 150,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`Name: ${invoiceData.customerName}`, {
    x: 50,
    y: height - 170,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`Address: ${invoiceData.customerAddress}`, {
    x: 50,
    y: height - 190,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`Email: ${invoiceData.customerEmail}`, {
    x: 50,
    y: height - 210,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Vehicle information
  page.drawText('VEHICLE DETAILS', {
    x: 50,
    y: height - 250,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  const vehicleDescription = `${invoiceData.vehicleYear} ${invoiceData.vehicleColor} ${invoiceData.vehicleMake} ${invoiceData.vehicleModel}`;
  
  page.drawText(`Vehicle: ${vehicleDescription}`, {
    x: 50,
    y: height - 270,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`Chassis No: ${invoiceData.chassisNo}`, {
    x: 50,
    y: height - 290,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(`Engine No: ${invoiceData.engineNo}`, {
    x: 50,
    y: height - 310,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Agreement text
  const amountInWords = numberToWords(invoiceData.invoiceAmount);
  const agreementText = `I ${invoiceData.customerName} of ${invoiceData.customerAddress} agree to purchase a ${vehicleDescription} Motor Vehicle in the amount of ${amountInWords} JMD $${invoiceData.invoiceAmount.toLocaleString()}.`;
  
  // Split the agreement text to fit the page width
  const maxWidth = width - 100;
  const fontSize = 10;
  const words = agreementText.split(' ');
  let line = '';
  let lines = [];
  let y = height - 370;
  
  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (lineWidth > maxWidth && line !== '') {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  
  // Draw the agreement text
  lines.forEach((line, i) => {
    page.drawText(line, {
      x: 50,
      y: y - i * 15,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
  });
  
  // Bank information
  const bankInfo = config.pdf.bankInfo;
  y -= (lines.length + 2) * 15;
  
  page.drawText(bankInfo, {
    x: 50,
    y,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Signature lines
  y -= 60;
  page.drawLine({
    start: { x: 50, y },
    end: { x: 250, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Customer Signature', {
    x: 50,
    y: y - 15,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawLine({
    start: { x: 350, y },
    end: { x: 550, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Steel Wheel Auto Representative', {
    x: 350,
    y: y - 15,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = {
  generateInvoicePdf,
  numberToWords
};
