import React, { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import emailjs from "@emailjs/browser";
import { format, differenceInCalendarDays } from "date-fns";

const SERVICE_ID = "service_12y6xre";
const TEMPLATE_ID = "template_1scrkoq";
const PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

const ROOM_PRICES: Record<string, number> = {
  "Standard Room": 1500,
  "Deluxe Room": 1700,
  "Luxury Room": 2500,
};

export default function BookingForm() {
  const today = new Date();
  const BREAKFAST_COST = 200;

  const [hotel, setHotel] = useState<keyof typeof ROOM_PRICES>("Standard Room");
  // Using Date objects for the picker
  const [checkInDate, setCheckInDate] = useState<Date | null>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(new Date(today.getTime() + 24 * 60 * 60 * 1000)); // Tomorrow
  
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const basePrice = ROOM_PRICES[hotel] || 0;

  // Calculate nights difference using date-fns
  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const diff = differenceInCalendarDays(checkOutDate, checkInDate);
    return diff > 0 ? diff : 1;
  }, [checkInDate, checkOutDate]);

  const totalPrice = useMemo(() => {
    return (basePrice + (addBreakfast ? BREAKFAST_COST : 0)) * nights;
  }, [basePrice, addBreakfast, nights]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkInDate || !checkOutDate || !name || !mobileNo || !email) {
      setMessage("Please fill all fields.");
      return;
    }

    setSending(true);
    setMessage("");

    // Format dates to YYYY-MM-DD string for EmailJS
    const formattedCheckIn = format(checkInDate, "yyyy-MM-dd");
    const formattedCheckOut = format(checkOutDate, "yyyy-MM-dd");

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          room_type: hotel,
          base_price: basePrice,
          add_breakfast: addBreakfast ? "Yes" : "No",
          total_price: totalPrice.toString(),
          check_in: formattedCheckIn,
          check_out: formattedCheckOut,
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email,
        },
        PUBLIC_KEY
      );
      setMessage("Booking request sent successfully!");
      // Reset form
      setCheckInDate(new Date());
      setCheckOutDate(new Date(today.getTime() + 24 * 60 * 60 * 1000));
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
    <section className="max-w-full px-6 py-6 font-sans bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="flex flex-nowrap items-center gap-3 max-w-full overflow-x-auto"
      >
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">Room Type</label>
          <select
            value={hotel}
            onChange={(e) => setHotel(e.target.value as keyof typeof ROOM_PRICES)}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          >
            {Object.entries(ROOM_PRICES).map(([roomName]) => (
              <option key={roomName} value={roomName}>
                {roomName}
              </option>
            ))}
          </select>
        </div>

        {/* Check In Date Picker */}
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">Check In</label>
          <DatePicker
            selected={checkInDate}
            onChange={(date) => setCheckInDate(date)}
            selectsStart
            startDate={checkInDate}
            endDate={checkOutDate}
            minDate={today}
            dateFormat="yyyy-MM-dd"
            className="border border-gray-400 rounded-md p-2 text-black w-full"
            required
          />
        </div>

        {/* Check Out Date Picker */}
        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">Check Out</label>
          <DatePicker
            selected={checkOutDate}
            onChange={(date) => setCheckOutDate(date)}
            selectsEnd
            startDate={checkInDate}
            endDate={checkOutDate}
            minDate={checkInDate || today}
            dateFormat="yyyy-MM-dd"
            className="border border-gray-400 rounded-md p-2 text-black w-full"
            required
          />
        </div>

        <div className="flex flex-col min-w-[160px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">Name</label>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">Mobile No.</label>
          <input
            type="tel"
            placeholder="+91 9000000000"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        <div className="flex flex-col min-w-[180px]">
          <label className="text-xs font-semibold uppercase mb-1 text-black">E-mail</label>
          <input
            type="email"
            placeholder="you@example.com"
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
          Add Breakfast ₹200
        </label>

        <div className="min-w-[140px] font-bold text-lg flex items-center justify-center text-black whitespace-nowrap">
          ₹{totalPrice.toLocaleString("en-IN")}
        </div>

        <button
          type="submit"
          disabled={sending}
          className={`min-w-[140px] px-6 py-3 rounded border border-red-600 font-bold transition ${
            sending ? "bg-red-600 text-white cursor-not-allowed opacity-50" : "text-red-600 hover:bg-red-600 hover:text-white"
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
