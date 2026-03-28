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
    return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }, [bookingCheckIn, bookingCheckOut]);

  const pricePerNight = useMemo(() => {
    const base = Number(room.basePrice) || 0;
    const amenitiesTotal = selectedAmenities.reduce((sum, amenity) => sum + (Number(amenity.price) || 0), 0);
    return base + amenitiesTotal;
  }, [room.basePrice, selectedAmenities]);

  const grandTotal = useMemo(() => (pricePerNight * nights), [pricePerNight, nights]);

  // Validation Logic
  const validateForm = () => {
    if (!bookingCheckIn || !bookingCheckOut) return "Please select both Check-In and Check-Out dates.";
    if (nights <= 0) return "Check-Out date must be after Check-In date.";
    if (!customerName.trim()) return "Please enter your full name.";
    if (!customerEmail.includes('@')) return "Please enter a valid email address.";
    if (customerPhone.length < 10) return "Please enter a valid phone number.";
    return null;
  };

  const resolveRoomUuid = () => {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
    if (room.uuid && isUuid(room.uuid)) return room.uuid;
    if (typeof room.id === 'string' && isUuid(room.id)) return room.id;
    return String(room.id); // Fallback to ID if not a UUID
  };

  const handleConfirmBooking = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      setSubmitError(errorMsg);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9',
          room_id: resolveRoomUuid(),
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

      if (bookingError) throw new Error(bookingError.message);

      await supabase.functions.invoke('send-booking-email', {
        body: { customerName, customerEmail, roomName: room.name }
      });

      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-emerald-50 z-[100] flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full bg-white p-8 rounded-3xl shadow-xl border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6 text-sm">We've sent a confirmation email to {customerEmail}</p>
          <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto font-sans">
      <button onClick={onClose} className="fixed top-6 right-6 text-gray-700 z-[60] bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
        <X size={24} />
      </button>

      <div className="relative h-[45vh] min-h-[350px]">
        <img src={room.image} alt={room.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">{room.name}</h1>
          <div className="flex gap-6 text-xs uppercase tracking-widest font-medium">
            <span className="flex items-center gap-2"><Users size={16}/> {room.maxGuests} Guests</span>
            <span className="bg-emerald-600 px-3 py-1 rounded">{formatCurrency(pricePerNight)} / Night</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-serif mb-4 text-gray-900 border-l-4 border-emerald-600 pl-4">Description</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{room.description}</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-6 text-gray-900">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 text-gray-700 border border-gray-100">
                <Tv size={24} className="text-emerald-600" /> <span className="text-xs font-semibold">Smart TV</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 text-gray-700 border border-gray-100">
                <Wifi size={24} className="text-emerald-600" /> <span className="text-xs font-semibold">Free WiFi</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 text-gray-700 border border-gray-100">
                <Car size={24} className="text-emerald-600" /> <span className="text-xs font-semibold">Parking</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 text-gray-700 border border-gray-100">
                <Wind size={24} className="text-emerald-600" /> <span className="text-xs font-semibold">AC</span>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-neutral-900 text-white p-8 rounded-3xl sticky top-8 shadow-2xl">
            <h3 className="text-xl font-serif mb-8 text-center tracking-widest uppercase">Reservation</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase px-1">Check-In</label>
                  <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl py-3 px-3 text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase px-1">Check-Out</label>
                  <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl py-3 px-3 text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl pl-10 py-3 text-sm" />
                </div>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" placeholder="Email Address" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl pl-10 py-3 text-sm" />
                </div>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="tel" placeholder="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl pl-10 py-3 text-sm" />
                </div>
              </div>

              {nights > 0 && (
                <div className="mt-6 p-4 bg-emerald-900/20 rounded-2xl border border-emerald-800/30 flex justify-between items-center">
                  <span className="text-xs text-emerald-500 uppercase font-bold">{nights} Nights</span>
                  <span className="text-xl font-bold text-emerald-400">{formatCurrency(grandTotal)}</span>
                </div>
              )}

              {submitError && <p className="text-red-400 text-[11px] text-center bg-red-950/30 py-2 rounded-lg">{submitError}</p>}

              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all mt-4 disabled:opacity-50"
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
