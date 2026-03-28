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
    id: string | number;
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

  useEffect(() => {
    if (checkIn) setBookingCheckIn(checkIn);
    if (checkOut) setBookingCheckOut(checkOut);
  }, [checkIn, checkOut]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const nights = useMemo(() => {
    if (!bookingCheckIn || !bookingCheckOut) return 0;
    const start = new Date(bookingCheckIn);
    const end = new Date(bookingCheckOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [bookingCheckIn, bookingCheckOut]);

  const grandTotal = useMemo(() => {
    const base = Number(room.basePrice) || 0;
    return base * (nights || 1);
  }, [room.basePrice, nights]);

  const handleConfirmBooking = async () => {
    if (!bookingCheckIn || !bookingCheckOut || nights <= 0) {
      setSubmitError("Please select valid stay dates.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // 1. RESOLVE ID - Fixed the query syntax to avoid 400 Bad Request
      let finalRoomId = room.id;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(String(room.id))) {
        // We use .filter to be more explicit and avoid URL malformation
        const { data: dbRoom, error: lookupError } = await supabase
          .from('rooms')
          .select('id')
          .filter('name', 'ilike', room.name.trim())
          .maybeSingle(); // maybeSingle handles "not found" better than .single()

        if (lookupError) throw lookupError;
        
        if (!dbRoom) {
          throw new Error(`Could not find a room matching "${room.name}" in your database. Please check the spelling in Supabase.`);
        }
        finalRoomId = dbRoom.id;
      }

      // 2. INSERT BOOKING
      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9', 
          room_id: finalRoomId,
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

      if (insertError) throw insertError;
      setSubmitSuccess(true);

    } catch (err: any) {
      setSubmitError(err.message || "Database connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6 text-center">
        <div className="max-w-md animate-in fade-in zoom-in">
          <CheckCircle2 size={60} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Confirmed!</h2>
          <p className="text-gray-500 mb-8">Reservation for {room.name} successful.</p>
          <button onClick={onClose} className="w-full bg-black text-white py-4 rounded-xl font-bold">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white/90 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-20">
        <span className="font-bold text-xl tracking-tight uppercase text-emerald-800">Booking Details</span>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={24} /></button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-12">
        {/* Left Side: Room Details */}
        <div className="lg:col-span-7 space-y-8">
          <img src={room.image} className="w-full h-96 object-cover rounded-[2.5rem] shadow-xl" alt={room.name} />
          <h1 className="text-5xl font-serif text-gray-900">{room.name}</h1>
          <p className="text-gray-600 text-lg leading-relaxed">{room.description}</p>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-5">
          <div className="bg-neutral-900 rounded-[2rem] p-8 text-white sticky top-24 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-center uppercase tracking-widest text-emerald-500">Reservation</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Check-In</label>
                  <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl py-3 px-4 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Check-Out</label>
                  <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl py-3 px-4 text-sm" />
                </div>
              </div>

              <input type="text" placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl p-4 text-sm" />
              <input type="email" placeholder="Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl p-4 text-sm" />
              <input type="tel" placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl p-4 text-sm" />

              {nights > 0 && (
                <div className="bg-emerald-600/20 border border-emerald-500/30 p-4 rounded-xl flex justify-between items-center">
                  <span className="text-xs uppercase font-bold text-emerald-400">{nights} Night(s)</span>
                  <span className="text-xl font-bold">₹{grandTotal.toLocaleString()}</span>
                </div>
              )}

              {submitError && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-2 text-red-400 text-xs">
                  <AlertCircle size={14} className="mt-0.5" />
                  <p>{submitError}</p>
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Working...</> : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
