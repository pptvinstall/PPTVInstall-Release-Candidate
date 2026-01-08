import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Tv, Zap, Wrench, Hammer, Plus, Minus, Trash2, 
  Video, Bell, Lightbulb, ChevronRight, ArrowLeft, 
  Loader2, CheckCircle2, Speaker, Cable, BrickWall
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

// --- INTERFACES ---
interface TVServiceOption {
  id: string;
  packageType: 'basic' | 'hardware' | 'concealment' | 'premium';
  packageName: string;
  size: 'small' | 'large';
  location: 'standard' | 'fireplace';
  wallType: 'standard' | 'masonry';
  mountType: 'fixed' | 'tilting' | 'full_motion' | 'customer';
  addSoundbar: boolean;
  addHdmi: boolean;
  concealment: boolean;
}

interface SmartHomeOption {
  id: string;
  type: 'camera' | 'doorbell' | 'floodlight';
  count: number;
  isMasonry: boolean;
}

// --- PRICING CONSTANTS ---
const PRICES = {
  basic_install: 100,
  concealment_install: 200,
  fireplace_fee: 100,
  masonry_tv: 50,
  masonry_sh: 20,
  soundbar: 50,
  hdmi: 25,
  smart_camera: 75,
  smart_doorbell: 85,
  smart_floodlight: 125,
  removal: 50
};

const getMountPrice = (mountType: string, size: 'small' | 'large') => {
  if (mountType === 'customer') return 0;
  if (size === 'small') {
    if (mountType === 'fixed') return 30;
    if (mountType === 'tilting') return 40;
    if (mountType === 'full_motion') return 60;
  } else {
    if (mountType === 'fixed') return 40;
    if (mountType === 'tilting') return 50;
    if (mountType === 'full_motion') return 80;
  }
  return 0;
};

const getSlotsForDate = (date: Date) => {
  const day = date.getDay();
  const isWeekend = day === 0 || day === 6;
  if (isWeekend) return ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];
  return ["5:30 PM", "6:30 PM", "7:30 PM", "8:30 PM"];
};

