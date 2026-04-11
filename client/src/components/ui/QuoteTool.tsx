import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Copy,
  Loader2,
  Mail,
  MessageSquare,
  Mic,
  Phone,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { siteConfig } from "@/config/cms";
import { formatPrice, pricingData } from "@/data/pricing-data";
import {
  calculateTroubleshootingTotal,
  calculateQuote,
  createDefaultCameraConfig,
  createDefaultQuoteFormState,
  createDefaultTVConfig,
  getCameraSummary,
  type CameraConfig,
  type CameraType,
  type MountType,
  type QuoteFormState,
  type QuoteGroup,
  type QuoteLineItem,
  type QuoteResult,
  type TVConfig,
  type WallType,
} from "@/lib/quote-calculator";
import { getSeasonalTheme } from "@/lib/seasonal-theme";
import { apiRequest } from "@/lib/queryClient";
import { getAreaName, getTravelContext, getTravelDayLabel, TRAVEL_FEE } from "@/lib/travel-pricing";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type QuoteStep = "build" | "loading" | "review" | "contact" | "booking";
type QuoteMode = "form" | "text" | "voice";

type DisplayQuote = QuoteResult & {
  summary: string;
  followUp?: string;
};

type QuoteRequestPayload = {
  name: string;
  phone: string;
  email: string;
};

type AiQuoteConfig = {
  siteKey: string;
  enabled: boolean;
  turnstileRequired: boolean;
  requireTurnstile?: boolean;
};

type NextStepIntent = "schedule" | "send_quote" | "text_confirm" | null;
type QuoteSourceMode = QuoteMode | null;
type OutletDistanceAnswer = "yes" | "no" | "not_sure" | null;

type PendingQuoteStorage = {
  total: number;
  summary: string;
  groups: QuoteGroup[];
  flags: string[];
  followUp?: string;
  promoCode?: string;
};

type StandaloneServices = {
  removalCount: number;
  troubleshootingMinutes: number;
  wireManagementLocations: number;
  deviceSetup: boolean;
  sharedUnmountCount: number;
};

type FullAiQuoteResponse = {
  groups?: Array<{
    title?: string;
    subtitle?: string;
    items?: Array<{
      name?: string;
      price?: number;
      qty?: number;
      lineTotal?: number;
      isDiscount?: boolean;
    }>;
    subtotal?: number;
  }>;
  subtotal?: number;
  discount?: number;
  total?: number;
  summary?: string;
  flags?: string[];
  followUp?: string;
};

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = Event & {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type MicrophonePermissionState = "granted" | "prompt" | "denied" | "unsupported" | "unknown";

type TurnstileInstance = {
  render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    turnstile?: TurnstileInstance;
  }
}

const tvAccentClasses = [
  "border-l-blue-500",
  "border-l-violet-500",
  "border-l-emerald-500",
  "border-l-amber-500",
  "border-l-rose-500",
];

const mountTypeLabels: Record<MountType, string> = {
  fixed: "Fixed",
  tilting: "Tilting",
  fullMotion: "Full Motion",
};

const wallTypeLabels: Record<WallType, string> = {
  drywall: "Drywall",
  brick: "Brick or Stone (+$50)",
  highrise: "High-rise / Steel Stud (+$25)",
};

const businessPhone = siteConfig.businessInfo.phone;
const businessEmail = siteConfig.businessInfo.email;
const telHref = `tel:${businessPhone.replace(/\D/g, "")}`;
const mailtoHref = `mailto:${businessEmail}?subject=${encodeURIComponent("Picture Perfect TV Install quote")}`;
const pendingQuoteStorageKey = "pptvinstall_pending_quote";
const DESCRIBE_IT_MAX_CHARS = 400;
const OUTLET_DISTANCE_QUESTION = "Is the existing outlet within 1–2 feet of where you want the TV mounted?";

function createDefaultStandaloneServices(): StandaloneServices {
  return {
    removalCount: 0,
    troubleshootingMinutes: 0,
    wireManagementLocations: 0,
    deviceSetup: false,
    sharedUnmountCount: 0,
  };
}

function extractJson<T>(content: string): T {
  const trimmed = content.trim();
  const withoutFences = trimmed.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Claude did not return valid JSON.");
  }

  return JSON.parse(withoutFences.slice(start, end + 1)) as T;
}

function isValidFiveDigitZip(value: string): boolean {
  return /^\d{5}$/.test(value);
}

function extractZipFromDescription(value: string): string {
  const match = value.match(/\b\d{5}\b/);
  return match?.[0] ?? "";
}

function cleanDescribeText(value: string): string {
  const normalized = value
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const dedupedLines = lines.filter((line, index) => index === 0 || line.toLowerCase() !== lines[index - 1]?.toLowerCase());
  return dedupedLines.join("\n").replace(/[ ]{2,}/g, " ").trim();
}

function getTravelFeeAmount(travelFee: number | "out_of_range"): number {
  return typeof travelFee === "number" ? travelFee : 0;
}

function hasTravelFeeLine(groups: QuoteGroup[]): boolean {
  return groups.some((group) => group.items.some((item) => item.name.toLowerCase().startsWith("travel fee")));
}

function normalizeQuoteForDisplayTotals<T extends DisplayQuote>(quote: T): T {
  const travelFeeAmount = getTravelFeeAmount(quote.travelFee);
  const subtotalExcludingTravel = Math.max(0, quote.subtotal - (hasTravelFeeLine(quote.groups) ? travelFeeAmount : 0));
  const totalIncludingTravel = Math.max(0, subtotalExcludingTravel - quote.discount + travelFeeAmount);

  return {
    ...quote,
    subtotal: subtotalExcludingTravel,
    total: totalIncludingTravel,
  };
}

function isAssessmentOnlyWireConcealment(item: QuoteLineItem): boolean {
  return item.name.trim().toLowerCase() === "wire concealment assessment required";
}

function shouldPriceStandardConcealment(group: QuoteGroup): boolean {
  const contextText = [group.title, group.subtitle, ...group.items.map((item) => item.name)].join(" ").toLowerCase();
  const hasFireplaceSignal = contextText.includes("fireplace");
  const hasMasonrySignal = /\b(brick|stone|masonry|concrete)\b/.test(contextText);

  return !hasFireplaceSignal && !hasMasonrySignal;
}

function correctAiWireConcealment(groups: QuoteGroup[]): QuoteGroup[] {
  return groups.map((group) => {
    let changed = false;

    const items = group.items.map((item) => {
      if (!isAssessmentOnlyWireConcealment(item) || !shouldPriceStandardConcealment(group)) {
        return item;
      }

      changed = true;
      return {
        name: pricingData.wireConcealment.standard.name,
        price: pricingData.wireConcealment.standard.price,
        qty: 1,
        lineTotal: pricingData.wireConcealment.standard.price,
      };
    });

    if (!changed) {
      return group;
    }

    return {
      ...group,
      items,
      subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
    };
  });
}

function correctAiFireplacePricing(groups: QuoteGroup[]): QuoteGroup[] {
  return groups.map((group) => {
    const contextText = [group.title, group.subtitle, ...group.items.map((item) => item.name)].join(" ").toLowerCase();
    const hasFireplaceSignal = contextText.includes("fireplace");

    if (!hasFireplaceSignal) {
      return group;
    }

    const fireplaceItem = group.items.find((item) => item.name === pricingData.tvMounting.fireplace.name);
    if (!fireplaceItem) {
      return group;
    }

    const standardMountItem = group.items.find((item) => item.name === pricingData.tvMounting.standard.name);
    const nonDrywallItem = group.items.find((item) => item.name === pricingData.tvMounting.nonDrywall.name);
    const hasCustomerMountContext = group.subtitle?.toLowerCase().includes("customer mount") ?? false;

    if (!standardMountItem && !nonDrywallItem) {
      return group;
    }

    const filteredItems = group.items.filter(
      (item) => item !== standardMountItem && item !== nonDrywallItem && item !== fireplaceItem,
    );

    const fireplaceDisplayName = hasCustomerMountContext
      ? "Fireplace TV Mounting (Customer's Mount)"
      : "Fireplace TV Mounting";

    const normalizedFireplaceItem: QuoteLineItem = {
      name: fireplaceDisplayName,
      price: fireplaceItem.lineTotal,
      qty: 1,
      lineTotal: fireplaceItem.lineTotal,
    };

    const items = [normalizedFireplaceItem, ...filteredItems];

    return {
      ...group,
      items,
      subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
    };
  });
}

function normalizeDiscountPresentation(groups: QuoteGroup[]) {
  const groupsWithoutDiscountLines = groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.lineTotal >= 0),
  }));

  const tvGroupCount = groupsWithoutDiscountLines.filter((group) => group.title.startsWith("TV ")).length;
  const pricedWireJobs = groupsWithoutDiscountLines.reduce(
    (count, group) =>
      count +
      group.items.filter((item) => item.name === pricingData.wireConcealment.standard.name && item.lineTotal > 0).length,
    0,
  );

  const bundleDiscount =
    tvGroupCount > 1
      ? (Math.max(0, tvGroupCount - 1) * pricingData.discounts.multipleTvs.amount) +
        (Math.max(0, pricedWireJobs - 1) * pricingData.discounts.multipleOutlets.amount)
      : 0;

  const fallbackDiscount = groups.reduce(
    (sum, group) => sum + group.items.filter((item) => item.lineTotal < 0).reduce((groupSum, item) => groupSum + Math.abs(item.lineTotal), 0),
    0,
  );

  return {
    groups: groupsWithoutDiscountLines.map((group) => ({
      ...group,
      subtotal: group.items.filter((item) => item.lineTotal >= 0).reduce((sum, item) => sum + item.lineTotal, 0),
    })),
    discount: bundleDiscount > 0 ? bundleDiscount : fallbackDiscount,
  };
}

function buildDisplayGroup(group: QuoteGroup): QuoteGroup {
  const hasFireplaceContext = [group.title, group.subtitle].some((value) => value?.toLowerCase().includes("fireplace"));
  const hasCustomerMountContext = group.subtitle?.toLowerCase().includes("customer mount") ?? false;

  if (!hasFireplaceContext) {
    return {
      ...group,
      items: group.items.map((item) => {
        if (item.lineTotal < 0 && item.name === pricingData.discounts.multipleTvs.name) {
          return {
            ...item,
            name: "Additional TV Discount",
          };
        }

        return item;
      }),
    };
  }

  const baseMountItem = group.items.find((item) => {
    const name = item.name.toLowerCase();
    return name.includes("fireplace") || name.includes("standard tv mounting");
  });
  const nonDrywallItem = group.items.find((item) => item.name === pricingData.tvMounting.nonDrywall.name);
  const canCombineFireplaceMount = Boolean(baseMountItem && nonDrywallItem);

  const displayItems: QuoteLineItem[] = [];

  if (canCombineFireplaceMount && baseMountItem && nonDrywallItem) {
    displayItems.push({
      name: hasCustomerMountContext ? "Fireplace TV Mounting (Customer's Mount)" : "Fireplace TV Mounting",
      price: baseMountItem.lineTotal + nonDrywallItem.lineTotal,
      qty: 1,
      lineTotal: baseMountItem.lineTotal + nonDrywallItem.lineTotal,
    });
  }

  for (const item of group.items) {
    if (canCombineFireplaceMount && (item === baseMountItem || item === nonDrywallItem)) {
      continue;
    }

    if (item.lineTotal < 0 && item.name === pricingData.discounts.multipleTvs.name) {
      displayItems.push({
        ...item,
        name: "Additional TV Discount",
      });
      continue;
    }

    displayItems.push(item);
  }

  return {
    ...group,
    items: displayItems,
  };
}

