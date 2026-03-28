import {
  X, Calendar, Users, Bed, Wifi, Coffee, Car, Tv, Wind,
  Mail, Phone, User, MessageSquare, CheckCircle2, AlertCircle, IndianRupee
} from 'lucide-react';
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
  room: any;
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
    setBookingCheckIn(checkIn);
    setBookingCheckOut(checkOut);
    setBookingGuests(initialGuests);
  }, [checkIn, checkOut, initialGuests]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const nights = useMemo(() => {
    if (!bookingCheckIn || !bookingCheckOut) return 0;
    const start = new Date(bookingCheckIn);
    const end = new Date(bookingCheckOut);
    if (start >= end) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [bookingCheckIn, bookingCheckOut]);

  const pricePerNight = useMemo(() => {
    const base = Number(room.basePrice) || 0;
    const amenities = selectedAmenities.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    return base + amenities;
  }, [room.basePrice, selectedAmenities]);

  const grandTotal = useMemo(() => (nights > 0 ? pricePerNight * nights : 0), [pricePerNight, nights]);

  const isFormValid = customerName.trim() && customerEmail.includes('@') && customerPhone.length >= 10 && nights > 0;

  const handleConfirmBooking = async () => {
    try {
      if (!isFormValid) return;
      setIsSubmitting(true);
      setSubmitError(null);

      const { error: bookingError } = await supabase.from('bookings').insert([{
        room_id: room.id,
        guest_name: customerName,
        guest_email: customerEmail,
        guest_phone: customerPhone,
        check_in: bookingCheckIn,
        check_out: bookingCheckOut,
        num_guests: bookingGuests,
        total_price: grandTotal,
        status: 'pending',
        special_requests: specialRequests
      }]);

      if (bookingError) throw bookingError;

      await supabase.functions.invoke('send-booking-email', {
        body: { customerName, customerEmail, roomName: room.name }
      });

      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Booking failed. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{submitSuccess ? 'Success!' : 'Complete Your Booking'}</h2>
            {!submitSuccess && <p className="text-slate-500 text-sm">{room.name} • {formatCurrency(pricePerNight)}/night</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          {submitSuccess ? (
            <div className="text-center py-12 animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Pack your bags!</h3>
              <p className="mt-2 text-slate-600">Confirmation sent to <span className="font-semibold">{customerEmail}</span></p>
              <button onClick={onClose} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all">
                Close Window
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Form */}
              <div className="space-y-6">
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <User size={16} /> Guest Details
                  </h3>
                  <div className="space-y-3">
                    <input 
                      type="text" placeholder="Full Name" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={customerName} onChange={e => setCustomerName(e.target.value)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input 
                        type="email" placeholder="Email Address" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                      />
                      <input 
                        type="tel" placeholder="Phone Number" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Calendar size={16} /> Schedule
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <label className="text-[10px] font-bold text-slate-400 absolute top-2 left-4 uppercase">Check-in</label>
                      <input 
                        type="date" min={today}
                        className="w-full pt-6 pb-2 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={bookingCheckIn} onChange={e => setBookingCheckIn(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <label className="text-[10px] font-bold text-slate-400 absolute top-2 left-4 uppercase">Check-out</label>
                      <input 
                        type="date" min={bookingCheckIn || today}
                        className="w-full pt-6 pb-2 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={bookingCheckOut} onChange={e => setBookingCheckOut(e.target.value)}
                      />
                    </div>
                  </div>
                </section>
                
                <textarea 
                  placeholder="Special requests (optional)..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  value={specialRequests} onChange={e => setSpecialRequests(e.target.value)}
                />
              </div>

              {/* Right Column: Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col">
                <h3 className="font-bold text-slate-900 mb-4">Summary</h3>
                <div className="space-y-3 text-sm flex-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stay Duration</span>
                    <span className="font-medium">{nights} Nights</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Price per Night</span>
                    <span className="font-medium">{formatCurrency(pricePerNight)}</span>
                  </div>
                  {selectedAmenities.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Selected Add-ons</p>
                      {selectedAmenities.map((a, i) => (
                        <div key={i} className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">{a.name}</span>
                          <span>{a.included ? 'Included' : formatCurrency(a.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-200">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-slate-900 font-bold text-lg">Total Amount</span>
                    <span className="text-3xl font-black text-emerald-600">{formatCurrency(grandTotal)}</span>
                  </div>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={!isFormValid || isSubmitting}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Confirm & Pay'
                    )}
                  </button>
                  
                  {submitError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs flex items-center gap-2 border border-red-100">
                      <AlertCircle size={14} /> {submitError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
