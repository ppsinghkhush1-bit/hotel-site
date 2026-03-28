import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, Calendar, Users, Bed, Mail, Phone, User, CheckCircle2, 
  Loader2, Star, Zap, ShieldCheck, Smartphone, ShieldAlert,
  ArrowRight, Wifi, Coffee, Utensils, ChevronLeft, ChevronRight,
  CreditCard, Clock, MapPin, Wind, Tv, Maximize, Shield, Heart,
  Share2, Info, BellRing, Sparkles, History, Layout, Bookmark,
  Camera, Waves, Car, Briefcase, HelpCircle, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

/**
 * HOTEL GREEN GARDEN - ULTIMATE BOOKING ECOSYSTEM
 * Configuration for EmailJS & Supabase
 */
const CONFIG = {
  EMAILJS: {
    SERVICE_ID: 'service_12y6xre',
    TEMPLATE_ID: 'template_mz16rsu',
    PUBLIC_KEY: 'bsmrGxOAEmpS7_WtU'
  },
  HOTEL_ID: '418d39b5-659d-4f0b-be4a-062ec24e22d9',
  CURRENCY: '₹',
  TAX_RATE: 0 // As per your requirement: No Extra Fees
};

// --- TYPES & INTERFACES ---
interface Room {
  id: string;
  room_type: string;
  description: string;
  price_per_night: number;
  max_occupancy: number;
  image_url?: string;
  amenities?: string[];
}

interface BookingState {
  step: number;
  loading: boolean;
  success: boolean;
  error: string | null;
}

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const slideIn = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 }
};

