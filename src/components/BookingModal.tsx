import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, Users, Bed, Mail, Phone, User, CheckCircle2, 
  Loader2, Star, Zap, ShieldCheck, Smartphone, 
  ArrowRight, Wifi, Coffee, Wind, Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

// --- CONFIGURATION ---
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

  // Modal open hote hi reset logic
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Scroll stop
      setIsSuccess(false);
      setError(null);
      setCurrentStep(1);
    } else {
      document.body.style.overflow = 'unset'; // Scroll start
    }
  }, [isOpen, room]);

  // Price Calculation
  const nights = useMemo(() => {
    if (!bookingIn || !bookingOut) return 1;
    const start = new Date(bookingIn);
    const end = new Date(bookingOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [bookingIn, bookingOut]);

  const pricePerNight = room?.basePrice || room?.price_per_night || 0;
  const totalPrice = pricePerNight * nights;

  // Final Submit to DB and Email
  const handleFinalSubmit = async () => {
    if (!guestDetails.name || !guestDetails.phone || !guestDetails.email) {
      setError("Please fill all guest details.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Database Entry
      const { error: dbError } = await supabase.from('bookings').insert({
        room_id: room?.id,
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

      // 2. EmailJS Sync (As per your screenshot)
      await emailjs.send(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID, {
        guest_name: guestDetails.name,
        guest_email: guestDetails.email,
        guest_phone: guestDetails.phone,
        room_name: room?.name || room?.room_type,
        check_in: bookingIn,
        check_out: bookingOut,
        total_price: totalPrice
      }, CONFIG.EMAILJS.PUBLIC_KEY);

      setIsSuccess(true);
    } catch (err: any) {
      setError("Sync Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative min-h-[600px] animate-in fade-in zoom-in duration-300">
        
        {/* Left: Room Branding Section */}
        <div className="lg:w-1/2 relative min-h-[300px] bg-neutral-900">
          <img 
            src={room.image || room.image_url} 
            className="absolute inset-0 w-full h-full object-cover opacity-60" 
            alt="room" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          
          <div className="absolute bottom-10 left-10 right-10 z-10">
            <div className="flex gap-1 text-emerald-400 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <h2 className="text-5xl font-serif italic text-white mb-4 leading-none">
              {room.name || room.room_type}
            </h2>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-[10px] font-bold text-white uppercase opacity-80"><Wifi size={14}/> Free WiFi</div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-white uppercase opacity-80"><Coffee size={14}/> Breakfast</div>
            </div>
          </div>

          <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white text-white hover:text-black rounded-full transition-all md:hidden">
            <X size={24} />
          </button>
        </div>

        {/* Right: Modern Booking Engine */}
        <div className="flex-1 flex flex-col bg-neutral-50 relative">
          <header className="p-8 border-b bg-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="hidden md:block p-2 hover:bg-neutral-100 rounded-full transition-colors"><X size={24} /></button>
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Step {currentStep} of 2</h3>
            </div>
            <Zap className="text-emerald-500 fill-emerald-500" />
          </header>

          <main className="flex-1 p-8 lg:p-12">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="text-3xl font-serif italic text-neutral-900">Reservation Confirmed!</h4>
                <p className="text-neutral-500 max-w-sm">We've sent the booking voucher to {guestDetails.email}.</p>
                <button onClick={onClose} className="bg-black text-white px-10 py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:scale-105 transition-all">Close Modal</button>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-8">
                {currentStep === 1 ? (
                  <div className="space-y-6">
                    <h4 className="text-3xl font-serif italic">Stay Dates</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
                        <label className="text-[9px] font-black text-neutral-400 uppercase block mb-1">Check-In</label>
                        <input type="date" value={bookingIn} onChange={e => setBookingIn(e.target.value)} className="w-full bg-transparent font-bold text-sm outline-none" />
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
                        <label className="text-[9px] font-black text-neutral-400 uppercase block mb-1">Check-Out</label>
                        <input type="date" value={bookingOut} onChange={e => setBookingOut(e.target.value)} className="w-full bg-transparent font-bold text-sm outline-none" />
                      </div>
                    </div>
                    <div className="bg-neutral-900 p-8 rounded-[2rem] text-white shadow-xl">
                       <p className="text-[10px] font-bold text-emerald-400 uppercase mb-2">Estimated Total</p>
                       <p className="text-5xl font-black italic tracking-tighter">₹{totalPrice.toLocaleString()}</p>
                       <p className="text-[10px] opacity-40 mt-4 uppercase font-bold tracking-widest">{nights} Night(s) Reservation</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-3xl font-serif italic mb-6">Guest Information</h4>
                    <input type="text" placeholder="Full Name" value={guestDetails.name} onChange={e => setGuestDetails({...guestDetails, name: e.target.value})} className="w-full p-5 bg-white border border-neutral-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                    <input type="tel" placeholder="Mobile Number" value={guestDetails.phone} onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})} className="w-full p-5 bg-white border border-neutral-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                    <input type="email" placeholder="Email Address" value={guestDetails.email} onChange={e => setGuestDetails({...guestDetails, email: e.target.value})} className="w-full p-5 bg-white border border-neutral-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                  </div>
                )}
              </div>
            )}
          </main>

          {!isSuccess && (
            <footer className="p-8 bg-white border-t flex justify-between items-center">
              <button onClick={() => currentStep > 1 && setCurrentStep(1)} className={`text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-black ${currentStep === 1 && 'invisible'}`}>Back</button>
              {error && <p className="text-[10px] text-red-500 font-bold uppercase">{error}</p>}
              <button 
                onClick={currentStep === 1 ? () => setCurrentStep(2) : handleFinalSubmit} 
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-black text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : currentStep === 1 ? "Next Step" : "Confirm Booking"}
                <ArrowRight size={16} />
              </button>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