export default function Booking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const configRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [tvServices, setTvServices] = useState<TVServiceOption[]>([]);
  const [smartHomeServices, setSmartHomeServices] = useState<SmartHomeOption[]>([]);
  const [deinstallCount, setDeinstallCount] = useState(0);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", streetAddress: "", city: "", state: "GA", zipCode: "",
    date: undefined as Date | undefined, time: "", notes: ""
  });

  // --- FETCH AVAILABILITY ---
  useEffect(() => {
    if (formData.date) {
      const dateStr = format(formData.date, 'yyyy-MM-dd');
      fetch(`/api/availability?date=${dateStr}`)
        .then(res => res.json())
        .then(data => setTakenSlots(data)) 
        .catch(err => console.error("Schedule error", err));
    } else {
      setTakenSlots([]);
    }
  }, [formData.date]);

  // --- SERVER-SIDE ASAP FINDER ---
  const findNextASAP = async () => {
    setIsSearching(true);
    try {
      const res = await fetch("/api/next-slot");
      if (!res.ok) throw new Error("No slots found");
      const data = await res.json();
      const nextDate = parseISO(data.date);
      setFormData(prev => ({ ...prev, date: nextDate, time: data.time }));
      toast({ 
        title: "Earliest Slot Locked!", 
        description: `${format(nextDate, 'MMM do')} @ ${data.time}`,
        className: "bg-green-50 border-green-200 text-green-800"
      });
    } catch (e) {
      toast({ title: "Schedule Full", description: "No openings found in next 14 days.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  // --- SCROLL HELP ---
  useEffect(() => {
    if ((tvServices.length > 0 || smartHomeServices.length > 0) && configRef.current) {
      setTimeout(() => {
        configRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [tvServices.length, smartHomeServices.length]);

  // --- TV ACTIONS ---
  const addTvPackage = (packageType: 'basic' | 'hardware' | 'concealment' | 'premium', packageName: string) => {
    const newTv: TVServiceOption = {
      id: `tv-${Date.now()}`,
      packageType,
      packageName,
      size: 'small',
      location: 'standard',
      wallType: 'standard',
      mountType: (packageType === 'hardware' || packageType === 'premium') ? 'fixed' : 'customer',
      addSoundbar: false,
      addHdmi: false,
      concealment: (packageType === 'concealment' || packageType === 'premium')
    };
    setTvServices([...tvServices, newTv]);
    toast({ title: "Added!", description: `${packageName} selected.` });
  };

  const updateTv = (id: string, updates: Partial<TVServiceOption>) => {
    setTvServices(prev => prev.map(tv => tv.id === id ? { ...tv, ...updates } : tv));
  };

  const removeTv = (id: string) => {
    setTvServices(prev => prev.filter(tv => tv.id !== id));
  };

  // --- SMART HOME ACTIONS (ADD/REMOVE) ---
  const addSmartHome = (type: 'camera' | 'doorbell' | 'floodlight') => {
    const existing = smartHomeServices.find(s => s.type === type);
    if (existing) {
      setSmartHomeServices(prev => prev.map(s => s.type === type ? { ...s, count: s.count + 1 } : s));
    } else {
      setSmartHomeServices([...smartHomeServices, { id: `sh-${Date.now()}`, type, count: 1, isMasonry: false }]);
    }
  };

  const removeSmartHome = (type: 'camera' | 'doorbell' | 'floodlight') => {
    const existing = smartHomeServices.find(s => s.type === type);
    if (!existing) return;
    if (existing.count > 1) {
      setSmartHomeServices(prev => prev.map(s => s.type === type ? { ...s, count: s.count - 1 } : s));
    } else {
      setSmartHomeServices(prev => prev.filter(s => s.type !== type));
    }
  };

  const updateSmartHome = (id: string, updates: Partial<SmartHomeOption>) => {
    setSmartHomeServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // --- REMOVAL ACTIONS (ADD/REMOVE) ---
  const incrementRemoval = () => setDeinstallCount(c => c + 1);
  const decrementRemoval = () => setDeinstallCount(c => Math.max(0, c - 1));

  // --- TOTAL CALC ---
  const calculateTotal = () => {
    let total = 0;
    tvServices.forEach(tv => {
      let price = 0;
      if (tv.packageType === 'basic' || tv.packageType === 'hardware') price += PRICES.basic_install;
      else price += PRICES.concealment_install;
      price += getMountPrice(tv.mountType, tv.size);
      if (tv.location === 'fireplace') price += PRICES.fireplace_fee;
      if (tv.wallType === 'masonry') price += PRICES.masonry_tv;
      if (tv.addSoundbar) price += PRICES.soundbar;
      if (tv.addHdmi) price += PRICES.hdmi;
      total += price;
    });
    smartHomeServices.forEach(s => {
      let unitPrice = (s.type === 'floodlight' ? PRICES.smart_floodlight : s.type === 'doorbell' ? PRICES.smart_doorbell : PRICES.smart_camera);
      if (s.isMasonry) unitPrice += PRICES.masonry_sh;
      total += unitPrice * s.count;
    });
    total += deinstallCount * PRICES.removal;
    return total;
  };

  const total = calculateTotal();

  // --- SUBMIT ---
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("POST", "/api/bookings", payload);
      if (res.status === 409) throw new Error("CONFLICT"); 
      if (!res.ok) throw new Error("Booking failed");
      return res.json();
    },
    onSuccess: () => { setLocation("/confirmation"); },
    onError: (err) => {
      setIsSubmitting(false);
      if (formData.date) {
         const dateStr = format(formData.date, 'yyyy-MM-dd');
         fetch(`/api/availability?date=${dateStr}`).then(r=>r.json()).then(d=>setTakenSlots(d));
      }
      if (err.message === "CONFLICT") {
        toast({ title: "❌ Slot Taken", description: "Someone booked this specific time. Please choose another.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Could not create booking. Please try again.", variant: "destructive" });
      }
    }
  });

  const handleSubmit = () => {
    if (isSubmitting) return;
    if(!formData.date || !formData.time || !formData.email) {
       toast({ title: "Missing Info", description: "Please fill out all fields.", variant: "destructive" });
       return;
    }
    setIsSubmitting(true);
    const payload = {
      ...formData,
      serviceType: "Custom Bundle",
      preferredDate: format(formData.date, 'yyyy-MM-dd'),
      appointmentTime: formData.time,
      pricingTotal: total.toString(),
      pricingBreakdown: JSON.stringify({ tvInstallations: tvServices, smartHome: smartHomeServices, removal: deinstallCount }),
      status: "active"
    };
    mutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-32">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
            <span className={step >= 1 ? "text-blue-600" : ""}>Services</span>
            <span className={step >= 2 ? "text-blue-600" : ""}>Info</span>
            <span className={step >= 3 ? "text-blue-600" : ""}>Schedule</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div className="h-full bg-blue-600" initial={{ width: "0%" }} animate={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>

        {/* STEP 1: SERVICES */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div>
               <h2 className="text-xl font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2"><Tv className="h-5 w-5 text-blue-600"/> TV Installation</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all p-4 text-center flex flex-col" onClick={() => addTvPackage('basic', 'Basic Mounting')}>
                    <div className="mx-auto bg-slate-100 p-2 rounded-full mb-3 text-blue-600"><Tv className="h-6 w-6" /></div>
                    <h3 className="font-bold">Basic Mounting</h3>
                    <div className="text-2xl font-black text-blue-600 my-1">$100</div>
                    <p className="text-xs text-slate-500 mb-4 flex-grow">Customer provides TV & Mount.</p>
                    <Button variant="outline" size="sm" className="w-full mt-auto">Add</Button>
                  </Card>
                  <Card className="cursor-pointer hover:border-slate-800 hover:shadow-lg transition-all p-4 text-center flex flex-col" onClick={() => addTvPackage('hardware', 'Hardware Bundle')}>
                    <div className="mx-auto bg-slate-100 p-2 rounded-full mb-3 text-slate-700"><Hammer className="h-6 w-6" /></div>
                    <h3 className="font-bold">Hardware Bundle</h3>
                    <div className="text-2xl font-black text-slate-800 my-1">$130+</div>
                    <p className="text-xs text-slate-500 mb-4 flex-grow">We provide the Mount.</p>
                    <Button variant="outline" size="sm" className="w-full mt-auto">Add</Button>
                  </Card>
                  <Card className="cursor-pointer border-blue-500 bg-blue-50/30 p-4 text-center flex flex-col" onClick={() => addTvPackage('concealment', 'Concealment Package')}>
                    <div className="mx-auto bg-blue-100 p-2 rounded-full mb-3 text-blue-600"><Zap className="h-6 w-6" /></div>
                    <h3 className="font-bold">Concealment Pkg</h3>
                    <div className="text-2xl font-black text-blue-600 my-1">$200</div>
                    <p className="text-xs text-slate-500 mb-4 flex-grow">Mounting + <span className="font-bold">Hidden Wires</span>.</p>
                    <Button size="sm" className="w-full mt-auto bg-blue-600 hover:bg-blue-700">Add</Button>
                  </Card>
                  <Card className="cursor-pointer hover:border-slate-900 hover:shadow-lg transition-all p-4 text-center flex flex-col" onClick={() => addTvPackage('premium', 'Premium Package')}>
                    <div className="mx-auto bg-slate-900 p-2 rounded-full mb-3 text-white"><Wrench className="h-6 w-6" /></div>
                    <h3 className="font-bold">Premium Package</h3>
                    <div className="text-2xl font-black text-slate-900 my-1">$200 + Mnt</div>
                    <p className="text-xs text-slate-500 mb-4 flex-grow">Everything included.</p>
                    <Button variant="outline" size="sm" className="w-full mt-auto group-hover:bg-slate-900 group-hover:text-white">Add</Button>
                  </Card>
               </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               <div>
                  <h2 className="text-xl font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2"><Video className="h-5 w-5 text-blue-600"/> Smart Home</h2>
                  <div className="space-y-3">
                     {[{ id: 'camera', label: 'Security Camera', price: 75, icon: Video }, { id: 'doorbell', label: 'Video Doorbell', price: 85, icon: Bell }, { id: 'floodlight', label: 'Floodlight Cam', price: 125, icon: Lightbulb }].map((item: any) => {
                       const count = smartHomeServices.find(s => s.type === item.id)?.count || 0;
                       return (
                       <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <div className="flex items-center gap-3"><item.icon className="h-5 w-5 text-slate-500"/><span className="font-bold text-sm">{item.label}</span></div>
                          <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => removeSmartHome(item.id)} disabled={count === 0}><Minus className="h-3 w-3"/></Button>
                             <span className="font-bold w-4 text-center">{count}</span>
                             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => addSmartHome(item.id)}><Plus className="h-3 w-3"/></Button>
                          </div>
                       </div>
                     )})}
                  </div>
               </div>
               <div>
                  <h2 className="text-xl font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2"><Trash2 className="h-5 w-5 text-red-500"/> Removal</h2>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                     <div className="flex items-center gap-3"><Trash2 className="h-5 w-5 text-red-500"/><span className="font-bold text-sm">TV De-Installation ($50/ea)</span></div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={decrementRemoval} disabled={deinstallCount === 0}><Minus className="h-3 w-3"/></Button>
                        <span className="font-bold w-4 text-center">{deinstallCount}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={incrementRemoval}><Plus className="h-3 w-3"/></Button>
                     </div>
                  </div>
               </div>
            </div>

            <AnimatePresence>
              {(tvServices.length > 0 || smartHomeServices.length > 0 || deinstallCount > 0) && (
                <motion.div ref={configRef} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                   <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                      <h3 className="font-bold text-lg text-slate-800">Your Selections</h3>
                      <Badge variant="secondary" className="text-lg px-3 text-blue-700 bg-blue-100">Total: ${total}</Badge>
                   </div>
                   <div className="p-6 space-y-6">
                      {tvServices.map((tv, idx) => (
                        <div key={tv.id} className="border rounded-lg p-4 space-y-4">
                           <div className="flex justify-between items-start">
                              <h4 className="font-bold text-blue-900 flex items-center gap-2"><span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">#{idx + 1}</span> Configure {tv.packageName}</h4>
                              <Button variant="ghost" size="sm" onClick={() => removeTv(tv.id)} className="text-red-500 h-6 w-6 p-0"><Trash2 className="h-4 w-4"/></Button>
                           </div>
                           <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-500 uppercase font-bold">TV Size</Label>
                                <RadioGroup value={tv.size} onValueChange={(v:any) => updateTv(tv.id, { size: v })} className="flex gap-2">
                                   <label className={cn("flex-1 border rounded px-3 py-2 cursor-pointer text-sm text-center", tv.size==='small' ? "bg-blue-50 border-blue-500 font-bold" : "hover:bg-slate-50")}>32" - 55" <RadioGroupItem value="small" className="sr-only"/></label>
                                   <label className={cn("flex-1 border rounded px-3 py-2 cursor-pointer text-sm text-center", tv.size==='large' ? "bg-blue-50 border-blue-500 font-bold" : "hover:bg-slate-50")}>56" or Larger <RadioGroupItem value="large" className="sr-only"/></label>
                                </RadioGroup>
                              </div>
                              {(tv.packageType === 'hardware' || tv.packageType === 'premium') && (
                                <div className="space-y-1">
                                  <Label className="text-xs text-slate-500 uppercase font-bold">Mount Type (Included)</Label>
                                  <RadioGroup value={tv.mountType} onValueChange={(v:any) => updateTv(tv.id, { mountType: v })} className="flex gap-1">
                                      {['fixed', 'tilting', 'full_motion'].map(m => {
                                        const price = getMountPrice(m, tv.size);
                                        return (<label key={m} className={cn("flex-1 border rounded px-1 py-2 cursor-pointer text-xs text-center capitalize", tv.mountType===m ? "bg-blue-50 border-blue-500 font-bold" : "hover:bg-slate-50")}>{m.replace('_', ' ')} <span className="block text-[9px] text-slate-500">+{price}</span><RadioGroupItem value={m} className="sr-only"/></label>)
                                      })}
                                  </RadioGroup>
                                </div>
                              )}
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                              <div onClick={() => updateTv(tv.id, { location: tv.location === 'fireplace' ? 'standard' : 'fireplace' })} className={cn("border rounded p-2 flex flex-col items-center justify-center text-center cursor-pointer text-xs", tv.location === 'fireplace' && "border-blue-500 bg-blue-50")}>
                                 <span className="font-bold">Over Fireplace?</span> <span className="text-slate-500">(+$100)</span>
                              </div>
                              <div onClick={() => updateTv(tv.id, { wallType: tv.wallType === 'masonry' ? 'standard' : 'masonry' })} className={cn("border rounded p-2 flex flex-col items-center justify-center text-center cursor-pointer text-xs", tv.wallType === 'masonry' && "border-blue-500 bg-blue-50")}>
                                 <BrickWall className="h-4 w-4 mb-1"/>
                                 <span className="font-bold">Masonry Wall?</span> <span className="text-slate-500">(+$50)</span>
                              </div>
                              <div onClick={() => updateTv(tv.id, { addSoundbar: !tv.addSoundbar })} className={cn("border rounded p-2 flex flex-col items-center justify-center text-center cursor-pointer text-xs", tv.addSoundbar && "border-blue-500 bg-blue-50")}>
                                 <Speaker className="h-4 w-4 mb-1"/>
                                 <span className="font-bold">Soundbar</span> <span className="text-slate-500">(+$50)</span>
                              </div>
                              <div onClick={() => updateTv(tv.id, { addHdmi: !tv.addHdmi })} className={cn("border rounded p-2 flex flex-col items-center justify-center text-center cursor-pointer text-xs", tv.addHdmi && "border-blue-500 bg-blue-50")}>
                                 <Cable className="h-4 w-4 mb-1"/>
                                 <span className="font-bold">HDMI Cable</span> <span className="text-slate-500">(+$25)</span>
                              </div>
                           </div>
                        </div>
                      ))}
                      {smartHomeServices.map(s => {
                         const unitPrice = (s.type === 'floodlight' ? PRICES.smart_floodlight : s.type === 'doorbell' ? PRICES.smart_doorbell : PRICES.smart_camera) + (s.isMasonry ? PRICES.masonry_sh : 0);
                         return (
                           <div key={s.id} className="border rounded bg-slate-50 p-3 text-sm font-bold">
                             <div className="flex justify-between items-center mb-2">
                               <span>{s.type} (x{s.count})</span>
                               <div className="flex items-center gap-3">
                                  <span>${unitPrice * s.count}</span>
                                  {/* DELETE BUTTON IN SUMMARY */}
                                  <Button variant="ghost" size="sm" onClick={() => removeSmartHome(s.type)} className="text-red-500 h-6 w-6 p-0"><Trash2 className="h-4 w-4"/></Button>
                               </div>
                             </div>
                             <div onClick={() => updateSmartHome(s.id, { isMasonry: !s.isMasonry })} className={cn("flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-200 w-fit", s.isMasonry && "text-blue-600 bg-blue-50")}>
                                <div className={cn("w-4 h-4 border rounded flex items-center justify-center bg-white", s.isMasonry ? "border-blue-600" : "border-slate-400")}>
                                   {s.isMasonry && <div className="w-2 h-2 bg-blue-600 rounded-full"/>}
                                </div>
                                <span className="text-xs text-slate-500">Masonry/Brick? (+$20/ea)</span>
                             </div>
                           </div>
                         )
                      })}
                      {deinstallCount > 0 && (
                         <div className="flex justify-between p-3 border rounded bg-red-50 text-red-700 text-sm font-bold">
                            <span>TV Removal (x{deinstallCount})</span>
                            <div className="flex items-center gap-3">
                              <span>${deinstallCount * 50}</span>
                              <Button variant="ghost" size="sm" onClick={decrementRemoval} className="text-red-500 h-6 w-6 p-0"><Minus className="h-4 w-4"/></Button>
                            </div>
                         </div>
                      )}
                   </div>
                   <div className="bg-slate-50 p-4 border-t flex justify-end">
                      <Button onClick={() => setStep(2)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg">Next Step <ChevronRight className="ml-2 h-4 w-4" /></Button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 2 & 3: (SAME AS BEFORE) */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
             <Button variant="ghost" onClick={() => setStep(1)} className="pl-0"><ArrowLeft className="mr-2 h-4 w-4"/> Back</Button>
             <Card className="p-6">
               <h2 className="text-2xl font-bold mb-6">Contact Details</h2>
               <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2"><Label>Full Name</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                 <div className="space-y-2"><Label>Phone</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                 <div className="space-y-2 md:col-span-2"><Label>Email</Label><Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                 <div className="space-y-2 md:col-span-2"><Label>Address</Label><Input value={formData.streetAddress} onChange={e => setFormData({...formData, streetAddress: e.target.value})} /></div>
                 <div className="space-y-2"><Label>City</Label><Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
                 <div className="space-y-2"><Label>Zip</Label><Input value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} /></div>
               </div>
               <div className="mt-8 flex justify-end">
                 <Button onClick={() => setStep(3)} disabled={!formData.name || !formData.email} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">Next: Schedule <ChevronRight className="ml-2 h-4 w-4" /></Button>
               </div>
             </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
             <Button variant="ghost" onClick={() => setStep(2)} className="pl-0"><ArrowLeft className="mr-2 h-4 w-4"/> Back</Button>
             <Button onClick={findNextASAP} disabled={isSearching} className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold mb-4 shadow-md animate-pulse">
               {isSearching ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2 h-4 w-4"/>} 
               {isSearching ? "Finding your slot..." : "Find Earliest Slot (ASAP)"}
             </Button>
             <div className="grid md:grid-cols-2 gap-6">
               <Card className="p-4 flex justify-center">
                 <Calendar mode="single" selected={formData.date} onSelect={(d) => setFormData({...formData, date: d})} disabled={(date) => date < new Date()} className="rounded-md border shadow-none" />
               </Card>
               <div className="space-y-4">
                 <h3 className="font-bold text-lg">{formData.date ? format(formData.date, 'EEEE, MMM do') : "Select a Date"}</h3>
                 {formData.date && (
                   <div className="grid grid-cols-2 gap-3">
                     {getSlotsForDate(formData.date).map((slot) => {
                       const isTaken = takenSlots.includes(slot);
                       return (
                         <Button key={slot} disabled={isTaken} variant={formData.time === slot ? "default" : "outline"} onClick={() => setFormData({...formData, time: slot})} className={cn(isTaken && "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 decoration-slate-400 line-through")}>
                           {slot} {isTaken ? "(Booked)" : ""}
                         </Button>
                       )
                     })}
                   </div>
                 )}
                 <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
                   <div className="flex justify-between items-center mb-1"><span className="text-slate-600">Total Estimate:</span><span className="font-black text-2xl text-blue-700">${total}</span></div>
                   <p className="text-xs text-slate-500">*Pay after job is done.</p>
                 </div>
                 <Button onClick={handleSubmit} disabled={isSubmitting || !formData.date || !formData.time} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg shadow-lg mt-4">
                   {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />} Confirm Booking
                 </Button>
               </div>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}