export default function MegaBookingPortal({ isOpen, onClose, initialRoom }: { isOpen: boolean, onClose: () => void, initialRoom: any }) {
  // --- CORE STATES ---
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
  const [status, setStatus] = useState<BookingState>({
    step: 1,
    loading: false,
    success: false,
    error: null
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    if (isOpen) {
      fetchRooms();
      if (initialRoom) {
        // Mapping incoming data to local Room type
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

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase.from('rooms').select('*');
      if (error) throw error;
      setRoomsList(data || []);
    } catch (err) {
      console.error("Room Fetch Error:", err);
    }
  };

  // --- COMPUTED PROPERTIES ---
  const nights = useMemo(() => {
    if (!bookingIn || !bookingOut) return 1;
    const start = new Date(bookingIn);
    const end = new Date(bookingOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [bookingIn, bookingOut]);

  const totalPrice = useMemo(() => {
    const rate = selectedRoom?.price_per_night || 0;
    return rate * nights;
  }, [selectedRoom, nights]);

  // --- HANDLERS ---
  const handleNextStep = () => {
    if (currentStep === 1 && (!bookingIn || !bookingOut)) {
      setStatus({ ...status, error: "Please select valid stay dates." });
      return;
    }
    if (currentStep === 2 && (!guestDetails.name || !guestDetails.phone || !guestDetails.email)) {
      setStatus({ ...status, error: "Identity verification is mandatory for security." });
      return;
    }
    setStatus({ ...status, error: null });
    setCurrentStep(prev => prev + 1);
  };

  const submitReservation = async () => {
    try {
      setStatus({ ...status, loading: true, error: null });

      // 1. Supabase Verification
      const { data: roomData } = await supabase
        .from('rooms')
        .select('id')
        .ilike('room_type', selectedRoom?.room_type || '')
        .single();

      // 2. Insert into DB
      const { error: dbError } = await supabase.from('bookings').insert({
        room_id: roomData?.id || selectedRoom?.id,
        hotel_id: CONFIG.HOTEL_ID,
        guest_name: guestDetails.name,
        guest_email: guestDetails.email,
        guest_phone: guestDetails.phone,
        check_in: bookingIn,
        check_out: bookingOut,
        num_guests: guestDetails.count,
        total_price: totalPrice,
        status: 'pending',
        special_requests: guestDetails.specialRequest
      });

      if (dbError) throw dbError;

      // 3. EmailJS Notification (Matches your Screenshot Template)
      const templateParams = {
        guest_name: guestDetails.name,    // {{guest_name}}
        guest_email: guestDetails.email,  // {{guest_email}}
        guest_phone: guestDetails.phone,  // {{guest_phone}}
        room_name: selectedRoom?.room_type, // {{room_name}}
        check_in: bookingIn,              // {{check_in}}
        check_out: bookingOut,            // {{check_out}}
        total_price: totalPrice,          // {{total_price}}
        title: `Priority Booking Request: ${selectedRoom?.room_type}`
      };

      await emailjs.send(
        CONFIG.EMAILJS.SERVICE_ID,
        CONFIG.EMAILJS.TEMPLATE_ID,
        templateParams,
        CONFIG.EMAILJS.PUBLIC_KEY
      );

      setStatus({ ...status, loading: false, success: true });
    } catch (err: any) {
      setStatus({ ...status, loading: false, error: err.message || "Encryption error in transaction." });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-950/80 backdrop-blur-2xl p-0 md:p-6 lg:p-12 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-full max-w-7xl bg-white md:rounded-[4rem] shadow-[-20px_40px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row relative"
      >
        
        {/* LEFT PANEL: Cinematic View (40%) */}
        <div className="hidden lg:block lg:w-[40%] relative overflow-hidden bg-neutral-900 border-r border-neutral-100">
           <AnimatePresence mode="wait">
             <motion.img 
               key={selectedRoom?.id}
               src={selectedRoom?.image_url} 
               className="absolute inset-0 w-full h-full object-cover"
               initial={{ scale: 1.2, opacity: 0 }}
               animate={{ scale: 1, opacity: 0.8 }}
               transition={{ duration: 1.5 }}
             />
           </AnimatePresence>
           
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
           
           <div className="absolute top-12 left-12 flex items-center gap-3">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl">
               <Zap size={24} className="fill-emerald-500 text-emerald-500" />
             </div>
             <span className="text-white font-black tracking-tighter text-2xl uppercase italic">Green <span className="text-emerald-500">Garden</span></span>
           </div>

           <div className="absolute bottom-16 left-12 right-12 space-y-6">
             <div className="flex gap-1">
               {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-emerald-400 fill-emerald-400" />)}
             </div>
             <h2 className="text-7xl font-serif text-white tracking-tighter italic leading-none">{selectedRoom?.room_type}</h2>
             <p className="text-neutral-300 text-lg font-light leading-relaxed border-l-2 border-emerald-500/50 pl-6 italic">
                "{selectedRoom?.description}"
             </p>
             
             <div className="grid grid-cols-2 gap-4 pt-8">
                <IconBox icon={<Wifi size={18}/>} label="Elite WiFi" />
                <IconBox icon={<Coffee size={18}/>} label="Garden Breakfast" />
                <IconBox icon={<Wind size={18}/>} label="Smart AC" />
                <IconBox icon={<Maximize size={18}/>} label="850 Sq. Ft" />
             </div>
           </div>
        </div>

        {/* RIGHT PANEL: The Booking Engine (60%) */}
        <div className="flex-1 flex flex-col h-full bg-neutral-50 relative">
          
          {/* Header */}
          <header className="p-8 flex justify-between items-center border-b border-neutral-100 bg-white/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-8">
              <button onClick={onClose} className="p-3 bg-neutral-100 hover:bg-black hover:text-white rounded-full transition-all">
                <X size={20} />
              </button>
              <div className="flex gap-2">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${currentStep >= s ? 'bg-emerald-500 w-12' : 'bg-neutral-200'}`} />
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Portal Status</span>
              <span className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Verification
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 lg:p-16 custom-scrollbar">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: DATE & ROOM SELECTION */}
              {currentStep === 1 && (
                <motion.div {...fadeInUp} key="step1" className="max-w-2xl mx-auto space-y-12">
                   <div>
                     <h3 className="text-5xl font-serif tracking-tighter text-neutral-900 mb-2 italic">Select Your Stay</h3>
                     <p className="text-neutral-500 font-medium">Choose your dates and experience the luxury of Green Garden.</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DateInput label="Check-In" value={bookingIn} onChange={setBookingIn} />
                      <DateInput label="Check-Out" value={bookingOut} onChange={setBookingOut} />
                   </div>

                   <div className="space-y-4">
                     <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-4">Select Available Category</p>
                     <div className="grid grid-cols-1 gap-4">
                       {roomsList.map(room => (
                         <RoomCard 
                           key={room.id} 
                           room={room} 
                           isSelected={selectedRoom?.id === room.id} 
                           onSelect={() => setSelectedRoom(room)} 
                         />
                       ))}
                     </div>
                   </div>
                </motion.div>
              )}

              {/* STEP 2: GUEST IDENTITY */}
              {currentStep === 2 && (
                <motion.div {...slideIn} key="step2" className="max-w-2xl mx-auto space-y-12">
                  <div>
                    <h3 className="text-5xl font-serif tracking-tighter text-neutral-900 mb-2 italic">Guest Identity</h3>
                    <p className="text-neutral-500 font-medium">We require these details for priority check-in verification.</p>
                  </div>

                  <div className="space-y-4">
                    <LuxeInput icon={<User size={18}/>} placeholder="Full Guest Name" value={guestDetails.name} onChange={(v) => setGuestDetails({...guestDetails, name: v})} />
                    <LuxeInput icon={<Smartphone size={18}/>} placeholder="Active WhatsApp Number" value={guestDetails.phone} onChange={(v) => setGuestDetails({...guestDetails, phone: v})} />
                    <LuxeInput icon={<Mail size={18}/>} placeholder="Email Address (For Voucher)" value={guestDetails.email} onChange={(v) => setGuestDetails({...guestDetails, email: v})} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-neutral-200 p-6 rounded-[2rem] flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">No. of Guests</p>
                          <p className="text-xl font-bold">{guestDetails.count} People</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setGuestDetails({...guestDetails, count: Math.max(1, guestDetails.count - 1)})} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-all">-</button>
                          <button onClick={() => setGuestDetails({...guestDetails, count: Math.min(selectedRoom?.max_occupancy || 4, guestDetails.count + 1)})} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-black hover:text-white transition-all">+</button>
                        </div>
                      </div>
                    </div>

                    <textarea 
                      placeholder="ANY SPECIAL REQUESTS? (Optional)"
                      className="w-full bg-white border border-neutral-200 rounded-[2rem] p-6 text-sm font-bold min-h-[120px] outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      value={guestDetails.specialRequest}
                      onChange={(e) => setGuestDetails({...guestDetails, specialRequest: e.target.value})}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3: SUMMARY & FINALIZATION */}
              {currentStep === 3 && !status.success && (
                <motion.div {...fadeInUp} key="step3" className="max-w-2xl mx-auto space-y-8">
                  <div className="text-center">
                    <h3 className="text-5xl font-serif tracking-tighter text-neutral-900 italic">Review Reservation</h3>
                    <p className="text-neutral-500 mt-2">Final check before we notify the hotel management.</p>
                  </div>

                  <div className="bg-neutral-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
                      <Shield size={200} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-10 relative z-10">
                      <div>
                         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">Stay Details</p>
                         <h4 className="text-2xl font-serif italic mb-1">{selectedRoom?.room_type}</h4>
                         <p className="text-xs opacity-60 mb-6">{nights} Nights • {guestDetails.count} Guests</p>
                         
                         <div className="flex items-center gap-3 text-sm font-bold">
                            <Calendar size={16} className="text-emerald-500" />
                            <span>{bookingIn} — {bookingOut}</span>
                         </div>
                      </div>

                      <div className="text-right">
                         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">Total Amount</p>
                         <p className="text-6xl font-black italic tracking-tighter mb-2">₹{totalPrice.toLocaleString()}</p>
                         <span className="text-[10px] font-bold bg-white/10 px-4 py-2 rounded-full border border-white/20 inline-block uppercase tracking-widest">Payable at Hotel</span>
                      </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-white/10 grid grid-cols-2 gap-6 relative z-10">
                       <SummaryItem label="Guest Name" value={guestDetails.name} />
                       <SummaryItem label="Contact" value={guestDetails.phone} />
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-6 rounded-3xl flex items-center gap-4 text-emerald-800 border border-emerald-100">
                     <ShieldCheck size={24} className="shrink-0" />
                     <p className="text-xs font-bold leading-relaxed">
                        Secure Reservation: Your data is encrypted and will be directly sent to Green Garden's booking engine via priority channel.
                     </p>
                  </div>
                </motion.div>
              )}

              {/* SUCCESS STATE */}
              {status.success && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10 space-y-8">
                   <div className="w-32 h-32 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(16,185,129,0.4)]">
                     <CheckCircle2 size={64} />
                   </div>
                   <div>
                     <h3 className="text-6xl font-serif italic text-neutral-900 tracking-tighter">Reservation Sent!</h3>
                     <p className="text-neutral-500 text-lg mt-4 max-w-md mx-auto">
                        Management has been notified of your stay. A priority voucher will be sent to <b>{guestDetails.email}</b> shortly.
                     </p>
                   </div>
                   <button onClick={onClose} className="bg-black text-white px-12 py-6 rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all active:scale-95 shadow-2xl">
                     Return to Home
                   </button>
                </motion.div>
              )}

            </AnimatePresence>
          </main>

          {/* Footer Controls */}
          {!status.success && (
            <footer className="p-8 bg-white border-t border-neutral-100 flex justify-between items-center px-12 lg:px-20">
              <button 
                onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-black transition-all ${currentStep === 1 && 'opacity-0 invisible'}`}
              >
                <ChevronLeft size={18} /> Back
              </button>

              {status.error && <p className="text-red-500 text-[10px] font-black uppercase animate-bounce">{status.error}</p>}

              <button 
                onClick={currentStep === 3 ? submitReservation : handleNextStep}
                disabled={status.loading}
                className="bg-emerald-600 hover:bg-black text-white px-12 py-6 rounded-3xl flex items-center gap-4 font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl active:scale-95 group relative overflow-hidden"
              >
                {status.loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span>{currentStep === 3 ? 'Confirm & Notify' : 'Continue'}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </footer>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// --- MEGA COMPONENTS HELPER ---

function DateInput({ label, value, onChange }: any) {
  return (
    <div className="bg-white border border-neutral-200 p-6 rounded-[2.5rem] focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 block">{label}</label>
      <div className="flex items-center gap-3">
        <Calendar size={18} className="text-emerald-500" />
        <input 
          type="date" 
          value={value} 
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-none outline-none font-bold text-lg w-full text-neutral-900" 
        />
      </div>
    </div>
  );
}

function RoomCard({ room, isSelected, onSelect }: any) {
  return (
    <div 
      onClick={onSelect}
      className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all flex items-center justify-between group ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-lg' : 'border-neutral-200 bg-white hover:border-neutral-400'}`}
    >
       <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner">
            <img src={room.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h4 className="text-xl font-serif italic text-neutral-900">{room.room_type}</h4>
            <div className="flex gap-4 mt-1">
               <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1"><Users size={12}/> {room.max_occupancy} Max</span>
               <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">₹{room.price_per_night} / Night</span>
            </div>
          </div>
       </div>
       <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-neutral-200 text-transparent'}`}>
          <CheckCircle2 size={16} />
       </div>
    </div>
  );
}

function LuxeInput({ icon, placeholder, value, onChange }: any) {
  return (
    <div className="relative group">
       <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors">
         {icon}
       </div>
       <input 
          type="text" 
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white border border-neutral-200 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-bold placeholder:text-neutral-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
       />
    </div>
  );
}

function IconBox({ icon, label }: any) {
  return (
    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-white/80">
      {icon} <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}

function SummaryItem({ label, value }: any) {
  return (
    <div>
      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-white/90">{value || 'N/A'}</p>
    </div>
  );
}
