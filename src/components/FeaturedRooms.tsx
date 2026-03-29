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
  const [message, setMessage] = useState("");

  // Reset form when room changes
  useEffect(() => {
    setCheckIn("");
    setCheckOut("");
    setName("");
    setMobileNo("");
    setEmail("");
    setAddBreakfast(false);
    setMessage("");
  }, [roomName, basePrice]);

  // Calculate nights difference, minimum 1
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  // Calculate total price live
  const totalPrice = useMemo(() => {
    const base = Number(basePrice) || 0;
    return (base + (addBreakfast ? BREAKFAST_PRICE : 0)) * nights;
  }, [basePrice, addBreakfast, nights]);

  // Handle input and checkbox changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    switch (name) {
      case "checkIn":
        setCheckIn(value);
        break;
      case "checkOut":
        setCheckOut(value);
        break;
      case "name":
        setName(value);
        break;
      case "mobileNo":
        setMobileNo(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "addBreakfast":
        setAddBreakfast(checked);
        break;
    }
  };

  // Submit handler
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
        SERVICE_ID,
        TEMPLATE_ID,
        {
          room_type: roomName,
          base_price: basePrice,
          add_breakfast: addBreakfast ? "Yes" : "No",
          total_price: totalPrice.toString(), // Send number only
          check_in: checkIn,
          check_out: checkOut,
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email,
        },
        PUBLIC_KEY
      );
      setMessage("Booking request sent successfully!");
      // Reset
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
      setAddBreakfast(false);
    } catch (err) {
      console.error(err);
      setMessage("Failed to send request. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-full px-6 py-6 bg-transparent font-sans">
      <form onSubmit={handleSubmit} className="flex flex-nowrap gap-3 max-w-full overflow-x-auto items-center">
        <div className="min-w-[160px] font-semibold truncate text-black whitespace-nowrap">{roomName}</div>

        <div className="flex flex-col min-w-[140px]">
          <label htmlFor="checkIn" className="text-xs font-bold uppercase mb-1 text-black">
            Check In
          </label>
          <input
            type="date"
            id="checkIn"
            name="checkIn"
            value={checkIn}
            min={today}
            onChange={handleChange}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label htmlFor="checkOut" className="text-xs font-bold uppercase mb-1 text-black">
            Check Out
          </label>
          <input
            type="date"
            id="checkOut"
            name="checkOut"
            value={checkOut}
            min={checkIn || today}
            onChange={handleChange}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        <div className="flex flex-col min-w-[160px]">
          <label htmlFor="name" className="text-xs font-bold uppercase mb-1 text-black">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Full name"
            value={name}
            onChange={handleChange}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label htmlFor="mobileNo" className="text-xs font-bold uppercase mb-1 text-black">
            Mobile No.
          </label>
          <input
            type="tel"
            id="mobileNo"
            name="mobileNo"
            placeholder="+91 9000000000"
            value={mobileNo}
            onChange={handleChange}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        <div className="flex flex-col min-w-[180px]">
          <label htmlFor="email" className="text-xs font-bold uppercase mb-1 text-black">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={handleChange}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        <label className="inline-flex items-center gap-2 min-w-[140px] text-black text-xs font-semibold whitespace-nowrap">
          <input
            type="checkbox"
            name="addBreakfast"
            checked={addBreakfast}
            onChange={handleChange}
            className="w-4 h-4"
          />
          Add Breakfast ₹200
        </label>

        <div className="min-w-[140px] font-bold text-lg flex items-center justify-center text-black whitespace-nowrap">
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
