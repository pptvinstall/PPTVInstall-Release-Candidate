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
import MobileFAB from "@/components/ui/MobileFAB";
// FIX: Added curly braces { } for named imports
import { EnvironmentIndicator } from "@/components/ui/environment-indicator";
import { PromotionBanner } from "@/components/ui/promotion-banner";
import SeasonalBanner from "@/components/ui/SeasonalBanner";
import ErrorBoundary from "@/components/error-boundary";

// Pages
import Home from "@/pages/home";
import Services from "@/pages/services";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import Gallery from "@/pages/gallery"; 
import Booking from "@/pages/booking";
import QuotePage from "@/pages/quote";
import Confirmation from "@/pages/Confirmation";
import Dashboard from "@/pages/dashboard";
import NotFoundPage from "@/pages/not-found";

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
      <Route path="/quote" component={QuotePage} />
      <Route path="/confirmation" component={Confirmation} />

      {/* Owner Dashboard */}
      <Route path="/dashboard" component={Dashboard} />

      {/* Fallback */}
      <Route>
        {() => <NotFoundPage />} 
      </Route>
    </Switch>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SeasonalBanner />
        <EnvironmentIndicator />
        <PromotionBanner />
        
        <Nav />
        <main>
          <Router />
        </main>
        <Footer />
        <MobileFAB />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
