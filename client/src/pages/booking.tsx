import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { ArrowLeft, CalendarDays, Check, CheckCircle2, ChevronRight, Loader2, MapPin, ShieldCheck, Sparkles } from "lucide-react";

import { pricingData } from "@/data/pricing-data";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type QuoteItem = { name: string; lineTotal: number; qty?: number };
type QuoteGroup = { title: string; items: QuoteItem[] };
type PendingQuote = { total: number; summary: string; groups: QuoteGroup[]; flags?: string[]; followUp?: string; promoCode?: string; zipCode?: string };
type Details = { firstName: string; lastName: string; phone: string; email: string; streetAddress: string; city: string; state: string; zipCode: string; notes: string };
type EntryMode = "mount_one" | "mount_multiple" | "smart_home" | null;
type BookingStep = 1 | 2 | 3;

const QUOTE_KEY = "pptvinstall_pending_quote";
const WEEKDAY_SLOTS = ["5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM"];
const WEEKEND_SLOTS = (() => {
  const slots: string[] = [];
  for (let hour = 8; hour <= 17; hour += 1) {
    slots.push(format(new Date(2026, 0, 1, hour, 0), "h:mm a"));
    if (hour < 17) slots.push(format(new Date(2026, 0, 1, hour, 30), "h:mm a"));
  }
  return slots;
})();

const ENTRY_CARDS = [
  { id: "mount_one" as const, icon: "📺", title: "Mount 1 TV", subtitle: `Starting at $${pricingData.tvMounting.standard.price}` },
  { id: "mount_multiple" as const, icon: "📺📺", title: "Mount multiple TVs", subtitle: `Starting at $${pricingData.tvMounting.standard.price}/TV` },
  { id: "smart_home" as const, icon: "🔒", title: "Smart home only", subtitle: "Cameras, doorbell, floodlight" },
];

function parseSlotTime(date: Date, slot: string): Date {
  const [timePart, meridiemPart] = slot.split(" ");
  const [hoursPart, minutesPart] = timePart.split(":");
  let hours = Number(hoursPart);
  const minutes = Number(minutesPart);
  const meridiem = meridiemPart.toUpperCase();
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
}

function getAllSlots(date: Date): string[] {
  return date.getDay() === 0 || date.getDay() === 6 ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
}

function getAvailableSlots(date: Date, bookedSlots: string[]): string[] {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  let allSlots = getAllSlots(date);
  if (isToday) {
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    if (now.getHours() >= 17) allSlots = [];
    else allSlots = allSlots.filter((slot) => parseSlotTime(date, slot) >= twoHoursFromNow);
  }
  return allSlots.filter((slot) => !bookedSlots.includes(slot));
}

function validPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function nextAvailableDate(fromDate: Date, bookedSlotsByDate: Record<string, string[]>): { date: Date; slot: string } | null {
  for (let offset = 0; offset < 21; offset += 1) {
    const candidate = addDays(fromDate, offset);
    const booked = bookedSlotsByDate[format(candidate, "yyyy-MM-dd")] ?? [];
    const available = getAvailableSlots(candidate, booked);
    if (available.length > 0) return { date: candidate, slot: available[0] };
  }
  return null;
}

