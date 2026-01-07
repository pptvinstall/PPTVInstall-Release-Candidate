import { useState } from "react";
import { useLocation } from "wouter";
import { IntegratedBookingWizard } from "@/components/ui/integrated-booking-wizard";
import { useToast } from "@/hooks/use-toast";

export default function Booking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This function receives the data FROM the Wizard
  const handleBookingSubmit = async (wizardData: any) => {
    setIsSubmitting(true);
    
    try {
      // 1. TRANSLATION LAYER
      // We convert the complex Wizard data into the flat format the DB expects
      const dbPayload = {
        name: wizardData.name,
        email: wizardData.email,
        phone: wizardData.phone,
        streetAddress: wizardData.streetAddress,
        addressLine2: wizardData.addressLine2,
        city: wizardData.city,
        state: wizardData.state,
        zipCode: wizardData.zipCode,
        
        serviceType: wizardData.serviceType,
        preferredDate: wizardData.preferredDate, // Already formatted YYYY-MM-DD by wizard
        appointmentTime: wizardData.appointmentTime,
        
        notes: wizardData.notes,
        
        // Convert the number to a string for the DB
        pricingTotal: wizardData.pricingTotal.toString(),
        
        // PACK THE DETAILS: Store all the TV/Smart Home arrays as a JSON string
        pricingBreakdown: JSON.stringify({
          tvInstallations: wizardData.tvInstallations,
          smartHome: wizardData.smartHomeInstallations,
          removal: wizardData.tvDeinstallationServices
        }),
        
        status: "active"
      };

      console.log("Sending to Server:", dbPayload);

      // 2. SEND TO SERVER
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbPayload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create booking");
      }

      // 3. SUCCESS!
      toast({
        title: "Booking Confirmed!",
        description: "Check your email for details.",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      
      // Redirect to confirmation page
      setLocation("/confirmation");

    } catch (error) {
      console.error("Booking Error:", error);
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "Please try again or call us.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            Schedule Your Installation
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select your service below. <span className="font-bold text-blue-600">No payment required</span> until the job is done.
          </p>
        </div>

        {/* Pass our new submit handler to the wizard */}
        <IntegratedBookingWizard 
          onSubmit={handleBookingSubmit} 
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}