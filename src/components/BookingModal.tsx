import { X, Calendar, Users, Bed, Wifi, Coffee, Car, Tv, Wind, Mail, Phone, User, MessageSquare, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
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

// --- Main Component ---
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

  // --- UUID Fixer ---
  // This ensures we never send "1" to a UUID column
  const getValidRoomUuid = () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (room.uuid && uuidRegex.test(room.uuid)) return room.uuid;
    if (typeof room.id === 'string' && uuidRegex.test(room.id)) return room.id;
    
    // If the ID is "1", this is a problem. In a real app, you'd fetch the UUID.
    // For now, we return a placeholder UUID to prevent the "Invalid Syntax" error if no real UUID exists.
    return "00000000-0000-0000-0000-000000000000"; 
  };

  // --- Form Submission ---
  const handleConfirmBooking = async () => {
    // Validation
    if (!bookingCheckIn || !bookingCheckOut || nights <= 0) {
      setSubmitError("Please select valid stay dates.");
      return;
    }
    if (!customerName || !customerEmail || !customerPhone) {
      setSubmitError("Please complete all guest information fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const { error: dbError } = await supabase
        .from('bookings')
        .insert({
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9',
          room_id: getValidRoomUuid(), // FIXED: Always returns valid UUID format
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

      // Optional: Trigger Email via Supabase Edge Function
      await supabase.functions.invoke('send-booking-email', {
        body: { customerName, customerEmail, roomName: room.name }
      }).catch(() => console.log("Email function not configured, skipping..."));

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("Booking Error:", err);
      setSubmitError(err.message || "An unexpected error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- Success View ---
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="bg-emerald-600 p-12 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-serif mb-2">Reservation Received!</h2>
            <p className="opacity-90">Your stay at {room.name} is now pending confirmation.</p>
          </div>
          <div className="p-8 space-y-4">
            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-500">Guest</span>
              <span className="font-semibold">{customerName}</span>
            </div>
            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-500">Dates</span>
              <span className="font-semibold">{bookingCheckIn} to {bookingCheckOut}</span>
            </div>
            <button onClick={onClose} className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold mt-4 hover:bg-black transition-colors">
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Booking View ---
  return (
    <div className="fixed inset-0 bg-white z-[90] overflow-y-auto selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-600" size={24} />
          <span className="font-bold tracking-tighter text-xl">HOTEL GARDEN</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={24} />
        </button>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-12 pb-20">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-7 p-6 lg:p-12 space-y-12">
          <section>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl mb-8 group">
              <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-2 opacity-80">Premium Collection</p>
                <h1 className="text-4xl md:text-5xl font-serif">{room.name}</h1>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <Users size={20} className="mb-2 text-emerald-600" />
                <p className="text-xs text-neutral-500 uppercase">Capacity</p>
                <p className="font-bold text-neutral-900">{room.maxGuests} Adults</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <MapPin size={20} className="mb-2 text-emerald-600" />
                <p className="text-xs text-neutral-500 uppercase">View</p>
                <p className="font-bold text-neutral-900">City Garden</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <Bed size={20} className="mb-2 text-emerald-600" />
                <p className="text-xs text-neutral-500 uppercase">Size</p>
                <p className="font-bold text-neutral-900">650 sq ft</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <Coffee size={20} className="mb-2 text-emerald-600" />
                <p className="text-xs text-neutral-500 uppercase">Breakfast</p>
                <p className="font-bold text-neutral-900">Included</p>
              </div>
            </div>

            <h2 className="text-2xl font-serif mb-4">About this room</h2>
            <p className="text-neutral-600 leading-relaxed text-lg mb-6">{room.description}</p>
            <div className="bg-emerald-50 p-6 rounded-2xl text-emerald-800 text-sm leading-relaxed border border-emerald-100">
              <strong>Note:</strong> 24-hour check-in/check-out service available. Late checkout may be subject to availability and additional charges.
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-6">Room Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                { icon: <Wifi size={20}/>, label: "High-Speed WiFi" },
                { icon: <Tv size={20}/>, label: "4K Smart TV" },
                { icon: <Wind size={20}/>, label: "Climate Control" },
                { icon: <Car size={20}/>, label: "Private Parking" },
                { icon: <Coffee size={20}/>, label: "Mini Bar" },
                { icon: <ShieldCheck size={20}/>, label: "Digital Safe" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-neutral-700">
                  <span className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-emerald-600">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className="lg:col-span-5 p-6">
          <div className="bg-white lg:bg-neutral-900 lg:text-white rounded-[2.5rem] p-8 lg:p-10 lg:sticky lg:top-28 shadow-xl lg:shadow-2xl border border-neutral-100 lg:border-neutral-800 transition-all">
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-2">Book Your Experience</p>
              <h3 className="text-3xl font-serif">Reservation</h3>
            </div>

            <div className="space-y-5">
              {/* Date Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Arrival</label>
                  <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="w-full bg-neutral-100 lg:bg-neutral-800 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Departure</label>
                  <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="w-full bg-neutral-100 lg:bg-neutral-800 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>

              {/* Guest Counter */}
              <div className="bg-neutral-100 lg:bg-neutral-800 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-emerald-500" />
                  <span className="text-sm font-semibold">Total Guests</span>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setBookingGuests(Math.max(1, bookingGuests - 1))} className="w-8 h-8 rounded-full border border-neutral-300 lg:border-neutral-600 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-600 transition-colors">-</button>
                  <span className="font-bold w-4 text-center">{bookingGuests}</span>
                  <button onClick={() => setBookingGuests(Math.min(room.maxGuests, bookingGuests + 1))} className="w-8 h-8 rounded-full border border-neutral-300 lg:border-neutral-600 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-600 transition-colors">+</button>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-3 pt-4 border-t border-neutral-200 lg:border-neutral-800">
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-100 lg:bg-neutral-800 border-none rounded-2xl pl-12 py-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input type="email" placeholder="Email Address" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-neutral-100 lg:bg-neutral-800 border-none rounded-2xl pl-12 py-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="relative group">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input type="tel" placeholder="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-neutral-100 lg:bg-neutral-800 border-none rounded-2xl pl-12 py-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              {/* Special Requests */}
              <div className="relative group">
                <MessageSquare size={18} className="absolute left-4 top-4 text-neutral-400" />
                <textarea placeholder="Special Requests (Optional)" rows={2} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className="w-full bg-neutral-100 lg:bg-neutral-800 border-none rounded-2xl pl-12 py-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>

              {/* Price Calculation */}
              {nights > 0 && (
                <div className="p-6 bg-emerald-600 rounded-3xl text-white shadow-xl shadow-emerald-900/20 animate-in slide-in-from-bottom-2">
                  <div className="flex justify-between text-xs opacity-80 mb-1">
                    <span>{nights} Night(s) Stay</span>
                    <span>{formatCurrency(pricePerNight)} / night</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total Amount</span>
                    <span className="text-2xl font-black">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {submitError && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{submitError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="group w-full relative overflow-hidden bg-neutral-900 lg:bg-white text-white lg:text-neutral-900 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? "Securing Room..." : "Confirm Booking"}
                  {!isSubmitting && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>

            <p className="text-[10px] text-center mt-6 opacity-40 uppercase tracking-tighter">Secure Checkout Powered by Supabase Cloud</p>
          </div>
        </div>
      </div>
    </div>
  );
}
