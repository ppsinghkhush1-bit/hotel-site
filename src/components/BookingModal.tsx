import React, { useState, useEffect, useMemo } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_1scrkoq";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

interface BookingBarProps {
  roomName: string;
  basePrice: number;
}

export default function BookingBar({ roomName, basePrice }: BookingBarProps) {
  const today = new Date().toISOString().split("T")[0];
  const BREAKFAST_COST = 200;

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Calculate nights between dates; fallback to 1 to avoid NaN
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  // Calculate total price live
  const totalPrice = useMemo(() => {
    const validBase = Number(basePrice) || 0;
    const breakfast = addBreakfast ? BREAKFAST_COST : 0;
    return (validBase + breakfast) * nights;
  }, [basePrice, nights, addBreakfast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn || !checkOut || !name || !mobileNo || !email) {
      setMessage("Please fill in all the required fields.");
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
          base_price: basePrice.toString(),
          add_breakfast: addBreakfast ? "Yes" : "No",
          total_price: `₹${totalPrice}`,
          check_in: checkIn,
          check_out: checkOut,
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email,
          nights: nights.toString(),
        },
        EMAILJS_PUBLIC_KEY
      );
      setMessage("Booking request sent successfully!");
      // Reset form on success if you want:
      // setCheckIn(""); setCheckOut(""); setName("");
      // setMobileNo(""); setEmail(""); setAddBreakfast(false);
    } catch (error) {
      console.error("EmailJS sending error:", error);
      setMessage("Failed to send booking. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-full px-6 py-5 font-sans bg-transparent w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-nowrap overflow-x-auto gap-4 items-center max-w-full"
        noValidate
      >
        <div className="min-w-[140px] text-black font-semibold whitespace-nowrap">
          {roomName}
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label htmlFor="checkIn" className="text-xs font-semibold uppercase mb-1 text-black">
            Check In
          </label>
          <input
            id="checkIn"
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label htmlFor="checkOut" className="text-xs font-semibold uppercase mb-1 text-black">
            Check Out
          </label>
          <input
            id="checkOut"
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        <div className="flex flex-col min-w-[160px]">
          <label htmlFor="name" className="text-xs font-semibold uppercase mb-1 text-black">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label htmlFor="mobile" className="text-xs font-semibold uppercase mb-1 text-black">
            Mobile No.
          </label>
          <input
            id="mobile"
            type="tel"
            placeholder="+91 9000000000"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        <div className="flex flex-col min-w-[180px]">
          <label htmlFor="email" className="text-xs font-semibold uppercase mb-1 text-black">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        <label className="inline-flex items-center min-w-[140px] gap-2 text-black text-xs font-semibold whitespace-nowrap">
          <input
            type="checkbox"
            checked={addBreakfast}
            onChange={(e) => setAddBreakfast(e.target.checked)}
            className="w-4 h-4"
          />
          + Add Breakfast ₹200
        </label>

        <div className="min-w-[140px] font-bold text-lg text-black flex items-center justify-center whitespace-nowrap">
          ₹{totalPrice.toLocaleString("en-IN")}
        </div>

        <button
          type="submit"
          disabled={sending}
          className={`min-w-[140px] px-6 py-3 rounded border border-red-600 font-bold transition ${
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
            message.toLowerCase().includes("success")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
