import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- FAQ DATA ---
const faqs = [
  {
    category: "Booking & Payments",
    items: [
      { q: "How do I pay?", a: "We accept Zelle, Cash, and Apple Pay upon completion of the job. We also accept Credit Cards via Square (a small processing fee applies)." },
      { q: "Do I need to pay a deposit?", a: "No! We don't require any payment until the job is done and you are 100% satisfied." },
      { q: "Can I cancel or reschedule?", a: "Yes. You can manage your appointment via the link in your confirmation email or by logging into the 'My Booking' section on our website." }
    ]
  },
  {
    category: "Services & Hardware",
    items: [
      { q: "Do you provide the mount?", a: "Yes! You can choose our 'Hardware Bundle' or 'Premium Package' and we will bring a high-quality mount (Fixed, Tilt, or Full Motion). If you have your own, select 'Basic Mounting'." },
      { q: "Do you hide the wires?", a: "Yes. Our 'Concealment' and 'Premium' packages include in-wall wire concealment for a clean, floating look. (Note: We cannot hide power cords inside walls unless an outlet is installed behind the TV)." },
      { q: "Can you mount over a fireplace?", a: "Absolutely. We specialize in fireplace mounting on drywall, brick, and stone. Just select the 'Over Fireplace' option when booking." }
    ]
  },
  {
    category: "Technical",
    items: [
      { q: "What if I have metal studs?", a: "We can mount to metal studs, but it requires special anchors. Please mention this in the booking notes so we come prepared." },
      { q: "Do you install on brick or concrete?", a: "Yes, we mount on all surfaces including brick, stone, and concrete. There is a small +$50 fee for masonry surfaces due to the specialized drill bits and anchors required." }
    ]
  }
];

// --- ACCORDION COMPONENT ---
const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left group"
      >
        <span className={`font-bold text-lg transition-colors ${isOpen ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600"}`}>
          {question}
        </span>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-600" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-slate-600 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* --- HERO SECTION --- */}
      <section className="relative bg-slate-900 text-white pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-600 blur-[100px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Frequently Asked <span className="text-blue-500">Questions</span>
            </h1>
            <p className="text-lg text-slate-300">
              Everything you need to know about our services, pricing, and installation process.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <section className="py-20 -mt-10 relative z-20">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <div className="space-y-8">
            {faqs.map((category, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-500 uppercase tracking-wider text-sm flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" /> {category.category}
                    </h2>
                  </div>
                  <div className="p-6 md:p-8">
                    {category.items.map((item, i) => (
                      <AccordionItem key={i} question={item.q} answer={item.a} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* --- STILL HAVE QUESTIONS CTA --- */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Still have questions?</h3>
            <p className="text-slate-500 mb-8">Can't find the answer you're looking for? Please chat to our friendly team.</p>
            <Link href="/contact">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-200">
                <MessageCircle className="mr-2 h-5 w-5" /> Contact Us
              </Button>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}