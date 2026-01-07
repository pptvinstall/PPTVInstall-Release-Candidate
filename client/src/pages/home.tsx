import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Star, Shield, Clock, Trophy, ChevronRight, Tv, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* --- HERO SECTION (Dark & Premium) --- */}
      <section className="relative bg-slate-900 text-white pt-24 pb-32 overflow-hidden">
        {/* Abstract Background Effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute -top-[50%] -left-[20%] w-[800px] h-[800px] rounded-full bg-blue-600 blur-[120px]" />
          <div className="absolute bottom-[0%] -right-[20%] w-[600px] h-[600px] rounded-full bg-indigo-600 blur-[120px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/50 text-blue-300 text-xs font-medium mb-4 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Available Now in Metro Atlanta
            </div>

            {/* UPDATED TITLE COLORS */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Picture Perfect <br />
              <span className="text-red-500">TV</span> <span className="text-blue-500">Installation</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Transform your living space with expert TV mounting and smart home setup. 
              Clean, wire-free, and professionally secured.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/booking">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-14 text-lg shadow-lg shadow-blue-900/50 transition-all hover:scale-105">
                  Book Now
                </Button>
              </Link>
              {/* UPDATED BUTTON: NOW VISIBLE */}
              <Link href="/services">
                <Button variant="outline" size="lg" className="bg-white text-blue-900 border-white hover:bg-blue-50 hover:text-blue-700 h-14 text-lg px-8 font-bold">
                  View Services
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 pt-12 text-slate-400 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" /> Licensed & Insured
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" /> Same-Day Service
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> 5-Star Rated
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- STATS SECTION (Floating Cards) --- */}
      <section className="relative z-20 -mt-16 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { label: "Happy Customers", value: "250+", icon: CheckCircle2 },
              { label: "TVs Mounted", value: "500+", icon: Tv },
              { label: "Average Rating", value: "5.0", icon: Star },
              { label: "Satisfaction", value: "100%", icon: Trophy },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-none shadow-xl bg-white/95 backdrop-blur">
                  <CardContent className="p-6 text-center">
                    <stat.icon className="h-8 w-8 mx-auto mb-2 text-blue-600 opacity-80" />
                    <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED OFFER (The "Wow" Deal) --- */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
            <div className="p-8 md:p-12 md:w-3/5 flex flex-col justify-center">
              <div className="uppercase tracking-wide text-sm text-blue-600 font-bold mb-2">Most Popular Choice</div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Standard Mounting Package</h2>
              <p className="text-slate-600 mb-6 text-lg">
                The perfect solution for most homes. We expertly mount your TV to the wall, level it perfectly, and handle basic cable management.
              </p>
              
              <ul className="space-y-3 mb-8">
                {["Level installation guaranteed", "Stud finding & secure mounting", "All TV sizes supported", "Basic cable management", "Post-install cleanup"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <div className="bg-green-100 p-1 rounded-full"><CheckCircle2 className="h-4 w-4 text-green-600" /></div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/booking">
                <Button className="w-fit bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 text-lg rounded-full">
                  Book This Service <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <div className="bg-blue-600 p-8 md:p-12 md:w-2/5 flex flex-col justify-center items-center text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-700 opacity-50 rotate-45 transform scale-150"></div>
              <div className="relative z-10">
                <div className="text-lg font-medium opacity-90 mb-2">Flat Rate Pricing</div>
                <div className="text-6xl font-black mb-2 tracking-tight">$100</div>
                <div className="text-xl font-medium opacity-90">Per TV</div>
                <div className="mt-8 text-sm opacity-75 border-t border-blue-400 pt-4">
                  Mount not included.<br/>We can provide one for +$30.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* (Removed the "Our Premium Services" section as requested) */}

      {/* --- TESTIMONIALS --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                text: "Excellent service! They mounted my TV above the fireplace and concealed all the wires. Very professional and clean work.",
                author: "Sarah M.",
                loc: "Atlanta, GA"
              },
              {
                text: "Fast, efficient, and very knowledgeable. They helped me choose the perfect spot for my TV and set up my smart home devices.",
                author: "John D.",
                loc: "Marietta, GA"
              },
              {
                text: "Best TV mounting service I've used. The installers were professional, on time, and did an amazing job hiding the wires.",
                author: "Michael T.",
                loc: "Alpharetta, GA"
              }
            ].map((review, idx) => (
              <Card key={idx} className="border-slate-100 shadow-sm bg-slate-50">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-slate-600 italic mb-6">"{review.text}"</p>
                  <div>
                    <div className="font-bold text-slate-900">{review.author}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {review.loc}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold">Ready to upgrade your home?</h2>
              <p className="text-slate-300 text-lg">
                Schedule your professional installation today and experience the difference.
              </p>
              <Link href="/booking">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 h-14 text-lg shadow-lg rounded-full mt-4">
                  Book Your Appointment
                </Button>
              </Link>
            </div>
            
            {/* Decorative background circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-600 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>
      </section>

    </div>
  );
}