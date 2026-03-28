import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, Mail, User, CheckCircle2, 
  Loader2, Star, Zap, Smartphone, ArrowRight, Wifi, Coffee 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

export default function BookingModal({ isOpen, onClose, room }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingIn, setBookingIn] = useState('');
  const [bookingOut, setBookingOut] = useState('');
  const [guestDetails, setGuestDetails] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal Reset Logic
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setError(null);
      setCurrentStep(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, room]);

  const nights = useMemo(() => {
    if (!bookingIn || !bookingOut) return 1;
    const diff = Math.ceil((new Date(bookingOut).getTime() - new Date(bookingIn).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [bookingIn, bookingOut]);

  const totalPrice = (room?.basePrice || room?.price_per_night || 0) * nights;

  const handleBooking = async () => {
    if (!guestDetails.name || !guestDetails.phone) {
      setError("Name and Phone are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Supabase Entry
      await supabase.from('bookings').insert({
        room_id: room?.id,
        hotel_id: '418d39b5-659d-4f0b-be4a-062ec24e22d9',
        guest_name: guestDetails.name,
        guest_email: guestDetails.email,
        guest_phone: guestDetails.phone,
        check_in: bookingIn,
        check_out: bookingOut,
        total_price: totalPrice,
        status: 'pending'
      });

      // EmailJS
      await emailjs.send('service_12y6xre', 'template_mz16rsu', {
        guest_name: guestDetails.name,
        guest_email: guestDetails.email,
        guest_phone: guestDetails.phone,
        room_name: room?.name || room?.room_type,
        check_in: bookingIn,
        check_out: bookingOut,
        total_price: totalPrice
      }, 'bsmrGxOAEmpS7_WtU');

      setIsSuccess(true);
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // AGAR MODAL OPEN NAHI HAI TOH KUCH MAT DIKHAYO
  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side Info */}
        <div className="md:w-5/12 bg-neutral-900 relative p-8 flex flex-col justify-end text-white">
          <img src={room.image || room.image_url} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />
          <div className="relative z-10">
            <h2 className="text-3xl font-serif italic mb-2">{room.name || room.room_type}</h2>
            <p className="text-xs opacity-70">₹{room.basePrice || room.price_per_night} / night</p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="flex-1 p-8 bg-white overflow-y-auto">
          <div className="flex justify-between mb-6">
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full"><X size={20}/></button>
            <Zap size={20} className="text-emerald-500 fill-emerald-500" />
          </div>

          {isSuccess ? (
            <div className="text-center py-10">
              <CheckCircle2 size={50} className="text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold">Booking Sent!</h3>
              <button onClick={onClose} className="mt-6 bg-black text-white px-8 py-2 rounded-lg">Done</button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentStep === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="date" value={bookingIn} onChange={e => setBookingIn(e.target.value)} className="p-3 border rounded-xl text-sm" />
                    <input type="date" value={bookingOut} onChange={e => setBookingOut(e.target.value)} className="p-3 border rounded-xl text-sm" />
                  </div>
                  <div className="bg-neutral-900 p-6 rounded-2xl text-white">
                    <p className="text-xs opacity-50 uppercase">Total Amount</p>
                    <p className="text-3xl font-bold">₹{totalPrice.toLocaleString()}</p>
                  </div>
                  <button onClick={() => setCurrentStep(2)} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold">Next Step</button>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Name" value={guestDetails.name} onChange={e => setGuestDetails({...guestDetails, name: e.target.value})} className="w-full p-4 border rounded-xl" />
                  <input type="tel" placeholder="Phone" value={guestDetails.phone} onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})} className="w-full p-4 border rounded-xl" />
                  <input type="email" placeholder="Email" value={guestDetails.email} onChange={e => setGuestDetails({...guestDetails, email: e.target.value})} className="w-full p-4 border rounded-xl" />
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <button onClick={handleBooking} disabled={isSubmitting} className="w-full bg-black text-white py-4 rounded-xl font-bold flex justify-center">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm Reservation"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
