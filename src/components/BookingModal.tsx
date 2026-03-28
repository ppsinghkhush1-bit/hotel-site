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
    booking_id?: string | null;
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

  const resolveBookingRoomId = () => {
    const candidates = [room.uuid, room.booking_id, String(room.id)];
    for (const value of candidates) {
      const clean = typeof value === 'string' ? value.trim() : '';
      if (clean && isUuid(clean)) return clean;
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

      const bookingRoomId = resolveBookingRoomId();

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9',
          room_id: bookingRoomId,
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
          <div className="lg:col-span-2">{/* unchanged left section */}</div>

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

              {/* keep the rest of your UI exactly the same, only buttons are type="button" */}
              {/* ...reuse your existing JSX below unchanged... */}

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
