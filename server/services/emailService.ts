import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email functionality will not work.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send a booking confirmation email to the customer
 */
export async function sendBookingConfirmationEmail(booking: any) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Cannot send booking confirmation email: SENDGRID_API_KEY not set");
    return false;
  }

  try {
    console.log(`Attempting to send confirmation email to customer: ${booking.email}`);

    const fromEmail = process.env.EMAIL_FROM || 'bookings@pictureperfecttv.com';
    console.log(`Using sender email: ${fromEmail}`);

    const msg = {
      to: booking.email,
      from: fromEmail,
      subject: 'Booking Confirmed - Picture Perfect TV Install',
      text: getPlainTextConfirmation(booking),
      html: getHtmlConfirmation(booking),
    };

    console.log("Customer email payload:", JSON.stringify({
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    }));

    await sgMail.send(msg);
    console.log(`Booking confirmation email sent to ${booking.email}`);
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    if (error.response) {
      console.error('SendGrid API error response:', error.response.body);
    }
    return false;
  }
}

function getPlainTextConfirmation(booking: any): string {
  const appointmentDate = new Date(booking.preferredDate);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let emailText = `
Booking Confirmation - Picture Perfect TV Install

Dear ${booking.name},

Thank you for choosing Picture Perfect TV Install! Your appointment has been confirmed.

APPOINTMENT DETAILS
Date: ${formattedDate}
Time: ${booking.appointmentTime}
Service: ${booking.serviceType}

LOCATION
${booking.streetAddress}
${booking.addressLine2 ? booking.addressLine2 + '\n' : ''}${booking.city}, ${booking.state} ${booking.zipCode}

NEXT STEPS
1. Our technician will arrive during your selected time slot
2. Please ensure the installation area is accessible
3. Have your TV and any mounting hardware ready if you're providing them

If you need to reschedule or cancel your appointment, please contact us at +16782632859.

Thank you for choosing Picture Perfect TV Install! We look forward to providing you with excellent service.

Best regards,
The Picture Perfect TV Install Team
  `;

  return emailText;
}

