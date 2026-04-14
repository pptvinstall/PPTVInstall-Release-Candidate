import nodemailer from "nodemailer";
import { format } from "date-fns";
import { addHours, formatICSDate, parseBookingDateTime } from "./services/calendarService";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

type LineItem = { name: string; total: number };

function formatAppointment(date: string, time: string) {
  return format(new Date(`${date}T12:00:00`), "EEEE, MMMM d yyyy") + ` at ${time}`;
}

function parseLineItems(booking: any): LineItem[] {
  try {
    const data = JSON.parse(booking.pricingBreakdown || "{}");
    if (Array.isArray(data.items)) {
      return data.items.map((item: any) => ({ name: item.name || "Service", total: Number(item.lineTotal ?? item.price ?? 0) }));
    }
    if (Array.isArray(data.quoteGroups)) {
      return data.quoteGroups.flatMap((group: any) =>
        (group.items || []).map((item: any) => ({
          name: group.title === "Shared Services" ? item.name : `${group.title} - ${item.name}`,
          total: Number(item.lineTotal ?? 0),
        })),
      );
    }
  } catch (error) {
    console.error("Could not parse booking line items:", error);
  }
  return [{ name: booking.serviceType || "Service", total: Number(booking.pricingTotal || 0) }];
}

function renderItemsHtml(items: LineItem[]) {
  return items
    .map((item) => `<tr><td style="padding:8px 0;color:#334155;">${item.name}</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#0f172a;">$${Math.abs(item.total)}</td></tr>`)
    .join("");
}

function renderItemsText(items: LineItem[]) {
  return items.map((item) => `- ${item.name}: $${Math.abs(item.total)}`).join("\n");
}

function getGoogleCalendarUrl(booking: any, summary: string) {
  const start = parseBookingDateTime(booking.preferredDate, booking.appointmentTime);
  const end = addHours(start, 2);
  const location = `${booking.streetAddress} ${booking.city} GA ${booking.zipCode}`;
  const details =
    `Services: ${summary}\n` +
    `Total: $${booking.pricingTotal ?? "TBD"}\n` +
    `Questions? 404-702-4748`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "TV Install — Picture Perfect TV Install",
    dates: `${formatICSDate(start)}/${formatICSDate(end)}`,
    details,
    location,
    sf: "true",
    output: "xml",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export async function sendBookingEmails(booking: any) {
  const [firstName] = String(booking.name || "").split(" ");
  const appointmentLabel = formatAppointment(booking.preferredDate, booking.appointmentTime);
  const items = parseLineItems(booking);
  const itemsHtml = renderItemsHtml(items);
  const itemsText = renderItemsText(items);
  const address = `${booking.streetAddress}, ${booking.city}, ${booking.state} ${booking.zipCode}`;
  const notes = booking.notes?.trim() || booking.specialInstructions?.trim() || "None provided";

  const ownerSubject = `New Booking -- ${booking.name} -- ${booking.preferredDate} at ${booking.appointmentTime}`;
  const customerSubject = `Booking Received -- Picture Perfect TV Install -- ${booking.preferredDate} at ${booking.appointmentTime}`;
  const appBaseUrl = process.env.PUBLIC_APP_URL || "https://pptvinstall.com";
  const calendarUrl = `${appBaseUrl}/api/bookings/${booking.id}/calendar`;
  const summaryText = items.map((item) => item.name).join(", ");
  const googleCalendarUrl = getGoogleCalendarUrl(booking, summaryText);

  const ownerHtml = `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
      <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;">
        <h1 style="margin:0 0 18px;color:#0f172a;">New Booking</h1>
        <p><strong>Customer:</strong> ${booking.name}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Appointment:</strong> ${appointmentLabel}</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">${itemsHtml}</table>
        <p style="margin-top:18px;"><strong>Estimated Total:</strong> $${booking.pricingTotal ?? "TBD"}</p>
        <p><strong>Special Instructions:</strong> ${notes}</p>
        <p style="margin-top:18px;color:#334155;">Reply to this email or call ${booking.phone} to confirm.</p>
      </div>
    </div>
  `;

  const customerHtml = `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
      <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;">
        <h1 style="margin:0 0 18px;color:#0f172a;">Booking Received</h1>
        <p>Hi ${firstName || "there"},</p>
        <p>Your appointment request is in for <strong>${appointmentLabel}</strong> at <strong>${address}</strong>.</p>
        <div style="margin:24px 0;text-align:center;">
          <p style="color:#64748b;font-size:14px;margin-bottom:12px;">Add this appointment to your calendar:</p>
          <a href="${calendarUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:4px;">Add to Calendar</a>
          <a href="${googleCalendarUrl}" style="display:inline-block;background:#ffffff;color:#2563eb;border:2px solid #2563eb;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;margin:4px;">Google Calendar</a>
          <p style="color:#64748b;font-size:13px;margin-top:12px;">The "Add to Calendar" button works with Google Calendar, Apple Calendar, and Outlook. On iPhone: tap the button and choose "Add" when prompted.</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">${itemsHtml}</table>
        <p style="margin-top:18px;"><strong>Estimated Total:</strong> $${booking.pricingTotal ?? "TBD"}</p>
        <div style="margin-top:18px;padding:16px;background:#eff6ff;border-radius:12px;">
          <p style="margin:0 0 8px;"><strong>What happens next</strong></p>
          <p style="margin:0 0 6px;">1. We confirm your appointment within 1 hour.</p>
          <p style="margin:0 0 6px;">2. We send a reminder the day before.</p>
          <p style="margin:0;">3. We show up and get it done.</p>
        </div>
        <p style="margin-top:18px;">Questions? Call 404-702-4748 or email pptvinstall@gmail.com.</p>
        <p>No payment required until after the job is complete.</p>
      </div>
    </div>
  `;

  const ownerText =
    `Customer full name: ${booking.name}\n` +
    `Phone number: ${booking.phone}\n` +
    `Email address: ${booking.email}\n` +
    `Full service address: ${address}\n` +
    `Appointment: ${appointmentLabel}\n\n` +
    `Itemized services:\n${itemsText}\n\n` +
    `Estimated total: $${booking.pricingTotal ?? "TBD"}\n` +
    `Special instructions: ${notes}\n\n` +
    `Reply to this email or call ${booking.phone} to confirm`;

  const customerText =
    `Hi ${firstName || "there"}!\n\n` +
    `Your appointment request is set for ${appointmentLabel} at ${address}.\n\n` +
    `Add to Calendar: ${calendarUrl}\n` +
    `Google Calendar: ${googleCalendarUrl}\n\n` +
    `${itemsText}\n\n` +
    `Estimated total: $${booking.pricingTotal ?? "TBD"}\n\n` +
    `What happens next:\n` +
    `1. We confirm within 1 hour.\n` +
    `2. We send a reminder the day before.\n` +
    `3. We show up and get it done.\n\n` +
    `Questions? 404-702-4748 or pptvinstall@gmail.com\n` +
    `No payment required until after the job is complete.`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Picture Perfect TV Install <pptvinstall@gmail.com>",
    to: booking.email,
    subject: customerSubject,
    html: customerHtml,
    text: customerText,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Picture Perfect TV Install <pptvinstall@gmail.com>",
    to: process.env.ADMIN_EMAIL || "pptvinstall@gmail.com",
    subject: ownerSubject,
    html: ownerHtml,
    text: ownerText,
  });
}

export async function sendRescheduleEmail(_booking: any) {}
export async function sendCancellationEmail(_booking: any) {}
