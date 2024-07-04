// emailService.ts
import nodemailer from 'nodemailer';

// Configure the email transport using SMTP
const transporter = nodemailer.createTransport({
  service: 'Gmail', // or any other email service you are using
  auth: {
    user: 'pttpos.system@gmail.com', // your email address
    pass: 'pTT!CT01', // your email password
  },
});

// Function to send OTP email
export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: 'pttpos.system@gmail.com', // sender address
    to: email, // list of receivers
    subject: 'Your OTP Code', // Subject line
    text: `Your OTP code is ${otp}`, // plain text body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending OTP email to ${email}:`, error);
  }
};
