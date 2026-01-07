import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Layout & Components
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import EnvironmentIndicator from "@/components/ui/environment-indicator";
import PromotionBanner from "@/components/ui/promotion-banner";
import PWAInstallBanner from "@/components/ui/pwa-install-banner";
import ErrorBoundary from "@/components/error-boundary";

// Pages
import Home from "@/pages/home";
import Services from "@/pages/services";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import Gallery from "@/pages/gallery"; // <--- Make sure this is imported if you added the file!
import Booking from "@/pages/booking";
import Confirmation from "@/pages/Confirmation";
import AdminBookings from "@/pages/admin-bookings";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      
      {/* Booking Flow */}
      <Route path="/booking" component={Booking} />
      <Route path="/confirmation" component={Confirmation} />

      {/* Admin */}
      <Route path="/admin/bookings" component={AdminBookings} />

      {/* Fallback (Redirect to Home instead of crashing on 404) */}
      <Route>
        {() => <Home />} 
      </Route>
    </Switch>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <EnvironmentIndicator />
        <PromotionBanner />
        <PWAInstallBanner />
        <Nav />
        <main>
          <Router />
        </main>
        <Footer />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);