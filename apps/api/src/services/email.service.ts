import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendCredentialsEmail = async (email: string, name: string, password: string, orgName: string) => {
  const mailOptions = {
    from: `"VerifyCerts Admin" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Your Organization Account: ${orgName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e1b4b;">
        <h2 style="color: #1e1b4b; border-bottom: 2px solid #F97316; padding-bottom: 10px;">Welcome to VerifyCerts, ${name}!</h2>
        <p>Your organization <strong>${orgName}</strong> has been successfully provisioned on our platform.</p>
        <p>Here are your initial login credentials:</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email Address:</strong> ${email}</p>
          <p style="margin: 10px 0 0 0;"><strong>Initial Password:</strong> <span style="color: #F97316; font-weight: bold;">${password}</span></p>
        </div>
        <p style="font-size: 13px; color: #64748b; font-style: italic;">Note: Please change your password immediately after your first login for security purposes.</p>
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8;">&copy; 2026 VerifyCerts Authentication Portal. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Credentials sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send credentials to ${email}:`, error);
    return false;
  }
};
export const sendCertificateEmail = async (email: string, subject: string, message: string, fileBuffer: Buffer, fileName: string) => {
  const mailOptions = {
    from: `"VerifyCerts Admin" <${process.env.SMTP_USER}>`,
    to: email,
    subject: subject || 'Your Certificate',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e1b4b;">
        <h2 style="color: #1e1b4b; border-bottom: 2px solid #F97316; padding-bottom: 10px;">Your Certificate is Ready!</h2>
        <p>${message || 'Please find your generated certificate attached to this email.'}</p>
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8;">&copy; 2026 VerifyCerts. All rights reserved.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: fileName,
        content: fileBuffer,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Certificate sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send certificate to ${email}:`, error);
    return false;
  }
};
