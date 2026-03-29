import React, { useState, useEffect } from "react";
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

  // Form state
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Calculate nights between dates
  const nights = React.useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  const breakfastPrice = addBreakfast ? 200 : 0;

  // Total price calculation
  const totalPrice = (basePrice + breakfastPrice) * nights;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !checkIn ||
      !checkOut ||
      !name.trim() ||
      !mobileNo.trim() ||
      !email.trim()
    ) {
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
      // Clear inputs optionally:
      // setCheckIn("");
      // setCheckOut("");
      // setName("");
      // setMobileNo("");
      // setEmail("");
      // setAddBreakfast(false);
    } catch (error) {
      setMessage("Failed to send booking request. Please try again.");
      console.error("EmailJS error:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-full px-6 py-6 font-sans bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="flex flex-nowrap items-center gap-3 max-w-full overflow-x-auto"
      >
        {/* Room Name Display */}
        <div className="min-w-[140px] text-black font-semibold truncate">
          {roomName}
        </div>

        {/* Check In */}
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">Check In</label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="border border-black rounded-md p-2 text-black"
          />
        </div>

        {/* Check Out */}
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">Check Out</label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="border border-black rounded-md p-2 text-black"
          />
        </div>

        {/* Name */}
        <div className="flex flex-col min-w-[160px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
            className="border border-black rounded-md p-2 text-black"
          />
        </div>

        {/* Mobile No */}
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">Mobile No.</label>
          <input
            type="tel"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            placeholder="+91..."
            required
            className="border border-black rounded-md p-2 text-black"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col min-w-[180px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            required
            className="border border-black rounded-md p-2 text-black"
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

      {message && (
        <p
          className={`mt-3 text-center text-sm font-semibold ${
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
