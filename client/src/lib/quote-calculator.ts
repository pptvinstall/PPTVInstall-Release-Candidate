import { pricingData } from "@/data/pricing-data";
import { getTravelContext, type TravelTier } from "@/lib/travel-pricing";

export type MountType = "fixed" | "tilting" | "fullMotion";
export type WallType = "drywall" | "brick" | "highrise";
export type CameraType = "wireless_smart" | "wired_smart" | "wired_dvr";

export type TVConfig = {
  id: string;
  size: "32-55" | "56+";
  wallType: WallType;
  location: "standard" | "fireplace";
  hasMount: boolean;
  mountType: MountType | null;
  wireConcealment: boolean;
  unmounting: boolean;
};

export type CameraConfig = {
  id: string;
  brand: "ring" | "blink" | "google" | "arlo" | "wyze" | "other";
  type: CameraType;
  location: "indoor" | "outdoor";
};

export type QuoteFormState = {
  tvs: TVConfig[];
  cameras: CameraConfig[];
  doorbell: boolean;
  doorbellBrand: string;
  soundbar: boolean;
  surroundSound: boolean;
  floodlight: boolean;
  handymanMinutes: number;
  zipCode: string;
  notes: string;
};

export type QuoteLineItem = {
  name: string;
  price: number;
  qty?: number;
  lineTotal: number;
  isDiscount?: boolean;
};

export type QuoteGroup = {
  title: string;
  subtitle?: string;
  items: QuoteLineItem[];
  subtotal: number;
};

export type QuoteResult = {
  groups: QuoteGroup[];
  subtotal: number;
  discount: number;
  total: number;
  flags: string[];
  followUp?: string;
  travelTier: TravelTier;
  travelFee: number | "out_of_range";
  travelContext: ReturnType<typeof getTravelContext>;
};

const cameraBrandLabels: Record<CameraConfig["brand"], string> = {
  ring: "Ring",
  blink: "Blink",
  google: "Google Nest",
  arlo: "Arlo",
  wyze: "Wyze",
  other: "Other",
};

function getMountPrice(size: TVConfig["size"], mountType: MountType): number {
  const isLarge = size === "56+";

  if (mountType === "fixed") {
    return isLarge ? pricingData.tvMounts.fixedBig.price : pricingData.tvMounts.fixedSmall.price;
  }

  if (mountType === "tilting") {
    return isLarge ? pricingData.tvMounts.tiltingBig.price : pricingData.tvMounts.tiltingSmall.price;
  }

  return isLarge ? pricingData.tvMounts.fullMotionBig.price : pricingData.tvMounts.fullMotionSmall.price;
}

function getMountLabel(size: TVConfig["size"], mountType: MountType): string {
  const isLarge = size === "56+";

  if (mountType === "fixed") {
    return isLarge ? pricingData.tvMounts.fixedBig.name : pricingData.tvMounts.fixedSmall.name;
  }

  if (mountType === "tilting") {
    return isLarge ? pricingData.tvMounts.tiltingBig.name : pricingData.tvMounts.tiltingSmall.name;
  }

  return isLarge ? pricingData.tvMounts.fullMotionBig.name : pricingData.tvMounts.fullMotionSmall.name;
}

function getTvSubtitle(tv: TVConfig): string {
  const locationLabel = tv.location === "fireplace" ? "Above fireplace" : "Standard wall";
  const wallLabel =
    tv.wallType === "brick"
      ? "Brick"
      : tv.wallType === "highrise"
        ? "High-rise / Steel Stud"
        : "Drywall";
  const mountLabel = tv.hasMount
    ? "Customer mount"
    : tv.mountType === "fullMotion"
      ? "Full Motion mount"
      : tv.mountType === "tilting"
        ? "Tilting mount"
        : "Fixed mount";

  return `${locationLabel}, ${wallLabel}, ${mountLabel}`;
}

export function createDefaultTVConfig(): TVConfig {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `tv-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    size: "56+",
    wallType: "drywall",
    location: "standard",
    hasMount: true,
    mountType: null,
    wireConcealment: false,
    unmounting: false,
  };
}

export function createDefaultCameraConfig(): CameraConfig {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `camera-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    brand: "ring",
    type: "wireless_smart",
    location: "outdoor",
  };
}

export function createDefaultQuoteFormState(): QuoteFormState {
  return {
    tvs: [createDefaultTVConfig()],
    cameras: [],
    doorbell: false,
    doorbellBrand: "Ring",
    soundbar: false,
    surroundSound: false,
    floodlight: false,
    handymanMinutes: 0,
    zipCode: "",
    notes: "",
  };
}

