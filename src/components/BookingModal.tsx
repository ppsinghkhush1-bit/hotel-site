import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  X, Calendar, Users, Bed, Wifi, Coffee, Car, Tv, Wind, Mail, 
  Phone, User, MessageSquare, ShieldCheck, Info, CheckCircle2, 
  MapPin, Clock, CreditCard, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// --- Interfaces ---

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
    id: string; // Database UUID
    room_type: string;
    image_url: string;
    description: string;
    price_per_night: number;
    max_occupancy: number;
    size_sqm?: number;
    bed_type?: string;
  };
}

// --- Constants & Mock Data ---

const ADDITIONAL_SERVICES: Amenity[] = [
  { id: 'br', name: 'Premium Breakfast', price: 850, icon: <Coffee size={18} />, description: 'Buffet breakfast with local specialties' },
  { id: 'ap', name: 'Airport Pickup', price: 1200, icon: <Car size={18} />, description: 'Private luxury sedan from airport' },
  { id: 'wf', name: 'Ultra High-Speed Wifi', price: 0, icon: <Wifi size={18} />, description: 'Included - 1Gbps dedicated line' },
  { id: 'cl', name: 'Late Check-out', price: 1500, icon: <Clock size={18} />, description: 'Stay until 6:00 PM' },
];

// --- Helper Components ---

