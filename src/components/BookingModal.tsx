import { X, Calendar, Users, Bed, Wifi, Coffee, Car, Tv, Wind, Mail, Phone, User, MessageSquare, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, MapPin, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

// --- Interfaces ---
interface Amenity {
  name: string;
  price: number;
  included: boolean;
}

interface RoomData {
  id: string | number;
  uuid?: string | null;
  name: string;
  image: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  bookable?: boolean;
}

interface BookingModalProps {
  isOpen?: boolean;
  onClose: () => void;
  room: RoomData;
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
  // Form States
  const [bookingCheckIn, setBookingCheckIn] = useState(checkIn);
  const [bookingCheckOut, setBookingCheckOut] = useState(checkOut);
  const [bookingGuests, setBookingGuests] = useState(initialGuests);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Status States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync props to state
  useEffect(() => {
    if (checkIn) setBookingCheckIn(checkIn);
    if (checkOut) setBookingCheckOut(checkOut);
    setBookingGuests(initialGuests);
  }, [checkIn, checkOut, initialGuests]);

  // --- Helpers & Logic ---
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const nights = useMemo(() => {
    if (!bookingCheckIn || !bookingCheckOut) return 0;
    const start = new Date(bookingCheckIn);
    const end = new Date(bookingCheckOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [bookingCheckIn, bookingCheckOut]);

  const pricePerNight = useMemo(() => {
    const base = Number(room.basePrice) || 0;
    const amenitiesTotal = selectedAmenities.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    return base + amenitiesTotal;
  }, [room.basePrice, selectedAmenities]);

  const grandTotal = useMemo(() => pricePerNight * nights, [pricePerNight, nights]);

  // --- Core Function: The Booking Logic ---
  const handleConfirmBooking = async () => {
    // 1. Client-side Validation
    if (!bookingCheckIn || !bookingCheckOut || nights <= 0) {
      setSubmitError("Please select valid stay dates (Check-out must be after Check-in).");
      return;
    }
    if (!customerName || !customerEmail || !customerPhone) {
      setSubmitError("Please fill in your name, email, and phone number.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // 2. DYNAMIC LOOKUP: Find the REAL UUID for this room name
      const { data: roomRecord, error: fetchError } = await supabase
        .from('rooms')
        .select('id')
        .eq('name', room.name) 
        .single();

      if (fetchError || !roomRecord) {
        throw new Error(`Room "${room.name}" was not found in the database. Please ensure it exists in your 'rooms' table.`);
      }

      // 3. INSERT BOOKING: Use the validated roomRecord.id (UUID)
      const { error: dbError } = await supabase
        .from('bookings')
        .insert({
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9', // Your fixed Hotel UUID
          room_id: roomRecord.id, // THE VALID UUID
          guest_name: customerName,
          guest_email: customerEmail,
          guest_phone: customerPhone,
          check_in: bookingCheckIn,
          check_out: bookingCheckOut,
          num_guests: bookingGuests,
          total_price: grandTotal,
          status: 'pending',
          special_requests: specialRequests || ''
        });

      if (dbError) throw dbError;

      // 4. Success State
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("Critical Booking Error:", err);
      setSubmitError(err.message || "Something went wrong while securing your room.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- Success UI ---
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-emerald-50 z-[100] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-3xl p-10 text-center shadow-2xl border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-serif text-neutral-900 mb-2">Booking Reserved!</h2>
          <p className="text-neutral-500 mb-8">Thank you, {customerName}. We've received your request for {room.name}.</p>
          <div className="bg-neutral-50 rounded-2xl p-4 mb-8 text-sm text-left space-y-2 border border-neutral-100">
            <div className="flex justify-between"><span>Check-In:</span> <span className="font-bold">{bookingCheckIn}</span></div>
            <div className="flex justify-between"><span>Check-Out:</span> <span className="font-bold">{bookingCheckOut}</span></div>
            <div className="flex justify-between text-emerald-600 font-bold"><span>Total Paid:</span> <span>{formatCurrency(grandTotal)}</span></div>
          </div>
          <button onClick={onClose} className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // --- Main Modal UI ---
  return (
    <div className="fixed inset-0 bg-white z-[90] overflow-y-auto selection:bg-emerald-100 selection:text-emerald-900">
      {/* Close Button */}
      <button onClick={onClose} className="fixed top-6 right-6 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg z-[110] hover:scale-110 transition-transform">
        <X size={20} />
      </button>

      {/* Hero Banner */}
      <div className="relative h-[40vh] min-h-[300px]">
        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-8">
            <h1 className="text-white text-4xl md:text-6xl font-serif leading-tight">{room.name}</h1>
            <div className="flex items-center gap-4 mt-4 text-white/90 text-sm uppercase tracking-widest">
                <span className="flex items-center gap-2 bg-emerald-600/20 backdrop-blur-md px-3 py-1 rounded-full"><Users size={14}/> {room.maxGuests} Guests</span>
                <span className="flex items-center gap-2"><Bed size={14}/> Luxury Suite</span>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Content Area */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
                <div className="w-10 h-[2px] bg-emerald-600" /> Room Overview
              </h2>
              <p className="text-neutral-600 text-lg leading-relaxed">{room.description}</p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-6">Included Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { icon: <Wifi />, label: "Ultra WiFi" },
                  { icon: <Tv />, label: "Smart TV" },
                  { icon: <Wind />, label: "Air Conditioned" },
                  { icon: <Car />, label: "Valet Parking" },
                  { icon: <Coffee />, label: "Breakfast" },
                  { icon: <ShieldCheck />, label: "Safe Locker" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 group hover:border-emerald-200 transition-colors">
                    <span className="text-emerald-600 group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="text-sm font-semibold text-neutral-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-neutral-900 text-white p-8 lg:p-10 rounded-[2.5rem] sticky top-10 shadow-2xl border border-neutral-800">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-serif mb-2">Reservation</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Secure booking for Hotel Garden</p>
              </div>

              <div className="space-y-4">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-emerald-500 font-bold ml-1">Check-In</label>
                    <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-emerald-500 font-bold ml-1">Check-Out</label>
                    <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3 pt-4">
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl pl-12 py-3.5 text-sm" />
                  </div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input type="email" placeholder="Email Address" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl pl-12 py-3.5 text-sm" />
                  </div>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input type="tel" placeholder="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl pl-12 py-3.5 text-sm" />
                  </div>
                </div>

                {/* Total Display */}
                {nights > 0 && (
                  <div className="bg-emerald-600 p-5 rounded-2xl flex justify-between items-center animate-in slide-in-from-bottom-2">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-white/70">Total for {nights} Night(s)</p>
                        <p className="text-2xl font-black">{formatCurrency(grandTotal)}</p>
                    </div>
                    <ArrowRight size={24} className="opacity-50" />
                  </div>
                )}

                {/* Feedback */}
                {submitError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex gap-2 text-red-500 text-xs">
                    <AlertCircle size={14} className="shrink-0" />
                    <p>{submitError}</p>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="w-full bg-white text-neutral-900 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-neutral-900"
                >
                  {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin" size={16} />
                        Confirming...
                    </>
                  ) : "Confirm Reservation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
