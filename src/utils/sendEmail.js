// utils/sendEmail.js

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "ninjarapper960@gmail.com", // your Gmail
    pass: "qyqebeoeuinchrdx", // app password
  },
   logger: true,
  debug: true,
});

const getOtpHtmlTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background: #f9f9f9;">
    <div style="text-align: center;">
      <h2 style="color: #e63946;">Guthbandhan.com</h2>
      <p style="font-size: 18px; color: #333;">Namaste 👋</p>
      <p style="font-size: 16px;">You're just one step away from resetting your password.</p>
      <p style="font-size: 18px; font-weight: bold; margin: 20px 0;">Your OTP Code is:</p>
      <div style="font-size: 32px; font-weight: bold; color: #1d3557;">${otp}</div>
      <p style="margin-top: 20px; font-size: 14px; color: #555;">This OTP is valid for 10 minutes.</p>
      <p style="margin-top: 40px; font-size: 14px; color: #888;">If you didn’t request this, please ignore this email.</p>
      <hr style="margin: 30px 0;">
      <p style="font-size: 13px; color: #aaa;">Thank you,<br/>Team Guthbandhan.com</p>
    </div>
  </div>
`;

const sendEmail = async (to, subject, otp) => {
  await transporter.sendMail({
    from: `"Guthbandhan Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: getOtpHtmlTemplate(otp),
  });
};

export default sendEmail;
