import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useLocation } from "wouter"; 
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { bookingSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { errorLogger } from "@/lib/errorLogger";
import { IntegratedBookingWizard } from "@/components/ui/integrated-booking-wizard";

export default function BookingPage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation(); 

  // Fetch existing bookings for selected date
  const { data: existingBookings = [], isLoading: isLoadingBookings } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      try {
        // Set a timeout to abort the request if it takes too long
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch("/api/bookings", {
          signal: controller.signal
        });
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error(`Error fetching bookings: ${response.status}`);
          return [];
        }
        
        const data = await response.json();
        return data.bookings || [];
      } catch (error) {
        // Handle specific error types but return empty array to avoid breaking the UI
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.error('Bookings request timed out');
          toast({
            title: "Warning",
            description: "Couldn't load existing bookings. Some time slots may appear available when they are not.",
            variant: "destructive"
          });
        } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.error('Network error while fetching bookings');
        } else {
          console.error('Error fetching bookings:', error);
          errorLogger.error(error instanceof Error ? error : 'Unknown booking fetch error', {
            component: 'BookingPage',
            action: 'fetchBookings'
          });
        }
        return [];
      }
    },
    retry: 1,
    retryDelay: 2000,
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const mutation = useMutation({
    mutationFn: async (data: any): Promise<any> => {
      console.log("Booking mutation received data:", data);

      try {
        // Set a timeout to abort the request if it takes too long
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        // Use simple fetch instead of apiRequest to directly handle response
        const response = await fetch('/api/booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: controller.signal
        });
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        console.log("API response status:", response.status);

        // Parse response JSON
        const responseData = await response.json();
        console.log("API response data:", responseData);

        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to create booking');
        }

        return responseData;
      } catch (error) {
        // Log error for debugging
        errorLogger.error(error instanceof Error ? error : 'Unknown booking mutation error', {
          component: 'BookingPage',
          action: 'createBooking',
          metadata: { bookingData: data }
        });

        // Handle specific error types
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        // Re-throw other errors
        throw error;
      }
    },
    onSuccess: (data) => {
      // Store the booking data and ID in session storage for retrieval
      if (data.booking) {
        const bookingId = data.booking.id;

        // Clear any previous booking data first
        sessionStorage.clear();

        // Store all booking information
        sessionStorage.setItem('bookingId', bookingId);

        // Store the entire booking data including smart home items if present
        const bookingWithSmartHome = {
          ...data.booking,
          smartHomeItems: data.booking.smartHomeItems || []
        };

        // Additionally store the raw date to ensure it's preserved exactly
        if (data.booking.preferredDate) {
          sessionStorage.setItem('rawBookingDate', data.booking.preferredDate);
        }

        // Log what we're storing for debugging
        console.log("Storing booking data in session:", bookingWithSmartHome);

        // Stringify and store the complete booking data
        sessionStorage.setItem('bookingData', JSON.stringify(bookingWithSmartHome));

        // Store appointment time separately for redundancy
        if (data.booking.appointmentTime) {
          sessionStorage.setItem('appointmentTime', data.booking.appointmentTime);
        }

        // Small delay to ensure storage is complete before navigation
        setTimeout(() => {
          // Redirect to confirmation page
          setLocation(`/booking-confirmation?id=${bookingId}`);
        }, 100);
      }

      toast({
        title: "Booking successful!",
        description: "You will receive a confirmation email shortly.",
      });
    },
    onError: (error: any) => {
      console.error("Booking error:", error);

      // Show more detailed error message if available
      const errorMessage = error.message || "There was an error processing your booking.";

      toast({
        title: "Booking failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Email Signup Banner */}
          <section aria-label="Email Signup" className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-green-700 mb-2">
                💰 Save $10 on Your Booking!
              </h2>
              <p className="text-green-600 mb-4">
                Join our newsletter for exclusive discounts and priority booking access
              </p>
              
              {/* Klaviyo Signup Form (Inline) */}
              <div className="klaviyo-form-XXjrLu mb-3"></div>
              
              {/* Alternative Manual Trigger */}
              <button 
                onClick={() => {
                  if ((window as any)._klOnsite) {
                    (window as any)._klOnsite.push(['openForm', 'XXjrLu']);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Get Discount Code
              </button>
              
              <p className="text-green-500 text-xs mt-2">
                Apply discount at checkout • No spam ever
              </p>
            </div>
          </section>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Book Your Installation</h1>
            <p className="text-xl text-gray-600">
              Schedule your TV mounting or smart home installation service
            </p>
          </div>

          <IntegratedBookingWizard
            onSubmit={async (data) => {
              return mutation.mutateAsync(data);
            }}
            isSubmitting={mutation.isPending}
            existingBookings={existingBookings}
            isLoadingBookings={isLoadingBookings}
          />
        </div>
      </div>
    </div>
  );
}