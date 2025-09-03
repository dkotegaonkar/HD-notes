// utils/email.js

const { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } = require('@getbrevo/brevo');

const emailAPI = new TransactionalEmailsApi();
emailAPI.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

async function sendBrevoEmail({ toEmail, toName, subject, htmlContent, textContent }) {
  const msg = new SendSmtpEmail();
  msg.sender = { email: process.env.SENDER_EMAIL, name: process.env.SENDER_NAME || 'No-Reply' };
  msg.to = [{ email: toEmail, name: toName || '' }];
  msg.subject = subject;
  msg.htmlContent = htmlContent;
  msg.textContent = textContent;

  try {
    const response = await emailAPI.sendTransacEmail(msg);
    console.log('Email sent:', response.body);
    return response.body;
  } catch (error) {
    console.error('Brevo Error:', error.body || error);
    throw error;
  }
}

module.exports = { sendBrevoEmail };
