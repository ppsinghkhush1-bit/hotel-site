import React, { useState, useMemo } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_1scrkoq";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

interface Room {
  name: string;
  price: number;
}

const rooms: Room[] = [
  { name: "Blossom", price: 2500 },
  { name: "Hotel Green Garden", price: 3200 },
  // Add more rooms here...
];

export default function BookingForm() {
  const today = new Date().toISOString().split("T")[0];
  const BREAKFAST_PRICE = 200;

  const [hotel, setHotel] = useState<string>(rooms[0].name);
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [mobileNo, setMobileNo] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [addBreakfast, setAddBreakfast] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Get room price for selected hotel
  const basePrice = useMemo(() => {
    const selectedRoom = rooms.find((room) => room.name === hotel);
    return selectedRoom ? selectedRoom.price : 0;
  }, [hotel]);

  // Calculate nights difference, min 1
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return (basePrice + (addBreakfast ? BREAKFAST_PRICE : 0)) * nights;
  }, [basePrice, addBreakfast, nights]);

  // Send booking info via EmailJS
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
          room_type: hotel,
          base_price: basePrice,
          breakfast_included: addBreakfast ? "Yes" : "No",
          total_price: totalPrice.toString(), // no ₹ here!
          check_in: checkIn,
          check_out: checkOut,
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email,
        },
        EMAILJS_PUBLIC_KEY
      );
      setMessage("Booking request sent successfully!");
      // Reset form
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
      setAddBreakfast(false);
    } catch (error) {
      console.error(error);
      setMessage("Failed to send booking request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="bg-white max-w-7xl mx-auto p-6 rounded-lg shadow-lg font-sans">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-4 justify-center overflow-x-auto"
      >
        {/* Hotel select */}
        <div className="flex flex-col min-w-[140px]">
          <label className="mb-1 uppercase text-xs font-semibold text-gray-700">Hotel</label>
          <select
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          >
            {rooms.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Check In */}
        <div className="flex flex-col min-w-[140px]">
          <label className="mb-1 uppercase text-xs font-semibold text-gray-700">Check In</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={today}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Check Out */}
        <div className="flex flex-col min-w-[140px]">
          <label className="mb-1 uppercase text-xs font-semibold text-gray-700">Check Out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || today}
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Name */}
        <div className="flex flex-col min-w-[160px]">
          <label className="mb-1 uppercase text-xs font-semibold text-gray-700">Name</label>
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
          <label className="mb-1 uppercase text-xs font-semibold text-gray-700">Mobile No.</label>
          <input
            type="tel"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            placeholder="+91 9999999999"
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Email */}
        <div className="flex flex-col min-w-[180px]">
          <label className="mb-1 uppercase text-xs font-semibold text-gray-700">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            className="border border-gray-400 rounded-md p-2 text-black"
            required
          />
        </div>

        {/* Breakfast */}
        <label className="inline-flex items-center gap-2 min-w-[160px] cursor-pointer select-none text-xs font-semibold text-gray-800 mt-6">
          <input
            type="checkbox"
            checked={addBreakfast}
            onChange={(e) => setAddBreakfast(e.target.checked)}
            className="w-4 h-4"
          />
          + Add Breakfast ₹200
        </label>

        {/* Total Price */}
        <div className="min-w-[140px] font-bold text-lg flex items-center justify-center text-black whitespace-nowrap mt-6">
          ₹{totalPrice.toLocaleString("en-IN")}
        </div>

        {/* Book Now button */}
        <button
          type="submit"
          disabled={sending}
          className={`min-w-[140px] px-6 py-3 rounded border border-red-600 font-bold transition ${
            sending
              ? "bg-red-600 text-white cursor-not-allowed opacity-50"
              : "text-red-600 hover:bg-red-600 hover:text-white"
          } mt-6`}
        >
          {sending ? "Booking..." : "Book Now"}
        </button>
      </form>

      {message && (
        <p
          className={`text-center mt-4 font-semibold ${
            message.toLowerCase().includes("success")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {/* Contact Info Bar */}
      <div className="mt-8 bg-[#473605] rounded-md py-3 px-6 text-white text-center text-sm font-semibold tracking-wide">
        Phone No. +91 80191600498 | Reservation Number | Email:{" "}
        <a href="mailto:reservations@blossomhotels.in" className="underline hover:text-gray-300">
          reservations@blossomhotels.in
        </a>
      </div>

      {/* Benefits Banner */}
      <div className="mt-8 overflow-x-auto">
        <div
          className="relative bg-black bg-opacity-90 rounded-lg shadow-lg flex items-center justify-between px-6 py-4 whitespace-nowrap text-white font-bold text-xl max-w-full"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 30px) 0, 100% 50%, calc(100% - 30px) 100%, 0 100%)",
          }}
        >
          <div>
            BENEFITS OF DIRECT <span className="underline">BOOKING</span>
            <br />
            <span className="text-sm font-normal normal-case mt-1 block">
              *Subject To Availability
            </span>
          </div>

          <div className="flex space-x-12 ml-10 text-base font-semibold items-center">
            <BenefitIcon
              title="ROOM UPGRADE"
              path1="M3 10h2v4H3v-4zm4 0h2v4H7v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4zM21 10h-2v4h2v-4z"
              path2="M17 10V5a2 2 0 00-2-2H9a2 2 0 00-2 2v5h10z"
            />
            <BenefitIcon
              title="EARLY CHECK-IN"
              path1="M8 7V3m8 4V3m-4 18v-4m-2-5h4m-6 7a9 9 0 11-2-7.89M12 8v4l2 2"
            />
            <BenefitIcon
              title="LATE CHECK-OUT"
              path1="M12 4v2m0 12v2m8-10h-3M7 8H4m16 4h-3M7 16H4m14.364-1.636l-2.121-2.12M7.757 7.757L5.636 5.636m0 10.728l2.121-2.12M16.243 16.243l2.121 2.122"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitIcon({
  title,
  path1,
  path2,
}: {
  title: string;
  path1: string;
  path2?: string;
}) {
  return (
    <div className="flex items-center space-x-2 whitespace-nowrap">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d={path1} />
        {path2 && <path d={path2} />}
      </svg>
      <span>{title}</span>
    </div>
  );
}
