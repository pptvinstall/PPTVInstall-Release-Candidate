import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, Search, ShieldAlert, Trash2, Edit, TrendingUp, Users, Inbox, X, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const SECRET_CODE = "admin123";

export default function AdminBookings() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto bg-slate-700 p-3 rounded-full w-fit mb-4">
               <ShieldAlert className="h-8 w-8 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Admin Access</h2>
            <Input 
              type="password" 
              placeholder="Enter Access Code" 
              className="bg-slate-900 border-slate-600 text-white"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && passcode === SECRET_CODE && setIsAuthenticated(true)}
            />
            <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={() => {
              if (passcode === SECRET_CODE) setIsAuthenticated(true);
            }}>
              Unlock Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <DashboardContent />;
}

function DashboardContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/bookings");
      return res.json();
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, date, time }: { id: number, date: string, time: string }) => {
      await apiRequest("POST", `/api/admin/bookings/${id}/reschedule`, { date, time });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({ title: "Updated!", description: "Customer has been emailed." });
      setRescheduleBooking(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/admin/bookings/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({ title: "Cancelled", description: "Booking cancelled & email sent." });
    }
  });

  // SAFETY CHECK: Ensure we don't process null/undefined bookings
  const safeBookings = Array.isArray(bookings) ? bookings.filter(b => b && typeof b === 'object') : [];

  const filteredBookings = safeBookings.filter((b: any) => 
    (b.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (b.email || "").toLowerCase().includes(search.toLowerCase())
  ).sort((a: any, b: any) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  const totalRevenue = filteredBookings.filter((b: any) => b.status !== 'cancelled').reduce((acc: number, b: any) => acc + (parseInt(b.pricingTotal) || 0), 0);
  const activeJobs = filteredBookings.filter((b: any) => b.status !== 'cancelled').length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 relative">
       <div className="max-w-6xl mx-auto space-y-8">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
             <h1 className="text-3xl font-bold text-slate-900">Booking Command Center</h1>
             <p className="text-slate-500">Manage schedule, revenue, and customer alerts.</p>
           </div>
           <div className="flex gap-2">
             <Card className="p-4 flex items-center gap-3 border-blue-100 bg-blue-50">
               <div className="p-2 bg-blue-100 rounded-full text-blue-600"><TrendingUp className="h-5 w-5"/></div>
               <div>
                 <div className="text-xs text-slate-500 font-bold uppercase">Est. Revenue</div>
                 <div className="text-lg font-black text-slate-900">${totalRevenue}</div>
               </div>
             </Card>
             <Card className="p-4 flex items-center gap-3 border-slate-200">
               <div className="p-2 bg-slate-100 rounded-full text-slate-600"><Users className="h-5 w-5"/></div>
               <div>
                 <div className="text-xs text-slate-500 font-bold uppercase">Active Jobs</div>
                 <div className="text-lg font-black text-slate-900">{activeJobs}</div>
               </div>
             </Card>
           </div>
         </div>

         <div className="relative">
           <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
           <Input 
             placeholder="Search name or email..." 
             className="pl-9 bg-white shadow-sm border-slate-200" 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
         </div>

         {filteredBookings.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
             <div className="bg-slate-50 p-4 rounded-full w-fit mx-auto mb-4">
               <Inbox className="h-10 w-10 text-slate-400" />
             </div>
             <h3 className="text-lg font-bold text-slate-900">No bookings found</h3>
             <p className="text-slate-500 max-w-sm mx-auto mt-2">
               {search ? "Try adjusting your search terms." : "New appointments will appear here once customers book a slot."}
             </p>
           </div>
         ) : (
           <div className="grid gap-4">
             {filteredBookings.map((booking: any) => {
               // SAFETY CHECK: If booking ID is missing, skip rendering this card
               if (!booking || !booking.id) return null;

               return (
                 <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-all border-slate-200">
                   <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                     <div className="space-y-2">
                       <div className="flex items-center gap-3">
                         <span className="font-bold text-lg text-slate-900">{booking.name}</span>
                         {booking.status === 'cancelled' 
                            ? <Badge variant="destructive">Cancelled</Badge> 
                            : <Badge className="bg-green-600 hover:bg-green-600">Active</Badge>}
                         <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">${booking.pricingTotal}</span>
                       </div>
                       <div className="text-sm text-slate-500 flex flex-wrap gap-4">
                         <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4 text-blue-500"/> {booking.preferredDate}</span>
                         <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-blue-500"/> {booking.appointmentTime}</span>
                       </div>
                       <div className="text-xs text-slate-400 font-medium">
                         {booking.serviceType} • {booking.streetAddress}, {booking.city}
                       </div>
                     </div>

                     {booking.status !== 'cancelled' && (
                       <div className="flex gap-2 w-full md:w-auto">
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="flex-1 md:flex-none border-blue-200 text-blue-700 hover:bg-blue-50"
                           onClick={() => setRescheduleBooking(booking)}
                         >
                           <Edit className="h-4 w-4 mr-2"/> Move
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="sm"
                           className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                           onClick={() => {
                             if(confirm("Are you sure? This will email the customer.")) cancelMutation.mutate(booking.id);
                           }}
                         >
                           <Trash2 className="h-4 w-4 mr-2"/> Cancel
                         </Button>
                       </div>
                     )}
                   </div>
                 </Card>
               );
             })}
           </div>
         )}
       </div>

       {rescheduleBooking && (
         <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 relative">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
               <h3 className="font-bold text-lg text-slate-900">Reschedule Appointment</h3>
               <button onClick={() => setRescheduleBooking(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                 <X className="h-5 w-5" />
               </button>
             </div>
             <div className="p-6">
               <RescheduleForm booking={rescheduleBooking} onSubmit={(data: any) => rescheduleMutation.mutate(data)} />
             </div>
           </div>
         </div>
       )}
    </div>
  );
}

function RescheduleForm({ booking, onSubmit }: any) {
  const [date, setDate] = useState<Date | undefined>(() => {
    if (!booking?.preferredDate) return new Date();
    return new Date(booking.preferredDate + 'T12:00:00');
  });
  
  const [time, setTime] = useState(booking?.appointmentTime || "8:00 AM");

  return (
    <div className="space-y-6">
       <div className="border rounded-lg p-2 flex justify-center bg-white shadow-sm">
         <Calendar 
            mode="single" 
            selected={date} 
            onSelect={setDate}
            disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
            className="rounded-md"
         />
       </div>
       <div className="space-y-2">
         <label className="text-sm font-bold text-slate-700">Select New Time</label>
         <div className="relative">
           <select 
             value={time} 
             onChange={(e) => setTime(e.target.value)}
             className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none cursor-pointer font-medium text-slate-700"
           >
              {["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "5:30 PM", "6:30 PM", "8:30 PM"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
           </select>
           <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
         </div>
       </div>
       <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 h-12 text-lg shadow-lg" onClick={() => {
         if(date && time && booking?.id) onSubmit({ id: booking.id, date: format(date, 'yyyy-MM-dd'), time });
       }}>
         Confirm New Time
       </Button>
    </div>
  )
}