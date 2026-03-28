import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, Users, Bed, Wifi, Coffee, Tv, Wind, Mail, 
  Phone, User, CheckCircle2, AlertCircle, ArrowRight, 
  ShieldCheck, Loader2, Star, Info, ChevronRight, CreditCard,
  MapPin, Share2, Heart, ShieldAlert, Clock, Sparkles, Utensils,
  Maximize, Car, Waves, Zap, Box
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- Types ---
interface RoomData {
  id: string | number;
  name: string;
  image: string;
  description: string;
  basePrice: number;
  maxGuests: number;
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
  // --- Form & UI States ---
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

  useEffect(() => {
    if (checkIn) setBookingCheckIn(checkIn);
    if (checkOut) setBookingCheckOut(checkOut);
  }, [checkIn, checkOut]);

  const today = new Date().toISOString().split('T')[0];

  // --- Calculations ---
  const nights = useMemo(() => {
    if (!bookingCheckIn || !bookingCheckOut) return 0;
    const start = new Date(bookingCheckIn);
    const end = new Date(bookingCheckOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [bookingCheckIn, bookingCheckOut]);

  const taxRate = 0.12; // 12% Luxury Tax
  const subTotal = (Number(room.basePrice) || 0) * (nights || 1);
  const taxPrice = subTotal * taxRate;
  const grandTotal = subTotal + taxPrice;

  // --- REAL CODER MODE: DYNAMIC ID RESOLVER ---
  const handleConfirmBooking = async () => {
    if (!bookingCheckIn || !bookingCheckOut || nights <= 0) {
      setSubmitError("Dates Missing: Arrival and Departure are required.");
      return;
    }
    if (!customerName.trim() || !customerEmail.includes('@')) {
      setSubmitError("Guest Info Missing: Name and valid Email are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      let finalRoomId = room.id;

      // Agar ID "1" hai ya numeric hai, toh asli UUID dhoondo
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(room.id));

      if (!isUuid) {
        console.log("Resolving Room ID for name:", room.name);
        
        // Step 1: Find the actual room row from DB
        const { data: dbRooms, error: lookupError } = await supabase
          .from('rooms')
          .select('id')
          .filter('name', 'ilike', `%${room.name.trim()}%`)
          .limit(1);

        if (lookupError || !dbRooms || dbRooms.length === 0) {
          throw new Error(`Room ID Error: Could not find room "${room.name}" in database. Check if the name matches exactly.`);
        }
        
        finalRoomId = dbRooms[0].id;
        console.log("Successfully resolved ID to:", finalRoomId);
      }

      // Step 2: Insert into bookings
      const { error: dbError } = await supabase
        .from('bookings')
        .insert({
          room_id: finalRoomId, 
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

      if (dbError) {
        if (dbError.code === '23503') {
          throw new Error("Foreign Key Violation: The Hotel ID or Room ID doesn't exist in the database. Contact admin.");
        }
        throw dbError;
      }
      
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("Booking Logic Failed:", err);
      setSubmitError(err.message || "Engine Error: Connection lost.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- SUCCESS OVERLAY ---
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full rounded-[4rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-700">
          <div className="bg-emerald-600 p-16 text-center text-white relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/40">
              <CheckCircle2 size={50} />
            </div>
            <h2 className="text-4xl font-serif mb-2">Reserved!</h2>
            <p className="opacity-80 font-light">Booking for {room.name} confirmed.</p>
          </div>
          <div className="p-10 space-y-6">
             <div className="flex justify-between border-b pb-4 text-sm font-bold uppercase tracking-widest text-neutral-400">
                <span>Total Paid</span>
                <span className="text-emerald-600 font-black italic">₹{grandTotal.toLocaleString()}</span>
             </div>
             <button onClick={onClose} className="w-full bg-neutral-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-emerald-500 transition-all">CLOSE PORTAL</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[90] overflow-y-auto font-sans selection:bg-emerald-100">
      {/* Header */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-xl border-b z-50 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-neutral-200">
            <Zap size={24} className="fill-emerald-500 text-emerald-500" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tight uppercase italic leading-none">LUXE <span className="text-emerald-600">HG</span></span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-black tracking-[0.2em] text-neutral-400 uppercase">Live Reservation Engine</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button className="hidden md:flex p-3 hover:bg-neutral-100 rounded-full transition-all"><Share2 size={20}/></button>
           <button onClick={onClose} className="p-3 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-full transition-all">
             <X size={24} />
           </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16 pb-32">
        
        {/* Left Section */}
        <div className="lg:col-span-7 p-6 lg:p-12 space-y-12">
          <div className="relative group overflow-hidden rounded-[3rem] shadow-2xl border-8 border-neutral-50 bg-neutral-100">
            <img src={room.image} className="w-full h-[500px] object-cover transition-transform duration-[3000ms] group-hover:scale-110" alt={room.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-12 left-12">
               <h1 className="text-6xl font-serif text-white tracking-tight">{room.name}</h1>
               <div className="flex gap-1 text-emerald-400 mt-4">
                  {[...Array(5)].map((_,i) => <Star key={i} size={16} fill="currentColor" />)}
               </div>
            </div>
          </div>

          <div className="flex gap-10 border-b">
            {['details', 'amenities', 'reviews'].map((t) => (
              <button key={t} onClick={() => setActiveTab(t as any)} className={`pb-6 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === t ? 'text-emerald-600' : 'text-neutral-400'}`}>
                {t}
                {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full" />}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             <div className="p-8 bg-neutral-50 rounded-[2.5rem] text-center border border-neutral-100 transition-all hover:bg-white hover:shadow-xl group">
                <Bed className="mx-auto text-emerald-600 mb-4 group-hover:rotate-12 transition-transform" />
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">King Suite</p>
             </div>
             <div className="p-8 bg-neutral-50 rounded-[2.5rem] text-center border border-neutral-100 transition-all hover:bg-white hover:shadow-xl group">
                <Users className="mx-auto text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{room.maxGuests} Guests</p>
             </div>
             <div className="p-8 bg-neutral-50 rounded-[2.5rem] text-center border border-neutral-100 transition-all hover:bg-white hover:shadow-xl group">
                <Maximize className="mx-auto text-emerald-600 mb-4 group-hover:rotate-90 transition-transform" />
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Premium</p>
             </div>
             <div className="p-8 bg-neutral-50 rounded-[2.5rem] text-center border border-neutral-100 transition-all hover:bg-white hover:shadow-xl group">
                <Waves className="mx-auto text-emerald-600 mb-4 group-hover:animate-pulse" />
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Luxury View</p>
             </div>
          </div>

          <p className="text-neutral-500 text-2xl leading-relaxed font-light italic border-l-8 border-emerald-500 pl-10">
            "{room.description}"
          </p>
        </div>

        {/* Right Section: Booking Sidebar */}
        <div className="lg:col-span-5 p-6 lg:p-12">
          <div className="bg-neutral-900 rounded-[3.5rem] p-12 text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] sticky top-32 border border-neutral-800">
            <div className="mb-10 flex justify-between items-end">
               <div>
                  <p className="text-emerald-500 text-[10px] font-black tracking-[0.4em] uppercase mb-1 italic">Premium Offer</p>
                  <h3 className="text-4xl font-serif tracking-tight">₹{room.basePrice.toLocaleString()}<span className="text-sm font-sans text-neutral-500 font-light ml-2">/ night</span></h3>
               </div>
               <div className="flex items-center gap-2 bg-emerald-600/10 p-2 px-4 rounded-full border border-emerald-500/20">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black tracking-widest">BEST RATE</span>
               </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Arrival</label>
                  <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl py-4 px-5 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Departure</label>
                  <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl py-4 px-5 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              <div className="space-y-3">
                 <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-emerald-500" />
                 <input type="email" placeholder="Email Address" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-emerald-500" />
                 <input type="tel" placeholder="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-emerald-500" />
              </div>

              {nights > 0 && (
                <div className="bg-emerald-600 p-8 rounded-[3rem] shadow-2xl shadow-emerald-900/40 space-y-4 animate-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center text-emerald-100 text-xs font-bold border-b border-emerald-500/50 pb-4">
                     <span>{nights} Nights x ₹{room.basePrice.toLocaleString()}</span>
                     <span>₹{subTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-100 text-xs font-bold">
                     <span>Tax & Service (12%)</span>
                     <span>₹{taxPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                     <p className="text-[10px] font-black uppercase text-white tracking-[0.4em] mb-1">Total</p>
                     <p className="text-4xl font-black tracking-tighter italic">₹{grandTotal.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl flex items-center gap-4 text-red-400 text-xs animate-bounce">
                  <ShieldAlert size={20} className="shrink-0" />
                  <p className="font-bold leading-tight uppercase tracking-widest">{submitError}</p>
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full group bg-white text-neutral-900 py-6 rounded-3xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 shadow-2xl"
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" size={20} /> SYNCING...</>
                ) : (
                  <>CONFIRM BOOKING <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
                )}
              </button>
            </div>
            
            <div className="mt-10 flex flex-col items-center gap-4 opacity-20 group-hover:opacity-100 transition-opacity">
               <div className="flex gap-8">
                 <Box size={16} /> <CreditCard size={16} /> <ShieldCheck size={16} />
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.6em]">Encrypted Session Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