const ProgressBar = ({ step }: { step: number }) => (
  <div className="flex items-center w-full mb-8 px-4">
    {[1, 2, 3].map((i) => (
      <React.Fragment key={i}>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 ${
          step >= i ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-300 text-gray-400'
        }`}>
          {step > i ? <CheckCircle2 size={20} /> : i}
        </div>
        {i < 3 && (
          <div className={`flex-1 h-1 mx-2 transition-all duration-500 ${
            step > i ? 'bg-emerald-600' : 'bg-gray-200'
          }`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// --- Main Component ---

export default function BookingModal({
  isOpen = true,
  onClose,
  room
}: BookingModalProps) {
  // 1. State Management
  const [currentStep, setCurrentStep] = useState(1);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  // Guest Details
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    agreedToTerms: false
  });

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Memoized Calculations
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [checkIn, checkOut]);

  const servicesTotal = useMemo(() => {
    return ADDITIONAL_SERVICES
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  const subtotal = useMemo(() => (room.price_per_night * nights), [room.price_per_night, nights]);
  const tax = useMemo(() => (subtotal + servicesTotal) * 0.12, [subtotal, servicesTotal]);
  const grandTotal = useMemo(() => subtotal + servicesTotal + tax, [subtotal, servicesTotal, tax]);

  // 3. Handlers
  const handleServiceToggle = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const validateStep = () => {
    if (currentStep === 1) return nights > 0 && guests <= room.max_occupancy;
    if (currentStep === 2) {
      return (
        formData.firstName.length > 1 &&
        formData.email.includes('@') &&
        formData.phone.length >= 10 &&
        formData.agreedToTerms
      );
    }
    return true;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleBooking = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { error: dbError } = await supabase
        .from('bookings')
        .insert({
          room_id: room.id,
          guest_name: `${formData.firstName} ${formData.lastName}`,
          guest_email: formData.email,
          guest_phone: formData.phone,
          check_in: checkIn,
          check_out: checkOut,
          num_guests: guests,
          total_price: grandTotal,
          status: 'pending',
          special_requests: formData.specialRequests,
          metadata: {
            services: selectedServices,
            nights: nights,
            room_type: room.room_type
          }
        });

      if (dbError) throw dbError;

      // Call Supabase Edge Function for Email
      await supabase.functions.invoke('send-booking-email', {
        body: {
          to: formData.email,
          subject: `Booking Confirmed: ${room.room_type}`,
          data: {
            customerName: formData.firstName,
            total: formatCurrency(grandTotal),
            checkIn,
            checkOut
          }
        }
      });

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error('Final Booking Error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- Success View ---
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="max-w-xl w-full text-center">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <ShieldCheck size={48} />
          </div>
          <h2 className="text-4xl font-serif text-gray-900 mb-4">Your stay is booked!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            A confirmation email has been sent to <span className="font-semibold">{formData.email}</span>. 
            We look forward to welcoming you to the {room.room_type}.
          </p>
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Confirmation ID</span>
              <span className="font-mono font-bold">#BK-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Dates</span>
              <span className="font-semibold">{checkIn} to {checkOut}</span>
            </div>
          </div>
          <button onClick={onClose} className="bg-neutral-900 text-white px-12 py-4 rounded-full hover:bg-neutral-800 transition-all font-bold tracking-widest uppercase text-sm">
            Close & Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom duration-500">
      
      {/* --- Left Panel: Visuals & Info (Hidden on mobile scroll) --- */}
      <div className="hidden lg:flex lg:w-2/5 relative bg-neutral-900 overflow-hidden">
        <img 
          src={room.image_url} 
          alt={room.room_type} 
          className="absolute inset-0 w-full h-full object-cover opacity-60" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
          <div>
            <button onClick={onClose} className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all mb-12">
              <X size={24} />
            </button>
            <h1 className="text-6xl font-serif mb-6 leading-tight">{room.room_type}</h1>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center gap-3"><Bed size={20} /> <span>{room.bed_type || 'King Size Bed'}</span></div>
              <div className="flex items-center gap-3"><Users size={20} /> <span>Up to {room.max_occupancy} Guests</span></div>
              <div className="flex items-center gap-3"><MapPin size={20} /> <span>City View, 4th Floor</span></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
            <p className="text-sm uppercase tracking-widest text-emerald-400 font-bold mb-2">Pricing Details</p>
            <div className="text-4xl font-bold mb-1">{formatCurrency(room.price_per_night)} <span className="text-sm font-normal text-gray-400">/ night</span></div>
            <p className="text-xs text-gray-400 leading-relaxed">Best price guarantee. Prices include access to our rooftop pool and wellness center.</p>
          </div>
        </div>
      </div>

      {/* --- Right Panel: Booking Flow --- */}
      <div className="flex-1 overflow-y-auto bg-white relative">
        {/* Mobile Close Button */}
        <button onClick={onClose} className="lg:hidden absolute top-4 right-4 z-20 p-2 bg-gray-100 rounded-full">
          <X size={20} />
        </button>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <ProgressBar step={currentStep} />

          {/* Step 1: Dates & Services */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-serif mb-8">Plan your stay</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-tighter">Check-In</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="date" 
                      min={today}
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-tighter">Check-Out</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="date" 
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <label className="text-xs font-bold uppercase text-gray-400 block mb-4">Number of Guests</label>
                <div className="flex items-center gap-6 bg-gray-50 w-fit p-2 rounded-2xl">
                  <button 
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{guests}</span>
                  <button 
                    onClick={() => setGuests(Math.min(room.max_occupancy, guests + 1))}
                    className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-serif mb-6">Enhance your experience</h3>
              <div className="grid grid-cols-1 gap-4 mb-12">
                {ADDITIONAL_SERVICES.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceToggle(service.id)}
                    className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all text-left ${
                      selectedServices.includes(service.id) 
                        ? 'border-emerald-500 bg-emerald-50/30' 
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${selectedServices.includes(service.id) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {service.icon}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{service.name}</p>
                        <p className="text-xs text-gray-500">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {service.price === 0 ? 'FREE' : `+${formatCurrency(service.price)}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Guest Information */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-serif mb-8">Guest Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">First Name</label>
                  <input 
                    type="text"
                    placeholder="John"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Last Name</label>
                  <input 
                    type="text"
                    placeholder="Doe"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email"
                      placeholder="john@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Special Requests</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} />
                    <textarea 
                      placeholder="e.g., allergies, quiet room, anniversary setup..."
                      rows={4}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                      value={formData.specialRequests}
                      onChange={e => setFormData({...formData, specialRequests: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-amber-50 rounded-3xl mb-8 flex gap-4 border border-amber-100">
                <Info className="text-amber-600 flex-shrink-0" size={20} />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Cancellation Policy:</strong> Free cancellation up to 48 hours before check-in. 
                  After that, the first night will be charged.
                </p>
              </div>

              <label className="flex items-center gap-4 cursor-pointer group mb-12">
                <input 
                  type="checkbox"
                  className="w-6 h-6 rounded-lg text-emerald-600 border-gray-200 focus:ring-emerald-500"
                  checked={formData.agreedToTerms}
                  onChange={e => setFormData({...formData, agreedToTerms: e.target.checked})}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  I agree to the Terms of Service and Privacy Policy.
                </span>
              </label>
            </div>
          )}

          {/* Step 3: Confirmation & Payment */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-serif mb-8">Review & Confirm</h2>
              
              <div className="bg-gray-50 rounded-3xl p-8 mb-8">
                <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{room.room_type}</h4>
                    <p className="text-gray-500">{nights} Nights • {guests} Guests</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Dates</p>
                    <p className="font-bold">{checkIn} — {checkOut}</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm mb-8">
                  <div className="flex justify-between text-gray-600">
                    <span>{nights} Nights x {formatCurrency(room.price_per_night)}</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {selectedServices.length > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Add-on Services</span>
                      <span>{formatCurrency(servicesTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & Fees (12%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                    <span>Total Amount</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl flex items-center gap-4 border border-gray-100">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <CreditCard size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Payment Method</p>
                    <p className="text-xs text-gray-500">Pay at Hotel / Guarantee with Card</p>
                  </div>
                  <button className="text-xs font-bold text-emerald-600 hover:underline">Change</button>
                </div>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-shake">
                  <AlertTriangle size={20} />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* --- Bottom Navigation Bar --- */}
          <div className="flex items-center gap-4 mt-12">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
              >
                Back
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!validateStep()}
                className="flex-1 flex items-center justify-center gap-3 bg-neutral-900 text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-xl shadow-black/5"
              >
                Continue to {currentStep === 1 ? 'Guest Info' : 'Confirmation'}
                <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleBooking}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-3 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 disabled:bg-emerald-300 transition-all shadow-xl shadow-emerald-500/20"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>Complete Booking - {formatCurrency(grandTotal)}</>
                )}
              </button>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-gray-400">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
              <ShieldCheck size={14} className="text-emerald-500" />
              Secure Checkout
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
              <Clock size={14} />
              24/7 Support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
