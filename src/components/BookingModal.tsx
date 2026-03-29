import { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_12y6xre';
const EMAILJS_TEMPLATE_ID = 'template_mz16rsu';
const EMAILJS_PUBLIC_KEY = 'bsmrGxOAEmpS7_WtU';

export default function BookingFormWithModal() {
  // Form fields
  const [hotel, setHotel] = useState('Blossom');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Calculate nights and price
  const nights = useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  // Example price per night lookup by hotel (customize if needed)
  const pricePerNight = hotel === 'Blossom' ? 1500 : 1200;
  const grandTotal = pricePerNight * nights;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hotel || !checkIn || !checkOut || !name || !mobileNo || !email) {
      setSubmitError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Insert booking to Supabase
      const { data, error } = await supabase.from('bookings').insert([
        {
          guest_name: name,
          guest_email: email,
          guest_phone: mobileNo,
          check_in: checkIn,
          check_out: checkOut,
          num_guests: 1, // adjust as required, or add guest field
          total_price: grandTotal,
          status: 'pending',
          room_id: null, // If you have room ID, add accordingly
          hotel_name: hotel, // optionally store hotel name
        },
      ]);

      if (error) throw error;

      // Send booking email
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          customer_name: name,
          customer_email: email,
          hotel_name: hotel,
          total_price: `₹${grandTotal}`,
          check_in: checkIn,
          check_out: checkOut,
          mobile_no: mobileNo,
        },
        EMAILJS_PUBLIC_KEY
      );

      setSubmitSuccess(true);
      // Reset form (optional)
      setHotel('Blossom');
      setCheckIn('');
      setCheckOut('');
      setName('');
      setMobileNo('');
      setEmail('');
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      {/* Booking Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-3 items-center justify-center bg-black bg-opacity-60 backdrop-blur-md p-3 rounded"
      >
        {/* Hotel */}
        <select
          aria-label="Hotel"
          value={hotel}
          onChange={(e) => setHotel(e.target.value)}
          className="p-2 rounded text-black w-36"
          required
        >
          <option value="Blossom">Blossom</option>
          <option value="Another Hotel">Another Hotel</option>
        </select>

        {/* Check In */}
        <input
          type="date"
          value={checkIn}
          min={today}
          onChange={(e) => setCheckIn(e.target.value)}
          placeholder="dd-mm-yyyy"
          className="p-2 rounded w-36 text-black"
          required
        />

        {/* Check Out */}
        <input
          type="date"
          value={checkOut}
          min={checkIn || today}
          onChange={(e) => setCheckOut(e.target.value)}
          placeholder="dd-mm-yyyy"
          className="p-2 rounded w-36 text-black"
          required
        />

        {/* Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="p-2 rounded w-40 text-black"
          required
        />

        {/* Mobile No. */}
        <input
          type="tel"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          placeholder="Mobile No."
          className="p-2 rounded w-36 text-black"
          required
        />

        {/* Email */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="p-2 rounded w-44 text-black"
          required
        />

        {/* Book Now */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`p-3 rounded border border-white text-white font-semibold ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-black transition'
          }`}
        >
          {isSubmitting ? 'Booking...' : 'Book Now'}
        </button>
      </form>

      {/* Status messages */}
      {submitSuccess && (
        <div className="mt-4 text-center text-green-500 font-semibold">
          Booking sent successfully!
        </div>
      )}
      {submitError && (
        <div className="mt-4 text-center text-red-500 font-semibold">
          {submitError}
        </div>
      )}

      {/* Price display below booking bar */}
      {checkIn && checkOut && !submitSuccess && (
        <div className="mt-2 text-center text-white font-bold text-lg">
          Price: ₹{grandTotal.toLocaleString('en-IN')} for {nights} night{nights > 1 ? 's' : ''}
        </div>
      )}
    </section>
  );
}
