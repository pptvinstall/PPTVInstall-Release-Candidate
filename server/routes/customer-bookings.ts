import { Request, Response } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db } from "../db";
import { bookings } from "@shared/schema";
import logger from "../logger";

// Update a booking as a customer
export async function updateCustomerBooking(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { preferredDate, appointmentTime, notes } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }
    
    // Load the existing booking
    const existingBooking = await db.select().from(bookings).where(eq(bookings.id, id));
    
    if (existingBooking.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    
    // Only allow editing of active bookings
    if (existingBooking[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        message: "Only active bookings can be updated"
      });
    }
    
    // Check if this time slot is already booked by someone else
    if (preferredDate && appointmentTime) {
      const existingBookings = await db.select().from(bookings).where(
        and(
          sql`DATE(${bookings.preferredDate}) = ${preferredDate}`,
          eq(bookings.appointmentTime, appointmentTime),
          eq(bookings.status, 'active'),
          sql`${bookings.id} != ${id}`
        )
      );
      
      if (existingBookings.length > 0) {
        return res.status(409).json({
          success: false,
          message: "This time slot is already booked. Please select another time."
        });
      }
    }
    
    // Prepare updates
    const updates: any = {};
    if (preferredDate) updates.preferredDate = preferredDate;
    if (appointmentTime) updates.appointmentTime = appointmentTime;
    if (notes !== undefined) updates.notes = notes;
    // Check if pricingBreakdown was passed in the request body, not in the updates object
    if (req.body.pricingBreakdown) {
      try {
        updates.pricingBreakdown = typeof req.body.pricingBreakdown === 'string' 
          ? JSON.parse(req.body.pricingBreakdown)
          : req.body.pricingBreakdown;
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid pricing breakdown format"
        });
      }
    }
    
    // Update the booking
    const result = await db.update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Failed to update booking"
      });
    }
    
    // Send notification email
    try {
      // Import the email service function
      const { sendBookingUpdateEmail } = await import('../services/emailService');
      
      // Send the email - ensure booking object has proper types
      const bookingData = {
        ...result[0],
        id: result[0].id.toString(), // Convert number ID to string
        status: (result[0].status || 'active') as 'active' | 'cancelled' | 'completed' | 'scheduled',
        notes: result[0].notes || undefined, // Convert null to undefined
        addressLine2: result[0].addressLine2 || undefined,
        pricingTotal: result[0].pricingTotal || undefined,
        pricingBreakdown: result[0].pricingBreakdown || undefined,
        tvSize: result[0].tvSize || undefined,
        mountType: result[0].mountType || undefined,
        wallMaterial: result[0].wallMaterial || undefined,
        specialInstructions: result[0].specialInstructions || undefined,
        cancellationReason: result[0].cancellationReason || undefined,
        createdAt: result[0].createdAt?.toISOString() || undefined,
        consentToContact: result[0].consentToContact || undefined
      };
      await sendBookingUpdateEmail(bookingData, updates);
      logger.info(`Customer booking update email sent for booking ID ${id}`);
    } catch (emailError) {
      logger.error("Error sending customer booking update email:", emailError);
      // We don't want to fail the request if the email fails
    }
    
    res.json({
      success: true,
      message: "Booking updated successfully",
      booking: result[0]
    });
  } catch (error) {
    logger.error("Error updating customer booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking"
    });
  }
}

// Get a customer's booking by ID
export async function getCustomerBookingById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const email = req.params.email;
    
    if (isNaN(id) || !email) {
      return res.status(400).json({
        success: false,
        message: "Invalid parameters"
      });
    }
    
    // Get the booking
    const booking = await db.select().from(bookings).where(
      and(
        eq(bookings.id, id),
        eq(bookings.email, email)
      )
    );
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    
    res.json({
      success: true,
      booking: booking[0]
    });
  } catch (error) {
    logger.error("Error fetching customer booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve booking"
    });
  }
}