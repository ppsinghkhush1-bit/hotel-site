import { useState } from 'react';

export default function DirectBookingForm() {
  const [hotel, setHotel] = useState('Blossom');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Booking Submitted for ${name} at ${hotel}`);
  };

  return (
    <section className="bg-black text-white p-4">
      {/* Booking Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-4 items-center justify-center max-w-full overflow-x-auto"
      >
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

      {/* Contact info */}
      <div className="mt-4 text-center text-gray-300 text-sm">
        Phone No. +91 07814 91779 | Reservation Number | Email: hotelgreengarden0112@gmail.com
      </div>

      {/* Benefits of Direct Booking Banner */}
      <div className="mt-8 max-w-full overflow-x-auto">
        <div className="relative bg-black bg-opacity-90 rounded-lg shadow-lg flex items-center justify-between px-6 py-4 max-w-full whitespace-nowrap text-white font-bold text-xl"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 50%, calc(100% - 30px) 100%, 0 100%)'
          }}
        >
          {/* Text Section */}
          <div>
            BENEFITS OF DIRECT <span className="underline">BOOKING</span><br />
            <span className="text-sm font-normal normal-case mt-1 block">
              *Subject To Availability
            </span>
          </div>

          {/* Icons with labels */}
          <div className="flex space-x-16 ml-10 text-base font-semibold">
            {/* ROOM UPGRADE */}
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 10h2v4H3v-4zm4 0h2v4H7v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4zM21 10h-2v4h2v-4z" />
                <path d="M17 10V5a2 2 0 00-2-2H9a2 2 0 00-2 2v5h10z" />
              </svg>
              <span>ROOM UPGRADE</span>
            </div>
            {/* EARLY CHECK-IN */}
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 7V3m8 4V3m-4 18v-4m-2-5h4m-6 7a9 9 0 11-2-7.89M12 8v4l2 2" />
              </svg>
              <span>EARLY CHECK-IN</span>
            </div>
            {/* LATE CHECK-OUT */}
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 4v2m0 12v2m8-10h-3M7 8H4m16 4h-3M7 16H4m14.364-1.636l-2.121-2.12M7.757 7.757L5.636 5.636m0 10.728l2.121-2.12M16.243 16.243l2.121 2.122" />
              </svg>
              <span>LATE CHECK-OUT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
