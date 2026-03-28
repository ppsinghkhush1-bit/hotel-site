import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, Users, Bed, Wifi, Coffee, Tv, Wind, Mail, 
  Phone, User, CheckCircle2, AlertCircle, ArrowRight, 
  ShieldCheck, Loader2, Star, Info, ChevronRight, CreditCard,
  MapPin, Share2, Heart, ShieldAlert, Clock, Sparkles, Utensils,
  Maximize, Car, Waves, Zap, Box, Bookmark, History, Layout
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- Types based on your Supabase Screenshot ---
interface RoomData {
  id: string | number;
  name: string; // Isko hum room_type se match karenge
  image: string;
  description: string;
  basePrice: number; // Mapping to price_per_night
  maxGuests: number; // Mapping to max_occupancy
}

interface BookingModalProps {
  isOpen?: boolean;
  onClose: () => void;
  room: RoomData;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export default function BookingModal({
  isOpen = true,
  onClose,
  room,
  checkIn = '',
  checkOut = '',
  guests: initialGuests = 2
}: BookingModalProps) {
  // --- States ---
  const [bookingCheckIn, setBookingCheckIn] = useState(checkIn || '');
  const [bookingCheckOut, setBookingCheckOut] = useState(checkOut || '');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'amenities' | 'reviews'>('details');

  const today = new Date().toISOString().split('T')[0];

  // --- Stay Calculations ---
  const nights = useMemo(() => {
    if (!bookingCheckIn || !bookingCheckOut) return 0;
    const start = new Date(bookingCheckIn);
    const end = new Date(bookingCheckOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [bookingCheckIn, bookingCheckOut]);

  const taxAmt = useMemo(() => (room.basePrice * 0.12), [room.basePrice]);
  const grandTotal = useMemo(() => (room.basePrice + taxAmt) * (nights || 1), [room.basePrice, taxAmt, nights]);

  // --- THE BULLETPROOF SYNC LOGIC ---
  const handleConfirmBooking = async () => {
    if (!bookingCheckIn || !bookingCheckOut || nights <= 0) {
      setSubmitError("Date Selection Error: Stay must be at least 1 night.");
      return;
    }
    if (!customerName || !customerEmail) {
      setSubmitError("Guest Identity Error: Name and Email are mandatory.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // 1. Resolve UUID using the 'room_type' column from your screenshot
      console.log("Searching for room in 'rooms' table where room_type =", room.name);
      
      const { data: dbRooms, error: lookupError } = await supabase
        .from('rooms')
        .select('id, room_type')
        .ilike('room_type', room.name.trim())
        .limit(1);

      if (lookupError) throw lookupError;

      let resolvedId;
      if (!dbRooms || dbRooms.length === 0) {
        console.warn("Exact match not found. Picking first available UUID from table.");
        const { data: fallback } = await supabase.from('rooms').select('id').limit(1);
        if (!fallback || fallback.length === 0) throw new Error("Rooms table is empty!");
        resolvedId = fallback[0].id;
      } else {
        resolvedId = dbRooms[0].id;
      }

      // 2. Insert into bookings
      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          room_id: resolvedId, // UUID correctly mapped
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9',
          guest_name: customerName,
          guest_email: customerEmail,
          guest_phone: customerPhone,
          check_in: bookingCheckIn,
          check_out: bookingCheckOut,
          num_guests: initialGuests,
          total_price: grandTotal,
          status: 'pending',
          special_requests: specialRequests
        });

      if (insertError) throw insertError;

      setSubmitSuccess(true);

    } catch (err: any) {
      console.error("Critical Failure:", err);
      setSubmitError(err.message || "Database Connection Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- Success UI ---
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-6">
        <div className="bg-white max-w-xl w-full rounded-[4rem] overflow-hidden shadow-2xl animate-in zoom-in duration-500">
          <div className="bg-emerald-600 p-20 text-center text-white relative">
            <Sparkles className="absolute top-10 right-10 opacity-30 animate-pulse" />
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/40">
              <CheckCircle2 size={50} />
            </div>
            <h2 className="text-5xl font-serif mb-3 tracking-tight">Confirmed!</h2>
            <p className="opacity-80 text-xl font-light italic">Experience luxury at {room.name}</p>
          </div>
          <div className="p-12 space-y-6">
             <div className="flex justify-between items-center bg-neutral-50 p-6 rounded-3xl border border-neutral-100">
                <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">Total Invoice</span>
                <span className="text-3xl font-black italic">₹{grandTotal.toLocaleString()}</span>
             </div>
             <button onClick={onClose} className="w-full bg-neutral-950 text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-emerald-600 transition-all active:scale-95 shadow-2xl">
               DISMISS PORTAL
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[90] overflow-y-auto font-sans">
      {/* Premium Navbar */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-2xl border-b z-50 px-10 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-black rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl rotate-3">
            <Zap size={28} className="fill-emerald-500 text-emerald-500" />
          </div>
          <div>
            <span className="font-black text-3xl tracking-tighter uppercase italic block leading-none">HG <span className="text-emerald-600">LUXE</span></span>
            <p className="text-[9px] font-black text-neutral-400 tracking-[0.3em] uppercase mt-1 flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> Encryption Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button className="hidden md:flex p-4 hover:bg-neutral-100 rounded-full transition-all"><Share2 size={20}/></button>
           <button onClick={onClose} className="p-4 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-full transition-all group">
             <X size={28} className="group-hover:rotate-90 transition-transform" />
           </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16 pb-40">
        
        {/* Left Column */}
        <div className="lg:col-span-7 p-6 lg:p-12 space-y-12">
          <div className="relative group rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-neutral-50">
            <img src={room.image} className="w-full h-[550px] object-cover transform transition-transform duration-[4000ms] group-hover:scale-110" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-12 left-12">
               <div className="flex gap-1 text-emerald-400 mb-4">
                  {[...Array(5)].map((_,i) => <Star key={i} size={18} fill="currentColor" />)}
               </div>
               <h1 className="text-7xl font-serif text-white tracking-tighter mb-2">{room.name}</h1>
               <p className="text-emerald-400 font-black tracking-[0.4em] uppercase text-xs">Verified Luxury Wing</p>
            </div>
          </div>

          <div className="flex gap-12 border-b border-neutral-100 overflow-x-auto pb-6 scrollbar-hide">
            {['details', 'amenities', 'reviews'].map(t => (
              <button key={t} onClick={() => setActiveTab(t as any)} className={`uppercase text-xs font-black tracking-[0.4em] transition-all relative ${activeTab === t ? 'text-emerald-600' : 'text-neutral-400 hover:text-neutral-950'}`}>
                {t}
                {activeTab === t && <div className="absolute -bottom-6 left-0 right-0 h-1.5 bg-emerald-600 rounded-full" />}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="p-10 bg-neutral-50 rounded-[3rem] text-center border border-neutral-100 hover:bg-white hover:shadow-2xl transition-all group">
                <Bed className="mx-auto text-emerald-600 mb-4 group-hover:-translate-y-2 transition-transform" size={32} />
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Master Bed</p>
             </div>
             <div className="p-10 bg-neutral-50 rounded-[3rem] text-center border border-neutral-100 hover:bg-white hover:shadow-2xl transition-all group">
                <Users className="mx-auto text-emerald-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{room.maxGuests} Guests</p>
             </div>
             <div className="p-10 bg-neutral-50 rounded-[3rem] text-center border border-neutral-100 hover:bg-white hover:shadow-2xl transition-all group">
                <Wind className="mx-auto text-emerald-600 mb-4 group-hover:rotate-45 transition-transform" size={32} />
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">AC Elite</p>
             </div>
             <div className="p-10 bg-neutral-50 rounded-[3rem] text-center border border-neutral-100 hover:bg-white hover:shadow-2xl transition-all group">
                <Waves className="mx-auto text-emerald-600 mb-4 group-hover:animate-pulse" size={32} />
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Ocean View</p>
             </div>
          </div>

          <p className="text-neutral-400 text-3xl leading-relaxed font-light italic border-l-[12px] border-emerald-500 pl-12 py-4">
            "{room.description}"
          </p>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-5 p-6 lg:p-12">
          <div className="bg-neutral-900 rounded-[4rem] p-14 text-white shadow-[0_60px_120px_-20px_rgba(0,0,0,0.7)] sticky top-32 border border-neutral-800">
            <div className="mb-12 flex justify-between items-end">
               <div>
                  <p className="text-emerald-500 text-[10px] font-black tracking-[0.5em] uppercase mb-2">Member Rate</p>
                  <h3 className="text-6xl font-serif tracking-tighter italic">₹{room.basePrice.toLocaleString()}<span className="text-sm font-sans text-neutral-500 font-light ml-3">/ night</span></h3>
               </div>
               <div className="bg-emerald-600/10 p-3 px-5 rounded-full border border-emerald-500/20 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="text-[9px] font-black tracking-widest">ELITE SECURE</span>
               </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Check-In</label>
                  <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl py-5 px-6 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Check-Out</label>
                  <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl py-5 px-6 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div className="space-y-4">
                 <div className="relative group">
                    <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input type="text" placeholder="GUEST FULL NAME" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-800 border-none rounded-3xl pl-16 py-5 text-xs font-black tracking-widest focus:ring-2 focus:ring-emerald-500" />
                 </div>
                 <div className="relative group">
                    <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input type="email" placeholder="EMAIL ADDRESS" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-neutral-800 border-none rounded-3xl pl-16 py-5 text-xs font-black tracking-widest focus:ring-2 focus:ring-emerald-500" />
                 </div>
              </div>

              {nights > 0 && (
                <div className="bg-emerald-600 p-10 rounded-[3rem] shadow-2xl shadow-emerald-900/50 space-y-6 animate-in slide-in-from-bottom-8">
                  <div className="flex justify-between items-center text-emerald-100 text-xs font-black tracking-widest border-b border-emerald-500/50 pb-5">
                     <span>{nights} NIGHTS x ₹{room.basePrice.toLocaleString()}</span>
                     <span>₹{(room.basePrice * nights).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                     <div>
                        <p className="text-[10px] font-black uppercase text-white tracking-[0.5em] mb-1">Total Payable</p>
                        <p className="text-5xl font-black tracking-tighter italic">₹{grandTotal.toLocaleString()}</p>
                     </div>
                     <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30">
                        <CreditCard size={28} />
                     </div>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl flex items-center gap-4 text-red-400 text-xs animate-bounce">
                  <ShieldAlert size={24} className="shrink-0" />
                  <p className="font-black leading-tight uppercase tracking-widest">{submitError}</p>
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full group bg-white text-neutral-900 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-xs hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-4 active:scale-95 shadow-2xl"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <>INITIATE BOOKING <ChevronRight size={20}/></>}
              </button>
            </div>
            
            <div className="mt-14 flex flex-col items-center gap-6 opacity-20">
               <div className="flex gap-10">
                 <Layout size={20} /> <History size={20} /> <Bookmark size={20} />
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.8em]">Supabase Database v4.0 Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
