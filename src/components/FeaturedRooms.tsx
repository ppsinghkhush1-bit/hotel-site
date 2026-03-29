import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_mz16rsu";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

export default function BookingSection() {
  const today = new Date().toISOString().split("T")[0];

  const [hotel, setHotel] = useState("Blossom");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel || !checkIn || !checkOut || !name || !mobileNo || !email) {
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
          hotel,
          check_in: checkIn,
          check_out: checkOut,
          name,
          mobile_no: mobileNo,
          email,
        },
        EMAILJS_PUBLIC_KEY
      );

      setMessage("Booking request sent successfully!");
      // Optionally reset the form
      setHotel("Blossom");
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
    } catch (error) {
      setMessage("Failed to send booking request. Please try again.");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="w-full bg-transparent py-6 px-4 font-sans">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-3 items-center justify-center max-w-full overflow-x-auto bg-transparent"
      >
        {/* Hotel */}
        <label className="flex flex-col text-black font-medium text-xs min-w-[120px]">
          Hotel
          <select
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            className="mt-1 p-3 text-black border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option>Blossom</option>
            <option>Another Hotel</option>
          </select>
        </label>

        {/* Check In */}
        <label className="flex flex-col text-black font-medium text-xs min-w-[140px]">
          Check In
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={today}
            className="mt-1 p-3 border border-gray-400 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </label>

        {/* Check Out */}
        <label className="flex flex-col text-black font-medium text-xs min-w-[140px]">
          Check Out
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || today}
            className="mt-1 p-3 border border-gray-400 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </label>

        {/* Name */}
        <label className="flex flex-col text-black font-medium text-xs min-w-[180px]">
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            placeholder="Your full name"
            className="mt-1 p-3 border border-gray-400 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </label>

        {/* Mobile No. */}
        <label className="flex flex-col text-black font-medium text-xs min-w-[140px]">
          Mobile No.
          <input
            type="tel"
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            maxLength={20}
            placeholder="Mobile number"
            className="mt-1 p-3 border border-gray-400 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </label>

        {/* Email */}
        <label className="flex flex-col text-black font-medium text-xs min-w-[200px]">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
            placeholder="Your email address"
            className="mt-1 p-3 border border-gray-400 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </label>

        <button
          type="submit"
          disabled={sending}
          className={`min-w-[140px] py-3 px-6 rounded-lg font-semibold border-2 border-red-600 text-red-600 transition ${
            sending
              ? "bg-red-600 text-white cursor-not-allowed opacity-50"
              : "hover:bg-red-600 hover:text-white"
          }`}
        >
          {sending ? "Sending..." : "Book Now"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center text-sm font-semibold ${
            message.includes("successfully")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {/* Contact Info Bar */}
      <div className="mt-8 w-full bg-[#473605] text-white text-center py-3 text-sm font-semibold tracking-wide rounded-md select-none">
        Phone No. +91 80191600498 | Reservation Number | Email:{" "}
        <a
          href="mailto:reservations@blossomhotels.in"
          className="underline hover:text-gray-200"
        >
          reservations@blossomhotels.in
        </a>
      </div>

      {/* Benefits Banner */}
      <div className="mt-8 max-w-full overflow-x-auto">
        <div
          className="relative bg-black bg-opacity-90 rounded-lg shadow-lg flex items-center justify-between px-6 py-4 whitespace-nowrap text-white font-bold text-xl"
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

          <div className="flex space-x-16 ml-10 text-base font-semibold">
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
    <div className="flex items-center space-x-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
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