function getHtmlConfirmation(booking: any): string {
  const appointmentDate = new Date(booking.preferredDate);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      background-color: #f9fafb;
    }
    .header { 
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .logo {
      width: 120px;
      height: auto;
      margin-bottom: 20px;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .appointment-details {
      background-color: #f0f9ff;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #3b82f6;
    }
    .location-details {
      background-color: #f0f9ff;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #3b82f6;
    }
    .next-steps {
      background-color: #f0f9ff;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .next-steps ul {
      list-style-type: none;
      padding-left: 0;
    }
    .next-steps li {
      margin-bottom: 10px;
      padding-left: 25px;
      position: relative;
    }
    .next-steps li:before {
      content: "✓";
      color: #3b82f6;
      position: absolute;
      left: 0;
    }
    .contact-info {
      text-align: center;
      background-color: #f0f9ff;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      font-size: 12px;
      text-align: center;
      margin-top: 30px;
      color: #666;
      padding: 20px;
    }
    h1 { margin: 0; font-size: 24px; }
    h2 { color: #1e40af; font-size: 20px; margin-top: 0; }
    .highlight { color: #1e40af; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your Booking is Confirmed!</h1>
  </div>

  <div class="content">
    <p>Dear <span class="highlight">${booking.name}</span>,</p>

    <p>Thank you for choosing Picture Perfect TV Install! We're excited to help you with your installation needs.</p>

    <div class="appointment-details">
      <h2>📅 Appointment Details</h2>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${booking.appointmentTime}</p>
      <p><strong>Service:</strong> ${booking.serviceType}</p>
    </div>

    <div class="location-details">
      <h2>📍 Installation Location</h2>
      <p>${booking.streetAddress}</p>
      ${booking.addressLine2 ? `<p>${booking.addressLine2}</p>` : ''}
      <p>${booking.city}, ${booking.state} ${booking.zipCode}</p>
    </div>

    <div class="next-steps">
      <h2>🔍 Next Steps</h2>
      <ul>
        <li>Our technician will arrive during your selected time slot</li>
        <li>Please ensure the installation area is accessible</li>
        <li>Have your TV and any mounting hardware ready if you're providing them</li>
        <li>Clear the workspace area for efficient installation</li>
      </ul>
    </div>

    <div class="contact-info">
      <h2>📞 Need to Make Changes?</h2>
      <p>If you need to reschedule or have any questions, please call us at:<br>
      <strong>+16782632859</strong></p>
    </div>

    <p style="text-align: center;">We look forward to providing you with excellent service!</p>
  </div>

  <div class="footer">
    <p>© ${new Date().getFullYear()} Picture Perfect TV Install. All rights reserved.</p>
    <p>Professional TV Mounting Services in Metro Atlanta</p>
  </div>
</body>
</html>
  `;

  return emailHtml;
}

/**
 * Send an admin notification email about a new booking
 */
export async function sendAdminBookingNotificationEmail(booking: any) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Cannot send admin notification email: SENDGRID_API_KEY not set");
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@pictureperfecttv.com';

  try {
    console.log(`Attempting to send notification email to admin: ${adminEmail}`);

    const fromEmail = process.env.EMAIL_FROM || 'bookings@pictureperfecttv.com';
    console.log(`Using sender email: ${fromEmail}`);

    const msg = {
      to: adminEmail,
      from: fromEmail,
      subject: '🔔 New Booking Alert - Picture Perfect TV Install',
      text: getPlainTextAdminNotification(booking),
      html: getHtmlAdminNotification(booking),
    };

    console.log("Admin email payload:", JSON.stringify({
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    }));

    await sgMail.send(msg);
    console.log(`Admin notification email sent to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    if (error.response) {
      console.error('SendGrid API error response:', error.response.body);
    }
    return false;
  }
}

function getPlainTextAdminNotification(booking: any): string {
  const appointmentDate = new Date(booking.preferredDate);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let emailText = `
🔔 New Booking Alert - Picture Perfect TV Install

A new booking has been received:

👤 CUSTOMER INFORMATION
Name: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone}

📅 APPOINTMENT DETAILS
Date: ${formattedDate}
Time: ${booking.appointmentTime}
Service: ${booking.serviceType}

📍 LOCATION
${booking.streetAddress}
${booking.addressLine2 ? booking.addressLine2 + '\n' : ''}${booking.city}, ${booking.state} ${booking.zipCode}

📝 ADDITIONAL NOTES
${booking.notes || 'None provided'}

💰 PRICING
Total: ${booking.pricingTotal || 'Not specified'}
${booking.pricingBreakdown ? `\nBreakdown: ${booking.pricingBreakdown}` : ''}

You can view and manage this booking from the admin dashboard.
  `;

  return emailText;
}

function getHtmlAdminNotification(booking: any): string {
  const appointmentDate = new Date(booking.preferredDate);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      background-color: #f9fafb;
    }
    .header { 
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section {
      background-color: #f0f9ff;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #3b82f6;
    }
    .pricing-section {
      background-color: #f0fff4;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #059669;
    }
    .footer {
      font-size: 12px;
      text-align: center;
      margin-top: 30px;
      color: #666;
      padding: 20px;
    }
    h1 { margin: 0; font-size: 24px; }
    h2 { color: #1e40af; font-size: 20px; margin-top: 0; }
    .highlight { color: #1e40af; font-weight: bold; }
    .urgent { color: #dc2626; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔔 New Booking Alert</h1>
  </div>

  <div class="content">
    <p class="urgent">A new booking requires your attention!</p>

    <div class="section">
      <h2>👤 Customer Information</h2>
      <p><strong>Name:</strong> ${booking.name}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Phone:</strong> ${booking.phone}</p>
    </div>

    <div class="section">
      <h2>📅 Appointment Details</h2>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${booking.appointmentTime}</p>
      <p><strong>Service:</strong> ${booking.serviceType}</p>
    </div>

    <div class="section">
      <h2>📍 Location</h2>
      <p>${booking.streetAddress}</p>
      ${booking.addressLine2 ? `<p>${booking.addressLine2}</p>` : ''}
      <p>${booking.city}, ${booking.state} ${booking.zipCode}</p>
    </div>

    <div class="pricing-section">
      <h2>💰 Pricing Information</h2>
      <p><strong>Total:</strong> ${booking.pricingTotal || 'Not specified'}</p>
      ${booking.pricingBreakdown ? `
      <div style="margin-top: 10px;">
        <strong>Breakdown:</strong><br>
        <pre style="background: #f8fafc; padding: 10px; border-radius: 4px; margin-top: 5px;">
${JSON.stringify(booking.pricingBreakdown, null, 2)}
        </pre>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <h2>📝 Additional Notes</h2>
      <p>${booking.notes || 'None provided'}</p>
    </div>

    <p style="text-align: center; margin-top: 30px;">
      <a href="/admin/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        View in Dashboard
      </a>
    </p>
  </div>

  <div class="footer">
    <p>© ${new Date().getFullYear()} Picture Perfect TV Install</p>
    <p>This is an automated notification - Do not reply</p>
  </div>
</body>
</html>
  `;

  return emailHtml;
}