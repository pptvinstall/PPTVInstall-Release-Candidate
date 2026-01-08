import { Link } from "wouter";
import { Logo } from "@/components/logo";
import { Instagram, Video, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <Logo variant="light" />
            </div>
            <p className="text-sm text-slate-400">
              Metro Atlanta's premier TV mounting and smart home installation service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Menu</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services" className="hover:text-blue-400">Services</Link></li>
              <li><Link href="/gallery" className="hover:text-blue-400">Our Work</Link></li>
              <li><Link href="/booking" className="hover:text-blue-400">Book Online</Link></li>
              <li><Link href="/faq" className="hover:text-blue-400">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-500" /> 404-702-4748
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" /> pptvinstall@gmail.com
              </li>
              <li className="text-slate-500 text-xs mt-2">
                Serving Atlanta, Buckhead, Decatur, Marietta, and surrounding areas.
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-bold text-white mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://www.tiktok.com/@pptvinstall" target="_blank" className="bg-slate-800 p-2 rounded-full hover:bg-pink-600 hover:text-white transition-all">
                <Video className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" className="bg-slate-800 p-2 rounded-full hover:bg-purple-600 hover:text-white transition-all">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Picture Perfect TV Install. All rights reserved.
        </div>
      </div>
    </footer>
  );
}