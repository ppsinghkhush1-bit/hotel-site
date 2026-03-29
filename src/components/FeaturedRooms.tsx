import { useState } from 'react';

export default function DirectBookingForm() {
  // Form state
  const [hotel, setHotel] = useState('Blossom');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement booking submit logic here
    alert(`Booking Submitted for ${name} at ${hotel}`);
  };

  return (
    <section className="bg-black text-white p-4">
      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-center justify-center max-w-full overflow-x-auto">
        {/* Hotel Select */}
        <label>
          Hotel
          <select
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            className="mx-2 p-2 rounded border border-gray-300 text-black"
          >
            <option value="Blossom">Blossom</option>
            <option value="Another Hotel">Another Hotel</option>
            {/* Add more hotels if needed */}
          </select>
        </label>

        {/* Check In */}
        <label>
          Check In
          <input
            type="date"
            placeholder="dd-mm-yyyy"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mx-2 p-2 rounded border border-gray-300 text-black"
          />
        </label>

        {/* Check Out */}
        <label>
          Check Out
          <input
            type="date"
            placeholder="dd-mm-yyyy"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mx-2 p-2 rounded border border-gray-300 text-black"
          />
        </label>

        {/* Name */}
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mx-2 p-2 rounded border border-gray-300 text-black"
            required
          />
        </label>

        {/* Mobile No */}
        <label>
          Mobile No.
          <input
            type="tel"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            className="mx-2 p-2 rounded border border-gray-300 text-black"
            required
          />
        </label>

        {/* E-mail */}
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mx-2 p-2 rounded border border-gray-300 text-black"
            required
          />
        </label>

        {/* Book Now Button */}
        <button
          type="submit"
          className="bg-white text-black font-bold py-2 px-4 rounded ml-2"
        >
          Book Now
        </button>
      </form>

      {/* Contact info below form */}
      <div className="mt-4 text-center text-gray-300">
        Phone No. +91 80191600498 | Reservation Number | Email: reservations@blossomhotels.in
      </div>
    </section>
  );
}
