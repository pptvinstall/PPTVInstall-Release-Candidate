import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mic,
  ShieldAlert,
} from "lucide-react";

import { formatPrice, pricingData } from "@/data/pricing-data";
import {
  calculateTroubleshootingTotal,
  type CameraConfig,
  type CameraType,
  type MountType,
  type WallType,
} from "@/lib/quote-calculator";
import { getAreaName, getTravelDayLabel } from "@/lib/travel-pricing";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  DESCRIBE_IT_MAX_CHARS,
  getMountPriceLabel,
  mountTypeLabels,
  tvAccentClasses,
  tvDotClass,
  updateCameraCount,
  updateTvCount,
  wallTypeLabels,
  extractZipFromDescription,
  isValidFiveDigitZip,
} from "@/components/ui/quote-tool/shared";
import { SelectorButton, ToggleCard } from "@/components/ui/quote-tool/QuoteComponents";
import { useQuoteContext, businessPhone } from "@/components/ui/quote-tool/useQuoteState";

export default function QuoteStepForm() {
  const {
    mode,
    setMode,
    formState,
    setFormState,
    tvCountLabel,
    setTvCountLabel,
    activeTvId,
    setActiveTvId,
    standaloneServices,
    setStandaloneServices,
    zipError,
    setZipError,
    textInput,
    setTextInput,
    textZipCode,
    setTextZipCode,
    textZipError,
    setTextZipError,
    textZipTouched,
    setTextZipTouched,
    textZipAutoDetected,
    setTextZipAutoDetected,
    textTravelContext,
    travelContext,
    honeypotValue,
    setHoneypotValue,
    isRecording,
    browserSupportsSpeechRecognition,
    microphonePermission,
    voiceError,
    voiceTranscript,
    turnstileRequired,
    turnstileError,
    turnstileContainerRef,
    aiQuoteConfigLoaded,
    aiQuoteEnabled,
    liveQuote,
    isZipValid,
    describeUsageRatio,
    describeCharacterCount,
    cleanedTextInput,
    handleFormQuote,
    handleDescribeItQuote,
    handleNarrativeQuote,
    toggleRecording,
    step,
  } = useQuoteContext();

  return (
    <AnimatePresence mode="wait">
      {step === "build" ? (
        <motion.div
          key="build"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-6 p-6 md:p-8"
        >
          <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)} className="w-full">
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

            {/* ── Build It (form) ─────────────────────────────────────────── */}
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
                                  onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, size: "32-55" } : item)) }))}
                                >
                                  32"-55"
                                </SelectorButton>
                                <SelectorButton
                                  selected={tv.size === "56+"}
                                  onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, size: "56+" } : item)) }))}
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
                                  onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, location: "standard" } : item)) }))}
                                >
                                  Standard wall
                                </SelectorButton>
                                <SelectorButton
                                  selected={tv.location === "fireplace"}
                                  onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, location: "fireplace", outletDistance: null } : item)) }))}
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
                                    onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, wallType } : item)) }))}
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
                                  onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, hasMount: true, mountType: null } : item)) }))}
                                >
                                  I have a mount
                                </SelectorButton>
                                <SelectorButton
                                  selected={!tv.hasMount}
                                  onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => item.id === tv.id ? { ...item, hasMount: false, mountType: item.mountType ?? "fixed" } : item) }))}
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
                                      onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, mountType } : item)) }))}
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
                                  onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, wireConcealment: false, outletDistance: null } : item)) }))}
                                >
                                  No thanks
                                </SelectorButton>
                                <SelectorButton
                                  selected={tv.wireConcealment}
                                  onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, wireConcealment: true } : item)) }))}
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
                                      onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, outletDistance: "near" } : item)) }))}
                                    >
                                      Yes, it&apos;s close
                                    </SelectorButton>
                                    <SelectorButton
                                      selected={tv.outletDistance === "far"}
                                      onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, outletDistance: "far" } : item)) }))}
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
                                onClick={() => setFormState((current) => ({ ...current, tvs: current.tvs.map((item) => (item.id === tv.id ? { ...item, unmounting: !item.unmounting } : item)) }))}
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
                        onClick={() => setFormState((current) => ({ ...current, cameras: updateCameraCount(current.cameras, count) }))}
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
                            onChange={(event) => setFormState((current) => ({ ...current, cameras: current.cameras.map((item) => item.id === camera.id ? { ...item, brand: event.target.value as CameraConfig["brand"] } : item) }))}
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
                            onChange={(event) => setFormState((current) => ({ ...current, cameras: current.cameras.map((item) => item.id === camera.id ? { ...item, type: event.target.value as CameraType } : item) }))}
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
                            onChange={(event) => setFormState((current) => ({ ...current, cameras: current.cameras.map((item) => item.id === camera.id ? { ...item, location: event.target.value as CameraConfig["location"] } : item) }))}
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
                    onClick={() => setFormState((current) => ({ ...current, handymanMinutes: current.handymanMinutes > 0 ? 0 : 60 }))}
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
                    onBlur={() => { setZipError(/^\d{5}$/.test(formState.zipCode) ? "" : "Please enter a valid 5-digit ZIP code."); }}
                    onChange={(event) => {
                      const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 5);
                      setFormState((current) => ({ ...current, zipCode: digitsOnly }));
                      if (zipError) setZipError("");
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
                      <div className={cn("rounded-2xl border p-4 text-sm", typeof travelContext.fee === "number" && travelContext.fee > 0 ? "border-amber-200 bg-amber-50 text-amber-900" : "border-green-200 bg-green-50 text-green-900")}>
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

            {/* ── Describe It (text) ──────────────────────────────────────── */}
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
                <span className={cn("font-semibold transition-colors", describeUsageRatio >= 1 ? "text-red-600" : describeUsageRatio >= 0.9 ? "text-amber-600" : describeUsageRatio >= 0.75 ? "text-slate-700" : "text-slate-500")}>
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
                  if (!textZipCode || isValidFiveDigitZip(textZipCode)) { setTextZipError(""); return; }
                  setTextZipError("Please enter a valid 5-digit ZIP code.");
                }}
                onChange={(event) => {
                  const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 5);
                  setTextZipTouched(true);
                  setTextZipAutoDetected(false);
                  setTextZipCode(digitsOnly);
                  if (textZipError) setTextZipError("");
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
                  <div className={cn("rounded-2xl border p-4 text-sm", typeof textTravelContext.fee === "number" && textTravelContext.fee > 0 ? "border-amber-200 bg-amber-50 text-amber-900" : "border-green-200 bg-green-50 text-green-900")}>
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 className={cn("h-4 w-4 shrink-0", typeof textTravelContext.fee === "number" && textTravelContext.fee > 0 ? "text-amber-600" : "text-green-600")} />
                      <span>We serve {getAreaName(textZipCode)}</span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      {textTravelContext.fee === 0
                        ? <p>No travel fee — you&apos;re in our home zone</p>
                        : <>
                            <p>Travel fee: +${textTravelContext.fee} (from {textTravelContext.origin} on {getTravelDayLabel(textTravelContext.dayType)})</p>
                            {textTravelContext.roundTripMiles !== null ? <p>Round-trip distance: approximately {textTravelContext.roundTripMiles} miles</p> : null}
                          </>}
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

            {/* ── Voice Note ──────────────────────────────────────────────── */}
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
    </AnimatePresence>
  );
}
