import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar, Users, Bed, Wifi, Coffee, Car, Tv, Wind, Mail, 
  Phone, User, MessageSquare, ShieldCheck, Info, CheckCircle2, 
  MapPin, Clock, CreditCard, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Amenity {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  description: string;
}

interface BookingModalProps {
  isOpen?: boolean;
  onClose: () => void;
  room: {
    id: string;             // uuid
    room_type: string;      // text
    image_url: string;      // text
    description: string;    // text
    price_per_night: number;// numeric
    max_occupancy: number;  // integer
    bed_type?: string;      // text
    size_sqm?: number;      // integer
  };
}

const ADDITIONAL_SERVICES: Amenity[] = [
  { id: 'br', name: 'Premium Breakfast', price: 850, icon: <Coffee size={18} />, description: 'Buffet breakfast with local specialties' },
  { id: 'ap', name: 'Airport Pickup', price: 1200, icon: <Car size={18} />, description: 'Private luxury sedan from airport' },
  { id: 'wf', name: 'Ultra High-Speed Wifi', price: 0, icon: <Wifi size={18} />, description: 'Included - 1Gbps dedicated line' },
];

export default function BookingModal({ isOpen = true, onClose, room }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(room?.max_occupancy || 1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    agreedToTerms: false
  });

  // Sync guests count when room data loads to prevent NaN
  useEffect(() => {
    if (room?.max_occupancy) setGuests(Math.min(2, room.max_occupancy));
  }, [room]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const servicesTotal = useMemo(() => 
    ADDITIONAL_SERVICES.filter(s => selectedServices.includes(s.id)).reduce((sum, s) => sum + s.price, 0)
  , [selectedServices]);

  const totalAmount = useMemo(() => 
    ((room?.price_per_night || 0) * nights) + servicesTotal
  , [room, nights, servicesTotal]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const handleBooking = async () => {
    try {
      setIsSubmitting(true);
      const { error: dbError } = await supabase.from('bookings').insert({
        room_id: room.id,
        guest_name: `${formData.firstName} ${formData.lastName}`,
        guest_email: formData.email,
        guest_phone: formData.phone,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: guests,
        total_price: totalAmount,
        status: 'pending'
      });
      if (dbError) throw dbError;
      setSubmitSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* LEFT SIDE: Room Image & Summary */}
      <div className="lg:w-1/3 bg-neutral-900 relative p-8 text-white flex flex-col justify-between">
        <img src={room.image_url} alt="Room" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        
        <div className="relative z-10">
          <button onClick={onClose} className="mb-12 p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
          <h2 className="text-4xl font-serif mb-4">{room.room_type || 'Luxury Room'}</h2>
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex items-center gap-2"><Bed size={18}/> {room.bed_type || 'King Size Bed'}</div>
            <div className="flex items-center gap-2"><Users size={18}/> Up to {room.max_occupancy} Guests</div>
            <div className="flex items-center gap-2"><MapPin size={18}/> City View, 4th Floor</div>
          </div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Pricing Details</p>
          <div className="text-3xl font-bold">{formatCurrency(room.price_per_night || 0)} <span className="text-xs font-normal opacity-60">/ night</span></div>
        </div>
      </div>

      {/* RIGHT SIDE: Booking Flow */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-xl mx-auto py-16 px-8">
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-12">
             {[1,2,3].map(i => (
               <div key={i} className={`h-1 flex-1 mx-1 rounded-full ${currentStep >= i ? 'bg-emerald-500' : 'bg-gray-100'}`} />
             ))}
          </div>

          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-3xl font-serif mb-8">Plan your stay</h1>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Check-In</label>
                  <input type="date" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Check-Out</label>
                  <input type="date" min={checkIn || today} value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              </div>

              <div className="mb-10">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-4">Number of Guests</label>
                <div className="flex items-center gap-4 bg-gray-50 w-fit p-1 rounded-xl">
                  <button onClick={() => setGuests(prev => Math.max(1, prev - 1))} className="w-10 h-10 bg-white rounded-lg shadow-sm font-bold">-</button>
                  <span className="w-8 text-center font-bold">{guests || 0}</span>
                  <button onClick={() => setGuests(prev => Math.min(room.max_occupancy, prev + 1))} className="w-10 h-10 bg-white rounded-lg shadow-sm font-bold">+</button>
                </div>
              </div>

              <h3 className="font-serif text-xl mb-6">Enhance your experience</h3>
              <div className="space-y-3 mb-12">
                {ADDITIONAL_SERVICES.map(service => (
                  <button 
                    key={service.id} 
                    onClick={() => setSelectedServices(prev => prev.includes(service.id) ? prev.filter(x => x !== service.id) : [...prev, service.id])}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${selectedServices.includes(service.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-50 hover:border-gray-100'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${selectedServices.includes(service.id) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{service.icon}</div>
                      <div className="text-left">
                        <p className="font-bold text-sm">{service.name}</p>
                        <p className="text-[10px] text-gray-500">{service.description}</p>
                      </div>
                    </div>
                    <span className="font-bold text-sm">{service.price === 0 ? 'FREE' : `+₹${service.price}`}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4">
              <h1 className="text-3xl font-serif mb-8">Your Details</h1>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="p-4 bg-gray-50 rounded-xl border-none" />
                <input type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="p-4 bg-gray-50 rounded-xl border-none" />
              </div>
              <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl border-none mb-4" />
              <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl border-none mb-4" />
              <textarea placeholder="Special Requests" rows={4} value={formData.specialRequests} onChange={e => setFormData({...formData, specialRequests: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl border-none" />
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button onClick={() => setCurrentStep(prev => prev - 1)} className="px-8 py-4 font-bold text-gray-400">Back</button>
            )}
            <button 
              onClick={() => currentStep < 2 ? setCurrentStep(2) : handleBooking()}
              disabled={currentStep === 1 && nights === 0}
              className="flex-1 bg-neutral-900 text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 disabled:opacity-20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Processing...' : currentStep === 1 ? 'Continue' : `Confirm ${formatCurrency(totalAmount)}`}
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      </div>

      {submitSuccess && (
        <div className="fixed inset-0 bg-white z-[70] flex items-center justify-center text-center p-8 animate-in zoom-in-95">
          <div className="max-w-sm">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40}/></div>
            <h2 className="text-3xl font-serif mb-2">Booking Confirmed!</h2>
            <p className="text-gray-500 mb-8 text-sm">A confirmation email has been sent to {formData.email}. We look forward to seeing you!</p>
            <button onClick={onClose} className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold">Return Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
