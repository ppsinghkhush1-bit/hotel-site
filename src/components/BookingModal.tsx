import React, { useState } from "react";

export default function DirectBookingForm() {
  // Form state
  const [hotel, setHotel] = useState("Blossom");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your submit logic here (e.g. EmailJS or API call)
    alert(`Booking submitted for ${name} at ${hotel}`);
  };

  return (
    <section className="font-sans">
      {/* Booking bar container */}
      <form
        onSubmit={handleSubmit}
        className="bg-transparent p-4 grid grid-cols-7 gap-x-4 items-end overflow-x-auto"
      >
        {/* Labels above inputs */}
        <div className="col-span-1 text-white font-semibold text-xs mb-1 whitespace-nowrap">
          Hotel
        </div>
        <div className="col-span-1 text-white font-semibold text-xs mb-1 whitespace-nowrap">
          Check In
        </div>
        <div className="col-span-1 text-white font-semibold text-xs mb-1 whitespace-nowrap">
          Check Out
        </div>
        <div className="col-span-1 text-white font-semibold text-xs mb-1 whitespace-nowrap">
          Name
        </div>
        <div className="col-span-1 text-white font-semibold text-xs mb-1 whitespace-nowrap">
          Mobile No.
        </div>
        <div className="col-span-1 text-white font-semibold text-xs mb-1 whitespace-nowrap">
          E-mail
        </div>
        <div></div> {/* Empty column for Book Now label alignment */}

        {/* Input fields */}
        <select
          value={hotel}
          onChange={(e) => setHotel(e.target.value)}
          className="col-span-1 rounded border border-black p-2 text-black"
          aria-label="Hotel"
          required
        >
          <option>Blossom</option>
          <option>Another Hotel</option>
        </select>

        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="col-span-1 p-2 rounded border border-black text-black"
          aria-label="Check In"
          required
        />

        <input
          type="date"
          min={checkIn || today}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="col-span-1 p-2 rounded border border-black text-black"
          aria-label="Check Out"
          required
        />

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder=""
          className="col-span-1 p-2 rounded border border-black text-black"
          aria-label="Name"
          required
        />

        <input
          type="tel"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          placeholder=""
          className="col-span-1 p-2 rounded border border-black text-black"
          aria-label="Mobile No."
          required
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=""
          className="col-span-1 p-2 rounded border border-black text-black"
          aria-label="E-mail"
          required
        />

        {/* Book Now button */}
        <button
          type="submit"
          className="col-span-1 border border-red-600 text-red-600 font-bold rounded py-2 px-5 hover:bg-red-600 hover:text-white transition"
        >
          Book Now
        </button>
      </form>

      {/* Contact bar */}
      <div className="bg-[#473605] text-white text-center py-4 px-3 tracking-wide">
        <h2 className="font-bold text-lg mb-1">Direct Hotel Booking</h2>
        <p className="text-sm">
          Phone No. +91 80191600498 | Reservation Number , Email:{" "}
          <a href="mailto:reservations@blossomhotels.in" className="underline">
            reservations@blossomhotels.in
          </a>
        </p>
      </div>

      {/* Benefits Banner */}
      <div className="mt-8 overflow-x-auto">
        <div
          className="relative bg-black bg-opacity-90 rounded-lg shadow-lg flex items-center justify-between px-6 py-4 whitespace-nowrap text-white font-bold text-xl max-w-full"
          style={{
            clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 50%, calc(100% - 30px) 100%, 0 100%)",
          }}
        >
          <div>
            BENEFITS OF DIRECT <span className="underline">BOOKING</span>
            <br />
            <span className="text-sm font-normal normal-case mt-1 block">
              *Subject To Availability
            </span>
          </div>

          <div className="flex space-x-12 ml-10 text-base font-semibold">
            {/* Room Upgrade */}
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

            {/* Early Check-In */}
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

            {/* Late Check-Out */}
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
