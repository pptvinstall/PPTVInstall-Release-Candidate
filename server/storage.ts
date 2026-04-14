import { type Booking, type InsertBooking } from "@shared/schema";
import { DatabaseStorage } from "./storage.db";

// This interface defines what our Storage must do
export interface IStorage {
  // Booking Methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getAllBookings(): Promise<Booking[]>;
  updateBooking(id: number, updates: Partial<Booking>): Promise<Booking>;
}

export class MemStorage implements IStorage {
  private bookings: Map<number, Booking>;
  private currentBookingId: number;

  constructor() {
    this.bookings = new Map();
    this.currentBookingId = 1;
  }

  // --- BOOKING METHODS (The Important Part) ---
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    
    // Ensure all required fields exist, defaulting if necessary
    const booking: Booking = { 
      ...insertBooking, 
      id: String(id),
      // Default to "active" if not provided
      status: insertBooking.status || "active",
      // Default to empty object if breakdown missing
      pricingBreakdown: insertBooking.pricingBreakdown || "{}", 
      // Ensure notes is a string
      notes: insertBooking.notes || ""
    };
    
    this.bookings.set(id, booking);
    console.log(`✅ Storage: Saved Booking #${id} for ${booking.email}`);
    return booking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error("Booking not found");
    
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
}

export const storage = new DatabaseStorage();
