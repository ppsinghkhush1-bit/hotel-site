import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_1scrkoq";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

interface BookingFormProps {
  basePrice: number;           // Room price per night (number) passed as prop
  roomName?: string;           // optional room name, shown as label (can be hidden)
}

export default function BookingForm({ basePrice, roomName }: BookingFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);

  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Validate that basePrice is a valid number, fallback 0
  const validBasePrice = typeof basePrice === "number" && !isNaN(basePrice) ? basePrice : 0;
  const breakfastPrice = addBreakfast ? 200 : 0;

  // Calculate nights to avoid NaN
  const getNights = () => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = getNights();
  const totalPrice = (validBasePrice + breakfastPrice) * nights;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn || !checkOut || !name || !mobileNo || !email) {
      setMessage("Please fill all fields.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          room_name: roomName || '',      // Optional, or remove as you prefer
          base_price: validBasePrice,
          add_breakfast: addBreakfast ? "Yes" : "No",
          total_price: `₹${totalPrice}`,
          check_in: checkIn,
          check_out: checkOut,
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email,
        },
        EMAILJS_PUBLIC_KEY
      );

      setMessage("Booking request sent successfully!");
      // Optionally clear form fields here

    } catch (err) {
      console.error(err);
      setMessage("Failed to send booking request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-full px-6 py-6 font-sans">
      <form
        onSubmit={handleSubmit}
        className="flex flex-nowrap items-center gap-3 max-w-full overflow-x-auto"
      >
        {/* Optional room name label - remove below block if you don't want to show */}
        {/* <div className="flex flex-col text-black text-xs font-semibold min-w-[140px]">
          <label>Room</label>
          <div className="p-2 border border-black rounded-md bg-gray-100">{roomName}</div>
        </div> */}

        {/* Check In */}
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase text-black mb-1">Check In</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={today}
            placeholder="dd-mm-yyyy"
            className="border border-black rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Check Out */}
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase text-black mb-1">Check Out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || today}
            placeholder="dd-mm-yyyy"
            className="border border-black rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Name */}
        <div className="flex flex-col min-w-[160px]">
          <label className="text-xs font-semibold uppercase text-black mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="border border-black rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Mobile No */}
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase text-black mb-1">Mobile No.</label>
          <input
            type="tel"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            placeholder="+91..."
            className="border border-black rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Email */}
        <div className="flex flex-col min-w-[180px]">
          <label className="text-xs font-semibold uppercase text-black mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border border-black rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Add Breakfast */}
        <label className="flex items-center min-w-[130px] gap-2 text-black text-xs font-semibold">
          <input
            type="checkbox"
            checked={addBreakfast}
            onChange={(e) => setAddBreakfast(e.target.checked)}
          />
          + Add Breakfast ₹200
        </label>

        {/* Total Price Display */}
        <div className="min-w-[140px] font-bold text-lg flex items-center justify-center text-black">
          ₹{totalPrice.toLocaleString("en-IN")}
        </div>

        {/* Book Now Button */}
        <button
          type="submit"
          disabled={sending}
          className={`ml-4 border border-red-600 rounded px-6 py-3 font-bold transition ${
            sending
              ? "bg-red-600 text-white cursor-not-allowed opacity-50"
              : "text-red-600 hover:bg-red-600 hover:text-white"
          }`}
        >
          {sending ? "Booking..." : "Book Now"}
        </button>
      </form>
    </section>
  );
}
