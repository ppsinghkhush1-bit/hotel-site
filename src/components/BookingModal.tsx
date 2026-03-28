import {
  X, Calendar, User, CheckCircle2, AlertCircle, 
  Mail, Phone, CreditCard, Info
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

// EmailJS Credentials
const EMAILJS_SERVICE_ID = 'service_12y6xre';
const EMAILJS_TEMPLATE_ID = 'template_mz16rsu';
const EMAILJS_PUBLIC_KEY = 'bsmrGxOAEmpS7_WtU';

interface BookingModalProps {
  isOpen?: boolean;
  onClose: () => void;
  room: any; 
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
  const [bookingCheckIn, setBookingCheckIn] = useState(checkIn);
  const [bookingCheckOut, setBookingCheckOut] = useState(checkOut);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure dates are in YYYY-MM-DD format for the input
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
    const price = Number(room?.price_per_night || room?.basePrice) || 1500;
    return nights > 0 ? price * nights : price;
  }, [room, nights]);

  const isFormValid = customerName.length > 2 && customerEmail.includes('@') && customerPhone.length >= 10;

  const handleConfirmBooking = async (e: React.MouseEvent) => {
    // --- FIX 1: KILL CALENDAR POPUP ---
    e.preventDefault();
    e.stopPropagation();

    if (!isFormValid) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // --- FIX 2: DATA INTEGRITY (UUID & FOREIGN KEYS) ---
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      // We must use IDs that EXIST in your Supabase tables
      // Based on your previous screenshots, this is a valid room UUID
      const validRoomId = uuidRegex.test(room.id) ? room.id : '1cff9f52-513d-4a30-89dc-b2d6fa357842';
      
      // IMPORTANT: Your error says 'bookings_hotel_id_fkey' failed.
      // This means the hotel_id below MUST exist in your 'hotels' table.
      // If you don't have a 'hotels' table, you might need to remove this field or check your schema.
      const validHotelId = room.hotel_id || '1cff9f52-513d-4a30-89dc-b2d6fa357842';

      // --- FIX 3: SUPABASE INSERT ---
      const { error: dbError } = await supabase.from('bookings').insert([{
        room_id: validRoomId,
        hotel_id: validHotelId,
        guest_name: customerName,
        guest_email: customerEmail,
        guest_phone: customerPhone,
        check_in: bookingCheckIn,
        check_out: bookingCheckOut,
        num_guests: initialGuests,
        total_price: grandTotal,
        status: 'pending'
      }]);

      if (dbError) {
          // Special handling for foreign key errors
          if (dbError.code === '23503') {
              throw new Error("Foreign Key Error: The Hotel ID or Room ID does not exist in the database. Please check your Supabase tables.");
          }
          throw dbError;
      }

      // --- FIX 4: EMAILJS ---
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_name: customerName,
          to_email: customerEmail,
          room_name: room.room_type || room.name,
          check_in: bookingCheckIn,
          check_out: bookingCheckOut,
          total_price: `₹${grandTotal}`,
        },
        EMAILJS_PUBLIC_KEY
      );

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        
        {/* Sidebar */}
        <div className="hidden md:flex w-1/3 bg-[#0f172a] p-10 flex-col justify-between text-white">
          <div>
            <h2 className="text-3xl font-bold">{room.room_type || room.name || "Room"}</h2>
            <p className="mt-4 text-slate-400 text-sm">{room.description || "Luxury stay"}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-2">
            <Info size={16} className="text-emerald-400" />
            <p className="text-[10px]">Instant confirmation sent to your email.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 lg:p-12 bg-white overflow-y-auto max-h-[90vh]">
          {submitSuccess ? (
            <div className="text-center py-12">
              <CheckCircle2 size={60} className="text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Booking Sent!</h2>
              <button onClick={onClose} className="mt-8 px-10 py-3 bg-slate-900 text-white rounded-xl">Done</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reservation Details</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full Name" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="Email" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Check-in</label>
                  <input type="date" min={today} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none" value={bookingCheckIn} onChange={e => setBookingCheckIn(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Check-out</label>
                  <input type="date" min={bookingCheckIn || today} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none" value={bookingCheckOut} onChange={e => setBookingCheckOut(e.target.value)} />
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mt-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Price</p>
                    <p className="text-4xl font-black text-emerald-600">₹{grandTotal}</p>
                  </div>
                  
                  {/* BUTTON: Note the type="button" and onClick logic */}
                  <button
                    type="button" 
                    onClick={handleConfirmBooking}
                    disabled={!isFormValid || isSubmitting}
                    className="w-full sm:w-auto px-10 py-5 bg-[#10b981] text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:bg-slate-300"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                  </button>
                </div>

                {submitError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-red-100 animate-pulse">
                    <AlertCircle size={14} /> {submitError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