export function getCameraSummary(cameras: CameraConfig[]): string {
  if (!cameras.length) {
    return "No cameras included";
  }

  return cameras
    .map((camera, index) => `${cameraBrandLabels[camera.brand]} ${index + 1} (${camera.type.replace(/_/g, " ")}, ${camera.location})`)
    .join("; ");
}

export function calculateTroubleshootingTotal(minutes: number): number {
  if (minutes <= 0) {
    return 0;
  }

  const basePrice = pricingData.otherServices.avTroubleshooting.minimum ?? pricingData.otherServices.avTroubleshooting.price;
  if (minutes <= 60) {
    return basePrice;
  }

  const additionalHalfHours = Math.ceil((minutes - 60) / 30);
  return basePrice + additionalHalfHours * (pricingData.otherServices.avTroubleshooting.halfHourRate ?? 0);
}

export function calculateQuote(state: QuoteFormState): QuoteResult {
  const groups: QuoteGroup[] = [];
  const flags = new Set<string>();
  const travelContext =
    state.zipCode.length === 5
      ? getTravelContext(state.zipCode)
      : {
          fee: 0,
          tier: 0 as TravelTier,
          dayType: "weekday" as const,
          origin: "Midtown Atlanta (Georgia Tech)",
          availabilityNote: null,
          feeLabel: "No travel fee",
          oneWayMiles: null,
          roundTripMiles: null,
        };
  const travelFee = travelContext.fee;
  const travelTier = travelContext.tier;

  let positiveSubtotal = 0;
  let pricedWireJobs = 0;
  let additionalTvDiscountUnits = 0;

  state.tvs.forEach((tv, index) => {
    const items: QuoteLineItem[] = [];
    const isAdditionalTv = index > 0;

    const baseMountPrice =
      tv.location === "fireplace"
        ? pricingData.tvMounting.fireplace.price
        : pricingData.tvMounting.standard.price;

    items.push({
      name:
        tv.location === "fireplace"
          ? pricingData.tvMounting.fireplace.name
          : pricingData.tvMounting.standard.name,
      price: baseMountPrice,
      qty: 1,
      lineTotal: baseMountPrice,
    });
    positiveSubtotal += baseMountPrice;

    if (tv.wallType === "brick" && tv.location !== "fireplace") {
      items.push({
        name: pricingData.tvMounting.nonDrywall.name,
        price: pricingData.tvMounting.nonDrywall.price,
        qty: 1,
        lineTotal: pricingData.tvMounting.nonDrywall.price,
      });
      positiveSubtotal += pricingData.tvMounting.nonDrywall.price;
    }

    if (tv.wallType === "highrise") {
      items.push({
        name: pricingData.tvMounting.highRise.name,
        price: pricingData.tvMounting.highRise.price,
        qty: 1,
        lineTotal: pricingData.tvMounting.highRise.price,
      });
      positiveSubtotal += pricingData.tvMounting.highRise.price;
    }

    if (!tv.hasMount && tv.mountType) {
      const mountPrice = getMountPrice(tv.size, tv.mountType);
      items.push({
        name: getMountLabel(tv.size, tv.mountType),
        price: mountPrice,
        qty: 1,
        lineTotal: mountPrice,
      });
      positiveSubtotal += mountPrice;
    }

    if (tv.wireConcealment) {
      if (tv.location === "fireplace") {
        items.push({
          name: "Wire concealment assessment required",
          price: 0,
          qty: 1,
          lineTotal: 0,
        });
        flags.add("Wire concealment above fireplaces requires photos before we can confirm pricing.");
      } else {
        pricedWireJobs += 1;
        items.push({
          name: pricingData.wireConcealment.standard.name,
          price: pricingData.wireConcealment.standard.price,
          qty: 1,
          lineTotal: pricingData.wireConcealment.standard.price,
        });
        positiveSubtotal += pricingData.wireConcealment.standard.price;

      }
    }

    if (tv.unmounting) {
      items.push({
        name: pricingData.tvMounting.unmount.name,
        price: pricingData.tvMounting.unmount.price,
        qty: 1,
        lineTotal: pricingData.tvMounting.unmount.price,
      });
      positiveSubtotal += pricingData.tvMounting.unmount.price;
    }

    if (isAdditionalTv) {
      additionalTvDiscountUnits += 1;
    }

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    groups.push({
      title: `TV ${index + 1}`,
      subtitle: getTvSubtitle(tv),
      items,
      subtotal,
    });
  });

  const sharedItems: QuoteLineItem[] = [];

  if (state.cameras.length > 0) {
    const cameraTotal = state.cameras.length * pricingData.smartHome.securityCamera.price;
    const brandSummary = Array.from(new Set(state.cameras.map((camera) => cameraBrandLabels[camera.brand]))).join(", ");

    sharedItems.push({
      name:
        brandSummary.length > 0
          ? `${brandSummary} security camera installation`
          : pricingData.smartHome.securityCamera.name,
      price: pricingData.smartHome.securityCamera.price,
      qty: state.cameras.length,
      lineTotal: cameraTotal,
    });
    positiveSubtotal += cameraTotal;

    if (state.cameras.some((camera) => camera.type === "wired_dvr")) {
      flags.add("Wired DVR/NVR systems vary significantly in complexity. We'll confirm final pricing after reviewing your setup.");
    }
  }

  if (state.doorbell) {
    const label = state.doorbellBrand
      ? `${state.doorbellBrand} doorbell installation`
      : pricingData.smartHome.doorbell.name;

    sharedItems.push({
      name: label,
      price: pricingData.smartHome.doorbell.price,
      qty: 1,
      lineTotal: pricingData.smartHome.doorbell.price,
    });
    positiveSubtotal += pricingData.smartHome.doorbell.price;
  }

  if (state.soundbar) {
    sharedItems.push({
      name: pricingData.soundSystem.soundbar.name,
      price: pricingData.soundSystem.soundbar.price,
      qty: 1,
      lineTotal: pricingData.soundSystem.soundbar.price,
    });
    positiveSubtotal += pricingData.soundSystem.soundbar.price;
  }

  if (state.surroundSound) {
    sharedItems.push({
      name: pricingData.soundSystem.surroundSound.name,
      price: pricingData.soundSystem.surroundSound.price,
      qty: 1,
      lineTotal: pricingData.soundSystem.surroundSound.price,
    });
    positiveSubtotal += pricingData.soundSystem.surroundSound.price;
  }

  if (state.floodlight) {
    sharedItems.push({
      name: pricingData.smartHome.floodlight.name,
      price: pricingData.smartHome.floodlight.price,
      qty: 1,
      lineTotal: pricingData.smartHome.floodlight.price,
    });
    positiveSubtotal += pricingData.smartHome.floodlight.price;
    flags.add("Floodlight install requires existing outdoor wiring. If no wiring exists, we'll need to assess before confirming price.");
  }

  if (state.handymanMinutes > 0) {
    const handymanRatePerHalfHour = pricingData.customServices.handyman.halfHourRate ?? 50;
    const handymanTotal = (state.handymanMinutes / 30) * handymanRatePerHalfHour;
    sharedItems.push({
      name: `Handyman work estimate (${state.handymanMinutes} min)`,
      price: handymanTotal,
      qty: 1,
      lineTotal: handymanTotal,
    });
    positiveSubtotal += handymanTotal;
  }

  if (travelFee !== "out_of_range" && travelFee > 0) {
    sharedItems.push({
      name: `Travel fee (${state.zipCode}, ${travelContext.dayType} ${travelContext.dayType === "weekday" ? "evening" : "hours"})`,
      price: travelFee,
      qty: 1,
      lineTotal: travelFee,
    });
    positiveSubtotal += travelFee;
  }

  if (travelFee === "out_of_range") {
    flags.add("We don't regularly serve this ZIP code, but we may still be able to accommodate. Call us to confirm availability.");
  }

  if (state.tvs.length >= 5) {
    flags.add("Large multi-room projects may qualify for a custom bundle rate. We'll discuss that at booking.");
  }

  if (sharedItems.length > 0) {
    groups.push({
      title: "Shared Services",
      items: sharedItems,
      subtotal: sharedItems.reduce((sum, item) => sum + item.lineTotal, 0),
    });
  }

  const bundleDiscount =
    state.tvs.length > 1
      ? (additionalTvDiscountUnits * pricingData.discounts.multipleTvs.amount) +
        (Math.max(0, pricedWireJobs - 1) * pricingData.discounts.multipleOutlets.amount)
      : 0;

  return {
    groups,
    subtotal: positiveSubtotal,
    discount: bundleDiscount,
    total: Math.max(0, positiveSubtotal - bundleDiscount),
    flags: Array.from(flags),
    travelTier,
    travelFee,
    travelContext,
  };
}
