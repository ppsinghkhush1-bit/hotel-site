import React, { useState, useMemo, useEffect } from "react";
import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_12y6xre";
const TEMPLATE_ID = "template_1scrkoq";
const PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

interface BookingBarProps {
  roomName: string;
  basePrice: number;
}

export default function BookingBar({ roomName, basePrice }: BookingBarProps) {
  const today = new Date().toISOString().split("T")[0];
  const BREAKFAST_PRICE = 200;

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);

  const [sending, setSending] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  // Calculate number of nights, default 1
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  // Calculate total price live
  const totalPrice = useMemo(() => {
    const base = Number(basePrice) || 0;
    const breakfast = addBreakfast ? BREAKFAST_PRICE : 0;
    return (base + breakfast) * nights;
  }, [basePrice, addBreakfast, nights]);

  // Reset result message when input changes
  useEffect(() => {
    setResultMessage("");
  }, [checkIn, checkOut, name, mobileNo, email, addBreakfast]);

  // Send booking request via EmailJS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn || !checkOut || !name || !mobileNo || !email) {
      setResultMessage("Please fill all fields.");
      return;
    }

    setSending(true);
    setResultMessage("");

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          customer_name: name,
          customer_email: email,
          customer_mobile: mobileNo,
          room_type: roomName,
          check_in: checkIn,
          check_out: checkOut,
          add_breakfast: addBreakfast ? "Yes" : "No",
          total_price: totalPrice.toString(), // send only number/string — no ₹
        },
        PUBLIC_KEY
      );
      setResultMessage("Booking request sent successfully!");
      // Optionally reset inputs:
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
      setAddBreakfast(false);
    } catch (error) {
      console.error("EmailJS error: ", error);
      setResultMessage("Failed to send booking request. Please try again.");
    }
    setSending(false);
  };

  return (
    <section className="px-6 py-6 font-sans bg-transparent max-w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-nowrap gap-4 items-center max-w-full overflow-x-auto"
      >
        {/* Room name display */}
        <div className="min-w-[160px] font-semibold text-black whitespace-nowrap truncate">
          {roomName}
        </div>

        {/* Check In */}
        <div className="flex flex-col min-w-[150px]">
          <label htmlFor="checkIn" className="text-xs font-bold uppercase mb-1 text-black">
            Check In
          </label>
          <input
            type="date"
            id="checkIn"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Check Out */}
        <div className="flex flex-col min-w-[150px]">
          <label htmlFor="checkOut" className="text-xs font-bold uppercase mb-1 text-black">
            Check Out
          </label>
          <input
            type="date"
            id="checkOut"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Name */}
        <div className="flex flex-col min-w-[160px]">
          <label htmlFor="name" className="text-xs font-bold uppercase mb-1 text-black">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Mobile No */}
        <div className="flex flex-col min-w-[150px]">
          <label htmlFor="mobileNo" className="text-xs font-bold uppercase mb-1 text-black">
            Mobile No.
          </label>
          <input
            type="tel"
            id="mobileNo"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            placeholder="+91 1234567890"
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Email */}
        <div className="flex flex-col min-w-[170px]">
          <label htmlFor="email" className="text-xs font-bold uppercase mb-1 text-black">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Breakfast checkbox */}
        <label className="inline-flex items-center min-w-[140px] gap-2 text-black text-xs font-semibold whitespace-nowrap">
          <input
            type="checkbox"
            checked={addBreakfast}
            onChange={(e) => setAddBreakfast(e.target.checked)}
            className="w-4 h-4"
          />
          Add Breakfast ₹200
        </label>

        {/* Total Price display */}
        <div className="min-w-[140px] font-bold text-lg flex items-center justify-center text-black whitespace-nowrap">
          ₹{totalPrice.toLocaleString("en-IN")}
        </div>

        {/* Book Now button */}
        <button
          type="submit"
          disabled={sending}
          className={`min-w-[140px] rounded px-6 py-3 font-bold border border-red-600 transition ${
            sending
              ? "bg-red-600 text-white cursor-not-allowed opacity-50"
              : "text-red-600 hover:bg-red-600 hover:text-white"
          }`}
        >
          {sending ? "Booking..." : "Book Now"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-3 text-center font-semibold ${
            message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
