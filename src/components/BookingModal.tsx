import React, { useState, useMemo } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_1scrkoq";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

interface BookingFormProps {
  room: {
    name: string;
    basePrice: number;
  };
}

export default function BookingForm({ room }: BookingFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const BREAKFAST_PRICE = 200;

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Calculate nights difference; fallback to 1 for invalid input
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  const totalPrice = (room.basePrice + (addBreakfast ? BREAKFAST_PRICE : 0)) * nights;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
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
          room_name: room.name,
          base_price: room.basePrice,
          breakfast_included: addBreakfast ? "Yes" : "No",
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
      // Reset form (optional)
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
      setAddBreakfast(false);
    } catch (error) {
      console.error("EmailJS error:", error);
      setMessage("Failed to send booking request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-full px-6 py-6 font-sans">
      <form onSubmit={handleSubmit} className="flex flex-nowrap items-center gap-3 max-w-full overflow-x-auto">
        {/* Room Name Display */}
        <div className="min-w-[150px] text-black font-semibold truncate">{room.name}</div>

        {/* Check In */}
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">Check In</label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
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
            className="border border-gray-400 rounded-md p-2 text-black"
            required
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
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Mobile No */}
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">Mobile No.</label>
          <input
            type="tel"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            placeholder="+91 9000000000"
            className="border border-gray-400 rounded-md p-2 text-black"
            required
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
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Breakfast Checkbox */}
        <label className="flex items-center min-w-[130px] gap-2 text-black text-xs font-semibold">
          <input
            type="checkbox"
            checked={addBreakfast}
            onChange={(e) => setAddBreakfast(e.target.checked)}
            className="w-4 h-4"
          />
          + Add Breakfast ₹200
        </label>

        {/* Total Price */}
        <div className="min-w-[150px] font-bold text-lg flex items-center justify-center text-black">
          ₹{totalPrice.toLocaleString("en-IN")}
        </div>

        {/* Book Now button */}
        <button
          type="submit"
          disabled={sending}
          className={`min-w-[140px] py-3 px-6 rounded border border-red-600 font-bold transition ${
            sending ? "bg-red-600 text-white opacity-50 cursor-not-allowed" : "text-red-600 hover:bg-red-600 hover:text-white"
          }`}
        >
          {sending ? "Booking..." : "Book Now"}
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
