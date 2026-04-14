import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { Details } from "@/pages/booking/shared";

type Props = {
  details: Details;
  errors: Partial<Record<keyof Details, string>>;
  setDetails: React.Dispatch<React.SetStateAction<Details>>;
  onBack: () => void;
  onContinue: () => void;
};

export default function BookingDetailsStep({ details, errors, setDetails, onBack, onContinue }: Props) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" className="pl-0" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Back to date and time</Button>
      <Card className="rounded-[28px] p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900">Your details</h1>
          <p className="text-slate-500">We use this to confirm your appointment and know where to go.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[{ key: "firstName", label: "First name" }, { key: "lastName", label: "Last name" }, { key: "phone", label: "Phone number" }, { key: "email", label: "Email" }].map((field) => (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <Input value={details[field.key as keyof Details] as string} onChange={(event) => setDetails((current) => ({ ...current, [field.key]: event.target.value }))} className="h-12 rounded-xl" />
              {errors[field.key as keyof Details] ? <p className="text-sm text-red-600">{errors[field.key as keyof Details]}</p> : null}
            </div>
          ))}
          <div className="space-y-2 md:col-span-2">
            <Label>Service address street</Label>
            <Input value={details.streetAddress} onChange={(event) => setDetails((current) => ({ ...current, streetAddress: event.target.value }))} className="h-12 rounded-xl" />
            {errors.streetAddress ? <p className="text-sm text-red-600">{errors.streetAddress}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={details.city} onChange={(event) => setDetails((current) => ({ ...current, city: event.target.value }))} className="h-12 rounded-xl" />
            {errors.city ? <p className="text-sm text-red-600">{errors.city}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Zip code</Label>
            <Input value={details.zipCode} maxLength={5} inputMode="numeric" onChange={(event) => setDetails((current) => ({ ...current, zipCode: event.target.value.replace(/\D/g, "").slice(0, 5) }))} className="h-12 rounded-xl" />
            {errors.zipCode ? <p className="text-sm text-red-600">{errors.zipCode}</p> : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Special instructions / notes</Label>
            <Textarea value={details.notes} onChange={(event) => setDetails((current) => ({ ...current, notes: event.target.value }))} placeholder="Parking info, floor number, gate code, TV already unboxed, etc." className="min-h-[140px] rounded-2xl" />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button className="h-12 rounded-2xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-500" onClick={onContinue}>Continue</Button>
        </div>
      </Card>
    </div>
  );
}
