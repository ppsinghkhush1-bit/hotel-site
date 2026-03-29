import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_mz16rsu";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

interface BookingFormProps {
  roomName: string;           // e.g. "Luxury Room"
  basePrice: number;          // e.g. 2500
  onBookingSuccess?: () => void; // optional callback after success
}

export default function BookingForm({ roomName, basePrice, onBookingSuccess }: BookingFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);

  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Breakfast cost fixed at 200 (adjust as needed)
  const breakfastCost = 200;

  // Calculate total price live
  const totalPrice = basePrice + (addBreakfast ? breakfastCost : 0);

  // Basic date validation for check-in / check-out
  const isValidDates = checkIn && checkOut && new Date(checkOut) > new Date(checkIn);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidDates) {
      setMessage("Please select valid Check-In and Check-Out dates.");
      return;
    }
    if (!name || !mobileNo || !email) {
      setMessage("Please fill all required fields.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          room_type: roomName,
          base_price: basePrice,
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
      // Optional: run callback after success
      if (onBookingSuccess) onBookingSuccess();

      // Reset form
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
      setAddBreakfast(false);
    } catch (error) {
      console.error(error);
      setMessage("Failed to send booking request. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-full px-6 py-6 bg-transparent font-sans">
      <form
        onSubmit={handleSubmit}
        className="flex flex-nowrap items-center gap-4 max-w-full overflow-x-auto"
      >
        {/* Room Type - show as label, removed hotel select */}
        <div className="flex flex-col text-black text-xs font-semibold min-w-[140px]">
          <label>Room</label>
          <div className="p-2 border border-black rounded-md bg-gray-100">{roomName}</div>
        </div>

        {/* Check In */}
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase text-black mb-1">Check In</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={today}
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
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
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
            placeholder="example@mail.com"
            className="border border-black rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Add Breakfast Checkbox */}
        <label className="flex items-center min-w-[130px] gap-2 text-black text-xs font-semibold">
          <input
            type="checkbox"
            checked={addBreakfast}
            onChange={(e) => setAddBreakfast(e.target.checked)}
          />
          Add Breakfast ₹200
        </label>

        {/* Total Price */}
        <div className="min-w-[140px] text-black font-bold text-lg flex items-center justify-center">
          ₹{totalPrice}
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
          {sending ? "Sending..." : "Book Now"}
        </button>
      </form>

      {/* Message */}
      {message && (
        <p
          className={`mt-3 text-center text-sm font-semibold ${
            message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
