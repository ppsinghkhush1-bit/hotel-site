import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, Users, Bed, Wifi, Coffee, Tv, Wind, Mail, 
  Phone, User, CheckCircle2, AlertCircle, ArrowRight, 
  ShieldCheck, Loader2, Star, Info, ChevronRight, CreditCard,
  MapPin, Share2, Heart, ShieldAlert, Clock, Sparkles, Utensils,
  Maximize, Car, Waves
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

  // Sync dates from props
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

  const taxPrice = useMemo(() => (room.basePrice * 0.18), [room.basePrice]);
  const grandTotal = useMemo(() => (Number(room.basePrice) + taxPrice) * (nights || 1), [room.basePrice, taxPrice, nights]);

  // --- THE FINAL UUID FIX ---
  const handleConfirmBooking = async () => {
    if (!bookingCheckIn || !bookingCheckOut || nights <= 0) {
      setSubmitError("Invalid Stay Dates: Please check arrival & departure.");
      return;
    }
    if (!customerName.trim() || !customerEmail.includes('@')) {
      setSubmitError("Identity Required: Please enter valid name and email.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Force conversion to UUID format to stop "Invalid syntax for type uuid"
      const safeRoomId = String(room.id).length < 20 
        ? `00000000-0000-0000-0000-${String(room.id).padStart(12, '0')}`
        : room.id;

      const { error: dbError } = await supabase
        .from('bookings')
        .insert({
          room_id: safeRoomId, 
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9', // Make sure this exists in hotels table
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

      if (dbError) throw dbError;
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "Engine Error: Database rejected the request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- SUCCESS SCREEN ---
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
        <div className="bg-white max-w-xl w-full rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="bg-emerald-600 p-16 text-center text-white relative">
            <Sparkles className="absolute top-10 left-10 opacity-20 animate-pulse" />
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30 shadow-xl">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-serif mb-2 tracking-tight">Booking Confirmed!</h2>
            <p className="opacity-80 font-light text-lg italic">Your luxury experience at {room.name} awaits.</p>
          </div>
          <div className="p-10 space-y-6 bg-white">
             <div className="space-y-3">
                <div className="flex justify-between border-b pb-3 text-sm font-medium">
                   <span className="text-neutral-400 uppercase tracking-widest">Transaction ID</span>
                   <span className="text-neutral-900">#BK-{Math.floor(Math.random() * 90000)}</span>
                </div>
                <div className="flex justify-between border-b pb-3 text-sm font-medium">
                   <span className="text-neutral-400 uppercase tracking-widest">Arrival Date</span>
                   <span className="text-neutral-900">{bookingCheckIn}</span>
                </div>
             </div>
             <button onClick={onClose} className="w-full bg-neutral-950 text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
               CLOSE PORTAL
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[90] overflow-y-auto">
      {/* Dynamic Navbar */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-2xl border-b z-50 px-8 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 transform rotate-3">
            <ShieldCheck size={28} />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tighter uppercase block leading-none">HG LUXURY</span>
            <span className="text-[9px] font-bold text-emerald-600 tracking-[0.3em] uppercase">Verified Reservation</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="hidden md:flex p-3 hover:bg-neutral-100 rounded-full transition-all"><Share2 size={20}/></button>
           <button className="hidden md:flex p-3 hover:bg-neutral-100 rounded-full transition-all text-red-500"><Heart size={20}/></button>
           <button onClick={onClose} className="p-3 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-full transition-all group">
             <X size={24} className="group-hover:rotate-90 transition-transform" />
           </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16 pb-32">
        
        {/* LEFT COLUMN: ROOM EXPERIENCE */}
        <div className="lg:col-span-7 p-6 lg:p-12 space-y-12">
          {/* Hero Gallery Section */}
          <div className="relative group">
            <div className="aspect-[16/10] rounded-[3.5rem] overflow-hidden shadow-2xl bg-neutral-100 border-8 border-neutral-50">
              <img src={room.image} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2000ms]" alt={room.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-10 left-10">
                 <div className="flex items-center gap-2 text-emerald-400 mb-3">
                    <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" />
                    <span className="text-white text-[10px] font-black tracking-widest bg-emerald-600/30 backdrop-blur px-3 py-1 rounded-full">ELITE STATUS</span>
                 </div>
                 <h1 className="text-6xl font-serif text-white tracking-tight">{room.name}</h1>
              </div>
            </div>
          </div>

          {/* Experience Tabs */}
          <div className="flex gap-10 border-b border-neutral-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {['details', 'amenities', 'reviews'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-6 text-xs font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-emerald-600' : 'text-neutral-400 hover:text-neutral-900'}`}>
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full" />}
              </button>
            ))}
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'details' && (
              <div className="space-y-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <div className="p-6 bg-neutral-50 rounded-[2.5rem] border border-neutral-100 hover:shadow-xl transition-all group">
                      <Bed className="text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] text-neutral-400 uppercase font-black mb-1">Beds</p>
                      <p className="font-bold text-lg">King Size</p>
                   </div>
                   <div className="p-6 bg-neutral-50 rounded-[2.5rem] border border-neutral-100 hover:shadow-xl transition-all group">
                      <Users className="text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] text-neutral-400 uppercase font-black mb-1">Capacity</p>
                      <p className="font-bold text-lg">{room.maxGuests} Adults</p>
                   </div>
                   <div className="p-6 bg-neutral-50 rounded-[2.5rem] border border-neutral-100 hover:shadow-xl transition-all group">
                      <Maximize className="text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] text-neutral-400 uppercase font-black mb-1">Space</p>
                      <p className="font-bold text-lg">850 sq.ft</p>
                   </div>
                   <div className="p-6 bg-neutral-50 rounded-[2.5rem] border border-neutral-100 hover:shadow-xl transition-all group">
                      <Waves className="text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] text-neutral-400 uppercase font-black mb-1">View</p>
                      <p className="font-bold text-lg">Garden/Pool</p>
                   </div>
                </div>
                <div className="prose prose-neutral max-w-none">
                   <p className="text-neutral-500 text-2xl leading-relaxed font-light italic border-l-4 border-emerald-500 pl-8">
                      "{room.description}"
                   </p>
                </div>
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {[
                   { icon: <Wifi />, title: "Hyper-Speed WiFi", desc: "600 Mbps dedicated fiber line" },
                   { icon: <Utensils />, title: "24/7 Butler Service", desc: "Private gourmet dining available" },
                   { icon: <Car />, title: "Chauffeur Service", desc: "Airport pickup & local tours" },
                   { icon: <Wind />, title: "Smart Climate", desc: "Voice controlled air conditioning" }
                 ].map((a, i) => (
                   <div key={i} className="flex gap-6 p-6 rounded-3xl hover:bg-neutral-50 transition-all border border-transparent hover:border-neutral-200">
                      <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">{a.icon}</div>
                      <div><h4 className="font-bold text-lg">{a.title}</h4><p className="text-neutral-400 text-sm leading-snug">{a.desc}</p></div>
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: BOOKING SIDEBAR */}
        <div className="lg:col-span-5 p-6 lg:p-12">
          <div className="bg-neutral-900 rounded-[3.5rem] p-12 text-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] sticky top-32 border border-neutral-800">
            <div className="flex justify-between items-start mb-10">
               <div>
                  <p className="text-emerald-500 text-[10px] uppercase font-black tracking-[0.5em] mb-2">Price for stay</p>
                  <h3 className="text-5xl font-serif">₹{room.basePrice.toLocaleString()}<span className="text-sm font-sans text-neutral-500 font-normal ml-2">/ night</span></h3>
               </div>
               <div className="bg-neutral-800 p-2 px-4 rounded-full flex items-center gap-2 text-xs font-black">
                 <ShieldAlert className="text-emerald-500" size={14} /> NO HIDDEN FEES
               </div>
            </div>

            <div className="space-y-6">
              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-neutral-500 tracking-widest ml-1">Check-In</label>
                  <div className="relative">
                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                     <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-neutral-500 tracking-widest ml-1">Check-Out</label>
                  <div className="relative">
                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                     <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              <div className="space-y-3 pt-2">
                 <div className="relative group">
                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-800 border-none rounded-[1.5rem] pl-14 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                 </div>
                 <div className="relative group">
                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input type="email" placeholder="Email Address" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-neutral-800 border-none rounded-[1.5rem] pl-14 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                 </div>
                 <div className="relative group">
                    <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input type="tel" placeholder="Mobile Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-neutral-800 border-none rounded-[1.5rem] pl-14 py-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                 </div>
              </div>

              {/* Advanced Summary Box */}
              {nights > 0 && (
                <div className="bg-emerald-600 p-8 rounded-[3rem] shadow-2xl shadow-emerald-900/40 space-y-4 transition-all animate-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center border-b border-emerald-500/50 pb-4">
                     <span className="text-[10px] font-black uppercase text-emerald-100 tracking-[0.2em]">{nights} Night Stay</span>
                     <span className="text-xl font-black">₹{(room.basePrice * nights).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-100">
                     <span>GST (18%)</span>
                     <span>₹{(taxPrice * nights).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                     <p className="text-[10px] font-black uppercase text-white tracking-[0.3em] leading-none mb-1">Total Payable</p>
                     <p className="text-4xl font-black tracking-tighter">₹{grandTotal.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Error Handler UI */}
              {submitError && (
                <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-center gap-4 text-red-400 text-xs animate-pulse">
                  <ShieldAlert size={24} className="shrink-0" />
                  <p className="font-bold leading-relaxed">{submitError}</p>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full group bg-white text-neutral-950 py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 active:scale-95 shadow-2xl flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" size={20} /> SYNCING WITH DB...</>
                ) : (
                  <>CONFIRM RESERVATION <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
                )}
              </button>
            </div>
            
            <div className="mt-10 flex flex-col items-center gap-4 opacity-30">
               <div className="flex gap-6">
                 <Clock size={16} /> <CreditCard size={16} /> <ShieldCheck size={16} />
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.5em]">Global Security Protocol Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