function buildDisplayFlags(flags: string[]): string[] {
  const fireplaceAssessmentFlags = flags.filter((flag) => {
    const normalized = flag.toLowerCase();
    return normalized.includes("fireplace") && (normalized.includes("photo") || normalized.includes("confirm pricing"));
  });

  const otherFlags = flags.filter((flag) => !fireplaceAssessmentFlags.includes(flag));
  const dedupedOtherFlags = Array.from(new Set(otherFlags));

  if (fireplaceAssessmentFlags.length === 0) {
    return dedupedOtherFlags;
  }

  return [
    ...dedupedOtherFlags,
    "Fireplace wire concealment requires photo review before we confirm final pricing.",
  ];
}

function groupContextText(group: QuoteGroup): string {
  return [group.title, group.subtitle, ...group.items.map((item) => item.name)].filter(Boolean).join(" ").toLowerCase();
}

function groupHasNonFireplaceWireConcealment(group: QuoteGroup): boolean {
  const contextText = groupContextText(group);
  return contextText.includes(pricingData.wireConcealment.standard.name.toLowerCase()) && !contextText.includes("fireplace");
}

function descriptionProvidesOutletDistanceInfo(description: string): boolean {
  const normalized = description.toLowerCase();
  return [
    /\bwithin\s+1(?:-|–|—|\s+to\s+)?2\s+feet\b/,
    /\b1(?:-|–|—|\s+to\s+)?2\s+feet\b/,
    /\boutlet\b.*\b(close|near|nearby|right below|directly below|behind it|behind the tv)\b/,
    /\b(close|near|nearby|right below|directly below|behind it|behind the tv)\b.*\boutlet\b/,
    /\boutlet\b.*\bfar|farther|further|not close|not near\b/,
  ].some((pattern) => pattern.test(normalized));
}

function quoteNeedsOutletDistanceFollowUp(quote: DisplayQuote, sourceMode: QuoteSourceMode, description: string): boolean {
  if (sourceMode !== "text" || descriptionProvidesOutletDistanceInfo(description)) {
    return false;
  }

  return quote.groups.some((group) => groupHasNonFireplaceWireConcealment(group));
}

function getMountPriceLabel(size: TVConfig["size"], type: MountType): string {
  if (type === "fixed") {
    return formatPrice(size === "56+" ? pricingData.tvMounts.fixedBig.price : pricingData.tvMounts.fixedSmall.price);
  }

  if (type === "tilting") {
    return formatPrice(size === "56+" ? pricingData.tvMounts.tiltingBig.price : pricingData.tvMounts.tiltingSmall.price);
  }

  return formatPrice(size === "56+" ? pricingData.tvMounts.fullMotionBig.price : pricingData.tvMounts.fullMotionSmall.price);
}

function normalizeAiQuote(response: FullAiQuoteResponse): DisplayQuote {
  const rawGroups: QuoteGroup[] = [];

  for (const group of response.groups ?? []) {
    if (!group.title) {
      continue;
    }

    const items: QuoteLineItem[] = [];

    for (const item of group.items ?? []) {
      const qty = Number(item.qty ?? 1);
      const price = Number(item.price ?? 0);
      const lineTotal = Number.isFinite(item.lineTotal) ? Number(item.lineTotal) : price * qty;

      if (!item.name || !Number.isFinite(qty) || !Number.isFinite(lineTotal)) {
        continue;
      }

      items.push({
        name: item.name,
        price,
        qty,
        lineTotal,
        isDiscount: item.isDiscount ?? lineTotal < 0,
      });
    }

    if (items.length === 0) {
      continue;
    }

    rawGroups.push({
      title: group.title,
      subtitle: group.subtitle,
      items,
      subtotal: Number.isFinite(group.subtotal)
        ? Number(group.subtotal)
        : items.reduce((sum, item) => sum + item.lineTotal, 0),
    });
  }

  if (rawGroups.length === 0) {
    throw new Error("No quote items were returned.");
  }

  const groups = correctAiWireConcealment(correctAiFireplacePricing(rawGroups));
  const normalizedDiscount = normalizeDiscountPresentation(groups);

  const subtotal = normalizedDiscount.groups.reduce(
    (sum, group) => sum + group.items.filter((item) => item.lineTotal > 0).reduce((groupSum, item) => groupSum + item.lineTotal, 0),
    0,
  );
  const discount = normalizedDiscount.discount;

  return {
    groups: normalizedDiscount.groups,
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
    flags: response.flags ?? [],
    summary: response.summary?.trim() || "Here is the estimate based on the details you shared.",
    followUp: response.followUp?.trim() || undefined,
    travelTier: 0,
    travelFee: 0,
    travelContext: getTravelContext("30332"),
  };
}

function updateTvCount(tvs: TVConfig[], count: number): TVConfig[] {
  if (tvs.length === count) {
    return tvs;
  }

  if (tvs.length > count) {
    return tvs.slice(0, count);
  }

  return [...tvs, ...Array.from({ length: count - tvs.length }, () => createDefaultTVConfig())];
}

function updateCameraCount(cameras: CameraConfig[], count: number): CameraConfig[] {
  if (cameras.length === count) {
    return cameras;
  }

  if (cameras.length > count) {
    return cameras.slice(0, count);
  }

  return [...cameras, ...Array.from({ length: count - cameras.length }, () => createDefaultCameraConfig())];
}

function tvDotClass(index: number): string {
  return index === 0 ? "bg-blue-500" : index === 1 ? "bg-violet-500" : index === 2 ? "bg-emerald-500" : index === 3 ? "bg-amber-500" : "bg-rose-500";
}

function flattenQuoteItems(groups: QuoteGroup[]): Array<{ name: string; price: number; qty: number }> {
  return groups.flatMap((group) =>
    group.items.map((item) => ({
      name: group.title === "Shared Services" ? item.name : `${group.title} - ${item.name}`,
      price: item.lineTotal,
      qty: 1,
    })),
  );
}

