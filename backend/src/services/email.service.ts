import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(options: {
  to:      string;
  subject: string;
  html:    string;
}): Promise<void> {
  await transporter.sendMail({
    from:    process.env.SMTP_FROM || 'Doctor SaaS <noreply@doctorsaas.com>',
    to:      options.to,
    subject: options.subject,
    html:    options.html,
  });
}

export function appointmentConfirmationEmail(patientName: string, doctorName: string, date: string, time: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0066cc;">Appointment Confirmed</h2>
      <p>Dear ${patientName},</p>
      <p>Your appointment has been confirmed with the following details:</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; font-weight: bold;">Doctor:</td><td>Dr. ${doctorName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Date:</td><td>${date}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Time:</td><td>${time}</td></tr>
      </table>
      <p>Please arrive 10 minutes before your appointment time.</p>
    </div>
  `;
}

export function appointmentCancelledEmail(patientName: string, date: string, reason: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #cc0000;">Appointment Cancelled</h2>
      <p>Dear ${patientName},</p>
      <p>Your appointment on <strong>${date}</strong> has been cancelled.</p>
      ${reason ? `<p>Reason: ${reason}</p>` : ''}
      <p>Please book a new appointment at your convenience.</p>
    </div>
  `;
}