export default function Booking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [pendingQuote, setPendingQuote] = useState<PendingQuote | null>(null);
  const [quoteExpanded, setQuoteExpanded] = useState(false);
  const [entryMode, setEntryMode] = useState<EntryMode>(null);
  const [directConfigured, setDirectConfigured] = useState(false);
  const [step, setStep] = useState<BookingStep>(1);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [heldSlot, setHeldSlot] = useState("");
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);
  const [slotConflict, setSlotConflict] = useState("");
  const [sameDayMessage, setSameDayMessage] = useState("");
  const [sameDayJump, setSameDayJump] = useState<Date | null>(null);
  const [sameDayJumpSlot, setSameDayJumpSlot] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Details, string>>>({});
  const [details, setDetails] = useState<Details>({ firstName: "", lastName: "", phone: "", email: "", streetAddress: "", city: "", state: "GA", zipCode: "", notes: "" });
  const [quickDetails, setQuickDetails] = useState({ tvCount: 1, fireplace: false, brick: false, concealment: false, mountProvided: false, smartCount: 1, cameras: true, doorbell: false, floodlight: false });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(QUOTE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as PendingQuote;
      setPendingQuote(parsed);
      if (parsed.zipCode) setDetails((current) => ({ ...current, zipCode: parsed.zipCode || "" }));
    } catch (error) {
      console.error("Could not parse pending quote:", error);
    }
  }, []);

  useEffect(() => {
    if (!date) {
      setTakenSlots([]);
      setSameDayMessage("");
      return;
    }

    fetch(`/api/availability?date=${format(date, "yyyy-MM-dd")}`)
      .then((response) => response.json())
      .then((data: string[]) => {
        setTakenSlots(data);
        const isToday = date.toDateString() === new Date().toDateString();
        const availableToday = getAvailableSlots(date, data);
        if (isToday && availableToday.length === 0) {
          const jump = nextAvailableDate(new Date(), {
            [format(date, "yyyy-MM-dd")]: data,
          });
          if (jump) {
            setSameDayJump(jump.date);
            setSameDayJumpSlot(jump.slot);
            setSameDayMessage(`No more slots available today - the next available time is ${format(jump.date, "EEE, MMM d")} at ${jump.slot}.`);
          } else {
            setSameDayJump(null);
            setSameDayJumpSlot("");
            setSameDayMessage("No more same-day slots are available right now.");
          }
        } else {
          setSameDayMessage("");
          setSameDayJump(null);
          setSameDayJumpSlot("");
        }
      })
      .catch((error) => console.error("Availability error:", error));
  }, [date]);

  const isQuoteFlow = Boolean(pendingQuote);
  const roughEstimate = useMemo(() => {
    if (isQuoteFlow || !entryMode) return null;

    if (entryMode === "smart_home") {
      let low = 0;
      let high = 0;
      if (quickDetails.cameras) {
        low += pricingData.smartHome.securityCamera.price * quickDetails.smartCount;
        high += pricingData.smartHome.securityCamera.price * quickDetails.smartCount;
      }
      if (quickDetails.doorbell) {
        low += pricingData.smartHome.doorbell.price;
        high += pricingData.smartHome.doorbell.price;
      }
      if (quickDetails.floodlight) {
        low += pricingData.smartHome.floodlight.price;
        high += pricingData.smartHome.floodlight.price + 75;
      }
      return { low: Math.max(low, pricingData.smartHome.securityCamera.price), high: Math.max(high, pricingData.smartHome.doorbell.price + pricingData.smartHome.floodlight.price) };
    }

    const count = quickDetails.tvCount;
    let lowPerTv = pricingData.tvMounting.standard.price;
    let highPerTv = pricingData.tvMounting.standard.price;
    if (quickDetails.fireplace) highPerTv += pricingData.tvMounting.fireplace.price - pricingData.tvMounting.standard.price;
    if (quickDetails.brick) highPerTv += pricingData.tvMounting.nonDrywall.price;
    if (quickDetails.concealment) highPerTv += pricingData.wireConcealment.standard.price;
    if (quickDetails.mountProvided) highPerTv += pricingData.tvMounts.fullMotionBig.price;
    if (quickDetails.mountProvided) lowPerTv += pricingData.tvMounts.fixedSmall.price;
    return { low: count * lowPerTv, high: count * highPerTv };
  }, [entryMode, isQuoteFlow, quickDetails]);

  const estimatedTotal = pendingQuote?.total ?? roughEstimate?.high ?? 0;
  const availableSlots = useMemo(() => (date ? getAvailableSlots(date, takenSlots) : []), [date, takenSlots]);
  const earliestAvailable = availableSlots[0] ?? "";
  const reviewItems = useMemo(() => {
    if (pendingQuote) {
      return pendingQuote.groups.flatMap((group) =>
        group.items.map((item) => ({
          name: group.title === "Shared Services" ? item.name : `${group.title} - ${item.name}`,
          lineTotal: item.lineTotal,
        })),
      );
    }

    if (entryMode === "smart_home") {
      const items = [];
      if (quickDetails.cameras) items.push({ name: `${quickDetails.smartCount}x Security Camera Install`, lineTotal: pricingData.smartHome.securityCamera.price * quickDetails.smartCount });
      if (quickDetails.doorbell) items.push({ name: pricingData.smartHome.doorbell.name, lineTotal: pricingData.smartHome.doorbell.price });
      if (quickDetails.floodlight) items.push({ name: pricingData.smartHome.floodlight.name, lineTotal: pricingData.smartHome.floodlight.price });
      return items;
    }

    return [
      { name: `${quickDetails.tvCount} TV${quickDetails.tvCount > 1 ? "s" : ""} mounting`, lineTotal: quickDetails.tvCount * pricingData.tvMounting.standard.price },
      ...(quickDetails.fireplace ? [{ name: "Possible fireplace mounting", lineTotal: pricingData.tvMounting.fireplace.price - pricingData.tvMounting.standard.price }] : []),
      ...(quickDetails.brick ? [{ name: "Possible brick/stone wall add-on", lineTotal: pricingData.tvMounting.nonDrywall.price }] : []),
      ...(quickDetails.concealment ? [{ name: "Possible wire concealment", lineTotal: pricingData.wireConcealment.standard.price }] : []),
      ...(quickDetails.mountProvided ? [{ name: "Possible mount hardware", lineTotal: pricingData.tvMounts.fixedSmall.price }] : []),
    ];
  }, [entryMode, pendingQuote, quickDetails]);

  function validateDetails() {
    const next: Partial<Record<keyof Details, string>> = {};
    if (!details.firstName.trim()) next.firstName = "First name is required.";
    if (!details.lastName.trim()) next.lastName = "Last name is required.";
    if (!validPhone(details.phone)) next.phone = "Enter a valid phone number.";
    if (!validEmail(details.email)) next.email = "Enter a valid email address.";
    if (!details.streetAddress.trim()) next.streetAddress = "Street address is required.";
    if (!details.city.trim()) next.city = "City is required.";
    if (!/^\d{5}$/.test(details.zipCode)) next.zipCode = "Enter a valid 5-digit ZIP code.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function findNextASAP() {
    setIsSearching(true);
    try {
      const response = await fetch("/api/next-slot");
      if (!response.ok) throw new Error("No slots found");
      const next = (await response.json()) as { date: string; time: string };
      const nextDate = new Date(`${next.date}T12:00:00`);
      setDate(nextDate);
      setTime(next.time);
      setHeldSlot(next.time);
      setSlotConflict("");
      setSuggestedSlots([]);
      toast({ title: "Earliest available selected", description: `${format(nextDate, "MMM d")} at ${next.time}` });
    } catch {
      toast({ title: "No slots found", description: "We couldn't find an opening in the next 14 days.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  }

  async function submitBooking() {
    if (!date || !time) {
      toast({ title: "Choose a time slot", description: "Please pick a date and time first.", variant: "destructive" });
      setStep(1);
      return;
    }
    if (!validateDetails()) {
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    const pricingBreakdown = pendingQuote
      ? JSON.stringify({ source: "quote_generated", quoteSummary: pendingQuote.summary, quoteGroups: pendingQuote.groups, quoteFlags: pendingQuote.flags ?? [], promoCode: pendingQuote.promoCode })
      : JSON.stringify({
          source: "direct_booking",
          entryMode,
          quickDetails,
          estimateRange: roughEstimate,
          items: reviewItems.map((item) => ({ name: item.name, price: Math.abs(item.lineTotal), qty: 1, lineTotal: Math.abs(item.lineTotal) })),
        });

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${details.firstName.trim()} ${details.lastName.trim()}`,
          email: details.email.trim(),
          phone: details.phone.trim(),
          streetAddress: details.streetAddress.trim(),
          city: details.city.trim(),
          state: details.state,
          zipCode: details.zipCode.trim(),
          notes: details.notes.trim(),
          specialInstructions: details.notes.trim(),
          serviceType: pendingQuote ? "quote_generated" : `booking_${entryMode ?? "custom"}`,
          preferredDate: format(date, "yyyy-MM-dd"),
          appointmentTime: time,
          pricingTotal: String(estimatedTotal),
          pricingBreakdown,
          status: "active",
        }),
      });

      if (response.status === 409) {
        const refreshed = await fetch(`/api/availability?date=${format(date, "yyyy-MM-dd")}`).then((res) => res.json() as Promise<string[]>);
        setTakenSlots(refreshed);
        setSlotConflict("Someone just grabbed that slot! Here are the next available times:");
        setSuggestedSlots(getAvailableSlots(date, refreshed).slice(0, 3));
        setStep(1);
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) throw new Error("Booking failed");
      if (typeof window !== "undefined" && pendingQuote) window.localStorage.removeItem(QUOTE_KEY);
      setLocation("/confirmation");
    } catch (error) {
      console.error(error);
      toast({ title: "Booking error", description: "We couldn't save your booking. Please try again.", variant: "destructive" });
      setIsSubmitting(false);
    }
  }

  function renderQuoteSummaryCard() {
    if (!pendingQuote) return null;
    return (
      <Card className="mb-6 overflow-hidden border-blue-200 bg-blue-50">
        <div className="border-b border-blue-100 px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Your Quote Summary</p>
              <p className="mt-1 text-sm text-slate-700">{pendingQuote.summary}</p>
            </div>
            <div className="text-2xl font-extrabold text-blue-700">${pendingQuote.total}</div>
          </div>
        </div>
        <div className="px-6 py-4">
          <button type="button" onClick={() => setQuoteExpanded((current) => !current)} className="text-sm font-semibold text-blue-700 hover:text-blue-900">
            {quoteExpanded ? "Hide quote details" : "View quote details"}
          </button>
          <AnimatePresence initial={false}>
            {quoteExpanded ? (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-4 space-y-4">
                  {pendingQuote.groups.map((group) => (
                    <div key={group.title} className="space-y-2">
                      <p className="font-semibold text-slate-900">{group.title}</p>
                      {group.items.map((item) => (
                        <div key={`${group.title}-${item.name}`} className="flex items-start justify-between gap-3 text-sm text-slate-600">
                          <span>{item.qty && item.qty > 1 ? `${item.qty}x ${item.name}` : item.name}</span>
                          <span className="font-semibold text-slate-900">${Math.abs(item.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <p className="mt-4 text-xs text-slate-500">This is your estimated price. Final total is confirmed before work begins.</p>
        </div>
      </Card>
    );
  }

  function renderEntryFlow() {
    if (isQuoteFlow) return null;
    if (!entryMode) {
      return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900">What do you need?</h1>
            <p className="text-slate-500">Pick the closest option and we&apos;ll guide you from there.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {ENTRY_CARDS.map((card) => (
              <button key={card.id} type="button" onClick={() => setEntryMode(card.id)} className="rounded-[28px] border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                <div className="text-4xl">{card.icon}</div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">{card.title}</h2>
                <p className="mt-2 text-sm text-slate-500">{card.subtitle}</p>
              </button>
            ))}
            <Link href="/quote">
              <button type="button" className="rounded-[28px] border border-blue-200 bg-blue-50 p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
                <div className="text-4xl">✨</div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Not sure — get a custom quote first</h2>
                <p className="mt-2 text-sm text-slate-600">Most customers use our quote tool for an exact price before booking.</p>
              </button>
            </Link>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Button variant="ghost" className="pl-0" onClick={() => { setEntryMode(null); setDirectConfigured(false); }}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900">Quick details</h1>
          <p className="text-slate-500">This gives you a rough estimate before you pick a time.</p>
        </div>
        <Card className="rounded-[28px] p-6 shadow-sm">
          {entryMode === "smart_home" ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>How many smart devices?</Label>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((count) => (
                    <Button key={count} type="button" variant={quickDetails.smartCount === count ? "default" : "outline"} className="h-12 rounded-2xl" onClick={() => setQuickDetails((current) => ({ ...current, smartCount: count }))}>{count}</Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { key: "cameras", label: "Security cameras" },
                  { key: "doorbell", label: "Doorbell install" },
                  { key: "floodlight", label: "Floodlight install" },
                ].map((option) => (
                  <button key={option.key} type="button" onClick={() => setQuickDetails((current) => ({ ...current, [option.key]: !current[option.key as keyof typeof current] }))} className={cn("rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition-all", quickDetails[option.key as keyof typeof quickDetails] ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700")}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>How many TVs?</Label>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((count) => (
                    <Button key={count} type="button" variant={quickDetails.tvCount === count ? "default" : "outline"} className="h-12 rounded-2xl" onClick={() => setQuickDetails((current) => ({ ...current, tvCount: count }))}>{count === 4 ? "4+" : count}</Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { key: "fireplace", label: "Above a fireplace" },
                  { key: "brick", label: "On brick or stone wall" },
                  { key: "concealment", label: "Need wires hidden" },
                  { key: "mountProvided", label: "Need a mount provided" },
                ].map((option) => (
                  <button key={option.key} type="button" onClick={() => setQuickDetails((current) => ({ ...current, [option.key]: !current[option.key as keyof typeof current] }))} className={cn("rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition-all", quickDetails[option.key as keyof typeof quickDetails] ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700")}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {roughEstimate ? (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Rough estimate</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">${roughEstimate.low}–${roughEstimate.high}</p>
              <p className="mt-2 text-sm text-slate-600">Based on what you selected, your estimate is shown as a range until we confirm the exact setup.</p>
            </div>
          ) : null}
          <div className="mt-8 flex justify-end">
            <Button className="h-12 rounded-2xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-500" onClick={() => { setDirectConfigured(true); setStep(1); }}>
              Continue to schedule <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (!isQuoteFlow && !directConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24 pt-24">
        <div className="container mx-auto max-w-5xl px-4">{renderEntryFlow()}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-24">
      <div className="container mx-auto max-w-5xl px-4">
        {renderQuoteSummaryCard()}
        <div className="mb-8 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            {[{ id: 1, label: "Date and Time" }, { id: 2, label: "Your Details" }, { id: 3, label: "Confirm" }].map((entry, index) => {
              const complete = step > entry.id;
              const active = step === entry.id;
              return (
                <div key={entry.id} className="flex flex-1 items-center gap-2">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold", complete ? "border-blue-600 bg-blue-600 text-white" : active ? "border-blue-600 text-blue-600" : "border-slate-200 text-slate-400")}>{complete ? <Check className="h-4 w-4" /> : entry.id}</div>
                  <p className={cn("text-sm font-semibold", active || complete ? "text-blue-600" : "text-slate-400")}>{entry.label}</p>
                  {index < 2 ? <div className="hidden h-px flex-1 bg-slate-200 md:block" /> : null}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step-1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-6">
              {!isQuoteFlow ? <Button variant="ghost" className="pl-0" onClick={() => { setStep(1); setEntryMode(null); setDirectConfigured(false); }}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button> : null}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div><h1 className="text-3xl font-extrabold text-slate-900">Pick your date and time</h1><p className="mt-2 text-slate-500">Choose what works best and we&apos;ll hold it while you finish booking.</p></div>
                <Button onClick={findNextASAP} disabled={isSearching} className="h-12 rounded-2xl bg-amber-400 px-6 font-bold text-amber-950 hover:bg-amber-300">{isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}{isSearching ? "Finding earliest..." : "Earliest available"}</Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge className="border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700"><ShieldCheck className="mr-2 h-3.5 w-3.5" />Same-day bookings require 2 hours notice</Badge>
                {!isQuoteFlow && roughEstimate ? <Badge className="border border-slate-200 bg-white px-3 py-1 text-slate-700"><Sparkles className="mr-2 h-3.5 w-3.5" />Rough estimate: ${roughEstimate.low}–${roughEstimate.high}</Badge> : null}
              </div>

              {slotConflict ? <Alert className="border-amber-200 bg-amber-50 text-amber-900"><CalendarDays className="h-4 w-4" /><AlertTitle>Slot update</AlertTitle><AlertDescription><p>{slotConflict}</p>{suggestedSlots.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{suggestedSlots.map((slot) => <Button key={slot} type="button" variant="outline" className="h-10 rounded-xl border-amber-300 bg-white text-amber-900 hover:bg-amber-100" onClick={() => { setTime(slot); setHeldSlot(slot); setSlotConflict(""); }}>{slot}</Button>)}</div> : null}</AlertDescription></Alert> : null}

              <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
                <Card className="rounded-[28px] p-4 shadow-sm">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(value) => { setDate(value); setTime(""); setHeldSlot(""); setSlotConflict(""); setSuggestedSlots([]); }}
                    disabled={(value) => isBefore(startOfDay(value), startOfDay(new Date())) || value.toDateString() === new Date().toDateString() && getAvailableSlots(value, []).length === 0}
                    modifiers={{ unavailableToday: (value) => value.toDateString() === new Date().toDateString() && getAvailableSlots(value, []).length === 0 }}
                    modifiersClassNames={{ unavailableToday: "opacity-40 line-through" }}
                    className="rounded-2xl border shadow-none"
                  />
                </Card>
                <Card className="rounded-[28px] p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">{date ? format(date, "EEEE, MMMM d") : "Select a date"}</h2><p className="mt-1 text-sm text-slate-500">{date ? (date.getDay() === 0 || date.getDay() === 6 ? "Weekend slots run from 8:00 AM to 5:00 PM." : "Weekday appointments begin at 5:30 PM.") : "Available times will appear here."}</p></div><Badge className="bg-blue-100 text-blue-800">${estimatedTotal}</Badge></div>
                  {sameDayMessage ? <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm text-amber-900">{sameDayMessage}</p>{sameDayJump ? <Button type="button" variant="outline" className="mt-3 rounded-xl border-amber-300 bg-white text-amber-900 hover:bg-amber-100" onClick={() => { setDate(sameDayJump); setTime(sameDayJumpSlot); setHeldSlot(sameDayJumpSlot); }}>Jump to next available</Button> : null}</div> : null}
                  {date ? availableSlots.length > 0 ? <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{getAllSlots(date).map((slot) => { const unavailable = !availableSlots.includes(slot); const selected = time === slot; const suggested = suggestedSlots.includes(slot); return <Button key={slot} type="button" variant={selected ? "default" : "outline"} disabled={unavailable} onClick={() => { setTime(slot); setHeldSlot(slot); setSlotConflict(""); setSuggestedSlots([]); }} className={cn("h-12 rounded-2xl", unavailable && "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through hover:bg-slate-100", selected && "bg-blue-600 text-white hover:bg-blue-600", suggested && !unavailable && !selected && "border-amber-300 bg-amber-50 text-amber-900")}>{slot}</Button>; })}</div> : <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">No available slots for this day.</div> : null}
                  {time ? <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><div className="flex items-center justify-between gap-3"><span>Holding this slot...</span><span className="font-semibold">{time}</span></div></div> : null}
                  {earliestAvailable && date ? <p className="mt-4 text-sm text-slate-500">Earliest available for this day: <span className="font-semibold text-slate-900">{earliestAvailable}</span></p> : null}
                  <div className="mt-8 flex justify-end"><Button className="h-12 rounded-2xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-500" disabled={!date || !time || heldSlot !== time} onClick={() => setStep(2)}>Continue <ChevronRight className="ml-2 h-4 w-4" /></Button></div>
                </Card>
              </div>
            </motion.div>
          ) : null}

          {step === 2 ? <motion.div key="step-2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-6"><Button variant="ghost" className="pl-0" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" />Back to date and time</Button><Card className="rounded-[28px] p-6 shadow-sm"><div className="space-y-2"><h1 className="text-3xl font-extrabold text-slate-900">Your details</h1><p className="text-slate-500">We use this to confirm your appointment and know where to go.</p></div><div className="mt-8 grid gap-4 md:grid-cols-2">{[{ key: "firstName", label: "First name" }, { key: "lastName", label: "Last name" }, { key: "phone", label: "Phone number" }, { key: "email", label: "Email" }].map((field) => <div key={field.key} className="space-y-2"><Label>{field.label}</Label><Input value={details[field.key as keyof Details] as string} onChange={(event) => setDetails((current) => ({ ...current, [field.key]: event.target.value }))} className="h-12 rounded-xl" />{errors[field.key as keyof Details] ? <p className="text-sm text-red-600">{errors[field.key as keyof Details]}</p> : null}</div>)}<div className="space-y-2 md:col-span-2"><Label>Service address street</Label><Input value={details.streetAddress} onChange={(event) => setDetails((current) => ({ ...current, streetAddress: event.target.value }))} className="h-12 rounded-xl" />{errors.streetAddress ? <p className="text-sm text-red-600">{errors.streetAddress}</p> : null}</div><div className="space-y-2"><Label>City</Label><Input value={details.city} onChange={(event) => setDetails((current) => ({ ...current, city: event.target.value }))} className="h-12 rounded-xl" />{errors.city ? <p className="text-sm text-red-600">{errors.city}</p> : null}</div><div className="space-y-2"><Label>Zip code</Label><Input value={details.zipCode} maxLength={5} inputMode="numeric" onChange={(event) => setDetails((current) => ({ ...current, zipCode: event.target.value.replace(/\D/g, "").slice(0, 5) }))} className="h-12 rounded-xl" />{errors.zipCode ? <p className="text-sm text-red-600">{errors.zipCode}</p> : null}</div><div className="space-y-2 md:col-span-2"><Label>Special instructions / notes</Label><Textarea value={details.notes} onChange={(event) => setDetails((current) => ({ ...current, notes: event.target.value }))} placeholder="Parking info, floor number, gate code, TV already unboxed, etc." className="min-h-[140px] rounded-2xl" /></div></div><div className="mt-8 flex justify-end"><Button className="h-12 rounded-2xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-500" onClick={() => { if (validateDetails()) setStep(3); }}>Continue <ChevronRight className="ml-2 h-4 w-4" /></Button></div></Card></motion.div> : null}

          {step === 3 ? <motion.div key="step-3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-6"><Button variant="ghost" className="pl-0" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" />Back to details</Button><Card className="rounded-[28px] p-6 shadow-sm"><div className="space-y-2"><h1 className="text-3xl font-extrabold text-slate-900">Review and confirm</h1><p className="text-slate-500">No payment required now. We confirm within 1 hour.</p></div><div className="mt-8 grid gap-6 lg:grid-cols-2"><div className="space-y-6"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-2 text-slate-900"><CalendarDays className="h-4 w-4 text-blue-600" /><span className="font-semibold">Appointment</span></div><p className="mt-2 text-sm text-slate-700">{date ? format(date, "EEEE, MMMM d, yyyy") : ""} at {time}</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-2 text-slate-900"><MapPin className="h-4 w-4 text-blue-600" /><span className="font-semibold">Customer details</span></div><div className="mt-2 space-y-1 text-sm text-slate-700"><p>{details.firstName} {details.lastName}</p><p>{details.phone}</p><p>{details.email}</p><p>{details.streetAddress}</p><p>{details.city}, {details.state} {details.zipCode}</p><p>{details.notes.trim() || "No special instructions provided."}</p></div></div></div><div className="space-y-6"><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">{pendingQuote ? "Quote summary" : "Service summary"}</p><div className="mt-4 space-y-2">{reviewItems.map((item) => <div key={item.name} className="flex items-start justify-between gap-3 text-sm text-slate-700"><span>{item.name}</span><span className="font-semibold">${Math.abs(item.lineTotal)}</span></div>)}</div>{pendingQuote ? <p className="mt-4 text-sm text-slate-500">{pendingQuote.summary}</p> : null}</div><div className="rounded-2xl bg-slate-900 p-5 text-white"><div className="flex items-center justify-between text-sm"><span className="text-slate-300">Estimated total</span><span className="text-2xl font-extrabold">${estimatedTotal}</span></div><p className="mt-3 text-xs text-slate-300">No payment required now. We confirm within 1 hour.</p></div></div></div><div className="mt-8 flex justify-end"><Button className="h-14 rounded-2xl bg-green-600 px-8 text-base font-bold text-white hover:bg-green-500" disabled={isSubmitting} onClick={submitBooking}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}Confirm my booking</Button></div></Card></motion.div> : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