function isValidPhoneNumber(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

function isValidOptionalEmail(value: string): boolean {
  if (!value.trim()) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildLocalQuoteSummary(quote: QuoteResult, state: QuoteFormState, standaloneServices: StandaloneServices): string {
  const parts: string[] = [];

  if (state.tvs.length > 0) {
    parts.push(`${state.tvs.length} TV ${state.tvs.length === 1 ? "install" : "installs"}`);
  }

  if (state.cameras.length > 0) {
    parts.push(`${state.cameras.length} security ${state.cameras.length === 1 ? "camera" : "cameras"}`);
  }

  if (state.doorbell) {
    parts.push("doorbell install");
  }

  if (state.soundbar) {
    parts.push("soundbar setup");
  }

  if (state.surroundSound) {
    parts.push("surround sound setup");
  }

  if (state.floodlight) {
    parts.push("smart floodlight install");
  }

  if (standaloneServices.removalCount > 0) {
    parts.push(`${standaloneServices.removalCount} TV ${standaloneServices.removalCount === 1 ? "removal" : "removals"}`);
  }

  if (standaloneServices.troubleshootingMinutes > 0) {
    parts.push(`AV troubleshooting (${standaloneServices.troubleshootingMinutes} min)`);
  }

  if (standaloneServices.deviceSetup) {
    parts.push("device setup");
  }

  const serviceSummary = parts.length > 0 ? parts.join(", ") : "your installation";
  const travelSummary = quote.travelFee === "out_of_range"
    ? "Travel is outside the standard service area and may need a custom quote."
    : quote.travelFee === 0
      ? "No travel fee applies for this ZIP code."
      : `This includes a ${formatPrice(typeof quote.travelFee === "number" ? quote.travelFee : 0)} travel fee.`;

  return `This estimate covers ${serviceSummary}. ${travelSummary}`;
}

function buildAugmentedQuote(baseQuote: QuoteResult, standaloneServices: StandaloneServices): QuoteResult {
  const extraItems: QuoteLineItem[] = [];
  const flags = [...baseQuote.flags];
  let extraSubtotal = 0;

  if (standaloneServices.removalCount > 0) {
    const lineTotal = pricingData.otherServices.tvUnmounting.price * standaloneServices.removalCount;
    extraItems.push({
      name: pricingData.otherServices.tvUnmounting.name,
      price: pricingData.otherServices.tvUnmounting.price,
      qty: standaloneServices.removalCount,
      lineTotal,
    });
    extraSubtotal += lineTotal;
  }

  if (standaloneServices.troubleshootingMinutes > 0) {
    const lineTotal = calculateTroubleshootingTotal(standaloneServices.troubleshootingMinutes);
    extraItems.push({
      name: `AV troubleshooting (${standaloneServices.troubleshootingMinutes} min)`,
      price: lineTotal,
      qty: 1,
      lineTotal,
    });
    extraSubtotal += lineTotal;
    if (standaloneServices.troubleshootingMinutes <= 60) {
      flags.push("AV troubleshooting has a 1-hour minimum. Shorter visits are billed at the first-hour rate.");
    }
  }

  if (standaloneServices.wireManagementLocations > 0) {
    const lineTotal = pricingData.otherServices.wireManagementOnly.price + Math.max(0, standaloneServices.wireManagementLocations - 1) * pricingData.otherServices.wireManagementOnly.additionalLocationPrice;
    extraItems.push({
      name: `Cable / wire management only (${standaloneServices.wireManagementLocations} location${standaloneServices.wireManagementLocations > 1 ? "s" : ""})`,
      price: lineTotal,
      qty: 1,
      lineTotal,
    });
    extraSubtotal += lineTotal;
  }

  if (standaloneServices.deviceSetup) {
    extraItems.push({
      name: "Device setup and configuration",
      price: pricingData.otherServices.deviceSetup.price,
      qty: 1,
      lineTotal: pricingData.otherServices.deviceSetup.price,
    });
    extraSubtotal += pricingData.otherServices.deviceSetup.price;
  }

  if (standaloneServices.sharedUnmountCount > 0) {
    const lineTotal = pricingData.tvMounting.unmount.price * standaloneServices.sharedUnmountCount;
    extraItems.push({
      name: `Unmount existing TV(s) before install`,
      price: pricingData.tvMounting.unmount.price,
      qty: standaloneServices.sharedUnmountCount,
      lineTotal,
    });
    extraSubtotal += lineTotal;
  }

  if (extraItems.length === 0) {
    return baseQuote;
  }

  return {
    ...baseQuote,
    groups: [
      ...baseQuote.groups,
      {
        title: "Additional Services",
        items: extraItems,
        subtotal: extraSubtotal,
      },
    ],
    subtotal: baseQuote.subtotal + extraSubtotal,
    total: baseQuote.total + extraSubtotal,
    flags: Array.from(new Set(flags)),
  };
}

function SelectorButton({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm font-semibold transition-all",
        selected ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-600",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function QuoteTool() {
  const [, setLocation] = useLocation();
  const seasonalTheme = useMemo(() => getSeasonalTheme(), []);
  const [step, setStep] = useState<QuoteStep>("build");
  const [mode, setMode] = useState<QuoteMode>("form");
  const [formState, setFormState] = useState<QuoteFormState>(createDefaultQuoteFormState);
  const [standaloneServices, setStandaloneServices] = useState<StandaloneServices>(createDefaultStandaloneServices);
  const [tvCountLabel, setTvCountLabel] = useState("1");
  const [activeTvId, setActiveTvId] = useState(formState.tvs[0]?.id ?? "");
  const [quote, setQuote] = useState<DisplayQuote | null>(null);
  const [error, setError] = useState("");
  const [textInput, setTextInput] = useState("");
  const [textZipCode, setTextZipCode] = useState("");
  const [textZipError, setTextZipError] = useState("");
  const [textZipAutoDetected, setTextZipAutoDetected] = useState(false);
  const [textZipTouched, setTextZipTouched] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [microphonePermission, setMicrophonePermission] = useState<MicrophonePermissionState>("unknown");
  const [isRecording, setIsRecording] = useState(false);
  const [zipError, setZipError] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState(seasonalTheme.promoCode ?? "");
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequestPayload>({ name: "", phone: "", email: "" });
  const [quoteRequestError, setQuoteRequestError] = useState("");
  const [quoteRequestStatus, setQuoteRequestStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [nextStepIntent, setNextStepIntent] = useState<NextStepIntent>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [quoteSourceMode, setQuoteSourceMode] = useState<QuoteSourceMode>(null);
  const [describeOutletAnswer, setDescribeOutletAnswer] = useState<OutletDistanceAnswer>(null);
  const [aiQuoteConfig, setAiQuoteConfig] = useState<AiQuoteConfig | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const [honeypotValue, setHoneypotValue] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const stepFlow: Array<{ key: Exclude<QuoteStep, "loading">; label: string }> = [
    { key: "build", label: "Build Quote" },
    { key: "review", label: "Review Quote" },
    { key: "contact", label: "Contact Info" },
    { key: "booking", label: "Next Step" },
  ];

  const browserSupportsSpeechRecognition = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  const liveQuote = useMemo(
    () => buildAugmentedQuote(calculateQuote(formState), standaloneServices),
    [formState, standaloneServices],
  );
  const cleanedTextInput = useMemo(() => cleanDescribeText(textInput), [textInput]);
  const describeCharacterCount = textInput.length;
  const describeUsageRatio = describeCharacterCount / DESCRIBE_IT_MAX_CHARS;
  const aiQuoteEnabled = aiQuoteConfig?.enabled ?? false;
  const turnstileRequired = aiQuoteConfig?.turnstileRequired ?? aiQuoteConfig?.requireTurnstile ?? false;
  const aiQuoteConfigLoaded = aiQuoteConfig !== null;
  const isZipValid = /^\d{5}$/.test(formState.zipCode);
  const isTextZipValid = isValidFiveDigitZip(textZipCode);
  const travelContext = useMemo(
    () => (isZipValid ? getTravelContext(formState.zipCode) : null),
    [formState.zipCode, isZipValid],
  );
  const textTravelContext = useMemo(
    () => (isTextZipValid ? getTravelContext(textZipCode) : null),
    [isTextZipValid, textZipCode],
  );
  const reviewGroups = useMemo(
    () =>
      quote
        ? quote.groups
            .map(buildDisplayGroup)
            .filter((group) => group.items.length > 0 && group.items.some((item) => item.lineTotal !== 0 || item.name.trim().length > 0))
        : [],
    [quote],
  );
  const reviewFlags = useMemo(
    () => {
      if (!quote) {
        return [];
      }

      const flags = buildDisplayFlags(quote.flags);

      if (quoteNeedsOutletDistanceFollowUp(quote, quoteSourceMode, cleanedTextInput)) {
        if (describeOutletAnswer === "no") {
          flags.push("Because the nearest outlet is farther than 1–2 feet from the TV location, additional concealment work may be needed. We’ll confirm that before the install.");
        } else if (describeOutletAnswer === "not_sure") {
          flags.push("Outlet distance is still unconfirmed for the standard wire concealment part of this quote. We may ask for a quick photo before finalizing pricing.");
        }
      }

      return Array.from(new Set(flags));
    },
    [cleanedTextInput, describeOutletAnswer, quote, quoteSourceMode],
  );
  const reviewDiscountLabel = useMemo(() => {
    if (!quote || quote.discount <= 0) {
      return "Total discounts";
    }

    const tvGroupCount = quote.groups.filter((group) => group.title.startsWith("TV ")).length;
    return tvGroupCount > 1 ? `Bundle Discount (${tvGroupCount} TVs)` : "Bundle Discount";
  }, [quote]);
  const describeOutletFollowUpNeeded = useMemo(
    () => (quote ? quoteNeedsOutletDistanceFollowUp(quote, quoteSourceMode, cleanedTextInput) : false),
    [cleanedTextInput, quote, quoteSourceMode],
  );
  const reviewNeedsPhotoHelper = useMemo(() => {
    if (!quote) {
      return false;
    }

    const hasTrickyFlag = reviewFlags.some((flag) => /\b(fireplace|brick|masonry|photo|concealment)\b/i.test(flag));
    const hasTrickyGroup = reviewGroups.some((group) => /\b(fireplace|brick|stone|masonry)\b/i.test(groupContextText(group)));
    return hasTrickyFlag || hasTrickyGroup || describeOutletAnswer === "not_sure";
  }, [describeOutletAnswer, quote, reviewFlags, reviewGroups]);

  useEffect(() => {
    if (!formState.tvs.some((tv) => tv.id === activeTvId) && formState.tvs[0]) {
      setActiveTvId(formState.tvs[0].id);
    }
  }, [activeTvId, formState.tvs]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (mode !== "voice") {
      return;
    }

    void refreshMicrophonePermission();
  }, [mode]);

  useEffect(() => {
    apiRequest("GET", "/api/ai-quote/config")
      .then((response) => response.json() as Promise<AiQuoteConfig>)
      .then((config) => setAiQuoteConfig(config))
      .catch((configError) => {
        console.error("AI quote config error:", configError);
        setAiQuoteConfig({ siteKey: "", enabled: false, turnstileRequired: false });
      });
  }, []);

  useEffect(() => {
    if (!aiQuoteEnabled || !turnstileRequired || !aiQuoteConfig?.siteKey || typeof window === "undefined") {
      return;
    }

    if (document.querySelector('script[data-turnstile-script="true"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = "true";
    document.head.appendChild(script);
  }, [aiQuoteConfig?.siteKey, aiQuoteEnabled, turnstileRequired]);

  useEffect(() => {
    if (!aiQuoteEnabled || !turnstileRequired || !aiQuoteConfig?.siteKey || !turnstileContainerRef.current || mode === "form" || step !== "build") {
      return;
    }

    let cancelled = false;
    let intervalId: number | null = null;

    const renderTurnstile = () => {
      if (cancelled || !window.turnstile || !turnstileContainerRef.current || turnstileWidgetIdRef.current) {
        return;
      }

      turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: aiQuoteConfig.siteKey,
        theme: "light",
        callback: (token: string) => {
          setTurnstileToken(token);
          setTurnstileError("");
        },
        "expired-callback": () => {
          setTurnstileToken("");
          setTurnstileError("Please complete the quick verification again.");
        },
        "error-callback": () => {
          setTurnstileToken("");
          setTurnstileError("We couldn't verify the request. Please try again.");
        },
      });
    };

    if (window.turnstile) {
      renderTurnstile();
    } else {
      intervalId = window.setInterval(() => {
        if (window.turnstile) {
          if (intervalId !== null) {
            window.clearInterval(intervalId);
          }
          renderTurnstile();
        }
      }, 250);
    }

    return () => {
      cancelled = true;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [aiQuoteConfig?.siteKey, aiQuoteEnabled, mode, step, turnstileRequired]);

  function resetTurnstileWidget() {
    setTurnstileToken("");
    setTurnstileError("");

    if (window.turnstile && turnstileWidgetIdRef.current) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  }

  async function requestProtectedAiQuote(payload: { message?: string; mode?: "text" | "voice"; description?: string; zipCode?: string }) {
    if (!aiQuoteConfigLoaded) {
      throw new Error("AI quote availability is still loading. Please try again in a moment.");
    }

    if (!aiQuoteEnabled) {
      throw new Error("AI quote requests are temporarily unavailable. Please use the local builder or call us directly.");
    }

    // Only require Turnstile token when the server has Turnstile configured.
    if (turnstileRequired && !turnstileToken) {
      setTurnstileError("Please complete the quick verification before requesting an AI quote.");
      throw new Error("Missing Turnstile verification.");
    }

    const response = await apiRequest("POST", "/api/ai-quote", {
      ...payload,
      turnstileToken,
      honeypot: honeypotValue,
    });

    const data = (await response.json()) as { content?: string };
    if (!data.content) {
      throw new Error("The AI quote service returned an empty response.");
    }

    resetTurnstileWidget();
    return data.content;
  }

  async function handleFormQuote() {
    if (!isZipValid) {
      setZipError("Please enter a valid 5-digit ZIP code.");
      return;
    }

    setError("");
    setQuoteRequestError("");
    setQuoteRequestStatus("idle");
    setNextStepIntent(null);
    setStep("loading");

    try {
      setQuote(
        normalizeQuoteForDisplayTotals({
          ...liveQuote,
          summary: buildLocalQuoteSummary(liveQuote, formState, standaloneServices),
        }),
      );
      setQuoteSourceMode("form");
      setDescribeOutletAnswer(null);
      setPromoCodeInput(seasonalTheme.promoCode ?? "");
      setStep("review");
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? `${submitError.message} You can try again, call ${businessPhone}, or email ${businessEmail}.`
          : `Something went wrong building the quote. You can try again, call ${businessPhone}, or email ${businessEmail}.`,
      );
      setStep("build");
    }
  }

  async function handleNarrativeQuote(prompt: string) {
    setError("");
    setQuoteRequestError("");
    setQuoteRequestStatus("idle");
    setNextStepIntent(null);
    setStep("loading");

    try {
      const raw = await requestProtectedAiQuote({ mode: "voice", message: prompt });
      setQuote(normalizeQuoteForDisplayTotals(normalizeAiQuote(extractJson<FullAiQuoteResponse>(raw))));
      setQuoteSourceMode("voice");
      setDescribeOutletAnswer(null);
      setPromoCodeInput(seasonalTheme.promoCode ?? "");
      setStep("review");
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? `${submitError.message.replace(/^\d+:\s*/, "")} You can try again, call ${businessPhone}, or email ${businessEmail}.`
          : `Something went wrong building the quote. You can try again, call ${businessPhone}, or email ${businessEmail}.`,
      );
      setStep("build");
    }
  }

  async function handleDescribeItQuote() {
    setError("");
    const fallbackZip = !textZipCode ? extractZipFromDescription(textInput) : "";
    const finalZipCode = textZipCode || fallbackZip;
    const cleanedDescription = cleanDescribeText(textInput).slice(0, DESCRIBE_IT_MAX_CHARS);

    if (!cleanedDescription) {
      setError("Please add a short description of the job before requesting an AI quote.");
      return;
    }

    if (!isValidFiveDigitZip(finalZipCode)) {
      setTextZipError("Please enter a valid 5-digit ZIP code.");
      if (fallbackZip) {
        setTextZipCode(fallbackZip);
        setTextZipAutoDetected(true);
      }
      return;
    }
    setTextZipError("");
    setQuoteRequestError("");
    setQuoteRequestStatus("idle");
    setNextStepIntent(null);
    setFormState((current) => ({ ...current, zipCode: finalZipCode }));
    setStep("loading");

    try {
      const raw = await requestProtectedAiQuote({
        mode: "text",
        message: `ZIP: ${finalZipCode}\nRequest: ${cleanedDescription}`,
        description: cleanedDescription,
        zipCode: finalZipCode,
      });
      const nextQuote = normalizeAiQuote(extractJson<FullAiQuoteResponse>(raw));
      const nextTravelContext = getTravelContext(finalZipCode);
      setQuote(
        normalizeQuoteForDisplayTotals({
          ...nextQuote,
          travelTier: nextTravelContext.tier,
          travelFee: nextTravelContext.fee,
          travelContext: nextTravelContext,
        }),
      );
      setQuoteSourceMode("text");
      setDescribeOutletAnswer(null);
      setPromoCodeInput(seasonalTheme.promoCode ?? "");
      setStep("review");
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? `${submitError.message.replace(/^\d+:\s*/, "")} You can try again, call ${businessPhone}, or email ${businessEmail}.`
          : `Something went wrong building the quote. You can try again, call ${businessPhone}, or email ${businessEmail}.`,
      );
      setStep("build");
    }
  }

  function savePendingQuote(nextQuote: DisplayQuote) {
    if (typeof window === "undefined") {
      return;
    }

    const payload: PendingQuoteStorage = {
      total: nextQuote.total,
      summary: nextQuote.summary,
      groups: nextQuote.groups,
      flags: nextQuote.flags,
      followUp: nextQuote.followUp,
      promoCode: promoCodeInput.trim() || undefined,
    };

    window.localStorage.setItem(pendingQuoteStorageKey, JSON.stringify(payload));
  }

  function validateContactInfo(): boolean {
    if (!quoteRequest.name.trim()) {
      setQuoteRequestError("Please enter your name.");
      return false;
    }

    if (!isValidPhoneNumber(quoteRequest.phone)) {
      setQuoteRequestError("Please enter a valid phone number.");
      return false;
    }

    if (!isValidOptionalEmail(quoteRequest.email)) {
      setQuoteRequestError("Please enter a valid email address or leave it blank.");
      return false;
    }

    setQuoteRequestError("");
    return true;
  }

  function handleReviewApproval() {
    if (describeOutletFollowUpNeeded && !describeOutletAnswer) {
      setError("Please answer the quick wire-concealment question so we can finalize the review clearly.");
      return;
    }

    setError("");
    setQuoteRequestError("");
    setStep("contact");
  }

  function handleEditQuote() {
    setQuoteRequestError("");
    setQuoteRequestStatus("idle");
    setNextStepIntent(null);
    setError("");
    setStep("build");
  }

  function handleScheduleNow() {
    if (!quote) {
      return;
    }

    if (!validateContactInfo()) {
      return;
    }

    savePendingQuote(quote);
    setNextStepIntent("schedule");
    setStep("booking");
  }

  async function handleFollowUpRequest(intent: Exclude<NextStepIntent, "schedule" | null>) {
    if (!quote) {
      return;
    }

    if (!validateContactInfo()) {
      return;
    }

    setQuoteRequestStatus("submitting");
    setNextStepIntent(intent);

    try {
      const followUpPreference = intent === "send_quote" ? "Customer requested this quote be sent for follow-up." : "Customer requested a text confirmation before booking.";
      const contactSummary = [
        followUpPreference,
        quoteRequest.email.trim() ? `Email: ${quoteRequest.email.trim()}` : null,
      ].filter(Boolean).join("\n");

      await apiRequest("POST", "/api/quote-request", {
        name: quoteRequest.name.trim(),
        phone: quoteRequest.phone.trim(),
        quoteTotal: quote.total,
        quoteItems: flattenQuoteItems(quote.groups),
        quoteSummary: [quote.summary, contactSummary].filter(Boolean).join("\n\n"),
        zipCode: formState.zipCode || "N/A",
      });
      setQuoteRequestStatus("success");
      setStep("booking");
    } catch (submitError) {
      console.error(submitError);
      setQuoteRequestStatus("idle");
      setQuoteRequestError("We couldn't send that quote just now. Please call or email us and we'll take it from there.");
    }
  }

  async function copyPhoneNumber() {
    try {
      await navigator.clipboard.writeText(businessPhone);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1800);
    } catch (copyError) {
      console.error(copyError);
    }
  }

  function resetTool() {
    recognitionRef.current?.abort();
    setIsRecording(false);
    setError("");
    setQuote(null);
    setTextInput("");
    setTextZipCode("");
    setTextZipError("");
    setTextZipAutoDetected(false);
    setTextZipTouched(false);
    setVoiceTranscript("");
    setVoiceError("");
    setMicrophonePermission("unknown");
    setZipError("");
    setStandaloneServices(createDefaultStandaloneServices());
    setQuoteRequest({ name: "", phone: "", email: "" });
    setQuoteRequestError("");
    setQuoteRequestStatus("idle");
    setNextStepIntent(null);
    setCopyStatus("idle");
    setQuoteSourceMode(null);
    setDescribeOutletAnswer(null);
    const nextState = createDefaultQuoteFormState();
    setFormState(nextState);
    setActiveTvId(nextState.tvs[0]?.id ?? "");
    setTvCountLabel("1");
    setMode("form");
    setPromoCodeInput(seasonalTheme.promoCode ?? "");
    setStep("build");
  }

  async function refreshMicrophonePermission(): Promise<MicrophonePermissionState> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicrophonePermission("unsupported");
      return "unsupported";
    }

    if (!navigator.permissions?.query) {
      setMicrophonePermission("unknown");
      return "unknown";
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName });
      const nextState = permissionStatus.state as MicrophonePermissionState;
      setMicrophonePermission(nextState);
      return nextState;
    } catch {
      setMicrophonePermission("unknown");
      return "unknown";
    }
  }

  async function requestMicrophoneAccess(): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicrophonePermission("unsupported");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicrophonePermission("granted");
      return true;
    } catch (requestError) {
      const errorName = requestError instanceof DOMException ? requestError.name : "";
      setMicrophonePermission(errorName === "NotAllowedError" || errorName === "PermissionDeniedError" ? "denied" : "unknown");
      return false;
    }
  }

  async function toggleRecording() {
    if (!browserSupportsSpeechRecognition) {
      setVoiceError("Voice quotes are not supported in this browser. Please use the builder or type your request instead.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceError("Voice quotes are not supported in this browser. Please use the builder or type your request instead.");
      return;
    }

    let permissionState = microphonePermission;
    if (permissionState === "unknown") {
      permissionState = await refreshMicrophonePermission();
    }

    if (permissionState === "denied") {
      setVoiceError("Microphone access is blocked right now. Allow microphone access in your browser settings, then refresh or try again. If you want to keep moving, use Describe It instead.");
      return;
    }

    if (permissionState === "unsupported") {
      setVoiceError("This browser doesn't expose microphone access the way voice quotes need. Please use Describe It instead.");
      return;
    }

    if (permissionState === "prompt" || permissionState === "unknown") {
      const granted = await requestMicrophoneAccess();
      if (!granted) {
        setVoiceError("We need microphone access to capture your voice note. Please allow access in your browser prompt, or use Describe It instead.");
        return;
      }
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join(" ").trim();
      setVoiceTranscript(transcript);
      setVoiceError("");
      setMicrophonePermission("granted");
    };
    recognition.onerror = (event) => {
      setVoiceError(
        event.error === "not-allowed"
          ? "Microphone access was blocked. Please allow it in your browser settings, then refresh or try again. You can also use Describe It instead."
          : "We couldn't capture your voice note. Please try again or use the text mode instead.",
      );
      if (event.error === "not-allowed") {
        setMicrophonePermission("denied");
      }
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    setVoiceTranscript("");
    setVoiceError("");
    setIsRecording(true);
    recognition.start();
  }

  return (
    <Card className="mx-auto w-full max-w-5xl overflow-hidden rounded-[32px] border-slate-200 bg-white shadow-2xl">
      <div className="bg-slate-900 px-6 py-6 text-white md:px-8">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-blue-600/20 p-3 text-blue-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Instant Estimate Builder</p>
            <h3 className="text-2xl font-extrabold leading-tight md:text-3xl">Build each TV exactly the way you want it</h3>
            <p className="max-w-2xl text-sm text-slate-300 md:text-base">
              Configure every TV, add shared services, and watch the estimate update in real time.
            </p>
            <p className="text-sm text-slate-300">
              Need a faster answer? <a href={telHref} className="font-semibold text-white hover:underline">Call or text {businessPhone}</a>.
            </p>
          </div>
        </div>
      </div>

      <CardContent className="relative p-0">
        {error ? (
          <div className="px-6 pt-6 md:px-8">
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>We couldn't build that quote</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : null}

        {step !== "loading" ? (
          <div className="border-b border-slate-100 px-6 py-4 md:px-8">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {stepFlow.map((stepItem, index) => {
                const active = stepItem.key === step;
                const currentIndex = stepFlow.findIndex((item) => item.key === step);
                const completed = currentIndex > index;

                return (
                  <div key={stepItem.key} className={cn("rounded-2xl border px-3 py-3 text-center transition-all", active ? "border-blue-600 bg-blue-50 text-blue-700" : completed ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-slate-50 text-slate-400")}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">Step {index + 1}</p>
                    <p className="mt-1 text-sm font-bold">{stepItem.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {step === "build" ? (
            <motion.div
              key="build"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6 p-6 md:p-8"
            >
              <Tabs value={mode} onValueChange={(value) => setMode(value as QuoteMode)} className="w-full">
                <TabsList data-quote-tabs="true" className="grid h-auto w-full grid-cols-3 gap-2 rounded-3xl bg-slate-100 p-2">
                  <TabsTrigger value="form" className="rounded-2xl px-4 py-3 text-sm font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Build It
                  </TabsTrigger>
                  <TabsTrigger value="text" className="rounded-2xl px-4 py-3 text-sm font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Describe It
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="rounded-2xl px-4 py-3 text-sm font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Voice Note
                  </TabsTrigger>
                </TabsList>
                <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-3">
                  <p><span className="font-semibold text-slate-700">Build It</span> — best if you know exactly what you need</p>
                  <p><span className="font-semibold text-slate-700">Describe It</span> — best if you want us to figure it out</p>
                  <p><span className="font-semibold text-slate-700">Voice Note</span> — best if it&apos;s easier to explain it out loud</p>
                </div>

                <TabsContent value="form" className="mt-6 space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">1. How many TVs?</h4>
                        <p className="text-sm text-slate-500">Set the TV count first, then configure each screen individually.</p>
                      </div>
                      {formState.tvs.length >= 5 ? (
                        <Badge className="border-amber-200 bg-amber-50 text-amber-800">Large project</Badge>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                      {["0", "1", "2", "3", "4", "5+"].map((option) => (
                        <SelectorButton
                          key={option}
                          selected={tvCountLabel === option}
                          onClick={() => {
                            const nextCount = option === "5+" ? 5 : Number(option);
                            const nextTvs = updateTvCount(formState.tvs, nextCount);
                            setTvCountLabel(option);
                            setFormState((current) => ({ ...current, tvs: nextTvs }));
                            setActiveTvId(nextTvs[0]?.id ?? "");
                          }}
                          className="py-4 text-base"
                        >
                          {option}
                        </SelectorButton>
                      ))}
                    </div>
                    {formState.tvs.length >= 5 ? (
                      <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Large multi-room project</AlertTitle>
                        <AlertDescription>
                          Large multi-room projects may qualify for a custom bundle rate. We&apos;ll discuss that at booking.
                        </AlertDescription>
                      </Alert>
                    ) : null}
                  </section>

                  {formState.tvs.length > 0 ? (
                    <section className="space-y-4">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">2. Configure each TV</h4>
                        <p className="text-sm text-slate-500">Every TV gets its own wall, mount, and wire plan.</p>
                      </div>

                      <Tabs value={activeTvId} onValueChange={setActiveTvId} className="w-full">
                      <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-3xl bg-slate-100 p-2 md:grid-cols-5">
                        {formState.tvs.map((tv, index) => (
                          <TabsTrigger
                            key={tv.id}
                            value={tv.id}
                            className="flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold data-[state=active]:bg-white"
                          >
                            <span className={cn("h-2.5 w-2.5 rounded-full", tvDotClass(index))} />
                            {`TV ${index + 1}`}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {formState.tvs.map((tv, index) => (
                        <TabsContent key={tv.id} value={tv.id} className="mt-4">
                          <div className={cn("rounded-[28px] border border-slate-200 border-l-4 bg-slate-50 p-5 md:p-6", tvAccentClasses[index] ?? "border-l-blue-500")}>
                            <div className="space-y-6">
                              <section className="space-y-3">
                                <p className="text-sm font-semibold text-slate-900">TV Size</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <SelectorButton
                                    selected={tv.size === "32-55"}
                                    onClick={() =>
                                      setFormState((current) => ({
                                        ...current,
                                        tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, size: "32-55" } : item)),
                                      }))
                                    }
                                  >
                                    32"-55"
                                  </SelectorButton>
                                  <SelectorButton
                                    selected={tv.size === "56+"}
                                    onClick={() =>
                                      setFormState((current) => ({
                                        ...current,
                                        tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, size: "56+" } : item)),
                                      }))
                                    }
                                  >
                                    56"+
                                  </SelectorButton>
                                </div>
                              </section>

                              <section className="space-y-3">
                                <p className="text-sm font-semibold text-slate-900">Where is this TV going?</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <SelectorButton
                                    selected={tv.location === "standard"}
                                    onClick={() =>
                                      setFormState((current) => ({
                                        ...current,
                                        tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, location: "standard" } : item)),
                                      }))
                                    }
                                  >
                                    Standard wall
                                  </SelectorButton>
                                  <SelectorButton
                                    selected={tv.location === "fireplace"}
                                    onClick={() =>
                                      setFormState((current) => ({
                                        ...current,
                                        tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, location: "fireplace", outletDistance: null } : item)),
                                      }))
                                    }
                                  >
                                    Above fireplace
                                  </SelectorButton>
                                </div>
                                {tv.location === "fireplace" ? (
                                  <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Fireplace setup note</AlertTitle>
                                    <AlertDescription>
                                      Fireplace mounts start at {formatPrice(pricingData.tvMounting.fireplace.price)}. Wire concealment above fireplaces requires a photo assessment - we&apos;ll confirm pricing after booking.
                                    </AlertDescription>
                                  </Alert>
                                ) : null}
                              </section>

                              <section className="space-y-3">
                                <p className="text-sm font-semibold text-slate-900">Wall type</p>
                                <div className="grid gap-3 md:grid-cols-3">
                                  {(["drywall", "brick", "highrise"] as WallType[]).map((wallType) => (
                                    <SelectorButton
                                      key={wallType}
                                      selected={tv.wallType === wallType}
                                      onClick={() =>
                                        setFormState((current) => ({
                                          ...current,
                                          tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, wallType } : item)),
                                        }))
                                      }
                                    >
                                      {wallTypeLabels[wallType]}
                                    </SelectorButton>
                                  ))}
                                </div>
                              </section>

                              <section className="space-y-3">
                                <p className="text-sm font-semibold text-slate-900">Do you have a mount?</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <SelectorButton
                                    selected={tv.hasMount}
                                    onClick={() =>
                                      setFormState((current) => ({
                                        ...current,
                                        tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, hasMount: true, mountType: null } : item)),
                                      }))
                                    }
                                  >
                                    I have a mount
                                  </SelectorButton>
                                  <SelectorButton
                                    selected={!tv.hasMount}
                                    onClick={() =>
                                      setFormState((current) => ({
                                        ...current,
                                        tvs: current.tvs.map((item) =>
                                          item.id === tv.id ? { ...item, hasMount: false, mountType: item.mountType ?? "fixed" } : item,
                                        ),
                                      }))
                                    }
                                  >
                                    I need a mount
                                  </SelectorButton>
                                </div>
                                {!tv.hasMount ? (
                                  <div className="grid gap-3 md:grid-cols-3">
                                    {(["fixed", "tilting", "fullMotion"] as MountType[]).map((mountType) => (
                                      <SelectorButton
                                        key={mountType}
                                        selected={tv.mountType === mountType}
                                        onClick={() =>
                                          setFormState((current) => ({
                                            ...current,
                                            tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, mountType } : item)),
                                          }))
                                        }
                                        className="min-h-[84px] text-left"
                                      >
                                        <div>{mountTypeLabels[mountType]}</div>
                                        <div className="mt-1 text-xs font-medium opacity-80">
                                          {mountType === "fixed" ? "Most affordable, doesn't move" : mountType === "tilting" ? "Angle up/down" : "Swings out and rotates"}
                                        </div>
                                        <div className="mt-2 text-sm font-bold">{getMountPriceLabel(tv.size, mountType)}</div>
                                      </SelectorButton>
                                    ))}
                                  </div>
                                ) : null}
                              </section>

                              <section className="space-y-3">
                                <p className="text-sm font-semibold text-slate-900">Wire concealment for this TV?</p>
                                {tv.location === "fireplace" ? (
                                  <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Assessment required</AlertTitle>
                                    <AlertDescription>
                                      Wire concealment above fireplace requires assessment. We&apos;ll quote after photos.
                                    </AlertDescription>
                                  </Alert>
                                ) : null}
                                <div className="grid grid-cols-2 gap-3">
                                  <SelectorButton
                                    selected={!tv.wireConcealment}
                                    onClick={() =>
                                      setFormState((current) => ({
                                        ...current,
                                        tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, wireConcealment: false, outletDistance: null } : item)),
                                      }))
                                    }
                                  >
                                    No thanks
                                  </SelectorButton>
                                  <SelectorButton
                                    selected={tv.wireConcealment}
                                    onClick={() =>
                                      setFormState((current) => ({
                                        ...current,
                                        tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, wireConcealment: true } : item)),
                                      }))
                                    }
                                  >
                                    Yes - hide my wires (+{formatPrice(pricingData.wireConcealment.standard.price)})
                                  </SelectorButton>
                                </div>
                                {tv.wireConcealment && tv.location !== "fireplace" ? (
                                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                                    <div>
                                      <p className="text-sm font-semibold text-slate-900">Is the existing outlet within 1-2 feet of where you want the TV mounted?</p>
                                      <p className="mt-1 text-sm text-slate-500">This helps us confirm whether the standard concealment price is the right fit.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <SelectorButton
                                        selected={tv.outletDistance === "near"}
                                        onClick={() =>
                                          setFormState((current) => ({
                                            ...current,
                                            tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, outletDistance: "near" } : item)),
                                          }))
                                        }
                                      >
                                        Yes, it&apos;s close
                                      </SelectorButton>
                                      <SelectorButton
                                        selected={tv.outletDistance === "far"}
                                        onClick={() =>
                                          setFormState((current) => ({
                                            ...current,
                                            tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, outletDistance: "far" } : item)),
                                          }))
                                        }
                                      >
                                        No, it&apos;s farther away
                                      </SelectorButton>
                                    </div>
                                    {tv.outletDistance === "near" ? (
                                      <p className="text-sm text-green-700">Perfect. We&apos;ll treat this as a standard concealment setup for the estimate.</p>
                                    ) : tv.outletDistance === "far" ? (
                                      <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Extra outlet work may be needed</AlertTitle>
                                        <AlertDescription>
                                          If the outlet is farther than 1-2 feet from the TV location, we may need to confirm extra work before final pricing.
                                        </AlertDescription>
                                      </Alert>
                                    ) : (
                                      <p className="text-sm text-slate-500">If you&apos;re not sure yet, we&apos;ll assume a nearby outlet for this estimate and confirm anything unusual before booking.</p>
                                    )}
                                  </div>
                                ) : null}
                              </section>

                              <section className="space-y-3">
                                <p className="text-sm font-semibold text-slate-900">Anything else for this TV?</p>
                                <SelectorButton
                                  selected={tv.unmounting}
                                  onClick={() =>
                                    setFormState((current) => ({
                                      ...current,
                                      tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, unmounting: !item.unmounting } : item)),
                                    }))
                                  }
                                  className="w-full text-left"
                                >
                                  Remove/unmount existing TV first (+{formatPrice(pricingData.tvMounting.unmount.price)})
                                </SelectorButton>
                              </section>
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                      </Tabs>
                    </section>
                  ) : (
                    <section className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 md:p-6">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900">2. Standalone services</h4>
                        <p className="text-sm text-slate-500">No TV mounting? No problem. Add your services below.</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <h5 className="text-sm font-bold text-slate-900">{pricingData.otherServices.tvUnmounting.name}</h5>
                          <p className="mt-1 text-sm text-slate-500">{pricingData.otherServices.tvUnmounting.description}</p>
                          <p className="mt-2 text-sm font-semibold text-blue-600">{formatPrice(pricingData.otherServices.tvUnmounting.price)} each</p>
                          <div className="mt-3 grid grid-cols-5 gap-2">
                            {[0, 1, 2, 3, 4].map((count) => (
                              <SelectorButton key={count} selected={standaloneServices.removalCount === count} onClick={() => setStandaloneServices((current) => ({ ...current, removalCount: count }))}>
                                {count}
                              </SelectorButton>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <h5 className="text-sm font-bold text-slate-900">{pricingData.otherServices.avTroubleshooting.name}</h5>
                          <p className="mt-1 text-sm text-slate-500">{pricingData.otherServices.avTroubleshooting.description}</p>
                          <p className="mt-2 text-sm font-semibold text-blue-600">{formatPrice(pricingData.otherServices.avTroubleshooting.minimum ?? pricingData.otherServices.avTroubleshooting.price)} first hour, {formatPrice(pricingData.otherServices.avTroubleshooting.halfHourRate ?? 0)} each additional 30 min</p>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {[
                              { minutes: 60, label: `1 hr (${formatPrice(calculateTroubleshootingTotal(60))})` },
                              { minutes: 90, label: `1.5 hr (${formatPrice(calculateTroubleshootingTotal(90))})` },
                              { minutes: 120, label: `2 hr (${formatPrice(calculateTroubleshootingTotal(120))})` },
                              { minutes: 150, label: `2.5 hr (${formatPrice(calculateTroubleshootingTotal(150))})` },
                            ].map((option) => (
                              <SelectorButton key={option.minutes} selected={standaloneServices.troubleshootingMinutes === option.minutes} onClick={() => setStandaloneServices((current) => ({ ...current, troubleshootingMinutes: option.minutes }))}>
                                {option.label}
                              </SelectorButton>
                            ))}
                          </div>
                          <p className="mt-3 text-sm text-slate-500">Minimum 1 hour for troubleshooting visits.</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <h5 className="text-sm font-bold text-slate-900">{pricingData.otherServices.wireManagementOnly.name}</h5>
                          <p className="mt-1 text-sm text-slate-500">{pricingData.otherServices.wireManagementOnly.description}</p>
                          <p className="mt-2 text-sm font-semibold text-blue-600">{formatPrice(pricingData.otherServices.wireManagementOnly.price)} first location, +{formatPrice(pricingData.otherServices.wireManagementOnly.additionalLocationPrice)} each additional</p>
                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {[0, 1, 2, 3].map((count) => (
                              <SelectorButton key={count} selected={standaloneServices.wireManagementLocations === count} onClick={() => setStandaloneServices((current) => ({ ...current, wireManagementLocations: count }))}>
                                {count === 0 ? "No thanks" : `${count} ${count === 1 ? "location" : "locations"}`}
                              </SelectorButton>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <h5 className="text-sm font-bold text-slate-900">{pricingData.otherServices.deviceSetup.name}</h5>
                          <p className="mt-1 text-sm text-slate-500">{pricingData.otherServices.deviceSetup.description}</p>
                          <p className="mt-2 text-sm font-semibold text-blue-600">{formatPrice(pricingData.otherServices.deviceSetup.price)} flat</p>
                          <div className="mt-3">
                            <ToggleCard
                              title="Add device setup service"
                              active={standaloneServices.deviceSetup}
                              onClick={() => setStandaloneServices((current) => ({ ...current, deviceSetup: !current.deviceSetup }))}
                            />
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-5 md:p-6">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">3. Shared add-ons</h4>
                      <p className="text-sm text-slate-500">Add the extras that apply to the whole job.</p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-900">Security cameras</p>
                      <div className="grid grid-cols-3 gap-2 md:grid-cols-9">
                        {Array.from({ length: 9 }, (_, index) => index).map((count) => (
                          <SelectorButton
                            key={count}
                            selected={formState.cameras.length === count}
                            onClick={() =>
                              setFormState((current) => ({
                                ...current,
                                cameras: updateCameraCount(current.cameras, count),
                              }))
                            }
                          >
                            {count}
                          </SelectorButton>
                        ))}
                      </div>
                      {formState.cameras.length > 0 ? (
                        <div className="space-y-3">
                          {formState.cameras.map((camera, index) => (
                            <div key={camera.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                              <select
                                aria-label={`Camera ${index + 1} brand`}
                                title={`Camera ${index + 1} brand`}
                                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                                value={camera.brand}
                                onChange={(event) =>
                                  setFormState((current) => ({
                                    ...current,
                                    cameras: current.cameras.map((item) =>
                                      item.id === camera.id ? { ...item, brand: event.target.value as CameraConfig["brand"] } : item,
                                    ),
                                  }))
                                }
                              >
                                <option value="ring">Ring</option>
                                <option value="blink">Blink</option>
                                <option value="google">Google Nest</option>
                                <option value="arlo">Arlo</option>
                                <option value="wyze">Wyze</option>
                                <option value="other">Other</option>
                              </select>
                              <select
                                aria-label={`Camera ${index + 1} connection type`}
                                title={`Camera ${index + 1} connection type`}
                                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                                value={camera.type}
                                onChange={(event) =>
                                  setFormState((current) => ({
                                    ...current,
                                    cameras: current.cameras.map((item) =>
                                      item.id === camera.id ? { ...item, type: event.target.value as CameraType } : item,
                                    ),
                                  }))
                                }
                              >
                                <option value="wireless_smart">Wireless smart</option>
                                <option value="wired_smart">Wired smart</option>
                                <option value="wired_dvr">Wired DVR/NVR</option>
                              </select>
                              <select
                                aria-label={`Camera ${index + 1} location`}
                                title={`Camera ${index + 1} location`}
                                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                                value={camera.location}
                                onChange={(event) =>
                                  setFormState((current) => ({
                                    ...current,
                                    cameras: current.cameras.map((item) =>
                                      item.id === camera.id ? { ...item, location: event.target.value as CameraConfig["location"] } : item,
                                    ),
                                  }))
                                }
                              >
                                <option value="indoor">Indoor</option>
                                <option value="outdoor">Outdoor</option>
                              </select>
                              <p className="md:col-span-3 text-xs text-slate-500">
                                Camera {index + 1} prices at {formatPrice(pricingData.smartHome.securityCamera.price)}. Wired DVR setups may require additional assessment.
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <ToggleCard
                        title={`Add smart doorbell install (+${formatPrice(pricingData.smartHome.doorbell.price)})`}
                        active={formState.doorbell}
                        onClick={() => setFormState((current) => ({ ...current, doorbell: !current.doorbell }))}
                      />
                      <ToggleCard
                        title={`Add soundbar setup (+${formatPrice(pricingData.soundSystem.soundbar.price)})`}
                        active={formState.soundbar}
                        onClick={() => setFormState((current) => ({ ...current, soundbar: !current.soundbar }))}
                      />
                      <ToggleCard
                        title={`Add surround sound installation (+${formatPrice(pricingData.soundSystem.surroundSound.price)})`}
                        active={formState.surroundSound}
                        onClick={() => setFormState((current) => ({ ...current, surroundSound: !current.surroundSound }))}
                      />
                      <ToggleCard
                        title={`Add smart floodlight (+${formatPrice(pricingData.smartHome.floodlight.price)})`}
                        active={formState.floodlight}
                        onClick={() => setFormState((current) => ({ ...current, floodlight: !current.floodlight }))}
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Unmount existing TV(s) before new install</p>
                      <p className="mt-1 text-sm text-slate-500">{formatPrice(pricingData.tvMounting.unmount.price)} each. Use this if you need extra removals outside the per-TV config above.</p>
                      <div className="mt-3 grid grid-cols-5 gap-2">
                        {[0, 1, 2, 3, 4].map((count) => (
                          <SelectorButton key={count} selected={standaloneServices.sharedUnmountCount === count} onClick={() => setStandaloneServices((current) => ({ ...current, sharedUnmountCount: count }))}>
                            {count}
                          </SelectorButton>
                        ))}
                      </div>
                    </div>

                    {formState.doorbell ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-900">Doorbell brand</p>
                        <select
                          aria-label="Doorbell brand"
                          title="Doorbell brand"
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                          value={formState.doorbellBrand}
                          onChange={(event) => setFormState((current) => ({ ...current, doorbellBrand: event.target.value }))}
                        >
                          <option value="Ring">Ring</option>
                          <option value="Nest">Nest</option>
                          <option value="Arlo">Arlo</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    ) : null}

                    {formState.floodlight ? (
                      <p className="text-xs text-slate-500">Requires existing outdoor wiring. No-wiring installs need assessment.</p>
                    ) : null}

                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <ToggleCard
                        title="I need some handyman work too"
                        active={formState.handymanMinutes > 0}
                        onClick={() =>
                          setFormState((current) => ({
                            ...current,
                            handymanMinutes: current.handymanMinutes > 0 ? 0 : 60,
                          }))
                        }
                      />
                      {formState.handymanMinutes > 0 ? (
                        <>
                          <div className="grid gap-3 md:grid-cols-4">
                            {[
                              { minutes: 30, label: "30 min ($50)" },
                              { minutes: 60, label: "1 hr ($100)" },
                              { minutes: 90, label: "1.5 hrs ($150)" },
                              { minutes: 120, label: "2 hrs ($200)" },
                            ].map((option) => (
                              <SelectorButton
                                key={option.minutes}
                                selected={formState.handymanMinutes === option.minutes}
                                onClick={() => setFormState((current) => ({ ...current, handymanMinutes: option.minutes }))}
                              >
                                {option.label}
                              </SelectorButton>
                            ))}
                          </div>
                          <Input
                            value={formState.notes}
                            onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
                            placeholder="What do you need? (shelves, mirrors, furniture assembly, etc.)"
                            className="h-12 rounded-xl bg-white"
                          />
                        </>
                      ) : null}
                    </div>
                  </section>

                  <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 md:p-6">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">4. ZIP code and notes</h4>
                      <p className="text-sm text-slate-500">We use your ZIP to estimate travel and confirm service coverage.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">Your ZIP code</label>
                      <Input
                        value={formState.zipCode}
                        maxLength={5}
                        inputMode="numeric"
                        placeholder="30318"
                        className="h-12 rounded-xl"
                        onBlur={() => {
                          setZipError(/^\d{5}$/.test(formState.zipCode) ? "" : "Please enter a valid 5-digit ZIP code.");
                        }}
                        onChange={(event) => {
                          const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 5);
                          setFormState((current) => ({ ...current, zipCode: digitsOnly }));
                          if (zipError) {
                            setZipError("");
                          }
                        }}
                      />
                      {zipError ? <p className="text-sm text-red-600">{zipError}</p> : null}
                      {travelContext ? (
                        travelContext.tier === "out_of_range" ? (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                            <div className="flex items-center gap-2 font-semibold">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span>Outside our standard area</span>
                            </div>
                            <p className="mt-1">We may still be able to help — call {businessPhone}</p>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "rounded-2xl border p-4 text-sm",
                              typeof travelContext.fee === "number" && travelContext.fee > 0
                                ? "border-amber-200 bg-amber-50 text-amber-900"
                                : "border-green-200 bg-green-50 text-green-900",
                            )}
                          >
                            <div className="flex items-center gap-2 font-semibold">
                              <CheckCircle2 className={cn("h-4 w-4 shrink-0", typeof travelContext.fee === "number" && travelContext.fee > 0 ? "text-amber-600" : "text-green-600")} />
                              <span>We serve {getAreaName(formState.zipCode)}</span>
                            </div>
                            <div className="mt-1.5 space-y-1">
                              {travelContext.fee === 0
                                ? <p>No travel fee — you&apos;re in our home zone (from {travelContext.origin} on {getTravelDayLabel(travelContext.dayType)})</p>
                                : <>
                                    <p>Travel fee: +${travelContext.fee} (from {travelContext.origin} on {getTravelDayLabel(travelContext.dayType)})</p>
                                    {travelContext.roundTripMiles !== null ? <p>Round-trip distance: approximately {travelContext.roundTripMiles} miles</p> : null}
                                  </>}
                              {travelContext.availabilityNote ? <p className="text-xs opacity-80">{travelContext.availabilityNote}</p> : null}
                            </div>
                          </div>
                        )
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-900">Anything else we should know?</label>
                      <Textarea
                        value={formState.notes}
                        onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
                        placeholder="e.g. 3rd floor apartment, parking situation, TV already unboxed, etc."
                        className="min-h-[140px] rounded-2xl bg-slate-50"
                      />
                    </div>
                  </section>

                  <div className="sticky bottom-0 z-20 -mx-6 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur md:-mx-8 md:px-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <motion.div
                        key={liveQuote.total}
                        initial={{ scale: 0.98, opacity: 0.85 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 220, damping: 18 }}
                      >
                        <p className="text-sm font-medium text-slate-500">Estimated total</p>
                        <p className="text-3xl font-extrabold text-slate-900">{formatPrice(liveQuote.total)}</p>
                      </motion.div>
                      <Button
                        className="h-14 rounded-2xl bg-blue-600 px-8 text-base font-bold text-white hover:bg-blue-500"
                        disabled={!isZipValid}
                        onClick={handleFormQuote}
                      >
                        Get My Quote
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="mt-6 space-y-4">
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-[-9999px] top-auto h-0 w-0 opacity-0"
                    value={honeypotValue}
                    onChange={(event) => setHoneypotValue(event.target.value)}
                  />
                  <Textarea
                    value={textInput}
                    onChange={(event) => {
                      const nextValue = event.target.value.slice(0, DESCRIBE_IT_MAX_CHARS);
                      setTextInput(nextValue);

                      if (!textZipCode && !textZipTouched) {
                        const detectedZip = extractZipFromDescription(nextValue);
                        if (detectedZip) {
                          setTextZipCode(detectedZip);
                          setTextZipAutoDetected(true);
                          setTextZipError("");
                        }
                      }
                    }}
                    placeholder="e.g. Two TVs: a 65-inch above a brick fireplace with a full motion mount, and a bedroom TV on drywall. Add a Ring doorbell and two outdoor Arlo cameras in 30075."
                    className="min-h-[240px] rounded-[28px] border-slate-200 bg-slate-50 px-4 py-4 text-base"
                  />
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">Keep it short and simple — just describe the job.</p>
                    <p className="text-sm text-slate-500">Example: 2 TVs, one over fireplace, hide wires in bedroom, I already have mounts</p>
                    <p className="text-sm text-slate-500">Example: Mount 1 TV on drywall, set up a soundbar, and the outlet is already close to the TV spot</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <label className="text-sm font-semibold text-slate-900">ZIP Code (for travel pricing)</label>
                    <span
                      className={cn(
                        "font-semibold transition-colors",
                        describeUsageRatio >= 1 ? "text-red-600" : describeUsageRatio >= 0.9 ? "text-amber-600" : describeUsageRatio >= 0.75 ? "text-slate-700" : "text-slate-500",
                      )}
                    >
                      {describeCharacterCount} / {DESCRIBE_IT_MAX_CHARS}
                    </span>
                  </div>
                  <Input
                    value={textZipCode}
                    maxLength={5}
                    inputMode="numeric"
                    placeholder="30318"
                    className="h-12 rounded-xl"
                    onBlur={() => {
                      if (!textZipCode || isValidFiveDigitZip(textZipCode)) {
                        setTextZipError("");
                        return;
                      }

                      setTextZipError("Please enter a valid 5-digit ZIP code.");
                    }}
                    onChange={(event) => {
                      const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 5);
                      setTextZipTouched(true);
                      setTextZipAutoDetected(false);
                      setTextZipCode(digitsOnly);
                      if (textZipError) {
                        setTextZipError("");
                      }
                    }}
                  />
                  {textZipAutoDetected && textZipCode ? <p className="text-xs text-slate-500">ZIP code detected from description.</p> : null}
                  {textZipError ? <p className="text-sm text-red-600">{textZipError}</p> : null}
                  {textTravelContext ? (
                    textTravelContext.tier === "out_of_range" ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <div className="flex items-center gap-2 font-semibold">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>Outside our standard area</span>
                        </div>
                        <p className="mt-2">We may still be able to help — call {businessPhone}</p>
                      </div>
                    ) : (
                      <div className={cn(
                        "rounded-2xl border p-4 text-sm",
                        typeof textTravelContext.fee === "number" && textTravelContext.fee > 0
                          ? "border-amber-200 bg-amber-50 text-amber-900"
                          : "border-green-200 bg-green-50 text-green-900",
                      )}>
                        <div className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className={cn("h-4 w-4 shrink-0", typeof textTravelContext.fee === "number" && textTravelContext.fee > 0 ? "text-amber-600" : "text-green-600")} />
                          <span>We serve {getAreaName(textZipCode)}</span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm">
                          {textTravelContext.fee === 0
                            ? <p>No travel fee — you&apos;re in our home zone</p>
                            : (
                                <>
                                  <p>Travel fee: +${textTravelContext.fee} (from {textTravelContext.origin} on {getTravelDayLabel(textTravelContext.dayType)})</p>
                                  {textTravelContext.roundTripMiles !== null ? <p>Round-trip distance: approximately {textTravelContext.roundTripMiles} miles</p> : null}
                                </>
                              )}
                          {textTravelContext.availabilityNote ? <p className="text-xs opacity-80">{textTravelContext.availabilityNote}</p> : null}
                        </div>
                      </div>
                    )
                  ) : null}
                  {turnstileRequired ? (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Quick verification</p>
                      <p className="mt-1 text-sm text-slate-500">This keeps bots from burning AI quote credits.</p>
                      <div ref={turnstileContainerRef} className="mt-3 min-h-[70px]" />
                      {turnstileError ? <p className="mt-2 text-sm text-red-600">{turnstileError}</p> : null}
                    </div>
                  ) : null}
                  {!aiQuoteConfigLoaded ? <p className="mt-2 text-sm text-slate-500">Checking AI quote availability...</p> : null}
                  {aiQuoteConfigLoaded && !aiQuoteEnabled ? <p className="mt-2 text-sm text-amber-700">AI quote requests are temporarily unavailable. You can still use the local builder.</p> : null}
                  <Button
                    className="h-14 w-full rounded-2xl bg-blue-600 text-base font-bold text-white hover:bg-blue-500"
                    disabled={!cleanedTextInput || !aiQuoteEnabled}
                    onClick={handleDescribeItQuote}
                  >
                    Get My Quote
                  </Button>
                </TabsContent>

                <TabsContent value="voice" className="mt-6 space-y-5">
                  <input
                    type="text"
                    name="website-voice"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="pointer-events-none absolute left-[-9999px] top-auto h-0 w-0 opacity-0"
                    value={honeypotValue}
                    onChange={(event) => setHoneypotValue(event.target.value)}
                  />
                  <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-center">
                    <button
                      type="button"
                      aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
                      title={isRecording ? "Stop voice recording" : "Start voice recording"}
                      onClick={toggleRecording}
                      className={cn(
                        "mx-auto flex h-24 w-24 items-center justify-center rounded-full border-8 transition-all",
                        isRecording ? "animate-pulse border-blue-200 bg-blue-600 text-white shadow-xl shadow-blue-200" : "border-slate-200 bg-white text-slate-900 hover:border-blue-200 hover:text-blue-600",
                      )}
                    >
                      <Mic className="h-10 w-10" />
                    </button>
                    <p className="mt-4 text-sm font-semibold text-slate-900">{isRecording ? "Tap to stop" : "Tap to speak"}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {browserSupportsSpeechRecognition ? "Describe the rooms, wall types, mounts, ZIP code, and any extras." : "Voice input is unavailable in this browser."}
                    </p>
                  </div>

                  {browserSupportsSpeechRecognition && (microphonePermission === "prompt" || microphonePermission === "unknown") ? (
                    <Alert className="border-blue-200 bg-blue-50 text-blue-900">
                      <Mic className="h-4 w-4" />
                      <AlertTitle>Microphone access helps us capture your voice note</AlertTitle>
                      <AlertDescription>
                        Tap the mic and your browser should ask for permission. We only use it to turn your spoken request into a quote.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  {microphonePermission === "denied" ? (
                    <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Microphone access is blocked</AlertTitle>
                      <AlertDescription>
                        Allow microphone access in your browser settings, then refresh or try again. If you&apos;d rather keep moving, Describe It works great too.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  {voiceError ? (
                    <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Voice note unavailable</AlertTitle>
                      <AlertDescription className="space-y-3">
                        <p>{voiceError}</p>
                        <Button type="button" variant="outline" className="h-10 rounded-xl border-amber-300 bg-white text-amber-900 hover:bg-amber-100" onClick={() => setMode("text")}>
                          Use Describe It instead
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  {voiceTranscript ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Transcript</p>
                      <p className="text-sm leading-6 text-slate-700">{voiceTranscript}</p>
                    </div>
                  ) : null}

                  {turnstileRequired ? (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Quick verification</p>
                      <p className="mt-1 text-sm text-slate-500">One quick check before we use AI for this request.</p>
                      <div ref={turnstileContainerRef} className="mt-3 min-h-[70px]" />
                      {turnstileError ? <p className="mt-2 text-sm text-red-600">{turnstileError}</p> : null}
                    </div>
                  ) : null}
                  {!aiQuoteConfigLoaded ? <p className="mt-2 text-sm text-slate-500">Checking AI quote availability...</p> : null}
                  {aiQuoteConfigLoaded && !aiQuoteEnabled ? <p className="mt-2 text-sm text-amber-700">AI quote requests are temporarily unavailable. You can still use the local builder.</p> : null}

                  <Button
                    className="h-14 w-full rounded-2xl bg-blue-600 text-base font-bold text-white hover:bg-blue-500"
                    disabled={!voiceTranscript.trim() || !aiQuoteEnabled}
                    onClick={() => handleNarrativeQuote(voiceTranscript.trim())}
                  >
                    Get My Quote
                  </Button>
                </TabsContent>
              </Tabs>
            </motion.div>
          ) : null}

          {step === "loading" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col items-center justify-center px-6 py-20 text-center md:px-8"
            >
              <div className="rounded-full bg-blue-50 p-5 text-blue-600">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
              <h4 className="mt-6 text-2xl font-bold text-slate-900">Building your quote...</h4>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                We&apos;re organizing the line items, checking your setup notes, and writing the summary.
              </p>
            </motion.div>
          ) : null}

          {step === "review" && quote ? (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6 p-6 md:p-8"
            >
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Review Your Quote</p>
                <h4 className="text-3xl font-extrabold text-slate-900">Make sure everything looks right</h4>
                <p className="text-base leading-7 text-slate-700">{quote.summary}</p>
              </div>

              {describeOutletFollowUpNeeded ? (
                <div className="rounded-[28px] border border-blue-200 bg-blue-50 p-5 shadow-sm">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Quick Clarification</p>
                    <h5 className="text-lg font-bold text-slate-900">{OUTLET_DISTANCE_QUESTION}</h5>
                    <p className="text-sm text-slate-600">This only applies to the standard wire-concealment part of your quote, not the fireplace portion.</p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                      { value: "not_sure", label: "Not sure" },
                    ].map((option) => (
                      <SelectorButton
                        key={option.value}
                        selected={describeOutletAnswer === option.value}
                        onClick={() => {
                          setDescribeOutletAnswer(option.value as OutletDistanceAnswer);
                          setError("");
                        }}
                      >
                        {option.label}
                      </SelectorButton>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {describeOutletAnswer === "yes"
                      ? "Great — we’ll keep the standard concealment path."
                      : describeOutletAnswer === "no"
                        ? "Thanks — we’ll keep the current estimate and clearly note that extra work may be needed."
                        : describeOutletAnswer === "not_sure"
                          ? "No problem — we’ll keep the estimate and note that a quick confirmation may be needed."
                          : "A quick answer helps us present the cleanest review and set expectations clearly."}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[28px] bg-slate-900 p-5 text-white shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Final Price</p>
                  <p className="mt-3 text-4xl font-extrabold">{formatPrice(quote.total)}</p>
                  <p className="mt-2 text-sm text-slate-300">Most installs take 30–90 minutes.</p>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Travel Fee</p>
                  <p className="mt-3 text-2xl font-extrabold text-slate-900">
                    {quote.travelFee === "out_of_range" ? "Custom quote" : formatPrice(typeof quote.travelFee === "number" ? quote.travelFee : 0)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {quote.travelFee === "out_of_range" ? "Outside the standard service area." : quote.travelFee === 0 ? "No travel fee for this ZIP." : `${quote.travelContext.origin} origin on ${getTravelDayLabel(quote.travelContext.dayType)}.`}
                  </p>
                </div>
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Promo</p>
                  <p className="mt-3 text-2xl font-extrabold text-slate-900">{promoCodeInput ? promoCodeInput : "None"}</p>
                  <p className="mt-2 text-sm text-slate-500">{promoCodeInput ? "Promo will be verified before final payment." : "No promo applied right now."}</p>
                </div>
              </div>

              {reviewFlags.length > 0 ? reviewFlags.map((flag) => (
                <Alert key={flag} className="border-amber-200 bg-amber-50 text-amber-900">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Heads up</AlertTitle>
                  <AlertDescription>{flag}</AlertDescription>
                </Alert>
              )) : null}

              {reviewNeedsPhotoHelper ? (
                <p className="text-sm text-slate-500">
                  Photos help us confirm pricing faster for fireplace, brick, or custom concealment jobs.
                </p>
              ) : null}

              {formState.notes.trim() ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Your notes</p>
                  <p className="mt-2 leading-6">{formState.notes}</p>
                </div>
              ) : null}

              <div className="space-y-4">
                {reviewGroups.map((group) => (
                  <div key={group.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <h4 className="text-lg font-bold text-slate-900">{group.title}</h4>
                      {group.subtitle ? <p className="text-sm text-slate-500">{group.subtitle}</p> : null}
                    </div>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div key={`${group.title}-${item.name}-${item.lineTotal}`} className="flex items-start justify-between gap-4 text-sm">
                          <div className="text-slate-700">{item.qty && item.qty > 1 ? `${item.qty}x ${item.name}` : item.name}</div>
                          <div className={cn("shrink-0 font-semibold", item.lineTotal < 0 ? "text-green-700" : "text-slate-900")}>
                            {item.lineTotal < 0 ? "-" : ""}
                            {formatPrice(Math.abs(item.lineTotal))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-bold">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="text-slate-900">{formatPrice(group.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

                <div className="rounded-[28px] bg-slate-900 p-5 text-white">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Subtotal</span>
                    <span>{formatPrice(quote.subtotal)}</span>
                  </div>
                {quote.discount > 0 ? (
                  <div className="mt-2 flex items-center justify-between text-sm text-green-300">
                    <span>{reviewDiscountLabel}</span>
                    <span>-{formatPrice(quote.discount)}</span>
                  </div>
                ) : null}
                {quote.travelFee !== "out_of_range" && quote.travelFee > 0 ? (
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-200">
                    <span>Travel fee</span>
                    <span>+{formatPrice(quote.travelFee)}</span>
                  </div>
                ) : null}
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xl font-extrabold">
                  <span>TOTAL</span>
                  <span>{formatPrice(quote.total)}</span>
                </div>
              </div>

              {quote.followUp && quote.followUp !== OUTLET_DISTANCE_QUESTION ? (
                <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>One thing to confirm</AlertTitle>
                  <AlertDescription>{quote.followUp}</AlertDescription>
                </Alert>
              ) : null}

              {seasonalTheme.promoCode ? (
                <div className="rounded-3xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                  Promo available this season: <strong>{seasonalTheme.promoCode}</strong>. We&apos;ll verify it during booking rather than auto-applying it here.
                </div>
              ) : null}

              <p className="text-xs font-medium text-slate-500">
                Final pricing may vary for complex installs. We confirm anything unusual before work begins.
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                <Button className="h-14 rounded-2xl bg-blue-600 text-base font-bold text-white hover:bg-blue-500 disabled:opacity-60" disabled={describeOutletFollowUpNeeded && !describeOutletAnswer} onClick={handleReviewApproval}>
                  Looks Good <ArrowRight className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" className="h-14 rounded-2xl" onClick={handleEditQuote}>
                  Edit Quote
                </Button>
              </div>
            </motion.div>
          ) : null}

          {step === "contact" && quote ? (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6 p-6 md:p-8"
            >
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Contact Info</p>
                  <h4 className="text-3xl font-extrabold text-slate-900">How should we follow up?</h4>
                  <p className="text-sm text-slate-500">Add your contact details, then choose whether to schedule now or get a follow-up first.</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Contact details</p>
                    <p className="text-xs text-slate-500">We only use this to hold your quote and follow up.</p>
                  </div>
                  <Input
                    value={quoteRequest.name}
                    onChange={(event) => setQuoteRequest((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                    className="h-12 rounded-xl"
                  />
                  <Input
                    value={quoteRequest.phone}
                    onChange={(event) => setQuoteRequest((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Phone number"
                    inputMode="tel"
                    className="h-12 rounded-xl"
                  />
                  <Input
                    value={quoteRequest.email}
                    onChange={(event) => setQuoteRequest((current) => ({ ...current, email: event.target.value }))}
                    placeholder="Email (optional)"
                    inputMode="email"
                    className="h-12 rounded-xl"
                  />
                  {quoteRequestError ? <p className="text-sm text-red-600">{quoteRequestError}</p> : null}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p>Most installs take 30–90 minutes.</p>
                    <p className="mt-2">Final pricing may vary for complex installs, unusual walls, or custom cable paths.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] bg-slate-900 p-5 text-white shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Estimated Total</p>
                    <p className="mt-3 text-4xl font-extrabold">{formatPrice(quote.total)}</p>
                    <p className="mt-2 text-sm text-slate-300">Travel: {quote.travelFee === "out_of_range" ? "Custom quote" : formatPrice(typeof quote.travelFee === "number" ? quote.travelFee : 0)}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Choose your next step</p>
                    <button
                      type="button"
                      onClick={handleScheduleNow}
                      className="w-full rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-bold text-slate-900">Schedule Now</p>
                          <p className="text-sm text-slate-500">Save this quote and move to the booking calendar.</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={quoteRequestStatus === "submitting"}
                      onClick={() => handleFollowUpRequest("send_quote")}
                      className="w-full rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md disabled:opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-bold text-slate-900">Send Me This Quote</p>
                          <p className="text-sm text-slate-500">We&apos;ll send the quote details and follow up.</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={quoteRequestStatus === "submitting"}
                      onClick={() => handleFollowUpRequest("text_confirm")}
                      className="w-full rounded-[28px] border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md disabled:opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-bold text-slate-900">Text Me To Confirm</p>
                          <p className="text-sm text-slate-500">We&apos;ll follow up by text before you book.</p>
                        </div>
                      </div>
                    </button>

                    {quoteRequestStatus === "submitting" ? (
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                        <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving your next step...</span>
                      </div>
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-2">
                      <Button type="button" variant="outline" className="h-12 rounded-2xl" onClick={() => setStep("review")}>
                        Back to Review
                      </Button>
                      <Button type="button" variant="ghost" className="h-12 rounded-2xl" onClick={handleEditQuote}>
                        Edit Quote
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}

          {step === "booking" && quote ? (
            <motion.div
              key="booking"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6 p-6 md:p-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600"
                >
                  <CheckCircle2 className="h-8 w-8" />
                </motion.div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Next Step</p>
                  <h4 className="text-3xl font-extrabold text-slate-900">
                    {nextStepIntent === "schedule" ? "Ready to schedule" : nextStepIntent === "send_quote" ? "Your quote request is in" : "We&apos;ll text you to confirm"}
                  </h4>
                  <p className="text-base text-slate-600">
                    {nextStepIntent === "schedule"
                      ? "Your quote is saved. Continue to booking whenever you&apos;re ready."
                      : nextStepIntent === "send_quote"
                        ? "We&apos;ll use your contact info to follow up with this quote shortly."
                        : "Expect a text follow-up soon so we can confirm the details with you."}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                    <p className="text-sm font-semibold text-slate-900">Quote total</p>
                    <p className="text-xs text-slate-500">Held under {quoteRequest.name || "your"} quote request</p>
                    </div>
                  <p className="text-3xl font-extrabold text-slate-900">{formatPrice(quote.total)}</p>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <p>Phone: {quoteRequest.phone || businessPhone}</p>
                  {quoteRequest.email ? <p className="mt-1">Email: {quoteRequest.email}</p> : null}
                </div>
              </div>

              <div className="space-y-3">
                {nextStepIntent === "schedule" ? (
                  <Button className="h-14 w-full rounded-2xl bg-blue-600 text-base font-bold text-white hover:bg-blue-500" onClick={() => setLocation("/booking")}>
                    Continue to Scheduling <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                    We have your details and will follow up using the contact info you entered.
                  </div>
                )}

                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <a href={telHref} className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-bold text-slate-900">Call to book</p>
                      <p className="text-sm text-slate-500">{businessPhone}</p>
                    </div>
                  </a>
                  <div className="mt-4 flex items-center gap-3">
                    <Button type="button" variant="outline" className="h-11 rounded-2xl" onClick={copyPhoneNumber}>
                      <Copy className="mr-2 h-4 w-4" />
                      {copyStatus === "copied" ? "Copied" : "Copy number"}
                    </Button>
                    <a href={mailtoHref} className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email quote
                      </span>
                    </a>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Button type="button" variant="outline" className="h-12 rounded-2xl" onClick={() => setStep("contact")}>
                    Back
                  </Button>
                  <Button type="button" variant="ghost" className="h-12 rounded-2xl" onClick={resetTool}>
                    Start over
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function ToggleCard({
  title,
  active,
  onClick,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition-all",
        active ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-600",
      )}
    >
      {title}
    </button>
  );
}
