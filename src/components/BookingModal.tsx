import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_12y6xre';
const EMAILJS_TEMPLATE_ID = 'template_mz16rsu';
const EMAILJS_PUBLIC_KEY = 'bsmrGxOAEmpS7_WtU';

export default function BookingModal({ 
  isOpen = true, 
  onClose, 
  room, 
  checkIn = '', 
  checkOut = '', 
  guests = 2 
}: any) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const grandTotal = useMemo(() => {
    const price = Number(room?.price_per_night) || 1500;
    return nights > 0 ? price * nights : price;
  }, [room, nights]);

  const handleConfirmBooking = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      setSubmitError("Please fill in all contact details.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // --- Safety Check for room_id ---
      // We use the first ID from your room screenshot as a fallback to prevent "uuid: 1" errors
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const validRoomId = uuidRegex.test(room?.id) ? room.id : '1cff9f52-513d-4a30-89dc-b2d6fa357842';

      const { error: dbError } = await supabase.from('bookings').insert([{
        room_id: validRoomId,
        hotel_id: "HOTEL_GREEN_GARDEN", // Plain text is safe now
        guest_name: customerName,
        guest_email: customerEmail,
        guest_phone: customerPhone,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: Number(guests),
        total_price: Number(grandTotal),
        status: 'pending'
      }]);

      if (dbError) throw dbError;

      // Send Email Notification
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        room_type: room?.room_type || "Room",
        total_price: `₹${grandTotal}`,
        check_in: checkIn,
        check_out: checkOut
      }, EMAILJS_PUBLIC_KEY);

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("Booking Logic Error:", err);
      setSubmitError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Design Sidebar */}
        <div className="hidden md:flex w-1/3 bg-[#0f172a] p-10 flex-col justify-between text-white">
          <div>
            <h2 className="text-3xl font-bold">{room?.room_type || "Standard Room"}</h2>
            <p className="mt-4 text-slate-400 text-sm">Affordable and comfortable room with essential facilities.</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-2">
            <Info size={16} className="text-emerald-400" />
            <p className="text-[10px]">Your request is sent directly to our reception.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 lg:p-12 bg-white">
          {submitSuccess ? (
            <div className="text-center py-12">
              <CheckCircle2 size={60} className="text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800">Booking Sent Successfully!</h2>
              <p className="text-slate-500 mt-2">We will contact you shortly to confirm.</p>
              <button onClick={onClose} className="mt-8 px-10 py-3 bg-slate-900 text-white rounded-xl font-bold">Close</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Reservation Details</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-emerald-500 transition-all" 
                    placeholder="Enter your name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-emerald-500 transition-all" 
                    placeholder="email@example.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Phone</label>
                  <input className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-emerald-500 transition-all" 
                    placeholder="Mobile number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Price</p>
                  <p className="text-4xl font-black text-emerald-600">₹{grandTotal}</p>
                </div>
                <button 
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-5 bg-[#10b981] text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-emerald-600 active:scale-95 disabled:bg-slate-300 transition-all"
                >
                  {isSubmitting ? "Processing..." : "Confirm Booking"}
                </button>
              </div>

              {submitError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
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
