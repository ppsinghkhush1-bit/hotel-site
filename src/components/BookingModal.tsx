import { X, Calendar, Users, Bed, Wifi, Coffee, Car, Tv, Wind, Mail, Phone, User, MessageSquare, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

interface BookingModalProps {
  isOpen?: boolean;
  onClose: () => void;
  room: {
    id: string | number; // Handles both "1" and UUIDs
    name: string;
    image: string;
    description: string;
    basePrice: number;
    maxGuests: number;
  };
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export default function BookingModal({
  isOpen = true,
  onClose,
  room,
  checkIn = '',
  checkOut = '',
  guests: initialGuests = 2
}: BookingModalProps) {
  // Form State
  const [bookingCheckIn, setBookingCheckIn] = useState(checkIn);
  const [bookingCheckOut, setBookingCheckOut] = useState(checkOut);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const nights = useMemo(() => {
    if (!bookingCheckIn || !bookingCheckOut) return 0;
    const start = new Date(bookingCheckIn);
    const end = new Date(bookingCheckOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [bookingCheckIn, bookingCheckOut]);

  const grandTotal = (room.basePrice || 0) * (nights || 1);

  const handleConfirmBooking = async () => {
    // 1. Validation
    if (!bookingCheckIn || !bookingCheckOut || nights <= 0) {
      setSubmitError("Please select valid Check-In and Check-Out dates.");
      return;
    }
    if (!customerName || !customerEmail) {
      setSubmitError("Name and Email are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // 2. THE UUID FIX: 
      // If room.id is "1", we look up the real UUID in the database first.
      let finalRoomId = room.id;
      
      const isUuid = (val: any) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(val));

      if (!isUuid(room.id)) {
        const { data: foundRoom, error: lookupError } = await supabase
          .from('rooms')
          .select('id')
          .ilike('name', room.name) // Finds the room by name instead of the broken "1" ID
          .single();

        if (lookupError || !foundRoom) {
          throw new Error(`Room ID "${room.id}" is not a valid UUID and I couldn't find a room named "${room.name}" in your database.`);
        }
        finalRoomId = foundRoom.id;
      }

      // 3. THE INSERT
      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          room_id: finalRoomId,
          guest_name: customerName,
          guest_email: customerEmail,
          guest_phone: customerPhone,
          check_in: bookingCheckIn,
          check_out: bookingCheckOut,
          num_guests: initialGuests,
          total_price: grandTotal,
          status: 'pending'
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
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-6">We'll see you on {bookingCheckIn}.</p>
          <button onClick={onClose} className="w-full bg-black text-white py-4 rounded-xl font-bold">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 lg:p-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold">Confirm Your Stay</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Room Summary */}
          <div className="space-y-6">
            <img src={room.image} className="w-full h-72 object-cover rounded-3xl shadow-lg" alt="" />
            <h2 className="text-2xl font-bold">{room.name}</h2>
            <p className="text-gray-600 leading-relaxed">{room.description}</p>
          </div>

          {/* Booking Form */}
          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-gray-400">Arrival</label>
                <input type="date" value={bookingCheckIn} min={today} onChange={(e) => setBookingCheckIn(e.target.value)} className="p-3 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-gray-400">Departure</label>
                <input type="date" value={bookingCheckOut} min={bookingCheckIn || today} onChange={(e) => setBookingCheckOut(e.target.value)} className="p-3 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-4 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-500" />
            <input type="email" placeholder="Email Address" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full p-4 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-500" />
            <input type="tel" placeholder="Phone Number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full p-4 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-500" />

            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-500">Total Price ({nights} nights)</span>
              <span className="text-2xl font-bold text-emerald-600">₹{grandTotal.toLocaleString()}</span>
            </div>

            {submitError && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm flex gap-2">
                <AlertCircle size={18} /> {submitError}
              </div>
            )}

            <button
              onClick={handleConfirmBooking}
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
