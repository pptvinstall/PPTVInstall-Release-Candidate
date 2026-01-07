import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Menu, X } from "lucide-react"; // Removed 'User' icon import
import { motion, AnimatePresence } from "framer-motion";

export default function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  // Always use solid white background
  const navClasses = "bg-white border-b border-slate-100 shadow-sm py-2";

  // Text Colors
  const linkClass = "text-slate-900 hover:text-blue-600 transition-colors cursor-pointer font-bold tracking-wide";

  const navLinks = [
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClasses}`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          
          {/* Logo */}
          <Logo variant="dark" />

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={linkClass}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* CTA Button */}
            <Link href="/booking">
              <Button 
                size="sm" 
                className="font-bold rounded-full px-8 transition-all shadow-md bg-blue-600 text-white hover:bg-blue-700 h-10 text-base"
              >
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-900"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-center">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span 
                    className="text-xl font-bold text-slate-800" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
              <div className="h-px bg-slate-100 w-full my-2" />
              
              <Link href="/booking">
                <Button className="w-full bg-blue-600 text-lg py-6 mt-4" onClick={() => setMobileMenuOpen(false)}>
                  Book Now
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}