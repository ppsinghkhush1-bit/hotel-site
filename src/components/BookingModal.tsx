import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, Users, Bed, Mail, Phone, User, CheckCircle2, 
  Loader2, Star, Zap, ShieldCheck, Smartphone, ShieldAlert,
  ArrowRight, Wifi, Coffee, Utensils, ChevronLeft,
  CreditCard, Wind, Maximize, Shield, Camera, Car
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

// --- CONFIGURATION (STRICT SYNC) ---
const CONFIG = {
  EMAILJS: {
    SERVICE_ID: 'service_12y6xre',
    TEMPLATE_ID: 'template_mz16rsu',
    PUBLIC_KEY: 'bsmrGxOAEmpS7_WtU'
  },
  HOTEL_ID: '418d39b5-659d-4f0b-be4a-062ec24e22d9'
};

export default function BookingModal({ isOpen, onClose, room, checkIn: initialIn, checkOut: initialOut }: any) {
  // --- STATES ---
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingIn, setBookingIn] = useState(initialIn || '');
  const [bookingOut, setBookingOut] = useState(initialOut || '');
  const [guestDetails, setGuestDetails] = useState({
    name: '',
    email: '',
    phone: '',
    count: 2
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- AUTO-FETCH RESET ---
  // Jab bhi naya room click hoga, modal purana data saaf kar dega
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setError(null);
      setCurrentStep(1);
    }
  }, [room, isOpen]);

  // --- PRICE CALCULATION ---
  const nights = useMemo(() => {
    if (!bookingIn || !bookingOut) return 1;
    const diff = Math.ceil((new Date(bookingOut).getTime() - new Date(bookingIn).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [bookingIn, bookingOut]);

  const totalPrice = (room?.basePrice || room?.price_per_night || 0) * nights;

  // --- FINAL SUBMIT LOGIC ---
  const handleFinalSubmit = async () => {
    if (!guestDetails.name || !guestDetails.phone) {
      setError("Please enter Guest Name and Phone.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Get Correct UUID from Supabase for the Clicked Room
      const { data: dbRoom } = await supabase
        .from('rooms')
        .select('id')
        .ilike('room_type', (room.name || room.room_type).trim())
        .single();

      // 2. Insert Booking into Supabase
      const { error: dbError } = await supabase.from('bookings').insert({
        room_id: dbRoom?.id || room.id,
        hotel_id: CONFIG.HOTEL_ID,
        guest_name: guestDetails.name,
        guest_email: guestDetails.email,
        guest_phone: guestDetails.phone,
        check_in: bookingIn,
        check_out: bookingOut,
        total_price: totalPrice,
        status: 'pending'
      });

      if (dbError) throw dbError;

      // 3. EmailJS Sync (Matches your Screenshot Template)
      const emailData = {
        guest_name: guestDetails.name,
        guest_email: guestDetails.email,
        guest_phone: guestDetails.phone,
        room_name: room.name || room.room_type,
        check_in: bookingIn,
        check_out: bookingOut,
        total_price: totalPrice
      };

      await emailjs.send(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID, emailData, CONFIG.EMAILJS.PUBLIC_KEY);

      setIsSuccess(true);
    } catch (err: any) {
      setError("System Busy: Email sent but DB sync delayed.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-6 overflow-hidden animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-full md:h-[85vh] md:rounded-[3rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative transition-all">
        
        {/* Step 1: Left Visual Side (Room Branding) */}
        <div className="lg:w-5/12 relative bg-neutral-900 overflow-hidden">
          <img 
            src={room.image || room.image_url} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 hover:scale-110 transition-transform duration-1000" 
            alt="luxury room" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/40" />
          
          <div className="absolute bottom-12 left-12 right-12 z-10">
            <div className="flex gap-1 text-emerald-400 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <h2 className="text-6xl font-serif italic text-white tracking-tighter leading-none mb-4">
              {room.name || room.room_type}
            </h2>
            <div className="flex flex-wrap gap-3">
              <span className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-[10px] font-bold text-white uppercase">Garden View</span>
              <span className="bg-emerald-600 px-4 py-2 rounded-full text-[10px] font-bold text-white uppercase">Verified Stay</span>
            </div>
          </div>
          
          <button onClick={onClose} className="absolute top-8 left-8 p-3 bg-white/10 hover:bg-white hover:text-black text-white rounded-full backdrop-blur-md transition-all z-20 md:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Step 2: Right Booking Engine */}
        <div className="flex-1 flex flex-col bg-neutral-50 relative">
          <header className="p-8 border-b bg-white flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button onClick={onClose} className="hidden md:flex p-3 hover:bg-neutral-100 rounded-full transition-colors"><X size={20} /></button>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Reservation Stage</p>
                <div className="flex gap-2">
                  <div className={`h-1.5 w-8 rounded-full ${currentStep >= 1 ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
                  <div className={`h-1.5 w-8 rounded-full ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
                </div>
              </div>
            </div>
            <Zap size={24} className="text-emerald-500 fill-emerald-500" />
          </header>

          <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
            {isSuccess ? (
              <div className="text-center py-12 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-4xl font-serif italic mb-4">Booking Initialized!</h3>
                <p className="text-neutral-500 mb-10 max-w-sm mx-auto font-medium">We've sent the details to {guestDetails.email}. The hotel will contact you for final confirmation.</p>
                <button onClick={onClose} className="w-full max-w-xs bg-black text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all">Back to Gallery</button>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-10">
                {currentStep === 1 ? (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-4xl font-serif italic text-neutral-900">Stay Duration</h3>
                      <p className="text-neutral-400 text-sm mt-1">Select your dates to calculate final stay value.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <DateBox label="Check-In" value={bookingIn} onChange={setBookingIn} />
                      <DateBox label="Check-Out" value={bookingOut} onChange={setBookingOut} />
                    </div>
                    <div className="bg-neutral-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                       <div className="relative z-10 flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Total Payable</p>
                            <h4 className="text-6xl font-black italic tracking-tighter">₹{totalPrice.toLocaleString()}</h4>
                         </div>
                         <div className="text-right opacity-40">
                            <p className="text-[10px] font-bold uppercase">{nights} Nights Stay</p>
                            <p className="text-[10px] font-bold uppercase">No Hidden Fees</p>
                         </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in slide-in-from-right duration-500">
                    <div>
                      <h3 className="text-4xl font-serif italic text-neutral-900">Guest Details</h3>
                      <p className="text-neutral-400 text-sm mt-1">Identity required for secure room reservation.</p>
                    </div>
                    <div className="space-y-4">
                      <LuxeInput icon={<User size={18}/>} placeholder="Guest Full Name" value={guestDetails.name} onChange={(v) => setGuestDetails({...guestDetails, name: v})} />
                      <LuxeInput icon={<Smartphone size={18}/>} placeholder="WhatsApp Number" value={guestDetails.phone} onChange={(v) => setGuestDetails({...guestDetails, phone: v})} />
                      <LuxeInput icon={<Mail size={18}/>} placeholder="Email (For Booking Voucher)" value={guestDetails.email} onChange={(v) => setGuestDetails({...guestDetails, email: v})} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {!isSuccess && (
            <footer className="p-8 bg-white border-t flex justify-between items-center lg:px-16">
              <button 
                onClick={() => currentStep > 1 && setCurrentStep(1)} 
                className={`text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-black transition-all ${currentStep === 1 && 'invisible'}`}
              >
                Back
              </button>
              
              {error && <span className="text-[10px] font-bold text-red-500 uppercase animate-pulse">{error}</span>}

              <button 
                onClick={currentStep === 1 ? () => setCurrentStep(2) : handleFinalSubmit}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-neutral-900 text-white px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : currentStep === 1 ? "Next Step" : "Confirm Booking"}
                <ArrowRight size={16} />
              </button>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MICRO COMPONENTS ---

function DateBox({ label, value, onChange }: any) {
  return (
    <div className="bg-white border border-neutral-200 p-6 rounded-[2rem] hover:border-emerald-500 transition-all">
      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 block">{label}</label>
      <input 
        type="date" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent font-bold text-sm outline-none cursor-pointer" 
      />
    </div>
  );
}

function LuxeInput({ icon, placeholder, value, onChange }: any) {
  return (
    <div className="relative group">
       <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors">
         {icon}
       </div>
       <input 
          type="text" 
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-neutral-200 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
       />
    </div>
  );
}
