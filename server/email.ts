import nodemailer from "nodemailer";

// Define brand colors
const BRAND_COLOR = "#2563eb"; // Blue-600
const BG_COLOR = "#f1f5f9"; // Slate-100
const TEXT_COLOR = "#1e293b"; // Slate-800

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pptvinstall@gmail.com",
    // 👇 PASTE YOUR APP PASSWORD INSIDE THE QUOTES BELOW 👇
    pass: "xsjlfjpqderocpyh", 
  },
});

// Helper: Fix Time Format (AM/PM to 24h)
function parseDateTime(dateStr: string, timeStr: string) {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  let hoursInt = parseInt(hours, 10);
  
  if (hoursInt === 12) hoursInt = 0;
  if (modifier === 'PM') hoursInt = hoursInt + 12;
  
  const paddedHours = hoursInt.toString().padStart(2, '0');
  return new Date(`${dateStr}T${paddedHours}:${minutes}:00`);
}

// Helper: Turn messy JSON into a detailed, itemized list
function formatServices(jsonString: string) {
  try {
    const data = JSON.parse(jsonString);
    let html = "";

    // 1. TV Services
    if (data.tvInstallations && data.tvInstallations.length > 0) {
      html += `<div style="margin-bottom: 15px;"><p style="margin: 0 0 5px; font-weight:bold; color:#2563eb; font-size: 14px;">📺 TV Installations</p><ul style="margin:0; padding-left: 20px; color: #475569;">`;
      
      data.tvInstallations.forEach((tv: any, i: number) => {
        let details = [];
        if (tv.mountType === 'customer') {
           details.push(`Client Provided Mount`);
        } else {
           const niceMountName = tv.mountType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
           details.push(`<strong>${niceMountName} Mount Provided</strong>`);
        }
        if (tv.packageType === 'clean' || tv.packageType === 'total') details.push(`<strong>Wire Concealment</strong>`);
        if (tv.location === 'fireplace') details.push(`<strong>Over Fireplace</strong>`);
        if (tv.addSoundbar) details.push(`Soundbar Install`);
        if (tv.addHdmi) details.push(`HDMI Cable`);
        
        const pkgName = tv.name || `TV Install (${tv.packageType})`;

        html += `<li style="margin-bottom: 8px; font-size: 13px;">
          <span style="color: #1e293b; font-weight: 600;">TV ${i + 1}: ${tv.size === 'small' ? '32"-55"' : '56"+'} - ${pkgName}</span>
          ${details.length > 0 ? `<br><span style="font-size: 12px; color: #64748b; line-height: 1.5;">↳ ${details.join(' • ')}</span>` : ''}
        </li>`;
      });
      html += `</ul></div>`;
    }

    // 2. Smart Home
    if (data.smartHome && data.smartHome.length > 0) {
      html += `<div style="margin-bottom: 15px;"><p style="margin: 0 0 5px; font-weight:bold; color:#2563eb; font-size: 14px;">🏠 Smart Home</p><ul style="margin:0; padding-left: 20px; color: #475569;">`;
      data.smartHome.forEach((item: any) => {
        html += `<li style="margin-bottom: 5px; font-size: 13px;">${item.count}x <strong>${item.type}</strong></li>`;
      });
      html += `</ul></div>`;
    }

    return html || "<p style='font-size: 13px; color: #94a3b8;'>No specific service details.</p>";
  } catch (e) {
    return ""; 
  }
}

// --- EMAIL TEMPLATE BASE ---
const emailTemplate = (title: string, bodyContent: string) => `
  <!DOCTYPE html>
  <html>
  <body style="margin: 0; padding: 0; background-color: ${BG_COLOR}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BG_COLOR}; padding: 40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">
            <tr>
              <td style="background-color: ${BRAND_COLOR}; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Picture Perfect TV Install</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: ${TEXT_COLOR}; margin-top: 0; font-size: 22px; text-align: center;">${title}</h2>
                ${bodyContent}
                <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    Questions? Reply to this email or text 404-702-4748
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

export async function sendBookingEmails(booking: any) {
  const formattedJobDetails = formatServices(booking.pricingBreakdown || "{}");
  
  const customerContent = `
    <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
      Hi ${booking.name}, your appointment is locked in. Here is your service summary.
    </p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
      <table width="100%" cellspacing="0" cellpadding="5">
        <tr><td style="color: #64748b; font-weight: bold; width: 80px;">Date:</td><td style="color: ${TEXT_COLOR};">${booking.preferredDate}</td></tr>
        <tr><td style="color: #64748b; font-weight: bold;">Time:</td><td style="color: ${TEXT_COLOR};">${booking.appointmentTime}</td></tr>
        <tr><td style="color: #64748b; font-weight: bold;">Location:</td><td style="color: ${TEXT_COLOR};">${booking.streetAddress}, ${booking.city}</td></tr>
      </table>
      <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #cbd5e1;">${formattedJobDetails}</div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Picture Perfect TV" <pptvinstall@gmail.com>',
    to: booking.email,
    subject: `Booking Confirmed: ${booking.serviceType}`,
    html: emailTemplate("Booking Confirmed! ✅", customerContent),
  });

  await transporter.sendMail({
    from: '"Booking System" <pptvinstall@gmail.com>',
    to: process.env.ADMIN_EMAIL || "pptvinstall@gmail.com",
    subject: `NEW BOOKING: ${booking.name}`,
    html: `New Job: ${booking.name} on ${booking.preferredDate} @ ${booking.appointmentTime}. Total: $${booking.pricingTotal}`,
  });
}

export async function sendRescheduleEmail(booking: any) {
  const content = `
    <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
      Hi ${booking.name}, your appointment has been successfully updated.
    </p>
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; text-align: center;">
      <p style="font-weight: bold; color: #1e3a8a; margin-bottom: 5px;">NEW TIME</p>
      <p style="font-size: 18px; color: #1e40af; margin: 0;">
        ${booking.preferredDate}<br>${booking.appointmentTime}
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: '"Picture Perfect TV" <pptvinstall@gmail.com>',
    to: booking.email,
    subject: `Appointment Updated: ${booking.preferredDate}`,
    html: emailTemplate("Appointment Rescheduled 🗓️", content),
  });
}

export async function sendCancellationEmail(booking: any) {
  const content = `
    <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
      Hi ${booking.name}, your appointment on ${booking.preferredDate} has been cancelled.
    </p>
    <p style="text-align: center; color: #64748b;">
      If this was a mistake, please reply to this email or book a new slot on our website.
    </p>
  `;

  await transporter.sendMail({
    from: '"Picture Perfect TV" <pptvinstall@gmail.com>',
    to: booking.email,
    subject: `Appointment Cancelled`,
    html: emailTemplate("Booking Cancelled ❌", content),
  });
}