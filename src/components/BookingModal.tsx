import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Calendar, Users, Bed, Mail, Phone, User, CheckCircle2, 
  Loader2, Star, ChevronRight, CreditCard, Zap, ShieldCheck, 
  Sparkles, BellRing, Smartphone, ArrowRight, Info, ShieldAlert,
  Clock, MapPin, Share2, Heart, Waves, Wind, Coffee, Tv,
  Maximize, Camera, Shield, Utensils, Car, History, Layout, Bookmark
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

// --- YOUR VERIFIED CONFIG ---
const EMAILJS_SERVICE_ID = 'service_12y6xre';
const EMAILJS_TEMPLATE_ID = 'template_mz16rsu';
const EMAILJS_PUBLIC_KEY = 'bsmrGxOAEmpS7_WtU';

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
}

export default function BookingModal({
  isOpen = true,
  onClose,
  room,
  checkIn: initialCheckIn = '',
  checkOut: initialCheckOut = ''
}: BookingModalProps) {
  // --- States Management ---
  const [bookingIn, setBookingIn] = useState(initialCheckIn || '');
  const [bookingOut, setBookingOut] = useState(initialCheckOut || '');
  const [guestCount, setGuestCount] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'policies'>('overview');

  const modalRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split('T')[0];

  // --- Stay Calculations (No Extra Fees) ---
  const nights = useMemo(() => {
    if (!bookingIn || !bookingOut) return 1;
    const start = new Date(bookingIn);
    const end = new Date(bookingOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [bookingIn, bookingOut]);

  const totalAmount = useMemo(() => room.basePrice * nights, [room.basePrice, nights]);

  // --- Handlers ---
  const handleFinalBooking = async () => {
    // 1. Validations
    if (!customerName || !customerEmail || !customerPhone) {
      setSubmitError("GUEST DETAILS MISSING: All fields are required for priority check-in.");
      return;
    }
    if (!bookingIn || !bookingOut) {
      setSubmitError("DATE ERROR: Please select valid stay dates.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // 2. Database Integration (Supabase Sync)
      // Resolve Room ID first to prevent foreign key errors
      const { data: dbRoom } = await supabase
        .from('rooms')
        .select('id')
        .ilike('room_type', room.name.trim())
        .limit(1)
        .single();

      const { error: dbError } = await supabase.from('bookings').insert({
        room_id: dbRoom?.id || room.id,
        hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9', // Your Hotel ID
        guest_name: customerName,
        guest_email: customerEmail,
        guest_phone: customerPhone,
        check_in: bookingIn,
        check_out: bookingOut,
        num_guests: guestCount,
        total_price: totalAmount,
        status: 'pending',
        special_requests: specialNote
      });

      if (dbError) throw dbError;

      // 3. Email Notification (EmailJS - Hotel Side)
      const emailParams = {
        guest_name: customerName,
        guest_email: customerEmail,
        guest_phone: customerPhone,
        room_name: room.name,
        check_in: bookingIn,
        check_out: bookingOut,
        total_price: totalAmount,
        special_requests: specialNote,
        hotel_contact: 'hotelgreengarden0112@gmail.com'
      };

      const emailResponse = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        emailParams,
        EMAILJS_PUBLIC_KEY
      );

      if (emailResponse.status !== 200) throw new Error("Email Service Timeout");

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("CRITICAL_SYSTEM_ERROR:", err);
      setSubmitError(err.message || "Network Congestion: Please try again in 60s.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- Success State UI ---
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-6">
        <div className="bg-white max-w-xl w-full rounded-[4rem] overflow-hidden shadow-[0_100px_200px_-50px_rgba(0,0,0,0.5)] animate-in zoom-in duration-700">
          <div className="bg-emerald-600 p-20 text-center text-white relative">
            <Sparkles className="absolute top-10 right-10 opacity-30 animate-pulse" />
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/40 shadow-inner">
              <CheckCircle2 size={50} />
            </div>
            <h2 className="text-5xl font-serif mb-3 tracking-tight">Confirmed!</h2>
            <p className="opacity-80 text-xl font-light italic">Your request is now with Hotel Green Garden.</p>
          </div>
          <div className="p-12 space-y-6">
             <div className="flex justify-between items-center bg-neutral-50 p-8 rounded-[2.5rem] border border-neutral-100">
                <div>
                   <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Total Payable at Hotel</span>
                   <span className="text-4xl font-black italic">₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Status</span>
                   <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase">Priority</span>
                </div>
             </div>
             <button onClick={onClose} className="w-full bg-neutral-900 text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-emerald-600 transition-all active:scale-95">
               CLOSE PORTAL
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[90] overflow-y-auto font-sans selection:bg-emerald-100">
      {/* Mega Navbar */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-3xl border-b z-50 px-10 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-black rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl rotate-3 transform hover:rotate-0 transition-transform cursor-pointer">
            <Zap size={28} className="fill-emerald-500 text-emerald-500" />
          </div>
          <div>
            <span className="font-black text-3xl tracking-tighter uppercase italic block leading-none">GREEN <span className="text-emerald-600">GARDEN</span></span>
            <p className="text-[9px] font-black text-neutral-400 tracking-[0.3em] uppercase mt-1 flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> Luxury Stay Verified
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button className="hidden md:flex p-4 hover:bg-neutral-100 rounded-full transition-all text-neutral-400 hover:text-black"><Share2 size={20}/></button>
           <button className="hidden md:flex p-4 hover:bg-neutral-100 rounded-full transition-all text-neutral-400 hover:text-black"><Heart size={20}/></button>
           <button onClick={onClose} className="p-4 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-full transition-all group">
             <X size={28} className="group-hover:rotate-90 transition-transform" />
           </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16 pb-40 px-4">
        
        {/* LEFT COLUMN: Visuals & Info (60% width) */}
        <div className="lg:col-span-7 py-10 space-y-12">
          
          {/* Main Hero Gallery */}
          <div className="relative group rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-neutral-50 aspect-video">
            <img src={room.image} className="w-full h-full object-cover transform transition-transform duration-[8000ms] group-hover:scale-125" alt={room.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent" />
            
            <div className="absolute top-8 left-8 flex gap-3">
               <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-[10px] font-black tracking-widest uppercase border border-white/20">
                  Top Rated
               </span>
               <span className="bg-emerald-600 px-4 py-2 rounded-full text-white text-[10px] font-black tracking-widest uppercase shadow-lg">
                  Direct Exclusive
               </span>
            </div>

            <div className="absolute bottom-12 left-12">
               <div className="flex gap-1 text-emerald-400 mb-4 scale-125 origin-left">
                  {[...Array(5)].map((_,i) => <Star key={i} size={14} fill="currentColor" />)}
               </div>
               <h1 className="text-7xl font-serif text-white tracking-tighter mb-4 leading-tight">{room.name}</h1>
               <div className="flex items-center gap-6 text-emerald-400">
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><MapPin size={14}/> Main Wing, Floor 3</span>
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><Camera size={14}/> Verified Photos</span>
               </div>
            </div>
          </div>

          {/* Luxury Tabs */}
          <div className="flex gap-12 border-b border-neutral-100 overflow-x-auto pb-6 scrollbar-hide">
            {['overview', 'amenities', 'policies'].map(t => (
              <button key={t} onClick={() => setActiveTab(t as any)} className={`uppercase text-xs font-black tracking-[0.4em] transition-all relative whitespace-nowrap ${activeTab === t ? 'text-emerald-600' : 'text-neutral-400 hover:text-neutral-950'}`}>
                {t}
                {activeTab === t && <div className="absolute -bottom-6 left-0 right-0 h-1.5 bg-emerald-600 rounded-full" />}
              </button>
            ))}
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[
               { icon: Bed, label: 'Master Suite' },
               { icon: Waves, label: 'Pool Access' },
               { icon: Wind, label: 'Elite AC' },
               { icon: Coffee, label: 'Breakfast' },
               { icon: Tv, label: 'Smart TV' },
               { icon: Maximize, label: '800 Sq Ft' },
               { icon: Utensils, label: 'Room Service' },
               { icon: Car, label: 'Free Parking' }
             ].map((item, idx) => (
               <div key={idx} className="p-8 bg-neutral-50 rounded-[3rem] text-center border border-neutral-100 hover:bg-white hover:shadow-2xl transition-all group">
                  <item.icon className="mx-auto text-emerald-600 mb-4 group-hover:-translate-y-2 transition-transform" size={28} />
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{item.label}</p>
               </div>
             ))}
          </div>

          {/* Description */}
          <div className="space-y-6">
             <h3 className="text-4xl font-serif tracking-tighter italic text-neutral-900">The Ultimate Escape</h3>
             <p className="text-neutral-400 text-2xl leading-relaxed font-light italic border-l-[10px] border-emerald-500 pl-10 py-4 bg-neutral-50/50 rounded-r-3xl">
               "{room.description}. Our rooms are designed for those who appreciate the finer things in life. From Egyptian cotton linens to panoramic garden views, every detail is crafted for your peace of mind."
             </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Booking Sidebar (40% width) */}
        <div className="lg:col-span-5 py-10">
          <div className="bg-neutral-900 rounded-[4.5rem] p-12 text-white shadow-[0_80px_150px_-30px_rgba(0,0,0,0.8)] sticky top-32 border border-neutral-800 overflow-hidden">
            
            {/* Glossy Overlay Effect */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
            
            <div className="mb-12 flex justify-between items-end relative">
               <div>
                  <p className="text-emerald-500 text-[10px] font-black tracking-[0.5em] uppercase mb-3">Guaranteed Best Rate</p>
                  <h3 className="text-6xl font-serif tracking-tighter italic">₹{room.basePrice.toLocaleString()}<span className="text-sm font-sans text-neutral-500 font-light ml-3 italic">/ night</span></h3>
               </div>
               <div className="bg-emerald-600/10 p-4 px-6 rounded-full border border-emerald-500/20 flex items-center gap-3 backdrop-blur-md">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase">Secure Portal</span>
               </div>
            </div>

            <div className="space-y-8 relative">
              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-800/50 p-6 rounded-[2rem] border border-neutral-700/50 group focus-within:border-emerald-500 transition-colors">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Arrival</label>
                  <input 
                    type="date" 
                    value={bookingIn} 
                    min={today}
                    onChange={(e) => setBookingIn(e.target.value)}
                    className="bg-transparent border-none text-sm font-bold w-full outline-none text-emerald-400" 
                  />
                </div>
                <div className="bg-neutral-800/50 p-6 rounded-[2rem] border border-neutral-700/50 group focus-within:border-emerald-500 transition-colors">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Departure</label>
                  <input 
                    type="date" 
                    value={bookingOut} 
                    min={bookingIn || today}
                    onChange={(e) => setBookingOut(e.target.value)}
                    className="bg-transparent border-none text-sm font-bold w-full outline-none text-emerald-400" 
                  />
                </div>
              </div>

              {/* Guest Counter */}
              <div className="bg-neutral-800/50 p-6 rounded-[2rem] flex justify-between items-center border border-neutral-700/50">
                 <div>
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Total Guests</span>
                    <span className="text-sm font-bold">{guestCount} People</span>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-10 h-10 rounded-full border border-neutral-600 flex items-center justify-center hover:bg-emerald-600 transition-colors">-</button>
                    <button onClick={() => setGuestCount(Math.min(room.maxGuests, guestCount + 1))} className="w-10 h-10 rounded-full border border-neutral-600 flex items-center justify-center hover:bg-emerald-600 transition-colors">+</button>
                 </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                 <div className="relative group">
                    <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="GUEST FULL NAME" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-neutral-800 border-none rounded-3xl pl-16 py-6 text-[11px] font-black tracking-[0.2em] focus:ring-2 focus:ring-emerald-500 transition-all" 
                    />
                 </div>
                 <div className="relative group">
                    <Smartphone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="tel" 
                      placeholder="PHONE NUMBER" 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-neutral-800 border-none rounded-3xl pl-16 py-6 text-[11px] font-black tracking-[0.2em] focus:ring-2 focus:ring-emerald-500 transition-all" 
                    />
                 </div>
                 <div className="relative group">
                    <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="email" 
                      placeholder="EMAIL ADDRESS" 
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-neutral-800 border-none rounded-3xl pl-16 py-6 text-[11px] font-black tracking-[0.2em] focus:ring-2 focus:ring-emerald-500 transition-all" 
                    />
                 </div>
                 <textarea 
                    placeholder="SPECIAL REQUESTS (OPTIONAL)" 
                    value={specialNote}
                    onChange={(e) => setSpecialNote(e.target.value)}
                    className="w-full bg-neutral-800 border-none rounded-3xl p-6 text-[11px] font-black tracking-[0.2em] focus:ring-2 focus:ring-emerald-500 transition-all min-h-[100px] resize-none"
                 />
              </div>

              {/* Total Calculation Display */}
              <div className="bg-emerald-600 p-10 rounded-[3.5rem] shadow-2xl shadow-emerald-900/50 space-y-4 transform hover:scale-[1.02] transition-transform duration-500">
                <div className="flex justify-between items-center text-emerald-100 text-[10px] font-black tracking-[0.3em] uppercase border-b border-emerald-500/50 pb-5">
                   <span>Room x {nights} Night{nights > 1 ? 's' : ''}</span>
                   <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-[10px] font-black uppercase text-white tracking-[0.5em] mb-1">Final Total</p>
                      <p className="text-5xl font-black tracking-tighter italic">₹{totalAmount.toLocaleString()}</p>
                   </div>
                   <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30 animate-pulse">
                      <CreditCard size={28} />
                   </div>
                </div>
              </div>

              {/* Error Alert */}
              {submitError && (
                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl flex items-center gap-4 text-red-400 text-[10px] font-black uppercase tracking-widest animate-bounce">
                  <ShieldAlert size={20} className="shrink-0" />
                  <p className="leading-tight">{submitError}</p>
                </div>
              )}

              {/* Final CTA */}
              <button
                onClick={handleFinalBooking}
                disabled={isSubmitting}
                className="w-full group bg-white text-neutral-900 py-8 rounded-[3rem] font-black uppercase tracking-[0.5em] text-xs hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-4 active:scale-95 shadow-2xl overflow-hidden relative"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span className="relative z-10">INITIATE RESERVATION</span>
                    <ChevronRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
            
            {/* Trust Badges */}
            <div className="mt-16 flex flex-col items-center gap-6 opacity-20 hover:opacity-100 transition-opacity">
               <div className="flex gap-10">
                 <Shield size={22} /> <History size={22} /> <Layout size={22} /> <Bookmark size={22} />
               </div>
               <p className="text-[8px] font-black uppercase tracking-[0.8em]">Secure Payment at Hotel Only</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
