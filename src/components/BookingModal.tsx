import {
  X, Calendar, Users, Bed, Wifi, Coffee, Car, Tv, Wind,
  Mail, Phone, User, MessageSquare
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
  room: {
    id: number;
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

  const formatCurrency = (value: number | undefined | null) => {
    if (value == null || !Number.isFinite(value)) return '0';
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

    if (start >= end) return 0;

    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [bookingCheckIn, bookingCheckOut]);

  const pricePerNight = useMemo(() => {
    const base = Number(room.basePrice) || 0;
    const amenities = selectedAmenities.reduce(
      (sum, a) => sum + (Number(a.price) || 0),
      0
    );
    return base + amenities;
  }, [room.basePrice, selectedAmenities]);

  const grandTotal = useMemo(() => {
    return nights > 0 ? pricePerNight * nights : 0;
  }, [pricePerNight, nights]);

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Booking Confirmed</h2>
          <p className="mt-4">Thank you, {customerName}</p>
          <button onClick={onClose} className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  const isFormValid =
    customerName &&
    customerEmail &&
    customerPhone &&
    bookingCheckIn &&
    bookingCheckOut &&
    nights > 0 &&
    grandTotal > 0;

  const incrementGuests = () => {
    setBookingGuests(prev => Math.min(prev + 1, room.maxGuests));
  };

  const decrementGuests = () => {
    setBookingGuests(prev => Math.max(prev - 1, 1));
  };

  const handleConfirmBooking = async () => {
    try {
      if (!isFormValid) return;

      setIsSubmitting(true);
      setSubmitError(null);

      // Validate room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('id', room.id)
        .maybeSingle();

      if (roomError) throw roomError;
      if (!roomData) throw new Error('Room not found');

      // Insert booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9',
          room_id: roomData.id,
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

      if (bookingError) throw bookingError;

      // Send email (correct Supabase way)
      const { error: emailError } = await supabase.functions.invoke(
        'send-booking-email',
        {
          body: {
            customerName,
            customerEmail,
            roomName: room.name
          }
        }
      );

      if (emailError) throw emailError;

      setSubmitSuccess(true);

    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">

      <button onClick={onClose} className="fixed top-4 right-4">
        <X />
      </button>

      <div className="p-6 max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold">{room.name}</h1>

        <p className="mt-4">{room.description}</p>

        <div className="mt-6">
          <label>Check-In</label>
          <input type="date" value={bookingCheckIn}
            min={today}
            onChange={(e) => setBookingCheckIn(e.target.value)} />
        </div>

        <div className="mt-4">
          <label>Check-Out</label>
          <input type="date" value={bookingCheckOut}
            min={bookingCheckIn || today}
            onChange={(e) => setBookingCheckOut(e.target.value)} />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button onClick={decrementGuests}>-</button>
          <span>{bookingGuests}</span>
          <button onClick={incrementGuests}>+</button>
        </div>

        <div className="mt-6">
          <p>Total: {formatCurrency(grandTotal)}</p>
        </div>

        <button
          onClick={handleConfirmBooking}
          disabled={!isFormValid || isSubmitting}
          className="mt-6 bg-emerald-600 text-white px-6 py-3"
        >
          {isSubmitting ? 'Processing...' : 'Confirm Booking'}
        </button>

        {submitError && <p className="text-red-500 mt-4">{submitError}</p>}

      </div>
    </div>
  );
}
