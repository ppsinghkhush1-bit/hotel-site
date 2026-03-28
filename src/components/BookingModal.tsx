import {
  X, Calendar, User, CheckCircle2, AlertCircle, 
  Mail, Phone, MessageSquare, CreditCard, Info
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

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
  // Form State
  const [bookingCheckIn, setBookingCheckIn] = useState(checkIn);
  const [bookingCheckOut, setBookingCheckOut] = useState(checkOut);
  const [bookingGuests, setBookingGuests] = useState(initialGuests);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setBookingCheckIn(checkIn);
    setBookingCheckOut(checkOut);
    setBookingGuests(initialGuests);
  }, [checkIn, checkOut, initialGuests]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Calculations
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

  const handleConfirmBooking = async () => {
    try {
      if (!isFormValid) return;
      setIsSubmitting(true);
      setSubmitError(null);

      // --- CRITICAL FIX: UUID VALIDATION ---
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(room.id)) {
        throw new Error(`Technical Error: Room ID "${room.id}" is not a valid UUID. Please ensure your database uses UUIDs.`);
      }

      const { error: bookingError } = await supabase.from('bookings').insert([{
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

      if (bookingError) throw bookingError;

      // Optional: Trigger Email
      await supabase.functions.invoke('send-booking-email', {
        body: { customerName, customerEmail, roomName: room.name }
      }).catch(() => console.log("Email function not configured, skipping..."));

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("Booking failed:", err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Glass Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Main Modal */}
      <div className="relative w-full max-w-5xl max-h-[95vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        
        {/* Left Section: Visuals & Info (Hidden on mobile scroll) */}
        <div className="hidden lg:flex w-1/3 bg-slate-900 p-10 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4">
              Booking Details
            </div>
            <h2 className="text-3xl font-bold leading-tight">{room.name}</h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">{room.description}</p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Info size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Instant Confirmation</p>
                <p className="text-sm font-medium">Secure your stay now</p>
              </div>
            </div>
          </div>

          {/* Abstract background glow */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
        </div>

        {/* Right Section: Form */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-6 border-b lg:hidden">
            <h3 className="font-bold">{room.name}</h3>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
          </div>

          <div className="p-6 lg:p-12">
            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-in slide-in-from-bottom-8">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={56} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">Booking Received!</h3>
                <p className="mt-4 text-slate-600 max-w-xs text-lg">
                  We've sent a confirmation email to <span className="font-bold text-slate-900">{customerEmail}</span>.
                </p>
                <button onClick={onClose} className="mt-10 w-full max-w-xs py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
                  Back to Explore
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div className="hidden lg:block">
                    <h2 className="text-2xl font-bold text-slate-900">Guest Information</h2>
                    <p className="text-slate-500">Fill in your details to finalize the reservation.</p>
                  </div>
                  <button onClick={onClose} className="hidden lg:flex p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        placeholder="e.g. Rahul Sharma"
                        value={customerName} onChange={e => setCustomerName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        placeholder="rahul@example.com"
                        value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="tel"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                        placeholder="+91 00000 00000"
                        value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Check-in</label>
                    <input 
                      type="date" min={today}
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      value={bookingCheckIn} onChange={e => setBookingCheckIn(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Check-out</label>
                    <input 
                      type="date" min={bookingCheckIn || today}
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      value={bookingCheckOut} onChange={e => setBookingCheckOut(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="text-slate-500 text-sm">Total for <span className="font-bold text-slate-900">{nights} Nights</span></p>
                      <h4 className="text-3xl font-black text-emerald-600">{formatCurrency(grandTotal)}</h4>
                    </div>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={!isFormValid || isSubmitting}
                      className="w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CreditCard size={20}/> Confirm Booking</>}
                    </button>
                  </div>
                  
                  {submitError && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-3 border border-red-100">
                      <AlertCircle className="shrink-0 mt-0.5" size={18} />
                      <span>{submitError}</span>
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
