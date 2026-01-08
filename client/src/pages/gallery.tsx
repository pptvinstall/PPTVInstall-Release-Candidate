import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Instagram, Video, Play, ExternalLink, Star } from "lucide-react";

// YOUR REAL TIKTOK VIDEOS 🎵
const tiktokVideos = [
  {
    title: "Drywall Tilt Mount",
    caption: "Clean simple mount with 100% wire concealment. The classic setup.",
    link: "https://www.tiktok.com/t/ZThLaM7e8/",
    thumbnail: "/images/install-8.jpg" // Using your Green Wall pic as cover
  },
  {
    title: "82\" Beast Mode Install",
    caption: "Me & Pops hanging a massive 82-inch on a full motion mount. Zero wires.",
    link: "https://www.tiktok.com/t/ZThLaU3Hy/",
    thumbnail: "/images/install-3.jpg" // Using your Wood Slat pic as cover
  },
  {
    title: "The Whole Home Upgrade",
    caption: "Smart doorbell + 2 Bedrooms + Living Room. Full house transformation.",
    link: "https://www.tiktok.com/t/ZThLaDyxy/",
    thumbnail: "/images/install-1.jpg" // Using your Marble Fireplace pic as cover
  }
];

// YOUR REAL INSTAGRAM PHOTOS 📸
// These map to the files you will upload to client/public/images/
const instagramImages = [
  { src: "/images/install-1.jpg", alt: "75 inch TV mounted on marble fireplace" },
  { src: "/images/install-3.jpg", alt: "Samsung TV on custom wood slat wall" },
  { src: "/images/install-6.jpg", alt: "Outdoor patio TV installation on stone" },
  { src: "/images/install-7.jpg", alt: "Living room TV over white mantel" },
  { src: "/images/install-2.jpg", alt: "Clean bedroom TV install" },
  { src: "/images/install-4.jpg", alt: "Wall mounted TV with hidden wires" },
  { src: "/images/install-5.jpg", alt: "Kitchen entertainment setup" },
  { src: "/images/install-8.jpg", alt: "Guest room TV mounting" },
];

export default function Gallery() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* --- HERO --- */}
      <section className="relative bg-slate-900 text-white pt-28 pb-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black opacity-80" />
        
        <div className="container relative z-10 mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 border-none text-white px-3 py-1 text-sm shadow-lg">
              <Instagram className="w-3 h-3 mr-1" /> As Seen On Social
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Real Installs.<br/><span className="text-blue-500">Real Results.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-sm mx-auto">
              No stock photos here. Just clean work from around Atlanta.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- TIKTOK SECTION --- */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="p-3 rounded-full bg-black text-white shadow-lg">
              <Video className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Watch Us Work</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiktokVideos.map((video, idx) => (
              <a href={video.link} target="_blank" key={idx} className="group relative block bg-slate-900 rounded-2xl overflow-hidden shadow-xl aspect-[9/16] md:aspect-video hover:ring-4 ring-blue-500/30 transition-all transform hover:-translate-y-1">
                {/* Thumbnail Image */}
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg border border-white/30">
                    <Play className="h-6 w-6 fill-white text-white ml-1" />
                  </div>
                  <span className="font-bold text-lg drop-shadow-md leading-tight">{video.title}</span>
                  <p className="text-xs text-slate-200 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {video.caption}
                  </p>
                  <span className="absolute bottom-4 text-[10px] font-bold uppercase tracking-wider bg-black/50 px-2 py-1 rounded flex items-center gap-1">
                    Watch on TikTok <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
          
          <div className="text-center mt-10">
             <a href="https://www.tiktok.com/@pptvinstall" target="_blank">
               <Button size="lg" variant="outline" className="rounded-full border-2 border-black text-black hover:bg-black hover:text-white font-bold px-8">
                 View All Videos
               </Button>
             </a>
          </div>
        </div>
      </section>

      {/* --- INSTAGRAM GRID --- */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-4">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-slate-700">Recent Atlanta Projects</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">The Highlight Reel</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-fr">
            {instagramImages.map((img, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden bg-white rounded-xl shadow-sm border border-slate-100 cursor-zoom-in">
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-white text-xs font-medium line-clamp-2">{img.alt}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-blue-600 rounded-2xl p-8 md:p-12 shadow-2xl shadow-blue-200 max-w-4xl mx-auto relative overflow-hidden">
               {/* Background patterns */}
               <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
               <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
               
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 relative z-10">Want your setup to look this good?</h3>
               <p className="text-blue-100 mb-8 max-w-lg mx-auto relative z-10">
                 Book online in less than 60 seconds. No hidden fees. Pay after we finish.
               </p>
               <Link href="/booking">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 py-6 rounded-full shadow-lg text-lg relative z-10">
                  Book Appointment Now
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}