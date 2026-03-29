import { useState } from 'react';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_12y6xre';
const EMAILJS_TEMPLATE_ID = 'template_mz16rsu';
const EMAILJS_PUBLIC_KEY = 'bsmrGxOAEmpS7_WtU';

export default function DirectBookingForm() {
  // form state
  const [hotel, setHotel] = useState('Blossom');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut || !name || !mobileNo || !email) {
      alert('Please fill all required fields.');
      return;
    }

    setSending(true);

    try {
      const templateParams = {
        to_email: 'hotelgreengarden0112@gmail.com',
        hotel,
        check_in: checkIn,
        check_out: checkOut,
        name,
        mobile_no: mobileNo,
        from_email: email,
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      alert('Booking request sent successfully!');
      // Reset form
      setHotel('Blossom');
      setCheckIn('');
      setCheckOut('');
      setName('');
      setMobileNo('');
      setEmail('');
    } catch (error) {
      console.error('EmailJS error:', error);
      alert('Failed to send booking request. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      className="bg-black bg-opacity-50 backdrop-blur-md px-4 py-3"
      style={{ fontFamily: 'inherit' }} // inherit font for consistency (optional)
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-full flex flex-wrap items-center gap-3 justify-center text-white text-sm font-medium"
      >
        {/* Hotel Select */}
        <label className="flex flex-col">
          <span className="sr-only">Hotel</span>
          <select
            aria-label="Select Hotel"
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            className="h-10 w-36 rounded-sm text-black px-2 border border-gray-300"
          >
            <option>Blossom</option>
            <option>Another Hotel</option>
          </select>
        </label>

        {/* Check In */}
        <label className="flex flex-col">
          <span className="sr-only">Check In</span>
          <input
            type="date"
            placeholder="dd-mm-yyyy"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="h-10 w-36 rounded-sm px-2 text-black border border-gray-300"
            required
          />
        </label>

        {/* Check Out */}
        <label className="flex flex-col">
          <span className="sr-only">Check Out</span>
          <input
            type="date"
            placeholder="dd-mm-yyyy"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="h-10 w-36 rounded-sm px-2 text-black border border-gray-300"
            required
          />
        </label>

        {/* Name */}
        <label className="flex flex-col">
          <span className="sr-only">Name</span>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-44 rounded-sm px-2 text-black border border-gray-300"
            required
          />
        </label>

        {/* Mobile No */}
        <label className="flex flex-col">
          <span className="sr-only">Mobile No</span>
          <input
            type="tel"
            placeholder="Mobile No."
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            className="h-10 w-36 rounded-sm px-2 text-black border border-gray-300"
            required
          />
        </label>

        {/* E-mail */}
        <label className="flex flex-col">
          <span className="sr-only">E-mail</span>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-44 rounded-sm px-2 text-black border border-gray-300"
            required
          />
        </label>

        {/* Book Now Button */}
        <button
          type="submit"
          disabled={sending}
          className={`h-10 px-5 rounded-sm font-semibold ${
            sending
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-100'
          } transition`}
        >
          {sending ? 'Sending...' : 'Book Now'}
        </button>
      </form>

      {/* Contact info below, adapt styling as you need */}
      <div className="mt-4 text-center text-sm text-gray-300">
        Phone No. +91 80191600498 | Reservation Number | Email: reservations@blossomhotels.in
      </div>
    </section>
  );
}
