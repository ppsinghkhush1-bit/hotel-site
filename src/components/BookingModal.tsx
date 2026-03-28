import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, Users, Bed, Mail, Phone, User, CheckCircle2, 
  Loader2, Star, Zap, ShieldCheck, Smartphone, 
  ArrowRight, Wifi, Coffee, Wind
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

// --- CONFIGURATION ---
const CONFIG = {
  EMAILJS_SERVICE_ID: 'service_12y6xre',
  EMAILJS_TEMPLATE_ID: 'template_mz16rsu',
  EMAILJS_PUBLIC_KEY: 'bsmrGxOAEmpS7_WtU',
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

  // Modal State Reset logic
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setError(null);
      setCurrentStep(1);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, room]);

  // Logic to calculate nights and total price
  const nights = useMemo(() => {
    if (!bookingIn || !bookingOut) return 1;
    const start = new Date(bookingIn);
    const end = new Date(bookingOut);
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 360 * 24));
    return dayDiff > 0 ? dayDiff : 1;
  }, [bookingIn, bookingOut]);

  const price = room?.basePrice || room?.price_per_night || 0;
  const totalPrice = price * nights;

  // --- SUBMISSION HANDLER ---
  const handleBooking = async () => {
    if (!guestDetails.name || !guestDetails.phone || !guestDetails.email) {
      setError("Please complete all guest information.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Save to Supabase
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

      // 2. Send via EmailJS (Matches your template variables)
      const templateParams = {
        guest_name: guestDetails.name,
        guest_email: guestDetails.email,
        guest_phone: guestDetails.phone,
        room_name: room?.name || room?.room_type,
        check_in: bookingIn,
        check_out: bookingOut,
        total_price: totalPrice,
        title: `New Reservation: ${room?.name || room?.room_type}`
      };

      await emailjs.send(
        CONFIG.EMAILJS_SERVICE_ID, 
        CONFIG.EMAILJS_TEMPLATE_ID, 
        templateParams, 
        CONFIG.EMAILJS_PUBLIC_KEY
      );

      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError("Connection Error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If modal is not open, return nothing
  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative max-h-[95vh]">
        
        {/* Left: Decorative Info */}
        <div className="md:w-5/12 bg-neutral-900 relative min-h-[250px] md:min-h-full">
          <img 
            src={room.image || room.image_url} 
            className="absolute inset-0 w-full h-full object-cover opacity-50" 
            alt="hotel room" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h2 className="text-4xl font-serif italic mb-2">{room.name || room.room_type}</h2>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={16} /> Best Price Guaranteed
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full md:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Right: Booking Form */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
          <header className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="hidden md:block p-2 hover:bg-neutral-100 rounded-full transition-all">
                <X size={20} />
              </button>
              <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                Step {currentStep} of 2
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase italic">
              <Zap size={14} fill="currentColor" /> Green Garden
            </div>
          </header>

          <main className="p-8 flex-1">
            {isSuccess ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-serif mb-2">Request Sent!</h3>
                <p className="text-neutral-500 mb-8">We will contact you shortly on {guestDetails.phone} for confirmation.</p>
                <button onClick={onClose} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase text-xs">Close</button>
              </div>
            ) : (
              <div className="space-y-6">
                {currentStep === 1 ? (
                  <div className="space-y-6">
                    <h4 className="text-2xl font-serif italic">Select Stay Dates</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-2xl bg-neutral-50">
                        <label className="text-[9px] font-black uppercase text-neutral-400 block mb-1">Check-In</label>
                        <input type="date" value={bookingIn} onChange={e => setBookingIn(e.target.value)} className="w-full bg-transparent font-bold text-sm outline-none" />
                      </div>
                      <div className="p-4 border rounded-2xl bg-neutral-50">
                        <label className="text-[9px] font-black uppercase text-neutral-400 block mb-1">Check-Out</label>
                        <input type="date" value={bookingOut} onChange={e => setBookingOut(e.target.value)} className="w-full bg-transparent font-bold text-sm outline-none" />
                      </div>
                    </div>
                    <div className="bg-neutral-900 p-8 rounded-3xl text-white">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Price Summary</p>
                      <div className="flex justify-between items-end">
                        <h5 className="text-5xl font-black italic">₹{totalPrice.toLocaleString()}</h5>
                        <p className="text-[10px] opacity-40 font-bold uppercase mb-2">Total for {nights} Night(s)</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-2xl font-serif italic">Guest Details</h4>
                    <input 
                      type="text" 
                      placeholder="Your Full Name" 
                      value={guestDetails.name} 
                      onChange={e => setGuestDetails({...guestDetails, name: e.target.value})} 
                      className="w-full p-4 border rounded-xl text-sm font-medium outline-none focus:border-emerald-500" 
                    />
                    <input 
                      type="tel" 
                      placeholder="WhatsApp Number" 
                      value={guestDetails.phone} 
                      onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})} 
                      className="w-full p-4 border rounded-xl text-sm font-medium outline-none focus:border-emerald-500" 
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={guestDetails.email} 
                      onChange={e => setGuestDetails({...guestDetails, email: e.target.value})} 
                      className="w-full p-4 border rounded-xl text-sm font-medium outline-none focus:border-emerald-500" 
                    />
                  </div>
                )}
              </div>
            )}
          </main>

          {!isSuccess && (
            <footer className="p-6 border-t bg-neutral-50 flex justify-between items-center">
              <button 
                onClick={() => currentStep > 1 && setCurrentStep(1)} 
                className={`text-xs font-black uppercase text-neutral-400 hover:text-black ${currentStep === 1 && 'invisible'}`}
              >
                Back
              </button>
              
              {error && <span className="text-[10px] font-bold text-red-500 uppercase">{error}</span>}

              <button 
                onClick={currentStep === 1 ? () => setCurrentStep(2) : handleBooking} 
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : currentStep === 1 ? "Next Step" : "Confirm Reservation"}
                <ArrowRight size={14} />
              </button>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
