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

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  const resolveRoomUuid = () => {
    const candidates = [
      typeof room.uuid === 'string' ? room.uuid.trim() : '',
      String(room.id).trim()
    ].filter(Boolean);

    for (const candidate of candidates) {
      if (isUuid(candidate)) return candidate;
    }

    throw new Error('Room UUID is missing. Please ensure the room record includes a UUID.');
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

      const roomUuid = resolveRoomUuid();

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9',
          room_id: roomUuid,
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

      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-booking-email', {
        body: {
          customerName,
          customerEmail,
          roomName: room.name
        }
      });

      if (emailError || !emailData?.success) {
        throw new Error(emailData?.error || emailError?.message || 'Email failed');
      }

      setSubmitSuccess(true);
    } catch (err: unknown) {
      console.error('FULL ERROR:', err);
      setSubmitError((err as Error).message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100 z-50 flex items-center justify-center">
        <div className="text-center px-8 max-w-md">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Gilda Display', serif" }}>
            Booking Confirmed!
          </h2>
          <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
            <p className="text-gray-700 mb-3" style={{ fontFamily: "'Roboto', sans-serif" }}>
              Thank you for your booking, <span className="font-semibold text-emerald-600">{customerName}</span>
            </p>
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm text-gray-600">
              <p><strong>Room:</strong> {room.name}</p>
              <p><strong>Check-in:</strong> {new Date(bookingCheckIn).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Check-out:</strong> {new Date(bookingCheckOut).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Total Amount:</strong> {formatCurrency(grandTotal)}</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm" style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 300 }}>
            A confirmation email has been sent to <span className="font-medium">{customerEmail}</span>
          </p>
          <button type="button" onClick={onClose} className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-medium">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <button type="button" onClick={onClose} className="fixed top-6 right-6 text-gray-700 hover:text-gray-900 transition-colors z-10 bg-white rounded-full p-2 shadow-lg">
        <X size={24} />
      </button>

      <div className="relative h-[60vh] min-h-[500px]">
        <img src={room.image} alt={room.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        <div className="absolute bottom-0 left-0 right-0 px-8 pb-12 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-serif mb-4">{room.name}</h1>
            <div className="flex items-center gap-8 text-sm uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>{room.maxGuests} Guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed size={18} />
                <span>660 Ft²</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{formatCurrency(pricePerNight)}</span>
                <span className="text-base">/ Per Night</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <section className="mb-12">
              <h2 className="text-3xl font-serif mb-6 text-gray-900">Description</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{room.description}</p>
              <p className="text-gray-700 leading-relaxed">
                A cozy and comfortable room well suited for business travelers and gives you an aesthetic view of this city.
                High ceiling, well-ventilated rooms equipped with TV, coffee maker, hairdryer, newspaper and 24/7 service from our staff, will enable you to enjoy your stay.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-serif mb-6 text-gray-900">Room Services</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-700"><Tv size={20} className="text-gray-500" /><span>Television</span></div>
                <div className="flex items-center gap-3 text-gray-700"><Wifi size={20} className="text-gray-500" /><span>Wifi</span></div>
                <div className="flex items-center gap-3 text-gray-700"><Wind size={20} className="text-gray-500" /><span>No Smoking</span></div>
                <div className="flex items-center gap-3 text-gray-700"><Car size={20} className="text-gray-500" /><span>Car Booking</span></div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-serif mb-4 text-gray-900">Booking Details</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3"><Coffee size={18} className="text-gray-500 mt-0.5 flex-shrink-0" /><span>The rates are inclusive of Buffet breakfast.</span></div>
                <div className="flex items-start gap-3"><Calendar size={18} className="text-gray-500 mt-0.5 flex-shrink-0" /><span>24 hr Check-in / Check out.</span></div>
                <div className="flex items-start gap-3"><Users size={18} className="text-gray-500 mt-0.5 flex-shrink-0" /><span>12 noon Check-in / Check out for Group Arrival.</span></div>
                <div className="flex items-start gap-3"><span className="text-gray-500 mt-0.5 flex-shrink-0">₹</span><span>Taxes as applicable</span></div>
                <div className="flex items-start gap-3"><Users size={18} className="text-gray-500 mt-0.5 flex-shrink-0" /><span>Extra person above 10 years are charge 1500 Net (Inclusive Breakfast).</span></div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-neutral-900 text-white p-6 sm:p-8 lg:sticky lg:top-6 w-full lg:max-w-md max-h-screen lg:max-h-screen overflow-y-auto rounded-lg">
              <h3 className="text-2xl font-serif mb-8 text-center uppercase tracking-wider">Complete Your Booking</h3>

              <div className="space-y-5 mb-6 relative z-10">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Check-In Date</label>
                  <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Check-Out Date</label>
                  <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                </div>
              </div>

              {bookingCheckIn && bookingCheckOut && nights > 0 && (
                <div className="mb-6 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-white font-semibold">{nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Number of Guests</label>
                <div className="flex items-center justify-between bg-neutral-800 border border-neutral-700 rounded-lg px-6 py-4">
                  <button type="button" onClick={decrementGuests} disabled={bookingGuests <= 1} className="text-2xl text-white hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">−</button>
                  <div className="flex items-center gap-3 text-white"><Users size={20} /><span className="font-bold text-2xl">{bookingGuests}</span></div>
                  <button type="button" onClick={incrementGuests} disabled={bookingGuests >= room.maxGuests} className="text-2xl text-white hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                </div>
              </div>

              <div className="space-y-5 mb-6">
                <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Guest Information</h4>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">Full Name *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter your full name" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">Special Requests (Optional)</label>
                  <div className="relative">
                    <MessageSquare size={18} className="absolute left-3 top-3 text-gray-500 pointer-events-none" />
                    <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Any special requirements..." rows={3} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none" />
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-red-300 font-semibold text-sm mb-1">Booking Failed</h4>
                      <p className="text-red-200 text-xs leading-relaxed">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmBooking();
                }}
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 font-semibold uppercase tracking-widest transition-all text-sm rounded-lg"
              >
                {isSubmitting ? 'Processing Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
Room UUID is missing. Please ensure the room record includes a UUID. fix this and make same desgin with no error
