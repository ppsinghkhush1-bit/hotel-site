import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

export default function BookingModal({ isOpen, onClose, room }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', in: '', out: '' });

  if (!isOpen) return null;

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // 1. Supabase Store
      await supabase.from('bookings').insert([{
        room_id: room.id,
        guest_name: form.name,
        guest_phone: form.phone,
        check_in: form.in,
        check_out: form.out,
        total_price: room.basePrice
      }]);

      // 2. EmailJS Send (Matches your Template image)
      await emailjs.send(
        'service_12y6xre', 
        'template_mz16rsu', 
        {
          guest_name: form.name,
          guest_phone: form.phone,
          guest_email: form.email,
          room_name: room.name,
          check_in: form.in,
          check_out: form.out,
          total_price: room.basePrice,
          title: "New Booking Received"
        }, 
        'bsmrGxOAEmpS7_WtU'
      );

      setSuccess(true);
    } catch (err) {
      alert("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full"><X/></button>
        
        {success ? (
          <div className="text-center py-10">
            <CheckCircle2 size={60} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Booking Sent!</h2>
            <p className="text-gray-500 mt-2">We will call you at {form.phone}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-3xl font-serif italic">{step === 1 ? 'Select Dates' : 'Your Details'}</h2>
            
            {step === 1 ? (
              <div className="space-y-4">
                <input type="date" className="w-full p-4 border rounded-xl" onChange={e => setForm({...form, in: e.target.value})} />
                <input type="date" className="w-full p-4 border rounded-xl" onChange={e => setForm({...form, out: e.target.value})} />
                <button onClick={() => setStep(2)} className="w-full bg-black text-white py-4 rounded-xl font-bold">Next Step</button>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" placeholder="Name" className="w-full p-4 border rounded-xl" onChange={e => setForm({...form, name: e.target.value})} />
                <input type="tel" placeholder="Phone" className="w-full p-4 border rounded-xl" onChange={e => setForm({...form, phone: e.target.value})} />
                <input type="email" placeholder="Email" className="w-full p-4 border rounded-xl" onChange={e => setForm({...form, email: e.target.value})} />
                <button onClick={handleFinalSubmit} disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold">
                  {loading ? <Loader2 className="animate-spin mx-auto"/> : "Confirm Now"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
