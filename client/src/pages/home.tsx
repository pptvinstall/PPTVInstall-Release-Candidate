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
    offset: ["start start", "end start"]
  });

  // Add a scroll progress tracker for the showcase section
  const { scrollYProgress: showcaseScrollProgress } = useScroll({
    target: showcaseRef,
    offset: ["start start", "end start"]
  });

  const showcaseOpacity = useTransform(heroScrollProgress, [0, 0.5], [1, 0.7]);
  const showcaseScale = useTransform(heroScrollProgress, [0, 0.5], [1, 1.05]);

  // Handle Brevo form success callback
  useEffect(() => {
    const handleBrevoSuccess = () => {
      setShowSuccessModal(true);
      trackLead({ source: 'brevo_form_submit' });
    };
    
    // Listen for custom success message from Brevo form
    const handleMessage = (event) => {
      if (event.origin === window.location.origin && event.data === 'brevo-form-success') {
        handleBrevoSuccess();
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const services = [
    {
      title: "TV Mounting",
      icon: Tv,
      color: "text-blue-600",
      description: "Expert TV mounting for all sizes and surfaces",
      link: "/services#tv-mounting",
      features: ["Concealed wiring", "Precise leveling", "Secure installation"]
    },
    {
      title: "Smart Home",
      icon: Camera,
      color: "text-blue-500",
      description: "Complete setup of smart home devices and systems",
      link: "/services#smart-home",
      features: ["Security cameras", "Video doorbells", "System integration"]
    },
    {
      title: "Commercial",
      icon: Monitor,
      color: "text-green-500",
      description: "Professional installation for businesses and offices",
      link: "/services#commercial",
      features: ["Digital signage", "Conference rooms", "Entertainment systems"]
    }
  ];

  const testimonials = [
    {
      text: "Excellent service! They mounted my TV above the fireplace and concealed all the wires. Very professional and clean work.",
      name: "Sarah M.",
      location: "Atlanta, GA",
      rating: 5
    },
    {
      text: "Fast, efficient, and very knowledgeable. They helped me choose the perfect spot for my TV and even set up my smart home devices.",
      name: "John D.",
      location: "Marietta, GA",
      rating: 5
    },
    {
      text: "Best TV mounting service I've used. The installers were professional, on time, and did an amazing job hiding all the wires in the wall.",
      name: "Michael T.",
      location: "Alpharetta, GA",
      rating: 5
    }
  ];

  const benefits = [
    { icon: Trophy, title: "Experience", text: "Years of professional installation expertise" },
    { icon: Shield, title: "Guaranteed", text: "Satisfaction guaranteed on every job" },
    { icon: Wrench, title: "Professional", text: "Clean, precise work with attention to detail" },
    { icon: Clock, title: "Punctual", text: "On-time service with respect for your schedule" }
  ];

  return (
    <div className="scroll-container overflow-x-hidden relative" style={{ position: 'relative' }}>
      {/* PWA Install Banner - only visible on mobile */}
      <PWAInstallBanner />
      
      {/* Hero Section with Desktop Side-by-Side Layout */}
      <section
        ref={heroRef}
        className="min-h-screen flex items-center bg-white pt-4 pb-4"
        style={{ position: 'relative' }}
      >
        <div className="absolute inset-0 z-0 opacity-5">
          <div className="h-full w-full bg-[url('/assets/pattern-bg.svg')] bg-repeat opacity-20" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Desktop: Side-by-side layout, Mobile: Stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center lg:items-center">
            
            {/* Left Side - Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-center lg:text-left bg-white/5 backdrop-blur-sm rounded-xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-white/10"
            >
              <div className="inline-flex items-center justify-center gap-1 px-4 py-1.5 mb-8 rounded-full bg-white border border-blue-100 lg:mx-0 mx-auto">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm text-blue-600">Available Now in Metro Atlanta</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-blue-600 leading-tight">
                Professional TV<br />Mounting & Smart<br />Home Installation
              </h1>

              <p className="text-lg lg:text-xl text-blue-600 mb-4">
                Expert installation services with flawless<br />results in Metro Atlanta
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8 text-blue-500 text-sm font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Clean Wire Management
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Fireplace Installs
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Smart Home Setups
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center lg:justify-start justify-center">
                <Link href="/booking" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-12 flex items-center justify-center gap-2 px-8"
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
            <div className="w-full max-w-md mx-auto lg:max-w-none mt-6 lg:mt-0">
              {/* Brevo Email Collection Form - Premium Design */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="bg-white rounded-xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-6"
              >
                <div 
                  dangerouslySetInnerHTML={{
                    __html: `
                      <div class="sib-form" style="text-align: center; background-color: #ffffff;">
                        <div id="sib-form-container" class="sib-form-container">
                          <div id="error-message" class="sib-form-message-panel" style="font-size:16px; text-align:left; font-family:'Inter', sans-serif; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;max-width:540px; display: none;">
                            <div class="sib-form-message-panel__text sib-form-message-panel__text--center">
                              <span class="sib-form-message-panel__inner-text">
                                Oops! We couldn't save your info. Please try again in a moment.
                              </span>
                            </div>
                          </div>
                          <div></div>
                          <div id="success-message" class="sib-form-message-panel" style="font-size:16px; text-align:left; font-family:'Inter', sans-serif; color:#085229; background-color:#e7faf0; border-radius:3px; border-color:#13ce66;max-width:540px; display: none;">
                            <div class="sib-form-message-panel__text sib-form-message-panel__text--center">
                              <span class="sib-form-message-panel__inner-text">
                                You're in! Welcome to the Picture Perfect experience.
                              </span>
                            </div>
                          </div>
                          <div></div>
                          <div id="sib-container" class="sib-container--large sib-container--horizontal" style="text-align:center; background-color:rgba(255,255,255,1); max-width:540px; border-radius:12px; border-width:0px; border-color:#C0CCD9; border-style:solid; direction:ltr">
                            <form id="sib-form" method="POST" action="https://227ffc5e.sibforms.com/serve/MUIFAIUZllMksdwOm3Hq1eUSACUOZwEB7GjIVB5-YyHskSKw34Nh8fF1z1dT_Lw4XwUJUcOskAmS8EyPhs4dqAdMPEk2vXCMSUD5vkNegQ-trLlN-fUow9L3uGEz3A2kJW829-GqovrQcFB-4vh6u-k_3e2tq1Hqpmk-pTL0rA6_RYazDiFPNmfO91ol4t4oXaV5fLdk16-zZT_m" data-type="subscription">
                              <div style="padding: 8px 0;">
                                <div class="sib-form-block" style="font-size:28px; text-align:center; font-weight:700; font-family:'Inter', sans-serif; color:#1A56DB; background-color:transparent; text-align:center">
                                  <p>Join the Picture Perfect Experience</p>
                                </div>
                              </div>
                              <div style="padding: 8px 0;">
                                <div class="sib-form-block" style="font-size:14px; text-align:center; font-family:'Inter', sans-serif; color:#EF4444; background-color:transparent; text-align:center">
                                  <div class="sib-text-form-block">
                                    <p>Unlock exclusive deals, early access to specials, and pro tips to elevate your home setup.</p>
                                  </div>
                                </div>
                              </div>
                              <div style="padding: 8px 0;">
                                <div class="sib-input sib-form-block">
                                  <div class="form__entry entry_block">
                                    <div class="form__label-row form__label-row--horizontal">
                                      <label class="entry__label" style="font-weight: 700; text-align:left; font-size:14px; text-align:left; font-weight:700; font-family:'Inter', sans-serif; color:#1A56DB;" for="FIRSTNAME" data-required="*">Name</label>
                                      <div class="entry__field">
                                        <input class="input" maxlength="200" type="text" id="FIRSTNAME" name="FIRSTNAME" autocomplete="off" placeholder="" data-required="true" required style="font-family:'Inter', sans-serif;" />
                                      </div>
                                    </div>
                                    <label class="entry__error entry__error--primary" style="font-size:14px; text-align:left; font-family:'Inter', sans-serif; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                                    <label class="entry__specification" style="font-size:11px; text-align:right; font-family:'Inter', sans-serif; color:#EF4444; text-align:right">
                                      Let us know who we're talking to!
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div style="padding: 8px 0;">
                                <div class="sib-sms-field sib-form-block">
                                  <div class="form__entry entry_block">
                                    <div class="form__label-row">
                                      <label class="entry__label" style="font-weight: 700; text-align:left; font-size:14px; text-align:left; font-weight:700; font-family:'Inter', sans-serif; color:#1A56DB;" for="SMS" data-required="*">Phone Number</label>
                                      <div class="sib-sms-input-wrapper" style="direction:ltr">
                                        <div class="sib-sms-input" data-placeholder="" data-required="1" data-country-code="US" data-whatsapp-country-code="US" data-value="" data-whatsappvalue="" data-attributename="SMS">
                                          <div class="entry__field">
                                            <select class="input" name="SMS__COUNTRY_CODE" data-required="true" style="font-family:'Inter', sans-serif;">
                                              <option value="+1" selected>+1 US</option>
                                            </select>
                                          </div>
                                          <div class="entry__field" style="width: 100%">
                                            <input type="tel" class="input" id="SMS" name="SMS" autocomplete="off" placeholder="" data-required="true" required style="font-family:'Inter', sans-serif;" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <label class="entry__error entry__error--primary" style="font-size:14px; text-align:left; font-family:'Inter', sans-serif; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                                    <label class="entry__specification" style="font-size:11px; text-align:right; font-family:'Inter', sans-serif; color:#EF4444; text-align:right">
                                      For exclusive SMS deals & updates (no spam, just the good stuff).
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div style="padding: 8px 0;">
                                <div class="sib-input sib-form-block">
                                  <div class="form__entry entry_block">
                                    <div class="form__label-row form__label-row--horizontal">
                                      <label class="entry__label" style="font-weight: 700; text-align:left; font-size:14px; text-align:left; font-weight:700; font-family:'Inter', sans-serif; color:#1A56DB;" for="EMAIL" data-required="*">Email</label>
                                      <div class="entry__field">
                                        <input class="input" type="text" id="EMAIL" name="EMAIL" autocomplete="off" placeholder="" data-required="true" required style="font-family:'Inter', sans-serif;" />
                                      </div>
                                    </div>
                                    <label class="entry__error entry__error--primary" style="font-size:14px; text-align:left; font-family:'Inter', sans-serif; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                                    <label class="entry__specification" style="font-size:11px; text-align:right; font-family:'Inter', sans-serif; color:#EF4444; text-align:right">
                                      Stay in the loop with promos, upgrades & insider tips.
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div style="padding: 8px 0;">
                                <div class="sib-input sib-form-block">
                                  <div class="form__entry">
                                    <div class="form__label-row form__label-row--horizontal">
                                      <label class="entry__label" style="font-weight: 700; text-align:left; font-size:14px; text-align:left; font-weight:700; font-family:'Inter', sans-serif; color:#1A56DB;" for="BIRTHDAY">Birthday</label>
                                      <div class="entry__field">
                                        <input maxlength="200" type="text" data-type="date" class="input" pattern="^([0-2][0-9]|(3)[0-1])(-)(((0)[0-9])|((1)[0-2]))(-)\d{4}$" title="dd-mm-yyyy" data-format="dd-mm-yyyy" id="BIRTHDAY" name="BIRTHDAY" autocomplete="off" placeholder="" style="font-family:'Inter', sans-serif;" />
                                      </div>
                                    </div>
                                    <label class="entry__error entry__error--primary" style="font-size:14px; text-align:left; font-family:'Inter', sans-serif; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                                    <label class="entry__specification" style="font-size:11px; text-align:right; font-family:'Inter', sans-serif; color:#EF4444; text-align:right">
                                      dd-mm-yyyy
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div style="padding: 8px 0;">
                                <div class="sib-form__declaration" style="direction:ltr">
                                  <div style="font-size:12px; text-align:left; font-family:'Inter', sans-serif; color:#687484; background-color:transparent;">
                                    <p>We use Brevo as our marketing platform. By submitting this form you agree that the personal data you provided will be transferred to Brevo for processing in accordance with <a href="https://www.brevo.com/en/legal/privacypolicy/" target="_blank" style="color:#1A56DB;">Brevo's Privacy Policy.</a></p>
                                  </div>
                                </div>
                              </div>
                              <div style="padding: 8px 0;">
                                <div class="g-recaptcha sib-visible-recaptcha" id="sib-captcha" data-sitekey="6LcYXY0rAAAAAFtZ5pblsWeJPowEER0rqUQbqtjM" data-callback="handleCaptchaResponse" style="direction:ltr"></div>
                              </div>
                              <div style="padding: 8px 0;">
                                <div class="sib-form-block" style="text-align: left">
                                  <button class="sib-form-block__button sib-form-block__button-with-loader" style="font-size:16px; text-align:center; font-weight:700; font-family:'Inter', sans-serif; color:#ffffff; background-color:#1A56DB; border-radius:8px; border-width:0px; width: 100%; padding: 12px;" form="sib-form" type="submit">
                                    JOIN NOW
                                  </button>
                                </div>
                              </div>
                              <input type="text" name="email_address_check" value="" class="input--hidden">
                              <input type="hidden" name="locale" value="en">
                            </form>
                          </div>
                        </div>
                      </div>
                    `
                  }}
                />
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



      {/* Recent Installations Gallery */}
      <section
        className="py-10 bg-gradient-to-b from-white to-blue-50"
        style={{ position: 'relative' }}
      >
        <div className="container relative mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-3">
              Our Work
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Recent TV Installations</h2>
            <p className="text-lg text-blue-600 mb-5">
              Browse our gallery of recent TV mounting and installation projects in Metro Atlanta
            </p>
          </div>
          
          <InstallationSlideshow />
          
          <div className="mt-8 text-center">
            <p className="text-sm text-blue-500 mb-4">Swipe or use arrows to view more installations</p>
            
            <Link href="/booking">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                onClick={() => trackLead({ source: 'gallery_section' })}
              >
                Book Your Professional Installation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Showcase section */}
      <section
        ref={showcaseRef}
        className="py-8 bg-white"
        style={{ position: 'relative' }}
      >
        <div className="container relative mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <p className="text-lg text-blue-600">
              We provide professional TV mounting and smart home installation services throughout Metro Atlanta
            </p>
          </div>

          <div className="mx-auto max-w-4xl bg-gray-100 rounded-xl overflow-hidden shadow-md">
            <div className="grid grid-cols-2 gap-px relative">
              <div className="bg-blue-50 p-6 text-center flex flex-col items-center justify-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600">250+</div>
                <div className="text-sm md:text-base text-blue-600 font-medium mt-2">Happy Customers</div>
              </div>
              <div className="bg-blue-50 p-6 text-center flex flex-col items-center justify-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600">500+</div>
                <div className="text-sm md:text-base text-blue-600 font-medium mt-2">TVs Mounted</div>
              </div>
              <div className="bg-blue-50 p-6 text-center flex flex-col items-center justify-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600">5<span className="text-yellow-500">★</span></div>
                <div className="text-sm md:text-base text-blue-600 font-medium mt-2">Average Rating</div>
              </div>
              <div className="bg-blue-50 p-6 text-center flex flex-col items-center justify-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600">100%</div>
                <div className="text-sm md:text-base text-blue-600 font-medium mt-2">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        ref={servicesRef}
        className="relative py-12 lg:py-16 bg-gradient-to-b from-white to-blue-50/30"
        style={{ position: 'relative' }}
      >
        <div className="container relative mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="section-title text-3xl lg:text-4xl font-bold">Our Premium Services</h2>
            <p className="text-blue-600 text-lg">
              Professional TV mounting and smart home installation services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-500 border-2 border-blue-100 hover:border-blue-200 overflow-hidden group bg-white">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="mb-6 flex justify-center">
                      <div className="p-4 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110">
                        <service.icon className={`h-8 w-8 ${service.color} group-hover:text-blue-600 transition-colors duration-300`} />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-center mb-4 text-blue-700 group-hover:text-blue-600 transition-colors duration-300">{service.title}</h3>
                    <p className="text-center text-gray-600 mb-6">{service.description}</p>

                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          </div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="text-center mt-auto">
                      <Link href={service.link}>
                        <Button
                          variant="outline"
                          className="border-blue-200 hover:bg-blue-50 group-hover:border-blue-300 transition-all duration-300"
                        >
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        ref={testimonialsRef}
        className="relative py-12 bg-white"
        style={{ position: 'relative' }}
      >
        <div className="container relative mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <motion.span
              className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              Testimonials
            </motion.span>
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              What Our Customers Say
            </motion.h2>
            <motion.p
              className="text-lg text-blue-600"
              initial={{ opacity: 0, y: 20 }}
              animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Don't just take our word for it - hear from our satisfied customers
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={testimonialsInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Card className="h-full border-2 border-gray-100 hover:border-blue-100 transition-all duration-300">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Star className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex text-blue-600">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    </div>

                    <p className="text-blue-600 mb-6 flex-grow">
                      "{testimonial.text}"
                    </p>

                    <div className="mt-auto">
                      <p className="font-semibold text-blue-600">{testimonial.name}</p>
                      <p className="text-sm text-blue-600">{testimonial.location}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative py-10 bg-blue-600 text-white"
        style={{ position: 'relative' }}
      >
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready for Picture Perfect Installation?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Book your TV mounting service today and enjoy a hassle-free experience
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/booking">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-700 hover:bg-gray-100"
                  onClick={() => trackLead({ source: 'cta_section' })}
                >
                  Book Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        className="relative py-12 bg-gray-50"
        style={{ position: 'relative' }}
      >
        <div className="container relative mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Why Choose Us
            </motion.h2>
            <motion.p
              className="text-lg text-blue-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              We're committed to providing the highest quality service with attention to every detail
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <Card className="text-center border-2 border-gray-100 hover:border-blue-100 transition-all duration-300 h-full">
                  <CardContent className="p-6 h-full">
                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-blue-600">{benefit.title}</h3>
                    <p className="text-blue-600">{benefit.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/services">
              <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto p-8 relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {/* Success Content */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#1A56DB] mb-3">
                🎉 You're In!
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Welcome to the Picture Perfect Experience! We'll keep you updated with VIP-only perks, exclusive offers, and pro installation tips.
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-[#1A56DB] hover:bg-[#1440A0] text-white py-3 rounded-lg font-medium"
                >
                  Continue Exploring
                </Button>
                
                <Link href="/booking" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-[#1A56DB] text-[#1A56DB] hover:bg-[#1A56DB] hover:text-white py-3 rounded-lg font-medium"
                    onClick={() => {
                      setShowSuccessModal(false);
                      trackLead({ source: 'success_modal_book_now' });
                    }}
                  >
                    Book Your Installation Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}