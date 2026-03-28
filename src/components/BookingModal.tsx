import {
  X, Calendar, User, CheckCircle2, AlertCircle, 
  Mail, Phone, CreditCard, Info
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_12y6xre';
const EMAILJS_TEMPLATE_ID = 'template_mz16rsu';
const EMAILJS_PUBLIC_KEY = 'bsmrGxOAEmpS7_WtU';

interface BookingModalProps {
  isOpen?: boolean;
  onClose: () => void;
  room: any; // Ensure this room object includes id and hotel_id from your DB
  selectedAmenities?: any[];
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

  const nights = useMemo(() => {
    if (!bookingCheckIn || !bookingCheckOut) return 0;
    const start = new Date(bookingCheckIn);
    const end = new Date(bookingCheckOut);
    return start < end ? Math.ceil((end.getTime() - start.getTime()) / 86400000) : 0;
  }, [bookingCheckIn, bookingCheckOut]);

  const grandTotal = useMemo(() => {
    const base = Number(room?.price_per_night || room?.basePrice) || 0;
    return nights > 0 ? base * nights : 0;
  }, [room, nights]);

  const isFormValid = customerName && customerEmail.includes('@') && customerPhone && nights > 0;

  const handleConfirmBooking = async (e: React.MouseEvent) => {
    // FIX: PREVENT CALENDAR POPUP
    e.preventDefault();
    e.stopPropagation();

    if (!isFormValid) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // UUID Regex check to help you debug
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(room.id)) {
        throw new Error(`Invalid Room UUID: ${room.id}. Please ensure your data matches Supabase.`);
      }

      // FIX: MATCHING YOUR TABLE SCHEMA (rooms/bookings)
      const { error: dbError } = await supabase.from('bookings').insert([{
        room_id: room.id,
        hotel_id: room.hotel_id || '1cff9f52-513d-4a30-89dc-b2d6fa357842', // Provide a fallback if missing
        guest_name: customerName,
        guest_email: customerEmail,
        guest_phone: customerPhone,
        check_in: bookingCheckIn,
        check_out: bookingCheckOut,
        num_guests: bookingGuests,
        total_price: grandTotal,
        status: 'pending',
        special_requests: specialRequests || ''
      }]);

      if (dbError) throw dbError;

      // EmailJS
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
      setSubmitError(err.message || "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        
        {/* Left Sidebar */}
        <div className="hidden md:flex w-1/3 bg-[#0f172a] p-10 flex-col justify-between text-white">
          <div>
            <h2 className="text-3xl font-bold">{room.room_type || room.name}</h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">{room.description || "Luxury accommodation"}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-2">
            <Info size={16} className="text-emerald-400" />
            <p className="text-[10px]">Your stay is protected by our secure reservation system.</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="flex-1 p-8 lg:p-12 bg-white overflow-y-auto max-h-[90vh]">
          {submitSuccess ? (
            <div className="text-center py-10 animate-in slide-in-from-bottom-4">
              <CheckCircle2 size={60} className="text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Reservation Sent!</h2>
              <p className="text-slate-500 mt-2">Check <b>{customerEmail}</b> for confirmation.</p>
              <button onClick={onClose} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold transition-transform active:scale-95">Close</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Reservation Details</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" placeholder="Enter your name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-all" placeholder="email@address.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 transition-all" placeholder="+91..." value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
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
                    <p className="text-3xl font-black text-emerald-600">₹{grandTotal}</p>
                  </div>
                  <button
                    type="button" // CRITICAL: Prevent form submit behavior
                    onClick={handleConfirmBooking}
                    disabled={!isFormValid || isSubmitting}
                    className="w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200 transition-all disabled:bg-slate-300 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CreditCard size={18} /> Confirm Booking</>}
                  </button>
                </div>
                {submitError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-red-100">
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
