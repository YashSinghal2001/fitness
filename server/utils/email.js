const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("📨 Sending email to:", options.email);

    const info = await transporter.sendMail({
      from: `"ATHLIX Fitness" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
    throw error;
  }
};

module.exports = sendEmail;