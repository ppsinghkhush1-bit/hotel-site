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
    id: string; // This is your UUID in the database
    room_type: string; // Mapped from your 'room_type' column
    image_url: string; // Mapped from your 'image_url' column
    description: string;
    price_per_night: number; // Mapped from your 'price_per_night' column
    max_occupancy: number; // Mapped from your 'max_occupancy' column
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
    const base = Number(room.price_per_night) || 0;
    const amenitiesTotal = selectedAmenities.reduce((sum, amenity) => sum + (Number(amenity.price) || 0), 0);
    return base + amenitiesTotal;
  }, [room.price_per_night, selectedAmenities]);

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
    if (bookingGuests < room.max_occupancy) setBookingGuests(prev => Math.min(prev + 1, room.max_occupancy));
  };

  const decrementGuests = () => {
    if (bookingGuests > 1) setBookingGuests(prev => prev - 1);
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

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9',
          room_id: room.id, // Database shows 'id' is already a UUID
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

      // Trigger Edge Function (Ensure this function handles the correct naming)
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-booking-email', {
        body: {
          customerName,
          customerEmail,
          roomName: room.room_type
        }
      });

      if (emailError || !emailData?.success) {
        console.warn('Email warning:', emailData?.error || emailError?.message);
        // We don't throw here so the user doesn't think the booking failed if only the email failed
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
            <p className="text-gray-700 mb-3">
              Thank you for your booking, <span className="font-semibold text-emerald-600">{customerName}</span>
            </p>
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm text-gray-600 text-left">
              <p><strong>Room:</strong> {room.room_type}</p>
              <p><strong>Check-in:</strong> {new Date(bookingCheckIn).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> {new Date(bookingCheckOut).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> {formatCurrency(grandTotal)}</p>
            </div>
          </div>
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
        <img src={room.image_url} alt={room.room_type} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-12 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-serif mb-4">{room.room_type}</h1>
            <div className="flex items-center gap-8 text-sm uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>{room.max_occupancy} Guests</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{formatCurrency(pricePerNight)}</span>
                <span className="text-base">/ Per Night</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <section className="mb-12">
              <h2 className="text-3xl font-serif mb-6 text-gray-900">Description</h2>
              <p className="text-gray-700 leading-relaxed">{room.description}</p>
            </section>
            {/* ... rest of your amenities sections ... */}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-neutral-900 text-white p-8 rounded-lg sticky top-6">
              <h3 className="text-2xl font-serif mb-8 text-center uppercase tracking-wider">Booking</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-2">Check-In</label>
                  <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-3" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-2">Check-Out</label>
                  <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-3" />
                </div>

                <div className="pt-4">
                    <label className="block text-xs text-gray-400 uppercase mb-2">Guests</label>
                    <div className="flex items-center justify-between bg-neutral-800 p-3 rounded">
                        <button onClick={decrementGuests}>-</button>
                        <span>{bookingGuests}</span>
                        <button onClick={incrementGuests}>+</button>
                    </div>
                </div>

                <div className="space-y-4 pt-6">
                    <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-3" />
                    <input type="email" placeholder="Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-3" />
                    <input type="tel" placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded p-3" />
                </div>

                {submitError && <p className="text-red-400 text-sm mt-4">{submitError}</p>}

                <button
                  onClick={handleConfirmBooking}
                  disabled={!isFormValid || isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 py-4 rounded-lg font-bold mt-6 uppercase tracking-widest transition-colors"
                >
                  {isSubmitting ? 'Processing...' : `Pay ${formatCurrency(grandTotal)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
