import nodemailer from "nodemailer";

// Brand Configuration
const BRAND_COLOR = "#2563eb"; 
const BRAND_DARK = "#1e3a8a"; 
const BG_COLOR = "#f8fafc"; 
const TEXT_COLOR = "#334155"; 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "pptvinstall@gmail.com",
    // 👇 PASTE YOUR APP PASSWORD INSIDE THE QUOTES BELOW 👇
    pass: "xsjlfjpqderocpyh", 
  },
});

// --- HELPER: GENERATE PLAIN TEXT RECEIPT (For Calendar) ---
function generatePlainTextReceipt(booking: any) {
  try {
    const data = JSON.parse(booking.pricingBreakdown || "{}");
    let text = `CUSTOMER: ${booking.name}\nPHONE: ${booking.phone}\n\n--- ORDER DETAILS ---\n`;

    if (data.tvInstallations?.length > 0) {
      data.tvInstallations.forEach((tv: any, i: number) => {
        text += `\nTV ${i + 1}: ${tv.packageName} (${tv.size === 'small' ? 'Under 55"' : 'Over 56"'})`;
        
        // --- 1. SURFACE CHECK (The Fix) ---
        // We check for 'masonry', 'brick', or 'stone' to be safe
        if (['masonry', 'brick', 'stone'].includes(tv.wallType)) {
           text += `\n • SURFACE: MASONRY/BRICK/STONE (Hammer Drill Needed)`;
        }

        // --- 2. HARDWARE ---
        if (tv.mountType === 'customer') text += `\n • Hardware: Client Provided Mount`;
        else {
           const cleanMount = (tv.mountType || 'fixed').replace(/_/g, ' ').toUpperCase();
           text += `\n • Hardware: ${cleanMount} MOUNT`;
        }
        
        if (tv.packageType === 'concealment' || tv.packageType === 'premium' || tv.concealment) {
           text += `\n • Service: In-Wall Wire Concealment`;
        }
        
        if (tv.location === 'fireplace' || tv.packageType === 'fireplace') {
           text += `\n • SPECIALTY: MOUNT OVER FIREPLACE`;
        }
        
        if (tv.addSoundbar) text += `\n • Add-on: Soundbar Mounting`;
        if (tv.addHdmi) text += `\n • Merch: HDMI Cable`;
      });
    }

    if (data.smartHome?.length > 0) {
       text += `\n\nSMART HOME:\n`;
       data.smartHome.forEach((s: any) => {
          text += ` • ${s.count}x ${s.type.toUpperCase()}${s.isMasonry ? ' (MASONRY INSTALL)' : ''}\n`;
       });
    }

    text += `\n\nTOTAL ESTIMATE: $${booking.pricingTotal}`;
    
    return text;
  } catch (e) {
    return "See email for full details.";
  }
}

// --- HELPER: GOOGLE CALENDAR LINK ---
function getGoogleCalLink(booking: any) {
  const startTime = new Date(`${booking.preferredDate}T${convertTime12to24(booking.appointmentTime.split(' - ')[0])}`);
  const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000)); // 2 hours

  const fmt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  
  const description = generatePlainTextReceipt(booking);
  const location = `${booking.streetAddress}, ${booking.city}, ${booking.state} ${booking.zipCode}`;
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=TV+Install:+${encodeURIComponent(booking.name)}&dates=${fmt(startTime)}/${fmt(endTime)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
}

function convertTime12to24(time12h: string) {
  if (!time12h) return "00:00";
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') { hours = '00'; }
  if (modifier === 'PM') { hours = String(parseInt(hours, 10) + 12); }
  return `${hours.padStart(2, '0')}:${minutes}`;
}

