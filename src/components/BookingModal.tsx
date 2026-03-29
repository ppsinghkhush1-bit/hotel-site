import { useState } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_mz16rsu";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

export default function DirectBookingForm() {
  const [hotel, setHotel] = useState("Blossom");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Minimum date for check-in and check-out is today
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !hotel ||
      !checkIn ||
      !checkOut ||
      !name ||
      !mobileNo ||
      !email
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
      // Clear form
      setHotel("Blossom");
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
    } catch (error) {
      console.error(error);
      setMessage("Failed to send booking request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="bg-transparent px-8 py-3">
      {/* Booking Form Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center gap-4 max-w-full justify-center"
      >
        {/* Hotel */}
        <select
          value={hotel}
          onChange={(e) => setHotel(e.target.value)}
          className="bg-white text-black p-2 rounded w-28"
          required
        >
          <option value="Blossom">Blossom</option>
          <option value="Another Hotel">Another Hotel</option>
        </select>

        {/* Check In */}
        <input
          type="date"
          value={checkIn}
          min={today}
          onChange={(e) => setCheckIn(e.target.value)}
          placeholder="dd-mm-yyyy"
          className="bg-white text-black p-2 rounded w-36"
          required
        />

        {/* Check Out */}
        <input
          type="date"
          value={checkOut}
          min={checkIn || today}
          onChange={(e) => setCheckOut(e.target.value)}
          placeholder="dd-mm-yyyy"
          className="bg-white text-black p-2 rounded w-36"
          required
        />

        {/* Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="bg-white text-black p-2 rounded w-40"
          required
        />

        {/* Mobile No */}
        <input
          type="tel"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          placeholder="Mobile No."
          className="bg-white text-black p-2 rounded w-36"
          required
        />

        {/* E-mail */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="bg-white text-black p-2 rounded w-44"
          required
        />

        {/* Book Now */}
        <button
          type="submit"
          disabled={sending}
          className={`border border-red-700 text-red-700 font-semibold px-6 py-2 rounded hover:bg-red-700 hover:text-white transition ${
            sending ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {sending ? "Sending..." : "Book Now"}
        </button>
      </form>

      {/* Status Message */}
      {message && (
        <p className="mt-2 text-center text-sm text-red-700 font-semibold">
          {message}
        </p>
      )}

      {/* Contact Info */}
      <div className="mt-6 bg-[#473605] text-white text-center py-3 rounded">
        <h2 className="font-bold text-lg mb-1">Direct Hotel Booking</h2>
        <p className="text-sm">
          Phone No. +91 80191600498 | Reservation Number , Email:{" "}
          <a
            href="mailto:reservations@blossomhotels.in"
            className="underline"
          >
            reservations@blossomhotels.in
          </a>
        </p>
      </div>

      {/* Benefits Banner */}
      <div className="mt-8 max-w-full overflow-x-auto">
        <div
          className="relative bg-black bg-opacity-70 rounded-lg shadow-lg flex items-center justify-between px-6 py-4 max-w-full whitespace-nowrap text-white font-bold text-xl"
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
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 10h2v4H3v-4zm4 0h2v4H7v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4zM21 10h-2v4h2v-4z" />
                <path d="M17 10V5a2 2 0 00-2-2H9a2 2 0 00-2 2v5h10z" />
              </svg>
              <span>ROOM UPGRADE</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 7V3m8 4V3m-4 18v-4m-2-5h4m-6 7a9 9 0 11-2-7.89M12 8v4l2 2" />
              </svg>
              <span>EARLY CHECK-IN</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 4v2m0 12v2m8-10h-3M7 8H4m16 4h-3M7 16H4m14.364-1.636l-2.121-2.12M7.757 7.757L5.636 5.636m0 10.728l2.121-2.12M16.243 16.243l2.121 2.122" />
              </svg>
              <span>LATE CHECK-OUT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
