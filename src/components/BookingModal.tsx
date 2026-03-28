import {
  X, Calendar, User, CheckCircle2, AlertCircle, 
  Mail, Phone, CreditCard, Info
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

// EmailJS Credentials
const EMAILJS_SERVICE_ID = 'service_12y6xre';
const EMAILJS_TEMPLATE_ID = 'template_mz16rsu';
const EMAILJS_PUBLIC_KEY = 'bsmrGxOAEmpS7_WtU';

interface Amenity {
  name: string;
  price: number;
  included: boolean;
}

interface BookingModalProps {
  isOpen?: boolean;
  onClose: () => void;
  room: any;
  selectedAmenities?: Amenity[];
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export default function BookingModal({
  isOpen = true,
  onClose,
  room,
  selectedAmenities = [],
  checkIn = '',
  checkOut = '',
  guests: initialGuests = 2
}: BookingModalProps) {
  // States
  const [bookingCheckIn, setBookingCheckIn] = useState(checkIn);
  const [bookingCheckOut, setBookingCheckOut] = useState(checkOut);
  const [bookingGuests, setBookingGuests] = useState(initialGuests);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setBookingCheckIn(checkIn);
    setBookingCheckOut(checkOut);
    setBookingGuests(initialGuests);
  }, [checkIn, checkOut, initialGuests]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const nights = useMemo(() => {
    if (!bookingCheckIn || !bookingCheckOut) return 0;
    const start = new Date(bookingCheckIn);
    const end = new Date(bookingCheckOut);
    if (start >= end) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [bookingCheckIn, bookingCheckOut]);

  const pricePerNight = useMemo(() => {
    const base = Number(room?.basePrice) || 0;
    const amenities = selectedAmenities.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    return base + amenities;
  }, [room?.basePrice, selectedAmenities]);

  const grandTotal = useMemo(() => (nights > 0 ? pricePerNight * nights : 0), [pricePerNight, nights]);

  const isFormValid = 
    customerName.trim().length > 2 && 
    customerEmail.includes('@') && 
    customerPhone.length >= 10 && 
    nights > 0;

  // FIX: Added e.preventDefault and e.stopPropagation to stop the calendar from opening
  const handleConfirmBooking = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!isFormValid) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // UUID Validation (Prevents "invalid input syntax for type uuid" error)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(room.id)) {
        throw new Error("Invalid Room ID format. Ensure your DB uses UUIDs.");
      }

      // 1. Save to Supabase
      const { error: dbError } = await supabase.from('bookings').insert([{
        room_id: room.id,
        guest_name: customerName,
        guest_email: customerEmail,
        guest_phone: customerPhone,
        check_in: bookingCheckIn,
        check_out: bookingCheckOut,
        num_guests: bookingGuests,
        total_price: grandTotal,
        status: 'pending',
        special_requests: specialRequests || ''
      }]);

      if (dbError) throw dbError;

      // 2. Send Email via EmailJS
      const templateParams = {
        to_name: customerName,
        to_email: customerEmail,
        room_name: room.name,
        check_in: bookingCheckIn,
        check_out: bookingCheckOut,
        total_price: formatCurrency(grandTotal),
        phone: customerPhone,
        nights: nights
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("Booking Error:", err);
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[95vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        
        {/* Sidebar (Desktop Only) */}
        <div className="hidden lg:flex w-1/3 bg-slate-900 p-10 flex-col justify-between text-white">
          <div>
            <h2 className="text-3xl font-bold leading-tight">{room.name}</h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">{room.description}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <Info className="text-emerald-400 flex-shrink-0" size={20} />
            <p className="text-xs">Secure reservation with instant email confirmation.</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
          <div className="p-6 lg:p-12">
            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-in slide-in-from-bottom-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-bold">Booking Confirmed!</h3>
                <p className="mt-2 text-slate-500">A copy of your receipt has been sent to <b>{customerEmail}</b></p>
                <button onClick={onClose} className="mt-8 px-10 py-3 bg-slate-900 text-white rounded-xl font-bold transition-transform active:scale-95">
                  Finish
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reservation Details</h2>
                  <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                    <input 
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      placeholder="John Doe"
                      value={customerName} onChange={e => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Email</label>
                    <input 
                      type="email"
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      placeholder="john@example.com"
                      value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Phone</label>
                    <input 
                      type="tel"
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      placeholder="+91..."
                      value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Check-in</label>
                    <input 
                      type="date" min={today}
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      value={bookingCheckIn} onChange={e => setBookingCheckIn(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Check-out</label>
                    <input 
                      type="date" min={bookingCheckIn || today}
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      value={bookingCheckOut} onChange={e => setBookingCheckOut(e.target.value)}
                    />
                  </div>
                </div>

                {/* Pricing Summary & Confirm Button */}
                <div className="mt-8 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="text-center sm:text-left">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Grand Total</p>
                      <h4 className="text-4xl font-black text-emerald-600 tracking-tighter">{formatCurrency(grandTotal)}</h4>
                    </div>
                    
                    <button
                      type="button" // CRITICAL: Explicitly set to button type
                      onClick={handleConfirmBooking}
                      disabled={!isFormValid || isSubmitting}
                      className="w-full sm:w-auto px-12 py-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><CreditCard size={22}/> Confirm Booking</>
                      )}
                    </button>
                  </div>
                  
                  {submitError && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-100 animate-shake">
                      <AlertCircle size={14} /> {submitError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
