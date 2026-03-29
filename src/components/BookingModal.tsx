// BookingModal.tsx
import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { X, CheckCircle } from "lucide-react";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_1scrkoq";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  roomPrice: number;
}

export default function BookingModal({ isOpen, onClose, roomName, roomPrice }: BookingModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Calculate nights between dates, fallback to 1
  const getNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = getNights();
  const totalPrice = roomPrice * nights;

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!checkIn || !checkOut || !name || !mobileNo || !email) {
      setError("Please fill all fields.");
      return;
    }

    setSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          room_name: roomName,
          total_price: `₹${totalPrice}`,
          check_in: checkIn,
          check_out: checkOut,
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email,
          nights: nights.toString(),
        },
        EMAILJS_PUBLIC_KEY
      );
      setSuccess(true);
    } catch (err) {
      setError("Booking failed. Please try again later.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-md p-5">
      <div className="bg-white rounded-xl max-w-md w-full p-8 relative shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          aria-label="Close booking modal"
          type="button"
        >
          <X size={24} />
        </button>

        {success ? (
          <div className="text-center">
            <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="mb-6">Thank you for booking. Confirmation sent to your email.</p>
            <button
              onClick={onClose}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              type="button"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-6 text-center">Book Your Stay</h2>
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div>
                <label htmlFor="checkIn" className="block text-sm font-semibold mb-1">
                  Check-In
                </label>
                <input
                  type="date"
                  id="checkIn"
                  value={checkIn}
                  min={today}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full p-3 border rounded"
                  required
                />
              </div>

              <div>
                <label htmlFor="checkOut" className="block text-sm font-semibold mb-1">
                  Check-Out
                </label>
                <input
                  type="date"
                  id="checkOut"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full p-3 border rounded"
                  required
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border rounded"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="mobileNo" className="block text-sm font-semibold mb-1">
                  Mobile No.
                </label>
                <input
                  type="tel"
                  id="mobileNo"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  className="w-full p-3 border rounded"
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {error && <p className="text-red-600">{error}</p>}

              <div className="text-lg font-semibold mt-4">
                Total Price: <span className="text-emerald-600">₹{totalPrice}</span>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="mt-4 w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 transition disabled:opacity-50"
              >
                {sending ? "Sending..." : "Confirm Booking"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
