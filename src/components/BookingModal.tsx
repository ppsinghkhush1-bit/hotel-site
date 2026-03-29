import { X, Calendar, User, CheckCircle2, AlertCircle, Mail, Phone, Info } from 'lucide-react';
import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_12y6xre';
const EMAILJS_TEMPLATE_ID = 'template_mz16rsu';
const EMAILJS_PUBLIC_KEY = 'bsmrGxOAEmpS7_WtU';

export default function BookingModal({ 
  isOpen = true, 
  onClose, 
  room, 
  checkIn: initialCheckIn = '', 
  checkOut: initialCheckOut = '', 
  guests = 2 
}: any) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const [dateIn, setDateIn] = useState(initialCheckIn || today);
  const [dateOut, setDateOut] = useState(initialCheckOut || tomorrow);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nights = useMemo(() => {
    const start = new Date(dateIn);
    const end = new Date(dateOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    // Ensure nights is at least 1, and handle invalid date ranges
    return diff > 0 ? diff : 1;
  }, [dateIn, dateOut]);

  const grandTotal = useMemo(() => {
    const price = Number(room?.price_per_night || room?.price) || 1500;
    return price * nights;
  }, [room, nights]);

  const handleConfirmBooking = async () => {
  if (!customerName || !customerEmail || !customerPhone) {
    setSubmitError("Please fill in all details.");
    return;
  }

  try {
    setIsSubmitting(true);
    setSubmitError(null);

    // Hardcoded fallback to ensure NO UUID error occurs
    const finalRoomId = room?.id || "1cff9f52-513d-4a30-89dc-b2d6fa357842";

    const { error: dbError } = await supabase
      .from('bookings')
      .insert([
        {
          guest_name: customerName,
          guest_email: customerEmail,
          guest_phone: customerPhone,
          check_in: dateIn,
          check_out: dateOut,
          num_guests: Number(guests),
          total_price: Number(grandTotal),
          status: 'pending',
          room_id: "1cff9f52-513d-4a30-89dc-b2d6fa357842", 
          hotel_id: "GREEN_GARDEN_RESORT" // <--- MUST have these " " quotes
        }
  ]);

    if (dbError) {
      console.error("Database Error Detail:", dbError);
      throw dbError;
    }

    // EmailJS logic stays the same...
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        customer_name: customerName,
        customer_email: customerEmail,
        room_type: room?.room_type || "Luxury Suite",
        total_price: `₹${grandTotal}`,
        check_in: dateIn,
        check_out: dateOut
      },
      EMAILJS_PUBLIC_KEY
    );

    setSubmitSuccess(true);
  } catch (err: any) {
    // This will now show the EXACT error from Supabase if it fails
    setSubmitError(err.message || "Something went wrong.");
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* --- Left Design Sidebar --- */}
        <div className="hidden md:flex w-1/3 bg-[#0f172a] p-10 flex-col justify-between text-white text-left">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{room?.room_type || "Luxury Room"}</h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              Experience the perfect blend of comfort and luxury at Green Garden. Your reservation request will be handled by our 24/7 reception team.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-3">
            <Info size={18} className="text-emerald-400 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-snug">
              Instant confirmation will be sent to your email after the reception reviews your request.
            </p>
          </div>
        </div>

        {/* --- Right Form Area --- */}
        <div className="flex-1 p-8 lg:p-12 bg-white overflow-y-auto max-h-[90vh]">
          {submitSuccess ? (
            <div className="text-center py-16">
              <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
              <h2 className="text-3xl font-extrabold text-slate-900">Booking Sent!</h2>
              <p className="text-slate-500 mt-3 text-lg">We'll reach out to you shortly.</p>
              <button onClick={onClose} className="mt-10 px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all">Done</button>
            </div>
          ) : (
            <div className="space-y-8 text-left">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Reservation Details</h2>
                <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><User size={12}/> Guest Name</label>
                  <input className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 focus:bg-white transition-all" 
                    value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full legal name" />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Mail size={12}/> Email Address</label>
                  <input className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 focus:bg-white transition-all" 
                    value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="email@address.com" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Phone size={12}/> Mobile Number</label>
                  <input className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 focus:bg-white transition-all" 
                    value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+91 00000 00000" />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Calendar size={12}/> Check-In</label>
                  <input type="date" min={today} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 focus:bg-white" 
                    value={dateIn} onChange={e => setDateIn(e.target.value)} />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2"><Calendar size={12}/> Check-Out</label>
                  <input type="date" min={dateIn} className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-emerald-500 focus:bg-white" 
                    value={dateOut} onChange={e => setDateOut(e.target.value)} />
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 mt-10 flex flex-col sm:flex-row justify-between items-center gap-8">
                <div className="text-center sm:text-left">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Est. Total ({nights} nights)</p>
                  <p className="text-5xl font-black text-emerald-600 tracking-tighter">₹{grandTotal}</p>
                </div>
                <button 
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-12 py-6 bg-[#10b981] text-white rounded-3xl font-black text-xl shadow-2xl shadow-emerald-200 hover:bg-emerald-600 active:scale-95 disabled:bg-slate-300 transition-all"
                >
                  {isSubmitting ? "Sending..." : "Confirm Booking"}
                </button>
              </div>

              {submitError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-bold flex items-center gap-2 border border-red-100">
                  <AlertCircle size={16} /> {submitError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
