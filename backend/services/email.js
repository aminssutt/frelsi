import { createTransport } from 'nodemailer'

// Configuration du transporteur Gmail
const transporter = createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465 (SSL), false for 587 (TLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, // 10 seconds max to connect
  greetingTimeout: 5000, // 5 seconds max for greeting
  socketTimeout: 15000, // 15 seconds max per operation
})

/**
 * Timeout wrapper for promises
 */
function withTimeout(promise, timeoutMs, errorMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ])
}

/**
 * Send authentication code email
 * @param {string} email - Recipient email
 * @param {string} code - 6-digit code
 */
export async function sendAuthCode(email, code) {
  try {
    const info = await withTimeout(
      transporter.sendMail({
        from: `"Frelsi" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🔐 Votre code de connexion Frelsi',
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                background-color: #f7efe6;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background: white;
                border-radius: 16px;
                box-shadow: 0 4px 12px rgba(181, 123, 107, 0.15);
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #b57b6b, #c18a75);
                padding: 40px;
                text-align: center;
                color: white;
              }
              .header h1 {
                margin: 0;
                font-size: 32px;
                font-weight: 700;
                font-family: 'Georgia', serif;
              }
              .content {
                padding: 40px;
                text-align: center;
              }
              .code-box {
                background: #f7efe6;
                border: 2px dashed #b57b6b;
                border-radius: 12px;
                padding: 30px;
                margin: 30px 0;
              }
              .code {
                font-size: 48px;
                font-weight: 700;
                letter-spacing: 8px;
                color: #b57b6b;
                font-family: 'Courier New', monospace;
              }
              .info {
                color: #8c7b73;
                font-size: 14px;
                margin-top: 20px;
              }
              .footer {
                background: #f7efe6;
                padding: 20px;
                text-align: center;
                color: #8c7b73;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Frelsi</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Code de connexion administrateur</p>
              </div>
              <div class="content">
                <p style="font-size: 16px; color: #2c2c2c; margin-bottom: 10px;">
                  Bonjour 👋
                </p>
                <p style="color: #666; font-size: 14px;">
                  Voici votre code de connexion pour accéder à l'administration Frelsi :
                </p>
                <div class="code-box">
                  <div class="code">${code}</div>
                </div>
                <p class="info">
                  ⏱️ Ce code expire dans <strong>10 minutes</strong>
                </p>
                <p class="info">
                  🔒 Si vous n'avez pas demandé ce code, ignorez cet email.
                </p>
              </div>
              <div class="footer">
                <p>© 2025 Frelsi · Made with ❤️</p>
                <p style="margin-top: 10px;">
                  Pensées · Idées · Créations
                </p>
              </div>
            </div>
          </body>
        </html>
      `
      }),
      20000, // 20 second timeout
      'Email sending timeout - SMTP server took too long to respond'
    )

    console.log('✅ Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Email service error:', error)
    throw error
  }
}
