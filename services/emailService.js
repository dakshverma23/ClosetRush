const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles sending emails using Nodemailer
 */

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send email
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email plain text content (optional)
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"ClosetRush" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send account locked notification
 */
const sendAccountLockedEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1890ff;">Account Temporarily Locked</h2>
      <p>Hello ${user.name},</p>
      <p>Your ClosetRush account has been temporarily locked due to multiple failed login attempts.</p>
      <p>For security reasons, your account will be automatically unlocked in 30 minutes.</p>
      <p>If you did not attempt to log in, please contact our support team immediately.</p>
      <br>
      <p>Best regards,<br>The ClosetRush Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Account Temporarily Locked - ClosetRush',
    html
  });
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1890ff;">Welcome to ClosetRush!</h2>
      <p>Hello ${user.name},</p>
      <p>Thank you for registering with ClosetRush. We're excited to have you on board!</p>
      <p>You can now browse our subscription bundles and start enjoying fresh, clean bedding delivered to your doorstep.</p>
      <br>
      <p>Best regards,<br>The ClosetRush Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Welcome to ClosetRush!',
    html
  });
};

module.exports = {
  sendEmail,
  sendAccountLockedEmail,
  sendWelcomeEmail
};
