import { X, Calendar, Users, Bed, Wifi, Coffee, Car, Tv, Wind, Mail, Phone, User, MessageSquare } from 'lucide-react';
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
    id: string | number;
    uuid?: string | null;
    name: string;
    image: string;
    description: string;
    basePrice: number;
    maxGuests: number;
    bookable?: boolean;
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

  useEffect(() => {
    setBookingCheckIn(checkIn);
    setBookingCheckOut(checkOut);
    setBookingGuests(initialGuests);
  }, [checkIn, checkOut, initialGuests]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const formatCurrency = (value: number | undefined | null): string => {
    if (value == null || !Number.isFinite(value)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const nights = useMemo(() => {
    if (!bookingCheckIn || !bookingCheckOut) return 0;
    const start = new Date(`${bookingCheckIn}T00:00:00`);
    const end = new Date(`${bookingCheckOut}T00:00:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    if (start >= end) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [bookingCheckIn, bookingCheckOut]);

  const pricePerNight = useMemo(() => {
    const base = Number(room.basePrice) || 0;
    const amenitiesTotal = selectedAmenities.reduce((sum, amenity) => sum + (Number(amenity.price) || 0), 0);
    return base + amenitiesTotal;
  }, [room.basePrice, selectedAmenities]);

  const grandTotal = useMemo(() => {
    if (!pricePerNight || !nights) return 0;
    return pricePerNight * nights;
  }, [pricePerNight, nights]);

  const isFormValid =
    customerName.trim() !== '' &&
    customerEmail.trim() !== '' &&
    customerPhone.trim() !== '' &&
    bookingCheckIn !== '' &&
    bookingCheckOut !== '' &&
    nights > 0 &&
    Number.isFinite(grandTotal) &&
    grandTotal > 0;

  const incrementGuests = () => {
    if (bookingGuests < room.maxGuests) setBookingGuests(prev => Math.min(prev + 1, room.maxGuests));
  };

  const decrementGuests = () => {
    if (bookingGuests > 1) setBookingGuests(prev => prev - 1);
  };

  // Improved UUID Resolver: It now attempts to find a UUID but falls back to the ID safely
  const resolveRoomId = () => {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
    
    if (room.uuid && isUuid(room.uuid)) return room.uuid;
    if (typeof room.id === 'string' && isUuid(room.id)) return room.id;
    
    // Fallback: If your DB allows non-UUID strings or numbers
    return String(room.id);
  };

  const handleConfirmBooking = async () => {
    try {
      if (room.bookable === false) {
        setSubmitError('Room not available');
        return;
      }

      if (!isFormValid) return;

      setIsSubmitting(true);
      setSubmitError(null);

      const roomId = resolveRoomId();

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9',
          room_id: roomId, // Using resolved ID
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

      if (bookingError) throw new Error('Booking failed: ' + bookingError.message);

      // Edge Function Call
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-booking-email', {
        body: {
          customerName,
          customerEmail,
          roomName: room.name,
          checkIn: bookingCheckIn,
          checkOut: bookingCheckOut,
          totalAmount: grandTotal
        }
      });

      // We make email failure non-blocking for the UI success state
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error('FULL ERROR:', err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100 z-[60] flex items-center justify-center p-4">
        <div className="text-center w-full max-w-md">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Booking Confirmed!</h2>
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-6 text-left border border-emerald-100">
            <p className="text-gray-700 mb-4">
              Thank you, <span className="font-semibold text-emerald-600">{customerName}</span>. Your stay at {room.name} is reserved.
            </p>
            <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
              <div className="flex justify-between"><span>Check-in:</span> <span className="font-medium text-gray-900">{bookingCheckIn}</span></div>
              <div className="flex justify-between"><span>Check-out:</span> <span className="font-medium text-gray-900">{bookingCheckOut}</span></div>
              <div className="flex justify-between"><span>Total:</span> <span className="font-bold text-emerald-700">{formatCurrency(grandTotal)}</span></div>
            </div>
          </div>
          <button onClick={onClose} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <button type="button" onClick={onClose} className="fixed top-6 right-6 text-gray-700 hover:text-gray-900 transition-colors z-[60] bg-white/80 backdrop-blur rounded-full p-2 shadow-lg">
        <X size={24} />
      </button>

      {/* Hero Image Section */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img src={room.image} alt={room.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-12 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-serif mb-4 leading-tight">{room.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-widest opacity-90">
              <div className="flex items-center gap-2"><Users size={16} /><span>{room.maxGuests} Max Guests</span></div>
              <div className="flex items-center gap-2"><Bed size={16} /><span>Premium Suite</span></div>
              <div className="flex items-center gap-2 bg-emerald-600 px-3 py-1 rounded text-white font-bold">
                <span className="text-lg">{formatCurrency(pricePerNight)}</span>
                <span className="lowercase opacity-80 font-normal">/night</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Content Left */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-serif mb-6 text-gray-900 flex items-center gap-3">
                <div className="w-8 h-[1px] bg-emerald-600"></div> Room Description
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-4">{room.description}</p>
              <p className="text-gray-600 leading-relaxed">
                Experience luxury with our high-ceiling, well-ventilated rooms. Equipped with high-speed WiFi, coffee maker, and 24/7 room service to ensure your stay is seamless.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-6 text-gray-900">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl items-center text-center">
                    <Tv size={24} className="text-emerald-600" />
                    <span className="text-sm font-medium">Smart TV</span>
                </div>
                <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl items-center text-center">
                    <Wifi size={24} className="text-emerald-600" />
                    <span className="text-sm font-medium">Free WiFi</span>
                </div>
                <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl items-center text-center">
                    <Car size={24} className="text-emerald-600" />
                    <span className="text-sm font-medium">Parking</span>
                </div>
                <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl items-center text-center">
                    <Wind size={24} className="text-emerald-600" />
                    <span className="text-sm font-medium">Air Cooled</span>
                </div>
              </div>
            </section>
          </div>

          {/* Sticky Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 text-white p-8 lg:sticky lg:top-8 rounded-3xl shadow-2xl border border-neutral-800">
              <h3 className="text-xl font-serif mb-8 text-center uppercase tracking-widest">Reservation</h3>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-2">Check-In</label>
                        <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-2">Check-Out</label>
                        <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 uppercase mb-2">Guests</label>
                  <div className="flex items-center justify-between bg-neutral-800 rounded-xl px-4 py-2">
                    <button type="button" onClick={decrementGuests} className="w-10 h-10 flex items-center justify-center text-xl hover:text-emerald-500">−</button>
                    <span className="font-bold">{bookingGuests}</span>
                    <button type="button" onClick={incrementGuests} className="w-10 h-10 flex items-center justify-center text-xl hover:text-emerald-500">+</button>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl pl-10 py-3 text-sm" />
                    </div>
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="email" placeholder="Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl pl-10 py-3 text-sm" />
                    </div>
                    <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="tel" placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl pl-10 py-3 text-sm" />
                    </div>
                </div>
              </div>

              {nights > 0 && (
                <div className="mb-6 p-4 bg-emerald-950/30 rounded-2xl border border-emerald-900/50">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-emerald-500">Total for {nights} night(s)</span>
                      <span className="text-xl font-bold text-emerald-400">{formatCurrency(grandTotal)}</span>
                   </div>
                </div>
              )}

              {submitError && (
                <p className="text-red-400 text-xs mb-4 text-center">{submitError}</p>
              )}

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-900/20"
              >
                {isSubmitting ? 'Processing...' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
