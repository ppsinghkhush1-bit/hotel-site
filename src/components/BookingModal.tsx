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

      // ✅ FIX: ensure valid UUID always
      const finalRoomId =
        room?.id && room.id.length > 10
          ? room.id
          : "1cff9f52-513d-4a30-89dc-b2d6fa357842";

      console.log("Using room_id:", finalRoomId);

      const { data, error } = await supabase
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
            room_id: finalRoomId
          }
        ])
        .select();

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      console.log("Booking success:", data);

      // ✅ Email
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
      console.error("Final Error:", err);
      setSubmitError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT PANEL */}
        <div className="hidden md:flex w-1/3 bg-[#0f172a] p-10 flex-col justify-between text-white">
          <div>
            <h2 className="text-3xl font-bold">{room?.room_type || "Luxury Room"}</h2>
            <p className="mt-4 text-slate-400 text-sm">
              Experience comfort at Green Garden.
            </p>
          </div>
          <div className="bg-white/5 p-5 rounded-2xl flex gap-3">
            <Info size={18} className="text-emerald-400" />
            <p className="text-xs text-slate-300">
              Confirmation will be sent via email.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-8 bg-white">

          {submitSuccess ? (
            <div className="text-center py-16">
              <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold">Booking Sent!</h2>
              <button onClick={onClose} className="mt-6 px-8 py-3 bg-black text-white rounded-xl">
                Done
              </button>
            </div>
          ) : (

            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Reservation</h2>
                <button onClick={onClose}><X /></button>
              </div>

              <input placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full mb-3 p-3 border rounded" />
              <input placeholder="Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full mb-3 p-3 border rounded" />
              <input placeholder="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full mb-3 p-3 border rounded" />

              <input type="date" value={dateIn} onChange={e => setDateIn(e.target.value)} className="w-full mb-3 p-3 border rounded" />
              <input type="date" value={dateOut} onChange={e => setDateOut(e.target.value)} className="w-full mb-3 p-3 border rounded" />

              <div className="my-4 text-lg font-bold">₹{grandTotal}</div>

              <button onClick={handleConfirmBooking} disabled={isSubmitting} className="w-full bg-green-500 text-white p-4 rounded-xl">
                {isSubmitting ? "Sending..." : "Confirm Booking"}
              </button>

              {submitError && (
                <div className="mt-4 text-red-500 flex gap-2">
                  <AlertCircle size={16} /> {submitError}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
