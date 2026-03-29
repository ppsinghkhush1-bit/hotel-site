import React, { useState, useMemo } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_1scrkoq";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

export default function BookingBar() {
  const today = new Date().toISOString().split("T")[0];

  const BASE_ROOM_PRICE = 2500;   // Example dynamic room price from your backend
  const BREAKFAST_PRICE = 200;

  // Form state
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Calculate nights (default 1, no NaN)
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  // Calculate total price dynamically
  const totalPrice = (BASE_ROOM_PRICE + (addBreakfast ? BREAKFAST_PRICE : 0)) * nights;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!checkIn || !checkOut || !name || !mobileNo || !email) {
      setMessage("Please fill all the fields.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          check_in: checkIn,
          check_out: checkOut,
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email,
          add_breakfast: addBreakfast ? "Yes" : "No",
          total_price: "₹" + totalPrice,
          room_price: BASE_ROOM_PRICE,
          nights: nights.toString(),
        },
        EMAILJS_PUBLIC_KEY
      );
      setMessage("Your booking request was sent successfully!");
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
      setAddBreakfast(false);
    } catch (error) {
      console.error(error);
      setMessage("Failed to send booking. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-full px-6 py-6 font-sans bg-transparent w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-nowrap overflow-x-auto gap-3 items-end max-w-full"
        noValidate
      >
        <div className="text-center">
          <div className="text-xs uppercase font-semibold mb-1">Room Price</div>
          <div className="py-2 px-4 border border-gray-400 rounded text-black min-w-[110px] text-lg font-bold">
            ₹{BASE_ROOM_PRICE.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label htmlFor="checkIn" className="mb-1 uppercase text-xs font-semibold text-black">
            Check In
          </label>
          <input
            id="checkIn"
            type="date"
            value={checkIn}
            min={today}
            placeholder="dd-mm-yyyy"
            onChange={(e) => setCheckIn(e.target.value)}
            className="border border-gray-400 rounded px-4 py-2 text-black"
            required
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label htmlFor="checkOut" className="mb-1 uppercase text-xs font-semibold text-black">
            Check Out
          </label>
          <input
            id="checkOut"
            type="date"
            value={checkOut}
            min={checkIn || today}
            placeholder="dd-mm-yyyy"
            onChange={(e) => setCheckOut(e.target.value)}
            className="border border-gray-400 rounded px-4 py-2 text-black"
            required
          />
        </div>

        <div className="flex flex-col min-w-[160px]">
          <label htmlFor="name" className="mb-1 uppercase text-xs font-semibold text-black">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="border border-gray-400 rounded px-4 py-2 text-black"
            maxLength={200}
            required
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label htmlFor="mobileNo" className="mb-1 uppercase text-xs font-semibold text-black">
            Mobile No.
          </label>
          <input
            id="mobileNo"
            type="tel"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            placeholder="+91 9876543210"
            className="border border-gray-400 rounded px-4 py-2 text-black"
            maxLength={20}
            required
          />
        </div>

        <div className="flex flex-col min-w-[180px]">
          <label htmlFor="email" className="mb-1 uppercase text-xs font-semibold text-black">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            className="border border-gray-400 rounded px-4 py-2 text-black"
            maxLength={200}
            required
          />
        </div>

        <label className="flex items-center whitespace-nowrap min-w-[145px] gap-2 text-black text-xs font-semibold">
          <input
            type="checkbox"
            checked={addBreakfast}
            onChange={(e) => setAddBreakfast(e.target.checked)}
            className="w-4 h-4"
          />
          Add Breakfast ₹200
        </label>

        <div className="min-w-[150px] text-black font-bold text-lg flex items-center justify-center whitespace-nowrap">
          ₹{totalPrice.toLocaleString("en-IN")}
        </div>

        <button
          type="submit"
          disabled={sending}
          className={`min-w-[130px] py-3 px-6 rounded border border-red-600 font-bold transition ${
            sending
              ? "bg-red-600 text-white opacity-50 cursor-wait"
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
