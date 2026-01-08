import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendBookingEmails, sendRescheduleEmail, sendCancellationEmail } from "./email";
import { insertBookingSchema } from "@shared/schema";
import { addDays, format, isSaturday, isSunday } from "date-fns";

export function registerRoutes(app: Express): Server {
  
  // --- HELPER: GET SLOTS FOR A SPECIFIC DATE ---
  function getSlots(date: Date) {
    const isWeekend = isSaturday(date) || isSunday(date);
    // Atlanta Logic: Weekends = All Day, Weekdays = Evenings
    if (isWeekend) return ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];
    return ["5:30 PM", "6:30 PM", "7:30 PM", "8:30 PM"];
  }

  // --- 1. FIND NEXT AVAILABLE SLOT (SERVER SIDE LOGIC) ---
  app.get("/api/next-slot", async (req, res) => {
    try {
      console.log("🔍 Searching for ASAP slot...");
      const allBookings = await storage.getAllBookings();
      
      let checkDate = new Date(); // Start "Now"
      let foundSlot = null;
      let foundDate = null;

      // Check the next 14 days
      for (let i = 1; i <= 14; i++) {
        const targetDate = addDays(checkDate, i); // Look at i days in the future
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        const daySlots = getSlots(targetDate);

        // Find taken slots for this specific date string
        const takenOnDay = allBookings
          .filter(b => b.preferredDate === dateStr && b.status !== 'cancelled')
          .map(b => b.appointmentTime);

        // Debug Log (So you can see it in your terminal)
        console.log(`Checking ${dateStr}: ${takenOnDay.length} slots taken.`);

        // Find the first slot NOT in the taken list
        const firstFree = daySlots.find(slot => !takenOnDay.includes(slot));

        if (firstFree) {
          foundSlot = firstFree;
          foundDate = dateStr;
          console.log(`✅ Found Slot: ${foundDate} @ ${foundSlot}`);
          break; // Stop looking, we found one!
        }
      }

      if (foundDate && foundSlot) {
        res.json({ date: foundDate, time: foundSlot });
      } else {
        console.log("❌ No slots found in 14 days.");
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

  // --- 3. CREATE BOOKING (With Bouncer) ---
  app.post("/api/bookings", async (req, res) => {
    try {
      const data = insertBookingSchema.parse(req.body);

      // THE BOUNCER: Double check availability before saving
      const allBookings = await storage.getAllBookings();
      const isTaken = allBookings.find(b => 
        b.preferredDate === data.preferredDate && 
        b.appointmentTime === data.appointmentTime &&
        b.status !== "cancelled"
      );

      if (isTaken) {
        console.log(`🚫 Blocked duplicate booking for ${data.preferredDate} @ ${data.appointmentTime}`);
        return res.status(409).json({ message: "Slot taken" });
      }
      
      const booking = await storage.createBooking(data);
      
      // Send Emails (Background)
      sendBookingEmails(booking).catch(err => console.error("Email Error:", err));
      
      res.json(booking);
    } catch (error) {
      console.error("Booking Error:", error);
      res.status(400).json({ message: "Invalid booking data" });
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
    const updated = await storage.updateBooking(id, { ...req.body });
    sendRescheduleEmail(updated).catch(e => console.error(e));
    res.json(updated);
  });

  app.post("/api/admin/bookings/:id/cancel", async (req, res) => {
    const id = parseInt(req.params.id);
    const updated = await storage.updateBooking(id, { status: "cancelled" });
    sendCancellationEmail(updated).catch(e => console.error(e));
    res.json(updated);
  });

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  const httpServer = createServer(app);
  return httpServer;
}