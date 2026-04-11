import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Clock, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { motion } from "framer-motion";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  async function onSubmit(data: z.infer<typeof contactSchema>) {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log("Contact Data:", data);
    toast({ title: "Message Sent!", description: "We'll get back to you shortly.", className: "bg-green-50 border-green-200 text-green-900" });
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <section className="relative overflow-hidden bg-slate-900 pb-24 pt-32 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute right-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-blue-600 blur-[100px]" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Get in <span className="text-blue-500">Touch</span>
            </h1>
            <p className="text-lg text-slate-300">
              Have a custom project or a quick question? We&apos;re here to help.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-20 -mt-10 py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 lg:col-span-1">
              <Card className="border-none bg-blue-600 text-white shadow-xl">
                <CardContent className="space-y-4 p-6 text-center">
                  <h3 className="text-xl font-bold">Need an exact price first?</h3>
                  <p className="text-sm text-blue-100">Most customers use our instant quote tool before booking.</p>
                  <Link href="/quote">
                    <Button className="w-full rounded-2xl bg-white text-blue-600 hover:bg-blue-50">Get Instant Quote</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="space-y-6 p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-slate-100 p-3 text-blue-600"><Phone className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-bold text-slate-900">Phone</h4>
                      <p className="text-sm text-slate-500">Call or text anytime</p>
                      <a href="tel:4047024748" className="text-sm font-bold text-blue-600 hover:underline">404-702-4748</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-slate-100 p-3 text-blue-600"><Mail className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-bold text-slate-900">Email</h4>
                      <p className="text-sm text-slate-500">Quotes and project questions</p>
                      <a href="mailto:pptvinstall@gmail.com" className="text-sm font-bold text-blue-600 hover:underline">pptvinstall@gmail.com</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-slate-100 p-3 text-blue-600"><MapPin className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-bold text-slate-900">Service Area</h4>
                      <p className="text-sm text-slate-600">Greater Atlanta metro including Buckhead, Decatur, Marietta, Alpharetta, Roswell, Lawrenceville and more.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-slate-100 p-3 text-blue-600"><Clock className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-bold text-slate-900">Business Hours</h4>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>Monday to Friday: 5:30 PM to 8:00 PM</p>
                        <p>Saturday and Sunday: 8:00 AM to 6:00 PM</p>
                      </div>
                    </div>
                  </div>

                  <a href="sms:4047024748?body=Hi! I have a question." className="block">
                    <Button variant="outline" className="w-full rounded-2xl border-slate-300 text-slate-900">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Text Us
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <h2 className="mb-6 text-2xl font-bold text-slate-900">Send us a message</h2>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" className="h-12 bg-slate-50 text-base" {...field} />
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
                                <Input placeholder="(404) 555-0123" className="h-12 bg-slate-50 text-base" {...field} />
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
                              <Input placeholder="john@example.com" className="h-12 bg-slate-50 text-base" {...field} />
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
                              <Textarea placeholder="Tell us about your project or question." className="min-h-[150px] resize-none bg-slate-50 text-base" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Message"}
                        {!isSubmitting ? <Send className="ml-2 h-4 w-4" /> : null}
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