// --- HELPER: HTML EMAIL RECEIPT ---
function formatServices(jsonString: string) {
  try {
    const data = JSON.parse(jsonString);
    let html = "";

    // TV SECTION
    if (data.tvInstallations?.length > 0) {
      html += `<div style="margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px; color:${BRAND_DARK}; font-size: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">📺 TV INSTALLATION</h3>
        <table width="100%" cellpadding="0" cellspacing="0">`;
      
      data.tvInstallations.forEach((tv: any, i: number) => {
        let items = [`<strong>Labor:</strong> Professional Mounting Service`];

        // --- 1. MASONRY CHECK (Priority & Bold) ---
        if (['masonry', 'brick', 'stone'].includes(tv.wallType)) {
           items.push(`<strong style="color:#ea580c; background:#fff7ed; padding:2px 5px; border-radius:4px; border: 1px solid #fdba74;">🧱 SURFACE: MASONRY/BRICK/STONE (Hammer Drill)</strong>`);
        }

        // --- 2. HARDWARE ---
        if (tv.mountType === 'customer') {
           items.push(`Customer Provided Mount`);
        } else {
           const cleanMount = (tv.mountType || 'fixed').replace(/_/g, ' ').toUpperCase();
           items.push(`<strong>Hardware:</strong> ${cleanMount} MOUNT`);
        }

        // --- 3. CONCEALMENT ---
        if (tv.packageType === 'concealment' || tv.packageType === 'premium' || tv.concealment) {
           items.push(`<strong>Upgrade:</strong> In-Wall Wire Concealment`);
        }

        // --- 4. FIREPLACE ---
        if (tv.location === 'fireplace' || tv.packageType === 'fireplace') {
           items.push(`<strong>SPECIALTY:</strong> OVER FIREPLACE INSTALL`);
        }

        // --- 5. EXTRAS ---
        if (tv.addSoundbar) items.push(`<strong>Add-on:</strong> Soundbar Mounting`);
        if (tv.addHdmi) items.push(`<strong>Merch:</strong> 4K HDMI Cable`);

        html += `
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px dashed #e2e8f0;">
            <div style="font-weight: bold; color: ${TEXT_COLOR}; font-size: 16px;">
               TV ${i + 1}: ${tv.packageName} <span style="font-size:12px; color:#64748b">(${tv.size === 'small' ? 'Under 55"' : 'Over 56"'})</span>
            </div>
            <div style="font-size: 14px; color: #475569; margin-top: 5px; line-height: 1.6; padding-left: 10px; border-left: 3px solid #cbd5e1;">
               ${items.map(item => `<div>• ${item}</div>`).join('')}
            </div>
          </td>
        </tr>`;
      });
      html += `</table></div>`;
    }

    // SMART HOME SECTION
    if (data.smartHome?.length > 0) {
      html += `<div style="margin-bottom: 25px;">
        <h3 style="margin: 0 0 10px; color:${BRAND_DARK}; font-size: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">🏠 SMART HOME</h3>
        <ul style="list-style:none; padding:0; margin:0;">`;
      data.smartHome.forEach((item: any) => {
        const masonryBadge = item.isMasonry 
          ? `<br><span style="color:#ea580c; font-weight:bold; font-size:11px; background:#fff7ed; padding:2px 6px; border-radius:4px; border: 1px solid #fdba74;">+ MASONRY INSTALL (Drilling Required)</span>` 
          : '';
          
        html += `<li style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0;">
           <span style="font-size:14px; font-weight:bold;">${item.count}x</span> ${item.type.replace(/_/g, ' ').toUpperCase()}
           ${masonryBadge}
        </li>`;
      });
      html += `</ul></div>`;
    }
    
    // REMOVAL SECTION
    if (data.removal > 0) {
       html += `<div style="background:#fff1f2; padding:10px; border-radius:6px; color:#991b1b; font-weight:bold; text-align:center;">
          🗑️ Removal included for ${data.removal} TV(s)
       </div>`;
    }

    return html || "<p>Standard Service Call</p>";
  } catch (e) { return ""; }
}

// --- MAIN EMAIL SENDER ---
export async function sendBookingEmails(booking: any) {
  // DEBUG LOG - CHECK THIS IN TERMINAL!
  console.log("📧 EMAILING... Breakdown:", booking.pricingBreakdown);

  const formattedJobDetails = formatServices(booking.pricingBreakdown || "{}");
  const calendarLink = getGoogleCalLink(booking);
  const firstName = booking.name.split(' ')[0];

  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background-color: ${BG_COLOR}; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <div style="background: ${BRAND_COLOR}; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">CONFIRMED</h1>
          <p style="color: #bfdbfe; margin: 5px 0;">Booking #${booking.id}</p>
        </div>
        
        <div style="padding: 30px;">
           <div style="background: #f0f9ff; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
              <div style="font-size: 20px; font-weight: 900; color: ${BRAND_DARK};">${booking.preferredDate}</div>
              <div style="font-size: 18px; color: ${BRAND_COLOR}; font-weight: bold; margin: 5px 0;">${booking.appointmentTime.split(' - ')[0]}</div>
              <div style="margin-top: 15px;">
                 <a href="${calendarLink}" style="background: ${BRAND_COLOR}; color: white; text-decoration: none; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 14px;">📅 Add to Calendar</a>
              </div>
           </div>

           <p>Hi ${firstName}, here is your detailed receipt:</p>
           ${formattedJobDetails}
           
           <div style="margin-top: 30px; padding-top: 20px; border-top: 2px dashed #e2e8f0; display: flex; justify-content: space-between;">
              <strong>ESTIMATED TOTAL</strong>
              <strong style="font-size: 24px; color: #16a34a;">$${booking.pricingTotal}</strong>
           </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Picture Perfect TV" <pptvinstall@gmail.com>',
    to: booking.email,
    subject: `✅ Confirmed: Appointment on ${booking.preferredDate}`,
    html: customerHtml,
  });

  await transporter.sendMail({
    from: '"Booking Bot" <pptvinstall@gmail.com>',
    to: "pptvinstall@gmail.com", 
    subject: `🔔 JOB: ${booking.name} - $${booking.pricingTotal}`,
    html: customerHtml, 
  });
}

export async function sendRescheduleEmail(booking: any) {}
export async function sendCancellationEmail(booking: any) {}