import { users, type User, type InsertUser, bookings, type Booking, type InsertBooking } from "@shared/schema";

// This interface defines what our Storage must do
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Booking Methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getAllBookings(): Promise<Booking[]>;
  updateBooking(id: number, updates: Partial<Booking>): Promise<Booking>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bookings: Map<number, Booking>;
  private currentUserId: number;
  private currentBookingId: number;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
  }

  // --- USER METHODS ---
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // --- BOOKING METHODS (The Important Part) ---
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    
    // Ensure all required fields exist, defaulting if necessary
    const booking: Booking = { 
      ...insertBooking, 
      id,
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

export const storage = new MemStorage();