import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, Tv, Zap, Video, Shield, Hammer, ArrowRight, Flame, MinusCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Services() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* --- HERO SECTION --- */}
      <section className="relative bg-slate-900 text-white pt-32 pb-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-600 blur-[100px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600 blur-[100px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Expert <span className="text-blue-500">Solutions</span> for <br/>Every Screen
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              From basic mounting to complex home theater setups and smart home integration. 
              We bring the tools, the hardware, and the expertise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- TV MOUNTING SECTION --- */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <Tv className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">TV Mounting</h2>
              <p className="text-slate-500">Secure, level, and clean installations.</p>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Basic Package */}
            <motion.div variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-all border-slate-200 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Basic Mounting</CardTitle>
                  <div className="text-3xl font-black text-slate-900 mt-2">$100</div>
                  <CardDescription>You provide the TV & Mount</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> Level installation guaranteed</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> Any TV Size (32" - 85"+)</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> Basic cable management</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/booking" className="w-full">
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">Book Basic</Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Hardware Bundle */}
            <motion.div variants={itemVariants}>
              <Card className="h-full shadow-lg border-blue-500 bg-white relative overflow-hidden flex flex-col transform md:-translate-y-4">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-blue-700">Hardware Bundle</CardTitle>
                  <div className="text-3xl font-black text-slate-900 mt-2">$130<span className="text-lg text-slate-400 font-medium">+</span></div>
                  <CardDescription>We provide the Mount</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-2"><Check className="h-4 w-4 text-blue-500 flex-shrink-0" /> <strong>Mount Included</strong></li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> Fixed, Tilt, or Full Motion options</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> Professional installation</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> Hardware warranty included</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/booking" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md">Book Bundle</Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Premium / Fireplace */}
            <motion.div variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-all border-slate-200 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Flame className="h-5 w-5 text-amber-500"/> Over Fireplace
                  </CardTitle>
                  <div className="text-3xl font-black text-slate-900 mt-2">$200<span className="text-lg text-slate-400 font-medium">+</span></div>
                  <CardDescription>Specialized Heat-Safe Install</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> Drywall or Masonry/Brick</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> Heat damage prevention</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> Proper viewing angle</li>
                    <li className="flex gap-2"><Check className="h-4 w-4 text-green-500 flex-shrink-0" /> Wire concealment available</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/booking" className="w-full">
                    <Button variant="outline" className="w-full">Book Fireplace</Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800 flex flex-col sm:flex-row gap-4 justify-center items-center text-center">
            <span className="flex items-center gap-2"><Hammer className="h-4 w-4"/> Brick/Stone Surface: <strong>+$50</strong></span>
            <span className="hidden sm:inline text-blue-300">|</span>
            <span className="flex items-center gap-2"><Zap className="h-4 w-4"/> Outlet Relocation: <strong>+$100</strong></span>
            <span className="hidden sm:inline text-blue-300">|</span>
            <span className="flex items-center gap-2"><Zap className="h-4 w-4"/> Wire Concealment: <strong>Package Available</strong></span>
          </div>
        </div>
      </section>

      {/* --- SMART HOME SECTION --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Smart Home</h2>
              <p className="text-slate-500">Automate and secure your property.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             {[
               { title: "Smart Doorbell", price: "$85", icon: Video, features: ["Wiring setup", "Chime sync", "WiFi testing", "Brick install (+$10)"] },
               { title: "Security Camera", price: "$75", icon: Shield, features: ["Secure mounting", "Power connection", "Custom height", "WiFi Setup"] },
               { title: "Floodlight Cam", price: "$125", icon: Zap, features: ["Weatherproof install", "Wiring integration", "Motion sensor setup", "App config"] }
             ].map((item, idx) => (
               <Card key={idx} className="hover:border-indigo-200 transition-all group">
                 <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                       <item.icon className="h-6 w-6 text-slate-700 group-hover:text-indigo-600" />
                     </div>
                     <div className="text-2xl font-bold text-indigo-600">{item.price}</div>
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mb-4">{item.title}</h3>
                   <ul className="space-y-2 mb-6">
                     {item.features.map((f, i) => (
                       <li key={i} className="text-sm text-slate-500 flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> {f}
                       </li>
                     ))}
                   </ul>
                   <Link href="/booking">
                     <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">Add to Booking <ArrowRight className="ml-2 h-4 w-4"/></Button>
                   </Link>
                 </CardContent>
               </Card>
             ))}
          </div>
        </div>
      </section>

      {/* --- REMOVAL SECTION --- */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-red-400 font-bold uppercase tracking-wide text-sm">
                <MinusCircle className="h-5 w-5" /> Removal Services
              </div>
              <h2 className="text-3xl font-bold">Need a TV Taken Down?</h2>
              <p className="text-slate-400 max-w-lg">
                We offer professional unmounting services. We'll safely remove your TV and mount, organize your cables, and patch basic drywall holes.
              </p>
              <div className="flex items-center gap-6 pt-2">
                <div className="text-4xl font-bold">$50</div>
                <div className="text-sm text-slate-400">Flat rate per TV</div>
              </div>
            </div>
            <Link href="/booking">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200 font-bold px-8">
                Book Removal
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}