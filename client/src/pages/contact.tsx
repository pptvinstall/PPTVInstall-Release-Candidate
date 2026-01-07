import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Schema for the contact form
const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  message: z.string().min(10, "Please provide more details"),
});

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  async function onSubmit(data: z.infer<typeof contactSchema>) {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Contact Data:", data);
    toast({
      title: "Message Sent!",
      description: "We'll get back to you shortly.",
      className: "bg-green-50 border-green-200 text-green-900"
    });
    
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* --- HERO SECTION --- */}
      <section className="relative bg-slate-900 text-white pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-blue-600 blur-[100px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Get in <span className="text-blue-500">Touch</span>
            </h1>
            <p className="text-lg text-slate-300">
              Have a custom project? Questions about our mounts? 
              <br/>We're here to help you create the perfect setup.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <section className="py-16 -mt-10 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* LEFT COLUMN: Contact Info */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Quick Book Card */}
              <Card className="bg-blue-600 border-none text-white shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <h3 className="text-xl font-bold">Ready to start?</h3>
                  <p className="text-blue-100 text-sm">
                    Skip the wait! You can check our live availability and book instantly online.
                  </p>
                  <Link href="/booking">
                    <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold">
                      Book Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Info Cards */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg text-blue-600">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Phone</h4>
                    <p className="text-slate-500 text-sm mb-1">Call or Text anytime</p>
                    <a href="tel:4047024748" className="text-blue-600 font-bold hover:underline">404-702-4748</a>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg text-blue-600">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Email</h4>
                    <p className="text-slate-500 text-sm mb-1">For quotes & inquiries</p>
                    <a href="mailto:pptvinstall@gmail.com" className="text-blue-600 font-bold hover:underline">pptvinstall@gmail.com</a>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg text-blue-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Service Area</h4>
                    <p className="text-slate-600 text-sm font-medium">Metro Atlanta & Surrounding</p>
                    <p className="text-slate-400 text-xs mt-1">Decatur, Marietta, Alpharetta, Buckhead, Midtown, and more.</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg text-blue-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Hours</h4>
                    <div className="text-sm text-slate-600">
                      <p><span className="font-medium text-slate-900">Mon-Fri:</span> 5:30 PM - 9:30 PM</p>
                      <p><span className="font-medium text-slate-900">Weekends:</span> 10:00 AM - 10:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="border-none shadow-lg h-full">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" className="bg-slate-50" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(404) 555-0123" className="bg-slate-50" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" className="bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How can we help?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about your project (e.g., Mounting a 65 inch TV over a fireplace)" 
                                className="min-h-[150px] bg-slate-50 resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" size="lg" className="w-full bg-slate-900 hover:bg-slate-800" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Message"}
                        {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}