import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import QuoteTool from "@/components/ui/QuoteTool";
import { ReviewCTA } from "@/components/ui/ReviewCTA";
import { getSeasonalTheme } from "@/lib/seasonal-theme";
import { cn } from "@/lib/utils";
import { CheckCircle2, Star, Shield, Clock, Trophy, ChevronRight, Tv, MapPin, Flame, Plug, Camera, Bell, Speaker, Wrench, Smartphone, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const theme = getSeasonalTheme();
  const servicePills = [
    { label: "TV Mounting", icon: Tv },
    { label: "Fireplace Mounting", icon: Flame },
    { label: "Wire Concealment", icon: Plug },
    { label: "Security Cameras", icon: Camera },
    { label: "Smart Doorbell", icon: Bell },
    { label: "Sound Systems", icon: Speaker },
    { label: "AV Troubleshooting", icon: Wrench },
    { label: "Device Setup", icon: Smartphone },
    { label: "TV Removal", icon: Trash2 },
  ];

  const testimonials = [
    {
      name: "Sean Solomon",
      location: "Atlanta, GA",
      stars: 5,
      text: "Service was great and price was great. He was prompt and communication was perfect. He has did 3 prior installs and will be doing more in the near future. I would highly recommend using Justin for all installation needs.",
      service: "Repeat Customer"
    },
    {
      name: "Collin Ivins",
      location: "Atlanta, GA",
      stars: 5,
      text: "Justin from Picture Perfect TV installation has exceeded my expectations mounting several TVs and sound bars for my household. Their service offers excellent customer service, great communication, and punctuality.",
      service: "TV Mount + Soundbar"
    },
    {
      name: "Khamari Whaley",
      location: "Atlanta, GA",
      stars: 5,
      text: "Amazing!!! Justin did an amazing job and had great customer service! Completed the installation in a timely manner. Will definitely recommend to family/friends in the area!",
      service: "TV Installation"
    },
    {
      name: "Jovan Hooper",
      location: "Atlanta, GA",
      stars: 5,
      text: "Reached out to this business to mount my 65in over my fireplace and they were extremely professional! Would definitely hire again and recommend.",
      service: "Fireplace Mount"
    },
    {
      name: "Kim Plater",
      location: "Atlanta, GA",
      stars: 5,
      text: "Justin was very professional and knowledgeable. He was punctual and neat. He cleaned up after himself. I couldn't believe that he was able to install on the same day I called.",
      service: "Same-Day Install"
    },
    {
      name: "Amnyst Davis",
      location: "Atlanta, GA",
      stars: 5,
      text: "Found them on Thumbtack. They were the first to respond very quickly. Said they had openings for the next following day, even sent me a link to schedule my time stamp. Communicated well and was here within my time window.",
      service: "TV Mount"
    },
    {
      name: "Samarra McGee",
      location: "Atlanta, GA",
      stars: 5,
      text: "Clean and professional work! Outstanding and highly recommended! Thanks, Justin!",
      service: "TV Installation"
    },
    {
      name: "Josh B",
      location: "Atlanta, GA",
      stars: 5,
      text: "Justin walked me through all the TV mounting options he offered and explained each one. He mounted two TVs for me at a good price for the high quality work that was done. Highly recommend, will use again!",
      service: "Multi-TV Mount"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* --- HERO SECTION (Dark & Premium) --- */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white pt-24 pb-32 overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5 hero-grid-pattern" />
        {theme.heroBgOverlay ? <div className={cn("absolute inset-0 z-0", theme.heroBgOverlay)} /> : null}

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
              {theme.heroBadge}
            </div>

            {/* UPDATED TITLE COLORS */}
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Picture Perfect <br />
              <span className="text-red-500">TV</span> <span className="text-blue-500">Installation</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Transform your living space with expert TV mounting and smart home setup. 
              Clean, wire-free, and professionally secured.
            </p>

            <div className="pt-8">
              <div className="mx-auto flex max-w-xl flex-col gap-4 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
                <Link href="/quote">
                  <Button type="button" className="h-14 w-full rounded-2xl bg-blue-600 px-8 text-lg font-bold text-white hover:bg-blue-500 sm:w-auto">
                    ⚡ Get Instant Quote
                  </Button>
                </Link>
                <div className="grid w-full grid-cols-2 gap-4 sm:flex sm:w-auto">
                  <a href="tel:4047024748" className="w-full sm:w-auto">
                    <Button type="button" variant="outline" className="h-14 w-full flex-1 rounded-2xl border-2 border-white bg-white/10 px-6 text-base font-bold text-white transition-all hover:bg-white hover:text-slate-900 sm:w-auto min-w-[120px]">
                      📞 Call Us
                    </Button>
                  </a>
                  <a href="sms:4047024748?body=Hi! I'm interested in TV mounting services." className="w-full sm:w-auto">
                    <Button type="button" variant="outline" className="h-14 w-full flex-1 rounded-2xl border-2 border-white bg-white/10 px-6 text-base font-bold text-white transition-all hover:bg-white hover:text-slate-900 sm:w-auto min-w-[120px]">
                      💬 Text Us
                    </Button>
                  </a>
                </div>
              </div>
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
                    <div className="mt-1 text-sm font-semibold uppercase tracking-wider text-slate-500">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 md:flex-wrap md:justify-center">
            {servicePills.map((service) => (
              <Link key={service.label} href="/quote">
                <button
                  type="button"
                  className="flex min-w-max flex-shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-blue-600 hover:text-white"
                >
                  <service.icon className="h-4 w-4" />
                  {service.label}
                </button>
              </Link>
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

              <Link href="/quote">
                <Button className="w-fit rounded-full bg-slate-900 px-8 py-6 text-lg text-white hover:bg-slate-800">
                  Get a Quote <ChevronRight className="ml-2 h-5 w-5" />
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
                  Mount not included.<br/>We provide mounts starting at $40.
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
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold px-4 py-2 rounded-full mb-4">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              22 Five-Star Reviews on Google
            </div>
            <h2 className="text-3xl font-bold text-slate-900">What Our Customers Say</h2>
          </div>

          {/* Top row — 4 cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
            {testimonials.slice(0, 4).map((review, idx) => (
              <Card key={idx} className="border-slate-100 shadow-sm bg-slate-50 card-elevated">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-slate-600 italic mb-4 text-sm">"{review.text}"</p>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{review.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {review.location}
                    </div>
                    <span className="inline-block mt-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{review.service}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom row — 4 cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {testimonials.slice(4, 8).map((review, idx) => (
              <Card key={idx} className="border-slate-100 shadow-sm bg-slate-50 card-elevated">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-slate-600 italic mb-4 text-sm">"{review.text}"</p>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{review.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {review.location}
                    </div>
                    <span className="inline-block mt-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{review.service}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://g.page/r/CR7z0j9VraqQEAI/review"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold hover:underline text-sm"
            >
              See all 22 reviews on Google →
            </a>
          </div>
        </div>
      </section>

      {/* --- OUR WORK --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-2">Real Installations</p>
            <h2 className="text-4xl font-extrabold text-slate-900">See Our Work</h2>
            <p className="text-slate-500 mt-3 text-lg max-w-xl mx-auto">
              Every mount is level, every wire is hidden, every customer is happy.
            </p>
          </div>

          {/* Photo grid — uses my-work/ photos ONLY here on homepage (duplicate prevention)
               Gallery page uses a different set; services.tsx uses 2 others */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { src: '/images/my-work/0105b206d2cd697b03872faa63e6cbddb5a0501d96.jpg', alt: 'TV above a sleek recessed electric fireplace, zero visible wires' },
              { src: '/images/my-work/012df72991c0471338022ce94247139561cfa42c33.jpg', alt: 'Large TV over a glowing electric fireplace with warm living room ambiance' },
              { src: '/images/my-work/01206089f35a6f3abec9f7d0ef4c2287d012e7509c.jpg', alt: 'TV above a traditional white fireplace mantel with ceiling fan' },
              { src: '/images/my-work/0179e968420aeac4c69f7852a45ef9c781ecf59524.jpg', alt: 'Clean TV mount on white drywall — minimalist living room, zero cables visible' },
              { src: '/images/my-work/01b414810c1682a926d49d9049ddc680859aa20fba.jpg', alt: 'Large TV above a modern white entertainment credenza, no visible wiring' },
              { src: '/images/my-work/017196394ee2a4e2dc86b4b058be9ad8ddac1b287d.jpg', alt: 'TV in a dark media room with dramatic navy accent walls' },
              { src: '/images/my-work/016a891a608dd140c3072b75ac9c2b9ac8e6cba151.jpg', alt: 'Bedroom TV above dresser on a grey accent wall — perfect viewing angle' },
              { src: '/images/my-work/01739ae21f82c211e1f5709ff11676ccdccc66262c.jpg', alt: 'Bedroom TV on dark accent wall with blue LED lighting — gaming room setup' },
            ].map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a href="/gallery" className="text-blue-600 font-semibold hover:underline text-lg">
              See full gallery →
            </a>
          </div>
        </div>
      </section>

      {/* AI Quote Tool CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Know your price before you book
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Type it, fill it out, or just say it. Our AI quote tool gives you an itemized price in seconds.
          </p>
          {theme.promoDiscount ? (
            <div className={cn("mx-auto mb-8 max-w-2xl rounded-[28px] border border-white/10 bg-gradient-to-r p-6 text-left shadow-2xl", theme.accentColor)}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                {theme.emoji} {theme.label}
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-white">{theme.promoHeadline}</h3>
              <p className="mt-2 text-sm text-white/85">{theme.promoSubtext}</p>
              {theme.promoCode ? (
                <p className="mt-3 text-sm font-semibold text-white">
                  Use code {theme.promoCode} at booking
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="mt-10">
            <QuoteTool />
          </div>
        </div>
      </section>

      {/* --- REVIEW CTA --- */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <ReviewCTA />
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
              <Link href="/quote">
                <Button size="lg" className="mt-4 h-14 rounded-full bg-blue-600 px-10 text-lg font-bold text-white shadow-lg hover:bg-blue-500">
                  Get My Instant Quote →
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
