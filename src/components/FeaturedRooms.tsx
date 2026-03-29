import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_mz16rsu";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

export default function BookingForm() {
  const today = new Date().toISOString().split("T")[0];

  // Form state
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

    const templateParams = {
      hotel,
      check_in: checkIn,
      check_out: checkOut,
      name,
      mobile_no: mobileNo,
      email,
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      setMessage("Booking request sent successfully!");
      // Reset form (optional)
      setHotel("Blossom");
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
    } catch (error) {
      console.error("Failed to send email:", error);
      setMessage("Failed to send booking request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="font-sans bg-transparent p-4">
      {/* Booking Form Bar */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-7 gap-x-4 items-end overflow-x-auto max-w-full"
      >
        {/* Labels */}
        <div className="col-span-1 text-white font-bold text-xs mb-1 whitespace-nowrap">
          Hotel
        </div>
        <div className="col-span-1 text-white font-bold text-xs mb-1 whitespace-nowrap">
          Check In
        </div>
        <div className="col-span-1 text-white font-bold text-xs mb-1 whitespace-nowrap">
          Check Out
        </div>
        <div className="col-span-1 text-white font-bold text-xs mb-1 whitespace-nowrap">
          Name
        </div>
        <div className="col-span-1 text-white font-bold text-xs mb-1 whitespace-nowrap">
          Mobile No.
        </div>
        <div className="col-span-1 text-white font-bold text-xs mb-1 whitespace-nowrap">
          E-mail
        </div>
        <div></div>

        {/* Inputs */}
        <select
          aria-label="Select Hotel"
          value={hotel}
          onChange={(e) => setHotel(e.target.value)}
          className="col-span-1 rounded border border-black p-2 text-black"
          required
        >
          <option>Blossom</option>
          <option>Another Hotel</option>
        </select>

        <input
          type="date"
          aria-label="Check In"
          value={checkIn}
          min={today}
          onChange={(e) => setCheckIn(e.target.value)}
          className="col-span-1 p-2 rounded border border-black text-black"
          required
        />

        <input
          type="date"
          aria-label="Check Out"
          value={checkOut}
          min={checkIn || today}
          onChange={(e) => setCheckOut(e.target.value)}
          className="col-span-1 p-2 rounded border border-black text-black"
          required
        />

        <input
          type="text"
          aria-label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-1 p-2 rounded border border-black text-black"
          required
        />

        <input
          type="tel"
          aria-label="Mobile No"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          className="col-span-1 p-2 rounded border border-black text-black"
          required
        />

        <input
          type="email"
          aria-label="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="col-span-1 p-2 rounded border border-black text-black"
          required
        />

        <button
          type="submit"
          disabled={sending}
          className={`col-span-1 border border-red-600 font-bold rounded py-2 px-5 transition ${
            sending
              ? "bg-red-600 text-white cursor-not-allowed opacity-60"
              : "text-red-600 hover:bg-red-600 hover:text-white"
          }`}
        >
          {sending ? "Sending..." : "Book Now"}
        </button>
      </form>

      {/* Message */}
      {message && (
        <p
          className={`mt-3 font-semibold text-center ${
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {/* Contact Bar */}
      <div className="bg-[#473605] text-white text-center py-4 px-3 mt-8 tracking-wide">
        <h2 className="font-bold text-lg mb-1">Direct Hotel Booking</h2>
        <p className="text-sm">
          Phone No. +91 80191600498 | Reservation Number , Email:{" "}
          <a
            href="mailto:reservations@blossomhotels.in"
            className="underline hover:text-gray-300"
          >
            reservations@blossomhotels.in
          </a>
        </p>
      </div>

      {/* Benefits Banner */}
      <div className="mt-8 overflow-x-auto">
        <div
          className="relative bg-black bg-opacity-90 rounded-lg shadow-lg flex items-center justify-between px-6 py-4 max-w-full whitespace-nowrap text-white font-bold text-xl"
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
