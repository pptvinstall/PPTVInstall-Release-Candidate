import type { Express } from "express";
import { createServer, type Server } from "http";
import nodemailer from "nodemailer";
import { storage } from "./storage";
import { sendBookingEmails, sendCancellationEmail, sendContactMessageEmail, sendRescheduleEmail } from "./email";
import { insertBookingSchema, insertContactMessageSchema, promotions } from "@shared/schema";
import { addDays, format } from "date-fns";
import { generateICS } from "./services/calendarService";
import { monitoring } from "./monitoring";
import { db } from "./db";
import {
  checkAiQuoteRateLimit,
  getAiQuoteProtectionConfig,
  requestAnthropicQuote,
  verifyTurnstileToken,
} from "./services/aiQuoteService";
import { and, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { ZodError } from "zod";

export function registerRoutes(app: Express): Server {
  app.get("/api/promotions", async (_req, res) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const rows = await db
        .select()
        .from(promotions)
        .where(
          and(
            eq(promotions.isActive, true),
            or(isNull(promotions.startDate), lte(promotions.startDate, today)),
            or(isNull(promotions.endDate), gte(promotions.endDate, today)),
          ),
        )
        .orderBy(desc(promotions.priority), desc(promotions.updatedAt));

      res.json({
        promotions: rows.map((row) => ({
          id: row.id,
          name: row.title,
          description: row.description ?? "",
          linkText: row.linkText ?? undefined,
          linkUrl: row.linkUrl ?? undefined,
          backgroundColor: row.backgroundColor ?? undefined,
          textColor: row.textColor ?? undefined,
        })),
      });
    } catch (error) {
      console.error("Promotions route error:", error);
      res.json({ promotions: [] });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const message = insertContactMessageSchema.parse(req.body);
      await sendContactMessageEmail(message);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof ZodError) {
        console.warn("Contact route validation failed");
      } else {
        console.error("Contact route error:", error);
      }
      res.status(400).json({ message: "We couldn't send that message right now. Please call or text us instead." });
    }
  });

  function getClientIpAddress(req: Express["request"]) {
    const forwardedFor = req.headers["x-forwarded-for"];
    if (typeof forwardedFor === "string") {
      return forwardedFor.split(",")[0]?.trim() || req.ip || "unknown";
    }
    return req.ip || "unknown";
  }

  function getBriefServices(pricingBreakdown: string | undefined, fallback: string) {
    try {
      const data = JSON.parse(pricingBreakdown || "{}");
      if (Array.isArray(data.items)) {
        return data.items.slice(0, 3).map((item: { name?: string }) => item.name || "Service").join(", ");
      }
      if (Array.isArray(data.quoteGroups)) {
        return data.quoteGroups
          .flatMap((group: { title?: string; items?: Array<{ name?: string }> }) =>
            (group.items || []).map((item) => (group.title === "Shared Services" ? item.name || "Service" : `${group.title} - ${item.name || "Service"}`)),
          )
          .slice(0, 3)
          .join(", ");
      }
    } catch (error) {
      console.error("Could not parse service list for SMS:", error);
    }
    return fallback;
  }
  
  // --- HELPER: GET SLOTS FOR A SPECIFIC DATE ---
  function getSlots(date: Date) {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (!isWeekend) {
      return ["5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM"];
    }

    const slots: string[] = [];
    for (let hour = 8; hour <= 17; hour += 1) {
      slots.push(format(new Date(2026, 0, 1, hour, 0), "h:mm a"));
      if (hour < 17) {
        slots.push(format(new Date(2026, 0, 1, hour, 30), "h:mm a"));
      }
    }
    return slots;
  }

  function parseSlotTime(date: Date, slot: string): Date {
    const [timePart, meridiemPart] = slot.split(" ");
    const [hoursPart, minutesPart] = timePart.split(":");
    let hours = Number(hoursPart);
    const minutes = Number(minutesPart);
    const meridiem = meridiemPart.toUpperCase();
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
  }

  function getAvailableSlots(date: Date, bookedSlots: string[]) {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    let allSlots = getSlots(date);
    if (isToday) {
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      if (now.getHours() >= 17) allSlots = [];
      else allSlots = allSlots.filter((slot) => parseSlotTime(date, slot) >= twoHoursFromNow);
    }
    return allSlots.filter((slot) => !bookedSlots.includes(slot));
  }

  // --- 1. FIND NEXT AVAILABLE SLOT (SERVER SIDE LOGIC) ---
  app.get("/api/next-slot", async (req, res) => {
    try {
      const allBookings = await storage.getAllBookings();

      let checkDate = new Date();
      let foundSlot = null;
      let foundDate = null;

      for (let i = 0; i <= 14; i++) {
        const targetDate = addDays(checkDate, i);
        const dateStr = format(targetDate, 'yyyy-MM-dd');

        const takenOnDay = allBookings
          .filter(b => b.preferredDate === dateStr && b.status !== 'cancelled')
          .map(b => b.appointmentTime);

        const firstFree = getAvailableSlots(targetDate, takenOnDay)[0];

        if (firstFree) {
          foundSlot = firstFree;
          foundDate = dateStr;
          break;
        }
      }

      if (foundDate && foundSlot) {
        res.json({ date: foundDate, time: foundSlot });
      } else {
        res.status(404).json({ message: "No slots found soon" });
      }
    } catch (error) {
      console.error("ASAP Error:", error);
      res.status(500).json({ message: "Error calculating slots" });
    }
  });

  // --- 2. CHECK AVAILABILITY (For Calendar Grid) ---
  app.get("/api/availability", async (req, res) => {
    try {
      const date = req.query.date as string;
      if (!date) return res.json([]);

      const allBookings = await storage.getAllBookings();
      const takenTimes = allBookings
        .filter(b => b.preferredDate === date && b.status !== 'cancelled')
        .map(b => b.appointmentTime);

      res.json(takenTimes);
    } catch (error) {
      res.status(500).json([]);
    }
  });

  app.get("/api/ai-quote/config", (_req, res) => {
    const config = getAiQuoteProtectionConfig();
    res.json(config);
  });

  app.post("/api/ai-quote", async (req, res) => {
    const {
      message,
      mode,
      description,
      zipCode,
      turnstileToken,
      honeypot,
    } = req.body as {
      message?: string;
      mode?: string;
      description?: string;
      zipCode?: string;
      turnstileToken?: string;
      honeypot?: string;
    };

    const structuredDescription = typeof description === "string" ? description.trim() : "";
    const structuredZipCode = typeof zipCode === "string" ? zipCode.trim() : "";
    const aiMessage = structuredDescription
      ? [
          mode ? `Mode: ${mode}` : null,
          structuredZipCode ? `ZIP: ${structuredZipCode}` : null,
          `Request: ${structuredDescription}`,
        ]
          .filter(Boolean)
          .join("\n")
      : message?.trim() || "";

    if (typeof honeypot === "string" && honeypot.trim()) {
      return res.status(400).json({ message: "We couldn't process that quote request. Please try again." });
    }

    if (!aiMessage) {
      return res.status(400).json({ message: "Please describe the job before requesting an AI quote." });
    }

    const config = getAiQuoteProtectionConfig();
    if (!config.enabled) {
      return res.status(503).json({ message: "AI quote requests are temporarily unavailable. Please call or text us instead." });
    }

    const ipAddress = getClientIpAddress(req);

    try {
      // Only verify Turnstile when it is configured (production). Skip in local dev.
      if (config.turnstileRequired) {
        const turnstilePassed = await verifyTurnstileToken(turnstileToken || "", ipAddress);
        if (!turnstilePassed) {
          return res.status(400).json({ message: "Please complete the quick verification before requesting an AI quote." });
        }
      }

      const rateLimitResult = checkAiQuoteRateLimit(ipAddress);
      if (!rateLimitResult.allowed) {
        return res.status(429).json({
          error: {
            code: rateLimitResult.code,
            message: rateLimitResult.message,
            retryAfterSeconds: rateLimitResult.retryAfterSeconds,
          },
        });
      }

      const content = await requestAnthropicQuote(aiMessage);
      return res.json({ content });
    } catch (error) {
      console.error("AI quote route error:", error);
      return res.status(500).json({ message: "We couldn't generate that AI quote right now. Please try again or call us directly." });
    }
  });

  // --- 3. CREATE BOOKING (With Bouncer) ---
  app.post("/api/bookings", async (req, res) => {
    try {
      const data = insertBookingSchema.parse(req.body);
      const allBookings = await storage.getAllBookings();
      const isTaken = allBookings.find(b => 
        b.preferredDate === data.preferredDate && 
        b.appointmentTime === data.appointmentTime &&
        b.status !== "cancelled"
      );

      if (isTaken) {
        console.log(`🚫 Blocked duplicate booking for ${data.preferredDate} @ ${data.appointmentTime}`);
        return res.status(409).json({ message: "That time slot was just booked. Please select another time." });
      }
      
      const booking = await storage.createBooking(data);

      sendBookingEmails(booking).catch(err => console.error("Email Error:", err));
      import("./services/smsService.js")
        .then(async (smsService) => {
          const firstName = booking.name.split(" ")[0] || booking.name;
          const services = getBriefServices(booking.pricingBreakdown, booking.serviceType);
          const friendlyDate = format(new Date(`${booking.preferredDate}T12:00:00`), "EEEE, MMMM d");
          const ownerMessage =
            `NEW BOOKING\n` +
            `${booking.name} -- ${friendlyDate} at ${booking.appointmentTime}\n` +
            `${booking.streetAddress}, ${booking.city} ${booking.zipCode}\n` +
            `Phone: ${booking.phone}\n` +
            `Services: ${services}\n` +
            `Total: $${booking.pricingTotal ?? "TBD"}`;
          const customerMessage =
            `Hi ${firstName}! Your Picture Perfect TV Install appointment is set for ${friendlyDate} at ${booking.appointmentTime}. ` +
            `Questions? Text or call 404-702-4748. See you then!`;

          await smsService.sendSMS(process.env.OWNER_PHONE || "4047024748", ownerMessage);
          await smsService.sendSMS(booking.phone, customerMessage);
        })
        .catch((err) => console.error("SMS Error:", err));
      
      res.json(booking);
    } catch (error) {
      if (error instanceof ZodError) {
        console.warn("Booking validation failed");
      } else {
        console.error("Booking Error:", error);
      }
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.get("/api/bookings/:id/calendar", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const bookings = await storage.getAllBookings();
      const booking = bookings.find((entry) => Number(entry.id) === id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      let summary = booking.serviceType;
      try {
        const parsed = JSON.parse(booking.pricingBreakdown || "{}");
        if (Array.isArray(parsed.items)) {
          summary = parsed.items.map((item: { name?: string }) => item.name || "Service").join(", ");
        } else if (Array.isArray(parsed.quoteGroups)) {
          summary = parsed.quoteGroups
            .flatMap((group: { title?: string; items?: Array<{ name?: string }> }) =>
              (group.items || []).map((item) => (group.title === "Shared Services" ? item.name || "Service" : `${group.title} - ${item.name || "Service"}`)),
            )
            .join(", ");
        }
      } catch (error) {
        console.error("Calendar summary parse error:", error);
      }

      const ics = generateICS({
        customerName: booking.name,
        customerEmail: booking.email,
        date: booking.preferredDate,
        time: booking.appointmentTime,
        address: booking.streetAddress,
        city: booking.city,
        zip: booking.zipCode,
        summary,
        total: Number(booking.pricingTotal || 0),
      });

      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="pptvinstall-appointment.ics"');
      res.send(ics);
    } catch (error) {
      console.error("Calendar endpoint error:", error);
      res.status(500).json({ message: "Could not generate calendar file" });
    }
  });

  app.post("/api/quote-request", async (req, res) => {
    const {
      name,
      phone,
      quoteTotal,
      quoteItems,
      quoteSummary,
      zipCode,
    } = req.body as {
      name?: string;
      phone?: string;
      quoteTotal?: number;
      quoteItems?: Array<{ name?: string; price?: number; qty?: number }>;
      quoteSummary?: string;
      zipCode?: string;
    };

    if (!name || !phone || quoteTotal === undefined || !Array.isArray(quoteItems)) {
      return res.status(400).json({ success: false, error: "Missing quote request fields" });
    }

    const itemsList = quoteItems
      .map((item) => `  • ${item.name ?? "Service"}: $${Number(item.price ?? 0) * Number(item.qty ?? 1)}`)
      .join("\n");

    const ownerMessage =
      `NEW QUOTE REQUEST\n` +
      `Customer: ${name}\n` +
      `Phone: ${phone}\n` +
      `Zip: ${zipCode ?? "N/A"}\n` +
      `Total: $${quoteTotal}\n\n` +
      `Services:\n${itemsList}\n\n` +
      `Summary: ${quoteSummary ?? "No summary provided."}`;

    const customerMessage =
      `Hey ${name}! We got your quote request for $${quoteTotal}. ` +
      `We'll reach out within 2 hours to schedule your install. ` +
      `Questions? Call 404-702-4748. - Picture Perfect TV Install`;

    try {
      const smsService = await import("./services/smsService.js");
      await smsService.sendSMS(process.env.OWNER_PHONE || "4047024748", ownerMessage);
      await smsService.sendSMS(phone, customerMessage);
      return res.json({ success: true, method: "sms" });
    } catch (smsError) {
      console.error("Quote request SMS failed:", smsError);

      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || "Picture Perfect TV Install <pptvinstall@gmail.com>",
          to: process.env.ADMIN_EMAIL || "pptvinstall@gmail.com",
          subject: `New Quote Request - ${name} - $${quoteTotal}`,
          text: ownerMessage,
        });

        return res.json({ success: true, method: "email" });
      } catch (emailError) {
        console.error("Quote request email failed:", emailError);
        return res.status(500).json({ success: false, error: "Could not send notification" });
      }
    }
  });

  // --- ADMIN ROUTES ---
  app.get("/api/admin/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (e) { res.status(500).json([]); }
  });

  app.post("/api/admin/bookings/:id/reschedule", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateBooking(id, {
      ...req.body,
      preferredDate: req.body.preferredDate ?? req.body.date,
      appointmentTime: req.body.appointmentTime ?? req.body.time,
    });
    sendRescheduleEmail(updated).catch(e => console.error(e));
    res.json(updated);
  });

  app.post("/api/admin/bookings/:id/cancel", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateBooking(id, {
      status: "cancelled",
      cancellationReason: req.body?.reason,
    });
    sendCancellationEmail(updated).catch(e => console.error(e));
    res.json(updated);
  });

  app.get("/api/health", async (_req, res) => {
    try {
      const health = await monitoring.getSystemHealth();
      const statusCode = health.status === "unhealthy" ? 503 : 200;
      res.status(statusCode).json(health);
    } catch (error) {
      console.error("Health route error:", error);
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        message: "Health check failed",
      });
    }
  });

  app.get("/api/ready", async (_req, res) => {
    try {
      const health = await monitoring.getSystemHealth();
      if (!health.database) {
        return res.status(503).json({
          status: "not_ready",
          timestamp: health.timestamp,
          database: health.database,
        });
      }

      res.json({
        status: "ready",
        timestamp: health.timestamp,
        database: health.database,
      });
    } catch (error) {
      console.error("Readiness route error:", error);
      res.status(503).json({
        status: "not_ready",
        timestamp: new Date().toISOString(),
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
