import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, Users, Bed, Mail, Phone, User, CheckCircle2, 
  Loader2, Star, Zap, ShieldCheck, Smartphone, ShieldAlert,
  ArrowRight, Wifi, Coffee, Utensils, ChevronLeft,
  CreditCard, Wind, Maximize, Shield, Camera, Car
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

// --- CONFIGURATION ---
const CONFIG = {
  EMAILJS: {
    SERVICE_ID: 'service_12y6xre',
    TEMPLATE_ID: 'template_mz16rsu',
    PUBLIC_KEY: 'bsmrGxOAEmpS7_WtU'
  },
  HOTEL_ID: '418d39b5-659d-4f0b-be4a-062ec24e22d9'
};

interface Room {
  id: string;
  room_type: string;
  description: string;
  price_per_night: number;
  max_occupancy: number;
  image_url?: string;
}

export default function BookingModal({ isOpen, onClose, initialRoom }: any) {
  // --- STATES ---
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [bookingIn, setBookingIn] = useState('');
  const [bookingOut, setBookingOut] = useState('');
  const [guestDetails, setGuestDetails] = useState({
    name: '',
    email: '',
    phone: '',
    count: 2,
    specialRequest: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (isOpen) {
      const fetchRooms = async () => {
        const { data } = await supabase.from('rooms').select('*');
        if (data) setRoomsList(data);
      };
      fetchRooms();
      
      if (initialRoom) {
        setSelectedRoom({
          id: initialRoom.id,
          room_type: initialRoom.name || initialRoom.room_type,
          description: initialRoom.description,
          price_per_night: initialRoom.basePrice || initialRoom.price_per_night,
          max_occupancy: initialRoom.maxGuests || initialRoom.max_occupancy,
          image_url: initialRoom.image || initialRoom.image_url
        });
      }
    }
  }, [isOpen, initialRoom]);

  // --- CALCULATIONS ---
  const nights = useMemo(() => {
    if (!bookingIn || !bookingOut) return 1;
    const diff = Math.ceil((new Date(bookingOut).getTime() - new Date(bookingIn).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [bookingIn, bookingOut]);

  const totalPrice = (selectedRoom?.price_per_night || 0) * nights;

  // --- ACTIONS ---
  const handleNext = () => {
    if (currentStep === 1 && (!bookingIn || !bookingOut || !selectedRoom)) {
      setError("Please select dates and a room category.");
      return;
    }
    if (currentStep === 2 && (!guestDetails.name || !guestDetails.phone)) {
      setError("Guest name and phone are required.");
      return;
    }
    setError(null);
    setCurrentStep(prev => prev + 1);
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Database Sync
      const { error: dbError } = await supabase.from('bookings').insert({
        room_id: selectedRoom?.id,
        hotel_id: CONFIG.HOTEL_ID,
        guest_name: guestDetails.name,
        guest_email: guestDetails.email,
        guest_phone: guestDetails.phone,
        check_in: bookingIn,
        check_out: bookingOut,
        num_guests: guestDetails.count,
        total_price: totalPrice,
        status: 'pending'
      });

      if (dbError) throw dbError;

      // 2. EmailJS (Exact mapping for your template)
      await emailjs.send(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID, {
        guest_name: guestDetails.name,
        guest_email: guestDetails.email,
        guest_phone: guestDetails.phone,
        room_name: selectedRoom?.room_type,
        check_in: bookingIn,
        check_out: bookingOut,
        total_price: totalPrice
      }, CONFIG.EMAILJS.PUBLIC_KEY);

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl min-h-[80vh] rounded-[2rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Left Visual Panel */}
        <div className="lg:w-2/5 relative bg-neutral-900 text-white p-12 flex flex-col justify-end">
          {selectedRoom?.image_url && (
            <img src={selectedRoom.image_url} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="room" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex gap-1 text-emerald-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <h2 className="text-5xl font-serif italic tracking-tighter">{selectedRoom?.room_type || 'Select a Room'}</h2>
            <p className="text-sm opacity-70 leading-relaxed max-w-xs">{selectedRoom?.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 p-3 rounded-xl border border-white/10"><Wifi size={14}/> WiFi</div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 p-3 rounded-xl border border-white/10"><Coffee size={14}/> Breakfast</div>
            </div>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 flex flex-col bg-neutral-50">
          <header className="p-6 border-b flex justify-between items-center bg-white">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><X size={20}/></button>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => <div key={i} className={`h-1 w-6 rounded-full ${currentStep >= i ? 'bg-emerald-500' : 'bg-neutral-200'}`} />)}
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 italic">Hotel Green Garden</span>
          </header>

          <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><CheckCircle2 size={40} /></div>
                <h3 className="text-3xl font-serif italic">Reservation Sent!</h3>
                <p className="text-neutral-500">We have notified the hotel. You will receive an email shortly at {guestDetails.email}.</p>
                <button onClick={onClose} className="bg-black text-white px-10 py-4 rounded-xl font-bold uppercase text-xs">Close Portal</button>
              </div>
            ) : (
              <div className="max-w-xl mx-auto space-y-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-3xl font-serif italic">Choose Dates & Room</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Check-In</label>
                        <input type="date" value={bookingIn} onChange={e => setBookingIn(e.target.value)} className="w-full bg-transparent font-bold outline-none text-sm" />
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Check-Out</label>
                        <input type="date" value={bookingOut} onChange={e => setBookingOut(e.target.value)} className="w-full bg-transparent font-bold outline-none text-sm" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase text-neutral-400 ml-2">Available Categories</p>
                      {roomsList.map(r => (
                        <div key={r.id} onClick={() => setSelectedRoom(r)} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedRoom?.id === r.id ? 'border-emerald-500 bg-emerald-50' : 'bg-white border-neutral-100 hover:border-neutral-300'}`}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden"><img src={r.image_url} className="w-full h-full object-cover" /></div>
                            <div><p className="font-bold text-sm">{r.room_type}</p><p className="text-[10px] text-neutral-400 uppercase">₹{r.price_per_night} / Night</p></div>
                          </div>
                          {selectedRoom?.id === r.id && <CheckCircle2 size={18} className="text-emerald-500" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-3xl font-serif italic">Guest Details</h3>
                    <div className="space-y-4">
                      <input type="text" placeholder="Full Name" value={guestDetails.name} onChange={e => setGuestDetails({...guestDetails, name: e.target.value})} className="w-full p-5 bg-white border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium" />
                      <input type="tel" placeholder="Phone Number" value={guestDetails.phone} onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})} className="w-full p-5 bg-white border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium" />
                      <input type="email" placeholder="Email Address" value={guestDetails.email} onChange={e => setGuestDetails({...guestDetails, email: e.target.value})} className="w-full p-5 bg-white border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-medium" />
                      <div className="bg-white p-5 rounded-2xl border border-neutral-200 flex justify-between items-center">
                        <span className="text-sm font-bold">No. of Guests</span>
                        <div className="flex gap-3 items-center">
                          <button onClick={() => setGuestDetails({...guestDetails, count: Math.max(1, guestDetails.count - 1)})} className="w-8 h-8 bg-neutral-100 rounded-full">-</button>
                          <span className="font-bold">{guestDetails.count}</span>
                          <button onClick={() => setGuestDetails({...guestDetails, count: Math.min(4, guestDetails.count + 1)})} className="w-8 h-8 bg-neutral-100 rounded-full">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-3xl font-serif italic">Final Summary</h3>
                    <div className="bg-neutral-900 text-white p-8 rounded-[2rem] space-y-6 shadow-xl">
                      <div className="flex justify-between border-b border-white/10 pb-4">
                        <p className="text-xs opacity-50 uppercase tracking-widest font-bold">Stay Info</p>
                        <p className="text-sm font-bold">{selectedRoom?.room_type} x {nights} Night(s)</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-emerald-400 uppercase font-black mb-1">Total Stay Value</p>
                          <p className="text-5xl font-black italic tracking-tighter">₹{totalPrice.toLocaleString()}</p>
                        </div>
                        <div className="text-right opacity-50"><p className="text-[10px] uppercase font-bold">Payable at</p><p className="text-xs font-bold">Hotel Front Desk</p></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 italic text-xs">
                      <ShieldCheck size={16} /> Instant confirmation via email will be sent.
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {!isSuccess && (
            <footer className="p-8 bg-white border-t flex justify-between items-center">
              <button onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)} className={`text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-black ${currentStep === 1 && 'invisible'}`}>Back</button>
              {error && <p className="text-[10px] text-red-500 font-bold uppercase">{error}</p>}
              <button 
                onClick={currentStep === 3 ? handleFinalSubmit : handleNext} 
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-neutral-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : currentStep === 3 ? "Confirm Booking" : "Continue"}
                <ArrowRight size={16} />
              </button>
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
