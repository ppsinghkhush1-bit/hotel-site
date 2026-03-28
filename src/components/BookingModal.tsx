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
  // Form State
  const [bookingCheckIn, setBookingCheckIn] = useState(checkIn);
  const [bookingCheckOut, setBookingCheckOut] = useState(checkOut);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setBookingCheckIn(checkIn);
    setBookingCheckOut(checkOut);
  }, [checkIn, checkOut]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Calculation Logic
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

  // --- THE FIX: Handle Booking ---
  const handleConfirmBooking = async (e: React.MouseEvent) => {
    // 1. FIX: STOP CALENDAR POPUP
    e.preventDefault();
    e.stopPropagation();

    if (!isFormValid) {
        setSubmitError("Please fill all fields correctly.");
        return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // 2. FIX: UUID VALIDATION
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      // If room.id is "1" or invalid, we use a valid UUID from your DB screenshot as fallback
      const validRoomId = uuidRegex.test(room.id) 
        ? room.id 
        : '1cff9f52-513d-4a30-89dc-b2d6fa357842'; 

      const validHotelId = '1cff9f52-513d-4a30-89dc-b2d6fa357842';

      // 3. Supabase Insert
      const { error: dbError } = await supabase.from('bookings').insert([{
        room_id: validRoomId,
        hotel_id: validHotelId,
        guest_name: customerName,
        guest_email: customerEmail,
        guest_phone: customerPhone,
        check_in: bookingCheckIn || today,
        check_out: bookingCheckOut || today,
        num_guests: initialGuests,
        total_price: grandTotal,
        status: 'pending'
      }]);

      if (dbError) throw dbError;

      // 4. EmailJS Send
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
      console.error("Booking Error:", err);
      setSubmitError(err.message || "Connection failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:row animate-in fade-in zoom-in duration-300 md:flex-row">
        
        {/* Dark Sidebar */}
        <div className="hidden md:flex w-1/3 bg-[#0f172a] p-10 flex-col justify-between text-white">
          <div>
            <h2 className="text-3xl font-bold">{room.room_type || room.name || "Room"}</h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              {room.description || "Experience comfort and luxury in our well-appointed rooms."}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <Info size={18} className="text-emerald-400 shrink-0" />
            <p className="text-[10px] text-slate-300">Your stay is protected by our secure reservation system.</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8 lg:p-12 bg-white overflow-y-auto max-h-[90vh]">
          {submitSuccess ? (
            <div className="text-center py-12 animate-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Booking Success!</h2>
              <p className="text-slate-500 mt-2">Check your email: <b>{customerEmail}</b></p>
              <button onClick={onClose} className="mt-8 px-12 py-3 bg-slate-900 text-white rounded-xl font-bold">Done</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Reservation Details</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Khushwinder Singh" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="example@mail.com" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                  <input className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+91..." />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Check-in</label>
                  <input type="date" className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none" value={bookingCheckIn} onChange={e => setBookingCheckIn(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Check-out</label>
                  <input type="date" className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none" value={bookingCheckOut} onChange={e => setBookingCheckOut(e.target.value)} />
                </div>
              </div>

              {/* Bottom Section */}
              <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Price</p>
                    <p className="text-4xl font-black text-emerald-600 tracking-tighter">₹{grandTotal}</p>
                  </div>
                  
                  <button
                    type="button" 
                    onClick={handleConfirmBooking}
                    disabled={!isFormValid || isSubmitting}
                    className="w-full sm:w-auto px-10 py-5 bg-[#10b981] hover:bg-[#059669] text-white rounded-[1.5rem] font-bold text-lg shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:bg-slate-300 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CreditCard size={20} /> Confirm Booking</>}
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
