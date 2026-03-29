// BookingModal.tsx
import React, { useState, useMemo } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_mz16rsu";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

export default function BookingModal({
  room,
  isOpen,
  onClose,
}: {
  room: any | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];

  // Booking form fields
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  // Price calculation
  const pricePerNight = room?.price_per_night || room?.price || 1500;
  const totalPrice = pricePerNight * nights;

  if (!isOpen || !room) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          customer_name: name,
          customer_email: email,
          customer_phone: mobileNo,
          room_type: room.room_type || room.name,
          total_price: `₹${totalPrice}`,
          check_in: checkIn,
          check_out: checkOut,
        },
        EMAILJS_PUBLIC_KEY
      );
      setMessage("Booking request sent successfully!");
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to send booking request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm px-4 py-6">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-lg">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-600 font-bold text-lg hover:text-gray-900"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Room Details */}
        <h2 className="text-2xl font-bold mb-4">{room.room_type || room.name}</h2>
        <p className="text-gray-700 mb-4">{room.description}</p>
        <p className="font-semibold mb-4">
          Price per night: <span className="text-emerald-600">₹{pricePerNight}</span>
        </p>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">
              Check In
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border border-gray-400 rounded p-2 mt-1"
                required
              />
            </label>
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Check Out
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border border-gray-400 rounded p-2 mt-1"
                required
              />
            </label>
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-400 rounded p-2 mt-1"
                required
                maxLength={200}
              />
            </label>
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Mobile No.
              <input
                type="tel"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                className="w-full border border-gray-400 rounded p-2 mt-1"
                required
                maxLength={20}
              />
            </label>
          </div>

          <div>
            <label className="block font-semibold mb-1">
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-400 rounded p-2 mt-1"
                required
              />
            </label>
          </div>

          <p className="font-semibold">
            Total Price ({nights} night{nights > 1 ? "s" : ""}):{" "}
            <span className="text-emerald-600">₹{totalPrice}</span>
          </p>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {sending ? "Sending..." : "Book Now"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 font-semibold ${
              message.includes("successfully")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
