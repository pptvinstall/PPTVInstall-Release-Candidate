import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  ArrowRight,
  Monitor,
  Shield,
  Star,
  Wrench,
  CheckCircle,
  Check,
  Tv,
  Camera,
  Home,
  Clock,
  Trophy,
  PhoneCall,
  X
} from "lucide-react";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { useEffect, useState, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { InstallationSlideshow } from "@/components/ui/installation-gallery";
import { PWAInstallBanner } from "@/components/ui/pwa-install-banner";
import { trackViewContent, trackLead } from "@/lib/fbPixel";
import { MetaTags, META_CONFIGS } from "@/components/ui/meta-tags";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  
  // Track page view with Meta Pixel ViewContent event
  useEffect(() => {
    trackViewContent({ content_name: 'Home Page', content_category: 'page_view' });
  }, []);

  const servicesInView = useInView(servicesRef, { once: true, amount: 0.2 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.2 });

  // Using a ref with a container that has position: relative
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
    layoutEffect: false
  });

  // Add a scroll progress tracker for the showcase section
  const { scrollYProgress: showcaseScrollProgress } = useScroll({
    target: showcaseRef,
    offset: ["start start", "end start"],
    layoutEffect: false
  });

  const showcaseOpacity = useTransform(heroScrollProgress, [0, 0.5], [1, 0.7]);
  const showcaseScale = useTransform(heroScrollProgress, [0, 0.5], [1, 1.05]);

  // Handle Brevo form success - Prevent redirect and submit via fetch
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission redirect
    
    const formData = new FormData(e.currentTarget);
    
    try {
      // Submit to Brevo without redirect
      await fetch('https://227ffc5e.sibforms.com/serve/MUIFAORX-sUxF1INXeVZ4MEHF-ZqHQq3Dp-NgpQnIa0ZVx4aM4kUizmV8L0Zjtwuc9IjCzNKbAKSdYmrp0rmAsoDex-umT2WtC8hSfft6fSybf-qhN3VmJFcOmiIunk7swUsf0Q4FpQYEsrXBMwxaEcunAcfAEZO9ymottARx6jsEnGnnCSIoVomhColDxPaIsnmFfW-U_WOSfjf', {
        method: 'POST',
        body: formData,
        mode: 'no-cors' // Allow cross-origin request
      });
      
      // Track successful submission
      trackLead({ source: 'brevo_form_submit' });
      
      // Show success modal immediately
      setShowSuccessModal(true);
      
      // Reset form
      e.currentTarget.reset();
      
    } catch (error) {
      console.error('Form submission error:', error);
      // Still show success modal since no-cors mode doesn't return response
      trackLead({ source: 'brevo_form_submit' });
      setShowSuccessModal(true);
      e.currentTarget.reset();
    }
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      <MetaTags {...META_CONFIGS.home} />
      <PWAInstallBanner />
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Picture Perfect!</h3>
            <p className="text-gray-600 mb-6">
              You're now part of our family! Get ready for exclusive deals, pro tips, and early access to our latest services.
            </p>
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Continue Exploring
            </Button>
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-[90vh] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden" 
        style={{ position: 'relative' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/assets/pattern-bg.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
            
            {/* Left Side - Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-white space-y-6 order-2 lg:order-1"
            >
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  #1 Rated in Metro Atlanta
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Picture Perfect
                  <span className="block text-red-400">TV Install</span>
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 max-w-xl">
                  Professional TV mounting & smart home installation services. Same-day appointments available across Metro Atlanta.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/booking" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-bold h-12 px-8 shadow-lg"
                    onClick={() => trackLead({ source: 'home_hero' })}
                  >
                    <span>Book Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 border-blue-200 text-blue-600 h-12 px-8"
                  >
                    Our Services
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-6">
                <div className="flex items-center px-4 py-2 bg-white rounded-full shadow-sm">
                  <Clock className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm">Same-Day Available</span>
                </div>
                <div className="flex items-center px-4 py-2 bg-white rounded-full shadow-sm">
                  <Shield className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm">License & Insured</span>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Brevo Form (Desktop), Below Hero (Mobile) */}
            <div className="w-full max-w-md mx-auto lg:max-w-none mt-6 lg:mt-0 order-1 lg:order-2">
              {/* Brevo Email Collection Form - Premium Design */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="bg-white rounded-xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-6"
              >
                <form 
                  method="POST" 
                  action="https://227ffc5e.sibforms.com/serve/MUIFAORX-sUxF1INXeVZ4MEHF-ZqHQq3Dp-NgpQnIa0ZVx4aM4kUizmV8L0Zjtwuc9IjCzNKbAKSdYmrp0rmAsoDex-umT2WtC8hSfft6fSybf-qhN3VmJFcOmiIunk7swUsf0Q4FpQYEsrXBMwxaEcunAcfAEZO9ymottARx6jsEnGnnCSIoVomhColDxPaIsnmFfW-U_WOSfjf"
                  className="text-center max-w-md mx-auto space-y-4"
                  onSubmit={handleFormSubmit}
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-blue-600 mb-2">
                      Join the Picture Perfect Experience
                    </h3>
                    <p className="text-red-500 text-sm">
                      Unlock exclusive deals, early access to specials, and pro tips to elevate your home setup.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="FIRSTNAME" className="block text-left text-blue-600 font-semibold mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="FIRSTNAME"
                      name="FIRSTNAME"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="SMS" className="block text-left text-blue-600 font-semibold mb-1">
                      Phone Number *
                    </label>
                    <div className="flex">
                      <select 
                        name="SMS__COUNTRY_CODE" 
                        className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <option value="+1">+1 US</option>
                      </select>
                      <input
                        type="tel"
                        id="SMS"
                        name="SMS"
                        required
                        className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="EMAIL" className="block text-left text-blue-600 font-semibold mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="EMAIL"
                      name="EMAIL"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="BIRTHDAY" className="block text-left text-blue-600 font-semibold mb-1">
                      Birthday
                    </label>
                    <input
                      type="text"
                      id="BIRTHDAY"
                      name="BIRTHDAY"
                      placeholder="dd-mm-yyyy"
                      pattern="^([0-2][0-9]|(3)[0-1])(-)(((0)[0-9])|((1)[0-2]))(-)\d{4}$"
                      title="dd-mm-yyyy"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  <div className="text-xs text-gray-500 text-left mt-4">
                    <p>
                      We use Brevo as our marketing platform. By submitting this form you agree that the personal data you provided will be transferred to Brevo for processing in accordance with{' '}
                      <a href="https://www.brevo.com/en/legal/privacypolicy/" target="_blank" className="text-blue-600 hover:underline">
                        Brevo's Privacy Policy
                      </a>
                      .
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors mt-6"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    JOIN NOW
                  </button>

                  <input type="text" name="email_address_check" defaultValue="" className="hidden" />
                  <input type="hidden" name="locale" value="en" />
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Service Section */}
      <section className="py-8 bg-gradient-to-b from-white to-blue-50" style={{ position: 'relative' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">Most Popular Service</span>
            <h2 className="text-3xl font-bold mt-2 mb-2">Basic TV Mounting</h2>
            <p className="text-gray-600">Professional mounting with your own TV mount</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-5 bg-white overflow-hidden rounded-xl shadow-md border border-blue-100">
              <div className="md:col-span-2 relative bg-blue-600 p-6 flex items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/assets/pattern-bg.svg')] bg-repeat"></div>
                <div className="text-center relative z-10">
                  <Monitor className="h-16 w-16 text-white mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white">$100</div>
                  <div className="text-blue-100 mt-1">Flat Rate</div>
                  <Link href="/booking" className="mt-4 block">
                    <Button 
                      className="bg-white text-blue-600 hover:bg-blue-50" 
                      onClick={() => trackLead({ source: 'featured_service' })}
                    >
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="md:col-span-3 p-6">
                <h3 className="text-xl font-semibold mb-3">What's Included:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Customer-provided mount</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Level installation</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>All TV sizes supported</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Stud finding & secure mounting</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Basic cable management</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Professional installation</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    Add-ons available: Outlet installation ($100), Non-drywall surface mounting ($50)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose Picture Perfect?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional installation with premium service standards across Metro Atlanta
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Licensed & Insured</h3>
              <p className="text-gray-600">
                Fully licensed professionals with comprehensive insurance coverage for your peace of mind.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Same-Day Service</h3>
              <p className="text-gray-600">
                Fast, reliable installation often available the same day you book.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">#1 Rated Service</h3>
              <p className="text-gray-600">
                Top-rated TV mounting service in Metro Atlanta with hundreds of satisfied customers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready for Picture Perfect Installation?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Book your professional TV mounting service today and join hundreds of satisfied customers across Metro Atlanta.
            </p>
            <Link href="/booking">
              <Button
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white font-bold h-14 px-12 text-lg shadow-lg"
                onClick={() => trackLead({ source: 'cta_bottom' })}
              >
                <span>Book Your Installation</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}