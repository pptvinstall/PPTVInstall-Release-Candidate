import { bookings, type Booking, type InsertBooking } from "@shared/schema";

export interface IStorage {
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByDate(date: string): Promise<Booking[]>;
  updateBooking(id: number, updates: Partial<Booking>): Promise<Booking>;
  getAllBookings(): Promise<Booking[]>; 
}

export class MemStorage implements IStorage {
  private bookings: Map<number, Booking>;
  private currentId: number;

  constructor() {
    this.bookings = new Map();
    this.currentId = 1;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentId++;
    const booking: Booking = { ...insertBooking, id, created_at: new Date() };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    // Filter by date AND ensure status is NOT cancelled
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.preferredDate === date && booking.status !== "cancelled"
    );
  }

  async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error("Booking not found");
    const updated = { ...booking, ...updates };
    this.bookings.set(id, updated);
    return updated;
  }

  async getAllBookings(): Promise<Booking[]> {
    // Return everything (active AND cancelled) so Admin can see history
    return Array.from(this.bookings.values());
  }
}

export const storage = new MemStorage();