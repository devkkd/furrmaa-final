import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // If email configuration is not provided, return null
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // For development, set to true in production
    },
  });
};

/**
 * Send OTP email
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
 * @returns {Promise<boolean>} - Returns true if email sent successfully
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn('⚠️  Email configuration not found. OTP email not sent.');
      console.log(`📧 OTP for ${email}: ${otp}`);
      return false;
    }

    const mailOptions = {
      from: `"Furmaa" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code - Furmaa',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Code - Furmaa</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Furmaa</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Your OTP Code</h2>
            <p>Hello,</p>
            <p>Your One-Time Password (OTP) for Furmaa is:</p>
            <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            <p>This OTP is valid for <strong>5 minutes</strong>.</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              If you didn't request this OTP, please ignore this email.
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Your OTP Code - Furmaa
        
        Hello,
        
        Your One-Time Password (OTP) for Furmaa is: ${otp}
        
        This OTP is valid for 5 minutes.
        
        If you didn't request this OTP, please ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}:`, info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    // Don't throw error, just log it and return false
    // In development, we still want to show OTP in console
    console.log(`📧 OTP for ${email}: ${otp}`);
    return false;
  }
};

/**
 * Verify email configuration
 * @returns {Promise<boolean>} - Returns true if email is configured
 */
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return false;
    }
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.warn('⚠️  Email service not available:', error.message);
    return false;
  }
};

export default { sendOTPEmail, verifyEmailConfig };









