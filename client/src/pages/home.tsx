
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Phone, MapPin, Clock, Star, Shield, Wrench, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InstallationGallery } from '@/components/ui/installation-gallery';
import { PromotionBanner } from '@/components/ui/promotion-banner';
import { Section } from '@/components/ui/section';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { AutoSlideshow } from '@/components/ui/auto-slideshow';

// Performance monitoring
import { logPerformance } from '@/lib/performance-monitor';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const startTime = performance.now();
    
    // Log page load performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          logPerformance('page_load', entry.duration, { page: 'home' });
        }
      }
    });
    observer.observe({ entryTypes: ['navigation'] });

    return () => {
      const endTime = performance.now();
      logPerformance('home_page_render', endTime - startTime, { mounted: true });
      observer.disconnect();
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Promotion Banner */}
      <PromotionBanner />

      {/* Hero Section */}
      <Section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-900 px-4 py-2">
                  Professional TV Installation Service
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Picture Perfect
                  <span className="block text-yellow-400">TV Install</span>
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                  Expert TV mounting and smart home installation services in Atlanta. 
                  Secure, professional installation at affordable rates.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
                  onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Book Installation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg"
                  onClick={() => window.open('tel:404-702-4748', '_self')}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span>Same Day Service</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span>1 Year Warranty</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <AutoSlideshow />
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Services Section */}
      <Section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional installation services to transform your space with the latest technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "TV Wall Mounting",
                description: "Secure mounting for TVs of all sizes with cable management",
                icon: "📺",
                price: "Starting at $89"
              },
              {
                title: "Fireplace TV Installation",
                description: "Professional mounting above fireplaces with heat considerations",
                icon: "🔥",
                price: "Starting at $129"
              },
              {
                title: "Smart Home Setup",
                description: "Complete smart home integration and device configuration",
                icon: "🏠",
                price: "Starting at $99"
              },
              {
                title: "Sound System Installation",
                description: "Surround sound and audio system professional setup",
                icon: "🔊",
                price: "Starting at $149"
              },
              {
                title: "Cable Management",
                description: "Clean, organized cable routing and concealment",
                icon: "🔌",
                price: "Starting at $49"
              },
              {
                title: "Device Setup",
                description: "Apple TV, streaming devices, and gaming console setup",
                icon: "📱",
                price: "Starting at $39"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="text-4xl mb-4">{service.icon}</div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <p className="font-semibold text-blue-600">{service.price}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the highest quality service with attention to every detail
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Licensed & Insured",
                description: "Fully licensed and insured for your peace of mind"
              },
              {
                icon: Wrench,
                title: "Expert Installation",
                description: "Years of experience with professional-grade equipment"
              },
              {
                icon: Clock,
                title: "Same Day Service",
                description: "Fast, efficient service that fits your schedule"
              },
              {
                icon: Users,
                title: "Customer Focused",
                description: "Dedicated to exceeding your expectations every time"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Installation Gallery */}
      <Section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Work</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See examples of our professional installations across Atlanta
            </p>
          </motion.div>
          <InstallationGallery />
        </div>
      </Section>

      {/* Booking Form Section */}
      <Section id="booking-form" className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Book Your Installation</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ready to get started? Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                {/* Brevo Form Embed */}
                <div 
                  id="sib-form-container"
                  dangerouslySetInnerHTML={{
                    __html: `
                      <div id="sib-container" class="sib-container--large sib-container--vertical" style="text-align:center; background-color:rgba(255,255,255,1); max-width:540px; border-radius:3px; border-width:1px; border-color:#C0CCD9; border-style:solid;">
                        <form id="sib-form" method="POST" action="https://6f3dd61a.sibforms.com/serve/MUIFAMb9H1zX7vHtD_wS5vu4YlE9uLJSMLqVeFN7LmUJKqJKfSfWJL3OXQ0KLhNWMdK0k8Sm7xdNpFwcNH1k3xAuPJ3tpQY7RckUjImEQrGn7lz5GUV7QSpYY9-TaGIuoNkTJjdBmhbIaNcR6-cAGcR3h5gj_EkrP7fJYYYRqA6HUKgSn2z2VgJjqZlrJKhI7sdklQ" data-type="subscription">
                          <div style="padding: 8px 0;">
                            <div class="sib-form-block" style="text-align:left">
                              <div class="sib-text-form-block">
                                <p style="text-align: center;"><span style="font-size:22px;"><span style="font-family:arial,helvetica,sans-serif;"><strong>Get Your Free Quote</strong></span></span></p>
                              </div>
                            </div>
                          </div>
                          <div style="padding: 8px 0;">
                            <div class="sib-input sib-form-block">
                              <div class="form__entry entry_block">
                                <div class="form__label-row ">
                                  <label class="entry__label" style="font-weight: 700; text-align:left; font-size:16px; color:#3C4858; font-family:'Inter', sans-serif;" for="FIRSTNAME" data-required="*">
                                    First Name
                                  </label>
                                  <div class="entry__field">
                                    <input class="input" type="text" id="FIRSTNAME" name="FIRSTNAME" autocomplete="given-name" placeholder="Your first name" data-required="true" required />
                                  </div>
                                </div>
                                <label class="entry__error entry__error--primary" style="font-size:16px; text-align:left; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                              </div>
                            </div>
                          </div>
                          <div style="padding: 8px 0;">
                            <div class="sib-input sib-form-block">
                              <div class="form__entry entry_block">
                                <div class="form__label-row ">
                                  <label class="entry__label" style="font-weight: 700; text-align:left; font-size:16px; color:#3C4858; font-family:'Inter', sans-serif;" for="LASTNAME" data-required="*">
                                    Last Name
                                  </label>
                                  <div class="entry__field">
                                    <input class="input" type="text" id="LASTNAME" name="LASTNAME" autocomplete="family-name" placeholder="Your last name" data-required="true" required />
                                  </div>
                                </div>
                                <label class="entry__error entry__error--primary" style="font-size:16px; text-align:left; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                              </div>
                            </div>
                          </div>
                          <div style="padding: 8px 0;">
                            <div class="sib-input sib-form-block">
                              <div class="form__entry entry_block">
                                <div class="form__label-row ">
                                  <label class="entry__label" style="font-weight: 700; text-align:left; font-size:16px; color:#3C4858; font-family:'Inter', sans-serif;" for="EMAIL" data-required="*">
                                    Email
                                  </label>
                                  <div class="entry__field">
                                    <input class="input" type="text" id="EMAIL" name="EMAIL" autocomplete="email" placeholder="Enter your email address" data-required="true" required />
                                  </div>
                                </div>
                                <label class="entry__error entry__error--primary" style="font-size:16px; text-align:left; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                              </div>
                            </div>
                          </div>
                          <div style="padding: 8px 0;">
                            <div class="sib-input sib-form-block">
                              <div class="form__entry entry_block">
                                <div class="form__label-row ">
                                  <label class="entry__label" style="font-weight: 700; text-align:left; font-size:16px; color:#3C4858; font-family:'Inter', sans-serif;" for="SMS" data-required="*">
                                    Phone Number
                                  </label>
                                  <div class="entry__field">
                                    <div class="sib-sms-input-wrapper" style="display:flex; align-items:center;">
                                      <select style="border:1px solid #ddd; padding:8px; border-radius:4px; margin-right:8px; background:white;">
                                        <option value="+1">🇺🇸 +1</option>
                                      </select>
                                      <input class="input" type="tel" id="SMS" name="SMS" autocomplete="tel" placeholder="(404) 555-0123" data-required="true" required style="flex:1;" />
                                    </div>
                                  </div>
                                </div>
                                <label class="entry__error entry__error--primary" style="font-size:16px; text-align:left; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                              </div>
                            </div>
                          </div>
                          <div style="padding: 8px 0;">
                            <div class="sib-input sib-form-block">
                              <div class="form__entry entry_block">
                                <div class="form__label-row ">
                                  <label class="entry__label" style="font-weight: 700; text-align:left; font-size:16px; color:#3C4858; font-family:'Inter', sans-serif;" for="SERVICE_TYPE">
                                    Service Type
                                  </label>
                                  <div class="entry__field">
                                    <select class="input" id="SERVICE_TYPE" name="SERVICE_TYPE" style="appearance:none; background-image:url('data:image/svg+xml,%3csvg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'none\\' viewBox=\\'0 0 20 20\\'%3e%3cpath stroke=\\'%236b7280\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'1.5\\' d=\\'M6 8l4 4 4-4\\'/%3e%3c/svg%3e'); background-position:right 12px center; background-repeat:no-repeat; background-size:16px; padding-right:40px;">
                                      <option value="">Select a service...</option>
                                      <option value="TV Wall Mounting">TV Wall Mounting ($89+)</option>
                                      <option value="Fireplace TV Installation">Fireplace TV Installation ($129+)</option>
                                      <option value="Smart Home Setup">Smart Home Setup ($99+)</option>
                                      <option value="Sound System Installation">Sound System Installation ($149+)</option>
                                      <option value="Cable Management">Cable Management ($49+)</option>
                                      <option value="Device Setup">Device Setup ($39+)</option>
                                      <option value="Multiple Services">Multiple Services</option>
                                      <option value="Not Sure - Need Consultation">Not Sure - Need Consultation</option>
                                    </select>
                                  </div>
                                </div>
                                <label class="entry__error entry__error--primary" style="font-size:16px; text-align:left; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                              </div>
                            </div>
                          </div>
                          <div style="padding: 8px 0;">
                            <div class="sib-input sib-form-block">
                              <div class="form__entry entry_block">
                                <div class="form__label-row ">
                                  <label class="entry__label" style="font-weight: 700; text-align:left; font-size:16px; color:#3C4858; font-family:'Inter', sans-serif;" for="MESSAGE">
                                    Project Details (Optional)
                                  </label>
                                  <div class="entry__field">
                                    <textarea class="input" id="MESSAGE" name="MESSAGE" placeholder="Tell us about your project, room details, preferred timing, etc." rows="4" style="resize:vertical; min-height:100px;"></textarea>
                                  </div>
                                </div>
                                <label class="entry__error entry__error--primary" style="font-size:16px; text-align:left; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                              </div>
                            </div>
                          </div>
                          <div style="padding: 8px 0;">
                            <div class="sib-form-block" style="text-align: center">
                              <button class="sib-form-block__button sib-form-block__button-with-loader" style="font-size:16px; text-align:center; font-weight:700; color:#FFFFFF; background-color:#3E90F0; border-radius:3px; border-width:0px; border-color:#3E90F0; font-family:'Inter', sans-serif; width:100%; padding:12px 24px;" form="sib-form" type="submit">
                                <svg class="icon clickable__icon progress-indicator__icon sib-hide-loader-icon" viewBox="0 0 512 512" style="width:16px; height:16px;">
                                  <path d="M460.116 373.846l-20.823-12.022c-5.541-3.199-7.54-10.159-4.663-15.874 30.137-59.886 28.343-131.652-5.386-189.946-33.641-58.394-94.896-95.833-161.827-99.676C261.028 55.961 256 50.751 256 44.352V20.309c0-6.904 5.808-12.337 12.703-11.982 83.556 4.306 160.163 50.864 202.11 123.677 42.063 72.696 42.15 162.226 0.248 235.056-3.209 5.571-0.185 12.703 6.384 15.12l21.338 7.864c6.587 2.427 10.22 9.808 8.036 16.314-2.222 6.617-9.269 10.047-15.703 7.588z"></path>
                                  <path d="M256.638 504.735c-84.004-0.307-160.499-50.579-202.046-133.462-41.531-82.826-32.831-184.632 23.018-257.428 3.177-4.144 8.767-4.704 12.911-1.25l13.077 10.907c4.144 3.177 4.704 8.767 1.25 12.911-48.106 62.794-55.202 150.269-18.707 220.506 36.777 70.839 108.024 114.353 188.638 115.241 6.5 0.072 11.717 5.35 11.717 11.864v23.846c0 6.904-5.808 12.337-12.703 11.982z"></path>
                                </svg>
                                GET MY FREE QUOTE
                              </button>
                            </div>
                          </div>
                          <div style="padding: 8px 0;">
                            <div class="sib-form-block" style="text-align:center">
                              <div class="form__entry entry_mcfield">
                                <div class="form__label-row ">
                                  <div style="text-align:center; font-size:14px; color:#687176; font-family:'Inter', sans-serif;">
                                    <p>By submitting this form, you agree to receive text messages from Picture Perfect TV Install. Message and data rates may apply. Reply STOP to opt out.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <input type="text" name="email_address_check" value="" class="input--hidden">
                          <input type="hidden" name="locale" value="en">
                        </form>
                      </div>
                    `
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* Contact Info Section */}
      <Section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Phone className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-blue-100">Available 7 days a week</p>
              <p className="text-2xl font-bold mt-2">404-702-4748</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <MapPin className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-semibold mb-2">Service Area</h3>
              <p className="text-blue-100">Atlanta Metro Area</p>
              <p className="mt-2">& Surrounding Counties</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-semibold mb-2">Hours</h3>
              <p className="text-blue-100">Monday - Sunday</p>
              <p className="mt-2">8:00 AM - 8:00 PM</p>
            </motion.div>
          </div>
        </div>
      </Section>
    </div>
  );
}
