import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";
import { sendBookingEmails, sendRescheduleEmail, sendCancellationEmail } from "./email";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // --- EXISTING ROUTES ---
  app.post("/api/bookings", async (req, res) => {
    try {
      const data = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(data);
      
      // Send confirmation email
      sendBookingEmails(booking).catch(console.error);
      
      res.json(booking);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({ message: "Invalid booking data", errors: e.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/availability", async (req, res) => {
    const date = req.query.date as string;
    if (!date) return res.status(400).json({ message: "Date required" });
    const bookings = await storage.getBookingsByDate(date);
    const takenTimes = bookings
      .filter(b => b.status === 'active' || b.status === 'confirmed')
      .map(b => b.appointmentTime);
    res.json(takenTimes);
  });

  // --- NEW ADMIN ROUTES ---

  // 1. Get All Bookings (Protected by simple frontend logic for now)
  app.get("/api/admin/bookings", async (req, res) => {
    // In a real app, check session/cookie here.
    const bookings = await storage.getAllBookings(); // You might need to add this method to storage if missing
    res.json(bookings);
  });

  // 2. Reschedule Booking
  app.post("/api/admin/bookings/:id/reschedule", async (req, res) => {
    const { id } = req.params;
    const { date, time } = req.body;
    
    try {
      const booking = await storage.getBooking(parseInt(id));
      if (!booking) return res.status(404).json({ message: "Booking not found" });

      const updated = await storage.updateBooking(parseInt(id), { 
        preferredDate: date, 
        appointmentTime: time 
      });

      // Send Email
      sendRescheduleEmail(updated).catch(console.error);
      
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: "Failed to reschedule" });
    }
  });

  // 3. Cancel Booking
  app.post("/api/admin/bookings/:id/cancel", async (req, res) => {
    const { id } = req.params;
    try {
      const booking = await storage.getBooking(parseInt(id));
      if (!booking) return res.status(404).json({ message: "Booking not found" });

      const updated = await storage.updateBooking(parseInt(id), { status: "cancelled" });

      // Send Email
      sendCancellationEmail(updated).catch(console.error);
      
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: "Failed to cancel" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}