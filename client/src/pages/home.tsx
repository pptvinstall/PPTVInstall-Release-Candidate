
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Shield, Zap, Star, Phone, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { trackLead, trackPageView } from '../lib/fbPixel';
import { useToast } from '../hooks/use-toast';

const Home: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  // Refs for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  // In-view detection
  const servicesInView = useInView(servicesRef, { once: true, amount: 0.2 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.2 });

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Track page view  
  useEffect(() => {
    trackPageView();
  }, []);

  const services = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "TV Mounting",
      description: "Professional wall mounting for all TV sizes with custom options for wall type, mount, and wire concealment",
      price: "Starting at $100 per TV",
      details: ["Fireplace install: +$100", "Brick/stone wall: +$50", "Wire concealment & outlet: +$100"]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart Home Setup",
      description: "Setup for all major smart devices and integrations",
      price: "Starting at $99",
      details: ["Complete device configuration", "Network optimization", "User training included"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "TV De-Installation",
      description: "Quick, professional removal of mounted TVs",
      price: "Starting at $49",
      details: ["Safe removal process", "Wall repair available", "Equipment recycling options"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Buckhead, GA",
      rating: 5,
      text: "Absolutely perfect installation! They mounted our 75\" TV above the fireplace and it looks amazing. Very professional and clean work."
    },
    {
      name: "Mike Chen",
      location: "Midtown, GA",
      rating: 5,
      text: "Best TV mounting service in Atlanta! Fast, affordable, and they cleaned up everything. Highly recommend!"
    },
    {
      name: "Jessica Williams",
      location: "Decatur, GA",
      rating: 5,
      text: "They set up our entire smart home system. Everything works perfectly and they explained how to use it all."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left Side - Hero Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left space-y-6"
            >
              <Badge className="bg-red-500 text-white px-4 py-2 text-sm font-medium">
                #1 Rated TV Mounting in Atlanta
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Picture Perfect
                <span className="block text-red-400">TV Install</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 max-w-lg mx-auto lg:mx-0">
                Professional TV mounting and smart home installation services across Metro Atlanta
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="/booking" className="inline-block">
                  <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 text-lg font-semibold w-full">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Installation
                  </Button>
                </a>
                <a href="tel:4047024748" className="inline-block">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold w-full">
                    <Phone className="w-5 h-5 mr-2" />
                    Call Now
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Licensed & Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Same-Day Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Lifetime Warranty</span>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Brevo Form */}
            <div className="w-full max-w-md mx-auto lg:max-w-none mt-6 lg:mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className="bg-white rounded-xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-6"
              >
                <div className="mb-6 text-center">
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">
                    Join the Picture Perfect Experience
                  </h3>
                  <p className="text-red-500 text-sm">
                    Unlock exclusive deals, early access to specials, and pro tips to elevate your home setup.
                  </p>
                </div>

                {/* Brevo Form Iframe - Fixed Implementation */}
                <iframe
                  width="100%"
                  height="520"
                  src="https://227ffc5e.sibforms.com/serve/MUIFAIvOdZJKQivVxIQglvAtaIigtxkEh2tq9PIWv01xvfP6mp3detDHXLbf_CG3Fpy0LnMIruRoETcJ5avgk7Gurzcu7ElEZnEWIeZwncRTnxGlZ5GZSeRA5zg9L9g25Dol6QoX7R8oN7q0efDeexgSGjqSkITx9xJ930lHB6bqa1dAWRLKn35tip3JmlCO_mEFJcHxznpuMkwg"
                  frameBorder={0}
                  scrolling="auto"
                  allowFullScreen={true}
                  className="brevo-form-iframe"
                  title="Picture Perfect TV Install Sign Up Form"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={servicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional installation services designed to transform your home entertainment experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={servicesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                      {service.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="text-2xl font-bold text-blue-600 mb-4">{service.price}</div>
                    {service.details && (
                      <ul className="text-sm text-gray-600 mb-6 text-left space-y-1">
                        {service.details.map((detail, i) => (
                          <li key={i} className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                    <a href="/booking" className="block">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Get Quote
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Trusted by hundreds of Atlanta homeowners</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {testimonial.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Home?</h2>
          <p className="text-xl mb-8 text-blue-100">Get your professional TV installation scheduled today</p>
          <a href="/booking">
            <Button size="lg" className="bg-red-500 hover:bg-red-600 px-8 py-4 text-lg font-semibold">
              <Calendar className="w-5 h-5 mr-2" />
              Book Your Installation
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
