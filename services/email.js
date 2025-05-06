// Email service using Resend
const { Resend } = require('resend');
const config = require('../config/config');

// Initialize Resend client
const resend = new Resend(config.email.resendApiKey);

/**
 * Send invoice email to customer and company
 * @param {Object} params Email parameters
 * @param {string} params.customerName Customer's full name
 * @param {string} params.customerEmail Customer's email address
 * @param {string} params.downloadUrl URL to download the PDF
 * @param {string} params.vehicleYear Vehicle year
 * @param {string} params.vehicleColor Vehicle color
 * @param {string} params.vehicleMake Vehicle make
 * @param {string} params.vehicleModel Vehicle model
 * @param {string} params.chassisNo Vehicle chassis number
 * @param {string} params.engineNo Vehicle engine number
 * @param {number} params.invoiceAmount Invoice amount in JMD
 * @returns {Promise<Object>} Resend API response
 */
async function sendInvoiceEmail(params) {
  const {
    customerName,
    customerEmail,
    downloadUrl,
    vehicleYear,
    vehicleColor,
    vehicleMake,
    vehicleModel,
    chassisNo,
    engineNo,
    invoiceAmount
  } = params;
  
  try {
    // Validate email API key
    if (!config.email.resendApiKey) {
      throw new Error('Missing Resend API key. Check your environment variables.');
    }

    const emailData = await resend.emails.send({
      from: config.email.fromEmail,
      to: [customerEmail, config.email.companyEmail],
      subject: 'Your Invoice from Steel Wheel Auto Ltd.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333;">Steel Wheel Auto Limited</h2>
            <p style="color: #777;">Invoice Confirmation</p>
          </div>
          
          <p>Dear ${customerName},</p>
          <p>Thank you for choosing Steel Wheel Auto Limited. Your invoice has been prepared and is ready for your review.</p>
          <p><a href="${downloadUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Download Invoice</a></p>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <h3 style="color: #333;">Vehicle Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Vehicle:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${vehicleYear} ${vehicleColor} ${vehicleMake} ${vehicleModel}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Chassis No:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${chassisNo}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Engine No:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${engineNo}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">JMD $${parseFloat(invoiceAmount).toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <p style="margin-top: 30px;">If you have any questions regarding your invoice, please don't hesitate to contact us.</p>
          <p>Thank you for doing business with Steel Wheel Auto Limited.</p>
          
          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #777; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Steel Wheel Auto Limited. All Rights Reserved.</p>
            <p>Kingston, Jamaica</p>
          </div>
        </div>
      `
    });
    
    return emailData;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

module.exports = {
  sendInvoiceEmail
};
