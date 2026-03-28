import React, { useState, useMemo } from 'react';
import { 
  X, Calendar, Users, Bed, Mail, Phone, User, CheckCircle2, 
  Loader2, Star, ChevronRight, CreditCard, Zap, ShieldCheck, 
  Sparkles, BellRing, Smartphone, ArrowRight, ShieldAlert,
  MapPin, Camera, Shield, Utensils, Car
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

// --- VERIFIED CONFIG FROM YOUR SCREENSHOTS ---
const EMAILJS_SERVICE_ID = 'service_12y6xre';
const EMAILJS_TEMPLATE_ID = 'template_mz16rsu'; //
const EMAILJS_PUBLIC_KEY = 'bsmrGxOAEmpS7_WtU';

interface RoomData {
  id: string | number;
  name: string;
  image: string;
  description: string;
  basePrice: number;
  maxGuests: number;
}

export default function BookingModal({ isOpen = true, onClose, room, checkIn: initialIn = '', checkOut: initialOut = '' }: any) {
  const [bookingIn, setBookingIn] = useState(initialIn);
  const [bookingOut, setBookingOut] = useState(initialOut);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // --- No Extra Fees Calculation ---
  const nights = useMemo(() => {
    if (!bookingIn || !bookingOut) return 1;
    const diff = Math.ceil((new Date(bookingOut).getTime() - new Date(bookingIn).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [bookingIn, bookingOut]);

  const totalAmount = room.basePrice * nights;

  const handleFinalBooking = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      setSubmitError("Please fill all guest details.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // 1. Resolve UUID from 'rooms' table
      const { data: dbRoom } = await supabase
        .from('rooms')
        .select('id')
        .ilike('room_type', room.name.trim())
        .limit(1)
        .single();

      // 2. Insert into 'bookings' table
      const { error: dbError } = await supabase.from('bookings').insert({
        room_id: dbRoom?.id || room.id,
        hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9',
        guest_name: customerName,
        guest_email: customerEmail,
        guest_phone: customerPhone,
        check_in: bookingIn,
        check_out: bookingOut,
        total_price: totalAmount,
        status: 'pending'
      });

      if (dbError) throw dbError;

      // 3. Send Email - Mapping to your Template Variables
      const emailParams = {
        guest_name: customerName,    // Matches {{guest_name}}
        guest_email: customerEmail,  // Matches {{guest_email}}
        guest_phone: customerPhone,  // Matches {{guest_phone}}
        room_name: room.name,        // Matches {{room_name}}
        check_in: bookingIn,         // Matches {{check_in}}
        check_out: bookingOut,       // Matches {{check_out}}
        total_price: totalAmount,    // Matches {{total_price}}
        title: `New Booking: ${room.name}` // For subject line {{title}}
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams, EMAILJS_PUBLIC_KEY);
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "Connection Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  if (submitSuccess) return (
    <div className="fixed inset-0 bg-neutral-950 z-[100] flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-[3rem] p-12 text-center shadow-2xl animate-in zoom-in">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-serif mb-2">Request Sent!</h2>
        <p className="text-neutral-500 mb-8">We have notified the hotel. Check your email for details.</p>
        <button onClick={onClose} className="w-full bg-black text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs">Close</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-[90] overflow-y-auto font-sans">
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-50 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap size={24} className="text-emerald-500 fill-emerald-500" />
          <span className="font-black text-xl tracking-tighter uppercase italic">GREEN GARDEN</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full"><X size={24} /></button>
      </nav>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 p-8">
        <div className="space-y-8">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-xl aspect-video">
            <img src={room.image} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <h1 className="absolute bottom-8 left-8 text-4xl font-serif text-white">{room.name}</h1>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 bg-neutral-50 rounded-2xl text-center border border-neutral-100">
              <Bed className="mx-auto mb-2 text-emerald-600" size={20} />
              <p className="text-[10px] font-black uppercase text-neutral-400">Master Bed</p>
            </div>
            <div className="p-6 bg-neutral-50 rounded-2xl text-center border border-neutral-100">
              <Users className="mx-auto mb-2 text-emerald-600" size={20} />
              <p className="text-[10px] font-black uppercase text-neutral-400">{room.maxGuests} Guests</p>
            </div>
            <div className="p-6 bg-neutral-50 rounded-2xl text-center border border-neutral-100">
              <ShieldCheck className="mx-auto mb-2 text-emerald-600" size={20} />
              <p className="text-[10px] font-black uppercase text-neutral-400">Verified</p>
            </div>
          </div>
          <p className="text-neutral-500 italic text-xl border-l-4 border-emerald-500 pl-6 leading-relaxed">"{room.description}"</p>
        </div>

        <div className="bg-neutral-900 rounded-[3rem] p-10 text-white shadow-2xl h-fit">
          <div className="mb-8">
            <p className="text-emerald-500 text-[10px] font-black tracking-widest uppercase mb-1">Stay Value</p>
            <h2 className="text-5xl font-serif italic">₹{room.basePrice.toLocaleString()}<span className="text-sm font-sans opacity-40 ml-2">/ night</span></h2>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={bookingIn} onChange={(e) => setBookingIn(e.target.value)} className="bg-neutral-800 rounded-xl p-4 text-xs font-bold border-none outline-none focus:ring-1 focus:ring-emerald-500" />
              <input type="date" value={bookingOut} onChange={(e) => setBookingOut(e.target.value)} className="bg-neutral-800 rounded-xl p-4 text-xs font-bold border-none outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <input type="text" placeholder="GUEST NAME" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-800 rounded-xl p-4 text-xs font-bold border-none outline-none" />
            <input type="tel" placeholder="PHONE" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-neutral-800 rounded-xl p-4 text-xs font-bold border-none outline-none" />
            <input type="email" placeholder="EMAIL" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-neutral-800 rounded-xl p-4 text-xs font-bold border-none outline-none" />

            <div className="bg-emerald-600 p-6 rounded-2xl flex justify-between items-center mt-4">
              <span className="text-[10px] font-black uppercase tracking-widest">Total for {nights} Night(s)</span>
              <span className="text-3xl font-black italic">₹{totalAmount.toLocaleString()}</span>
            </div>

            {submitError && <div className="text-red-400 text-[10px] font-black uppercase text-center">{submitError}</div>}

            <button onClick={handleFinalBooking} disabled={isSubmitting} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Send Reservation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
