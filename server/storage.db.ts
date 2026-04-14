import { db } from "./db";
import {
  bookings,
  type Booking,
  type InsertBooking,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // ── Booking methods ───────────────────────────────────────────────────────

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [row] = await db
      .insert(bookings)
      .values({
        name: insertBooking.name,
        email: insertBooking.email,
        phone: insertBooking.phone,
        streetAddress: insertBooking.streetAddress,
        addressLine2: insertBooking.addressLine2 ?? null,
        city: insertBooking.city,
        state: insertBooking.state,
        zipCode: insertBooking.zipCode,
        notes: insertBooking.notes ?? null,
        serviceType: insertBooking.serviceType,
        preferredDate: insertBooking.preferredDate,
        appointmentTime: insertBooking.appointmentTime,
        status: insertBooking.status ?? "active",
        pricingTotal: insertBooking.pricingTotal != null
          ? String(insertBooking.pricingTotal)
          : null,
        pricingBreakdown: insertBooking.pricingBreakdown != null
          ? typeof insertBooking.pricingBreakdown === "string"
            ? insertBooking.pricingBreakdown
            : JSON.stringify(insertBooking.pricingBreakdown)
          : "{}",
        tvSize: insertBooking.tvSize ?? null,
        mountType: insertBooking.mountType ?? null,
        wallMaterial: insertBooking.wallMaterial ?? null,
        specialInstructions: insertBooking.specialInstructions ?? null,
      })
      .returning();

    return this.toBooking(row);
  }

  async getAllBookings(): Promise<Booking[]> {
    const rows = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt));
    return rows.map((row) => this.toBooking(row));
  }

  async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking> {
    // Only patch columns that were explicitly provided — never overwrite with undefined
    const patch: Record<string, unknown> = {};

    if (updates.status !== undefined)           patch.status = updates.status;
    if (updates.notes !== undefined)            patch.notes = updates.notes;
    if (updates.preferredDate !== undefined)    patch.preferredDate = updates.preferredDate;
    if (updates.appointmentTime !== undefined)  patch.appointmentTime = updates.appointmentTime;
    if (updates.pricingTotal !== undefined)     patch.pricingTotal = String(updates.pricingTotal);
    if (updates.tvSize !== undefined)           patch.tvSize = updates.tvSize;
    if (updates.mountType !== undefined)        patch.mountType = updates.mountType;
    if (updates.wallMaterial !== undefined)     patch.wallMaterial = updates.wallMaterial;
    if (updates.specialInstructions !== undefined) patch.specialInstructions = updates.specialInstructions;
    if (updates.cancellationReason !== undefined)  patch.cancellationReason = updates.cancellationReason;
    if (updates.pricingBreakdown !== undefined) {
      patch.pricingBreakdown =
        typeof updates.pricingBreakdown === "string"
          ? updates.pricingBreakdown
          : JSON.stringify(updates.pricingBreakdown);
    }

    const [row] = await db
      .update(bookings)
      .set(patch)
      .where(eq(bookings.id, id))
      .returning();

    if (!row) throw new Error(`Booking #${id} not found`);
    return this.toBooking(row);
  }

  // ── Row mapper ────────────────────────────────────────────────────────────
  // Maps a raw Drizzle DB row to the Booking type the rest of the app expects.
  // Key differences: DB id is number → app expects string; dates are Date → ISO string.

  private toBooking(row: typeof bookings.$inferSelect): Booking {
    return {
      id: String(row.id),
      name: row.name,
      email: row.email,
      phone: row.phone,
      streetAddress: row.streetAddress,
      addressLine2: row.addressLine2 ?? undefined,
      city: row.city,
      state: row.state,
      zipCode: row.zipCode,
      notes: row.notes ?? "",
      serviceType: row.serviceType,
      preferredDate: row.preferredDate,
      appointmentTime: row.appointmentTime,
      status: (row.status ?? "active") as Booking["status"],
      pricingTotal: row.pricingTotal ?? undefined,
      pricingBreakdown: row.pricingBreakdown ?? "{}",
      tvSize: row.tvSize ?? undefined,
      mountType: row.mountType ?? undefined,
      wallMaterial: row.wallMaterial ?? undefined,
      specialInstructions: row.specialInstructions ?? undefined,
      cancellationReason: row.cancellationReason ?? undefined,
      createdAt: row.createdAt?.toISOString() ?? undefined,
    } as unknown as Booking;
  }
}
