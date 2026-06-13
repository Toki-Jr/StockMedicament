const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: `"Mon App" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Votre code de vérification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Vérification de votre email</h2>
        <p>Votre code OTP valable <strong>10 minutes</strong> :</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                    padding: 20px; background: #f4f4f4; text-align: center;
                    border-radius: 8px;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 12px;">Ne partagez ce code avec personne.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };