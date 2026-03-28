import { X, Calendar, Users, Bed, Wifi, Coffee, Car, Tv, Wind, Mail, Phone, User, MessageSquare, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
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
  room: {
    id: string; // This MUST be the UUID from Supabase
    name: string;
    image: string;
    description: string;
    basePrice: number;
    maxGuests: number;
  };
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

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const nights = useMemo(() => {
    if (!bookingCheckIn || !bookingCheckOut) return 0;
    const start = new Date(bookingCheckIn);
    const end = new Date(bookingCheckOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [bookingCheckIn, bookingCheckOut]);

  const grandTotal = useMemo(() => {
    const amenityPrice = selectedAmenities.reduce((sum, a) => sum + (a.price || 0), 0);
    return (room.basePrice + amenityPrice) * (nights || 1);
  }, [room.basePrice, selectedAmenities, nights]);

  const handleConfirmBooking = async () => {
    if (!bookingCheckIn || !bookingCheckOut || !customerName || !customerEmail) {
      setSubmitError("Please complete all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const { error } = await supabase
        .from('bookings')
        .insert({
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9', // Replace with your actual Hotel UUID
          room_id: room.id, // Direct UUID usage
          guest_name: customerName,
          guest_email: customerEmail,
          guest_phone: customerPhone,
          check_in: bookingCheckIn,
          check_out: bookingCheckOut,
          num_guests: bookingGuests,
          total_price: grandTotal,
          status: 'pending',
          special_requests: specialRequests
        });

      if (error) throw error;
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6 text-center">
        <div className="max-w-md animate-in zoom-in-95 duration-300">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <h2 className="text-4xl font-serif mb-4">Reservation Placed!</h2>
          <p className="text-gray-500 mb-10 leading-relaxed">We've received your request for the <strong>{room.name}</strong>. A confirmation email will be sent shortly.</p>
          <button onClick={onClose} className="w-full bg-black text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-xs transition-transform active:scale-95">Close & Return</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto font-sans selection:bg-emerald-100">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b px-8 py-5 flex justify-between items-center z-10">
        <span className="font-bold tracking-tighter text-xl">HG <span className="text-emerald-600">RESERVATIONS</span></span>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16 pb-20">
        
        {/* Left Side: Images & Info */}
        <div className="lg:col-span-7 p-8 lg:p-12 space-y-12">
          <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[16/10]">
            <img src={room.image} className="w-full h-full object-cover" alt={room.name} />
          </div>

          <div>
            <h1 className="text-5xl font-serif mb-6 text-gray-900">{room.name}</h1>
            <p className="text-gray-600 text-xl leading-relaxed font-light">{room.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 border-y py-12 border-gray-100">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-emerald-600"><Wifi size={20} /></div>
              <span className="font-semibold text-sm">Gigabit WiFi</span>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-emerald-600"><Tv size={20} /></div>
              <span className="font-semibold text-sm">Smart TV</span>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-emerald-600"><Wind size={20} /></div>
              <span className="font-semibold text-sm">Climate Control</span>
            </div>
          </div>
        </div>

        {/* Right Side: Sticky Booking Card */}
        <div className="lg:col-span-5 p-8">
          <div className="bg-neutral-900 rounded-[3rem] p-10 text-white shadow-2xl sticky top-28">
            <h3 className="text-2xl font-serif mb-8 text-center">Secure Stay</h3>
            
            <div className="space-y-6">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Check-In</label>
                  <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Check-Out</label>
                  <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              {/* Guest Details */}
              <div className="space-y-3">
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" placeholder="Your Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl pl-12 py-4 text-sm" />
                </div>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" placeholder="Email for Confirmation" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl pl-12 py-4 text-sm" />
                </div>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="tel" placeholder="Contact Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-neutral-800 border-none rounded-2xl pl-12 py-4 text-sm" />
                </div>
              </div>

              {/* Total Summary */}
              {nights > 0 && (
                <div className="bg-emerald-600 rounded-3xl p-6 flex justify-between items-center transition-all animate-in fade-in slide-in-from-bottom-2">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-emerald-100">Total Price</p>
                    <p className="text-3xl font-black tracking-tight">₹{grandTotal.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-emerald-100">{nights} Nights</p>
                    <p className="text-sm opacity-80">Inclusive of Tax</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex gap-3 text-red-400 text-xs">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{submitError}</p>
                </div>
              )}

              {/* Booking Button */}
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-emerald-500 hover:text-white flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl"
              >
                {isSubmitting ? <><Loader2 className="animate-spin" /> Processing</> : <>Book Now <ArrowRight size={16} /></>}
              </button>
            </div>
            <p className="text-[9px] text-center mt-6 text-gray-600 tracking-widest uppercase">Verified Secure Booking System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
