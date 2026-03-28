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

  // --- THE CRITICAL FIX FOR THE "1" ERROR ---
  const handleConfirmBooking = async () => {
    if (!bookingCheckIn || !bookingCheckOut || nights <= 0) {
      setSubmitError("Please select valid stay dates.");
      return;
    }
    if (!customerName || !customerEmail) {
      setSubmitError("Name and Email are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // 1. Resolve the ID (Convert "1" to a real UUID)
      let finalRoomId = room.id;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(String(room.id))) {
        // If ID is "1", find the real UUID by room name
        const { data: dbRoom, error: lookupError } = await supabase
          .from('rooms')
          .select('id')
          .ilike('name', room.name)
          .single();

        if (lookupError || !dbRoom) {
          throw new Error(`Room "${room.name}" not found in DB. Make sure the name matches Supabase exactly.`);
        }
        finalRoomId = dbRoom.id;
      }

      // 2. Insert the booking
      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9', // Use your actual Hotel UUID here
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
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-8">We've received your reservation for {room.name}.</p>
          <button onClick={onClose} className="w-full bg-black text-white py-4 rounded-xl font-bold">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto font-sans">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center z-10">
        <span className="font-bold text-xl tracking-tighter italic text-emerald-700">LUXE STAY</span>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-12 pb-20">
        <div className="lg:col-span-7 p-6 lg:p-12 space-y-8">
          <img src={room.image} className="w-full h-[450px] object-cover rounded-[2rem] shadow-2xl" alt={room.name} />
          <h1 className="text-5xl font-serif text-gray-900">{room.name}</h1>
          <p className="text-gray-600 text-xl leading-relaxed">{room.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {/* Amenities icons */}
             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                <Wifi className="text-emerald-600" /> <span className="text-xs font-bold">Free WiFi</span>
             </div>
             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                <Tv className="text-emerald-600" /> <span className="text-xs font-bold">Smart TV</span>
             </div>
             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                <Coffee className="text-emerald-600" /> <span className="text-xs font-bold">Breakfast</span>
             </div>
             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center gap-2">
                <Wind className="text-emerald-600" /> <span className="text-xs font-bold">Air Condition</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-5 p-6">
          <div className="bg-neutral-900 rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl sticky top-28">
            <h3 className="text-2xl font-serif mb-8 text-center uppercase tracking-widest">Reservation</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-emerald-500 font-bold uppercase">Arrival</label>
                  <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-emerald-500 font-bold uppercase">Departure</label>
                  <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="space-y-3">
                <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl p-4 text-sm" />
                <input type="email" placeholder="Email Address" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl p-4 text-sm" />
                <input type="tel" placeholder="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-neutral-800 border-none rounded-xl p-4 text-sm" />
              </div>

              {nights > 0 && (
                <div className="bg-emerald-600 p-5 rounded-2xl flex justify-between items-center transition-all animate-in slide-in-from-bottom-2">
                  <span className="text-xs font-bold uppercase">Total for {nights} nights</span>
                  <span className="text-2xl font-black">₹{grandTotal.toLocaleString()}</span>
                </div>
              )}

              {submitError && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 text-red-400 text-xs">
                  <AlertCircle size={16} className="shrink-0" /> <p>{submitError}</p>
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
