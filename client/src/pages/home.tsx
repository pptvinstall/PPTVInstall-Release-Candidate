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
import { debounce, monitorMemoryUsage } from "@/lib/performance-optimizations";

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

  // Remove problematic scroll animations that cause errors
  // const { scrollYProgress: heroScrollProgress } = useScroll({
  //   target: heroRef,
  //   offset: ["start start", "end start"],
  //   layoutEffect: false
  // });

  // // Optimized transforms with error handling
  // const showcaseOpacity = useTransform(heroScrollProgress, [0, 0.5], [1, 0.7]);
  // const showcaseScale = useTransform(heroScrollProgress, [0, 0.5], [1, 1.05]);

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
    
    // Monitor memory usage in development
    if (process.env.NODE_ENV === 'development') {
      const memoryCheck = debounce(monitorMemoryUsage, 5000);
      memoryCheck();
    }
    
    // Cleanup function
    return () => {
      // Cleanup any subscriptions or timers
      setShowSuccessModal(false);
    };
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
        className="relative min-h-[100vh] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden" 
        style={{ position: 'relative' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/assets/pattern-bg.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 py-16 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full min-h-[80vh]">
            
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

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                <div className="flex items-center px-5 py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-xl border-2 border-white/50 hover:bg-white transition-all duration-300">
                  <Clock className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-bold text-gray-900">Same-Day Available</span>
                </div>
                <div className="flex items-center px-5 py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-xl border-2 border-white/50 hover:bg-white transition-all duration-300">
                  <Shield className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-bold text-gray-900">Licensed & Insured</span>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Enhanced Form */}
            <div className="w-full max-w-lg mx-auto lg:max-w-none mt-4 lg:mt-0 order-1 lg:order-2">
              {/* Premium Email Collection Form */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="bg-white/98 backdrop-blur-md rounded-2xl border-2 border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-6 lg:p-8 hover:shadow-[0_25px_70px_rgba(0,0,0,0.25)] transition-shadow duration-500"
              >
                <form 
                  method="POST" 
                  action="https://227ffc5e.sibforms.com/serve/MUIFAORX-sUxF1INXeVZ4MEHF-ZqHQq3Dp-NgpQnIa0ZVx4aM4kUizmV8L0Zjtwuc9IjCzNKbAKSdYmrp0rmAsoDex-umT2WtC8hSfft6fSybf-qhN3VmJFcOmiIunk7swUsf0Q4FpQYEsrXBMwxaEcunAcfAEZO9ymottARx6jsEnGnnCSIoVomhColDxPaIsnmFfW-U_WOSfjf"
                  className="text-center max-w-md mx-auto space-y-4"
                  onSubmit={handleFormSubmit}
                >
                  <div className="mb-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Star className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      Join the Picture Perfect Experience
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed max-w-sm mx-auto">
                      Unlock exclusive deals, early access to specials, and pro tips to elevate your home setup.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="FIRSTNAME" className="block text-left text-gray-900 font-semibold text-base mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="FIRSTNAME"
                      name="FIRSTNAME"
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-base"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="SMS" className="block text-left text-gray-900 font-semibold text-base mb-1">
                      Phone Number *
                    </label>
                    <div className="flex rounded-xl overflow-hidden bg-white border-2 border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 hover:border-gray-400 transition-all duration-200">
                      <select 
                        name="SMS__COUNTRY_CODE" 
                        className="px-4 py-4 bg-white border-0 focus:outline-none focus:ring-0 text-gray-900 font-medium text-base"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input
                        type="tel"
                        id="SMS"
                        name="SMS"
                        required
                        placeholder="(555) 123-4567"
                        className="flex-1 px-4 py-4 bg-white border-0 focus:outline-none focus:ring-0 text-gray-900 placeholder-gray-500 text-base"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="EMAIL" className="block text-left text-gray-900 font-semibold text-base mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="EMAIL"
                      name="EMAIL"
                      required
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-base"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="BIRTHDAY" className="block text-left text-gray-900 font-semibold text-base mb-1">
                      Birthday <span className="text-gray-600 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="BIRTHDAY"
                      name="BIRTHDAY"
                      placeholder="MM/DD/YYYY"
                      pattern="^([0-2][0-9]|(3)[0-1])(-)(((0)[0-9])|((1)[0-2]))(-)\d{4}$"
                      title="dd-mm-yyyy"
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-base"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl mt-6 text-base shadow-lg"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    🚀 JOIN THE PICTURE PERFECT EXPERIENCE
                  </button>

                  <div className="text-xs text-gray-700 text-center mt-4 leading-relaxed">
                    <p>
                      By joining, you agree to receive exclusive offers and updates. We use Brevo for email marketing in accordance with{' '}
                      <a href="https://www.brevo.com/en/legal/privacypolicy/" target="_blank" className="text-blue-700 hover:text-blue-800 underline font-medium">
                        their Privacy Policy
                      </a>
                      . Unsubscribe anytime.
                    </p>
                  </div>

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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 mb-4">Why Choose Us</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Why Choose Picture Perfect?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Professional installation with premium service standards across Metro Atlanta
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Licensed & Insured</h3>
              <p className="text-gray-600 leading-relaxed">
                Fully licensed professionals with comprehensive insurance coverage for your complete peace of mind.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Same-Day Available</h3>
              <p className="text-gray-600 leading-relaxed">
                Fast, reliable installation often available the same day you book. No waiting weeks for service.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">#1 Rated Service</h3>
              <p className="text-gray-600 leading-relaxed">
                Top-rated TV mounting service in Metro Atlanta with hundreds of five-star reviews from satisfied customers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section 
        ref={testimonialsRef}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-700 mb-4">Customer Love</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from Atlanta homeowners who chose Picture Perfect
            </p>
          </div>

          {testimonialsInView && (
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-50 p-8 rounded-2xl"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "Amazing service! They mounted our 75" TV over the fireplace perfectly. Same-day service and extremely professional. Highly recommend!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">JS</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Jennifer S.</p>
                    <p className="text-gray-600 text-sm">Buckhead, Atlanta</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gray-50 p-8 rounded-2xl"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "Picture Perfect exceeded our expectations. Clean work, fair pricing, and they even helped set up our Apple TV. Will use again!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Mike R.</p>
                    <p className="text-gray-600 text-sm">Midtown, Atlanta</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gray-50 p-8 rounded-2xl"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "Fast, professional, and reasonably priced. They mounted 3 TVs and installed smart cameras. Couldn't be happier with the service!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">AL</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Amanda L.</p>
                    <p className="text-gray-600 text-sm">Decatur, Atlanta</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/pattern-bg.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready for Picture Perfect Installation?
            </h2>
            <p className="text-xl lg:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Book your professional TV mounting service today and join hundreds of satisfied customers across Metro Atlanta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <Button
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white font-bold h-16 px-12 text-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => trackLead({ source: 'cta_bottom' })}
                >
                  <span>Book Your Installation</span>
                  <ArrowRight className="h-6 w-6 ml-2" />
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white hover:bg-gray-50 border-2 border-white text-blue-700 font-bold h-16 px-12 text-xl"
                >
                  View All Services
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}