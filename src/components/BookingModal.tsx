// BookingModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import emailjs from "@emailjs/browser";
import { X, CheckCircle } from "lucide-react";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_1scrkoq";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: {
    room_type: string;
    price_per_night: number;
    description?: string;
  } | null;
}

export default function BookingModal({ isOpen, onClose, room }: BookingModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Calculate nights between dates
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  // Calculate total price (base price + breakfast if checked) * nights
  const BREAKFAST_PRICE = 200;
  const basePrice = room?.price_per_night || 0;
  const totalPrice = (basePrice + (addBreakfast ? BREAKFAST_PRICE : 0)) * nights;

  useEffect(() => {
    // Reset form when room or modal closes/opens
    if (!isOpen) {
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
      setAddBreakfast(false);
      setSending(false);
      setStatus("idle");
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen || !room) return null;

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();

    if (!checkIn || !checkOut || !name || !mobileNo || !email) {
      setErrorMessage("Please fill in all required fields.");
      setStatus("error");
      return;
    }

    setSending(true);
    setErrorMessage("");
    setStatus("idle");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          room_type: room.room_type,
          base_price: basePrice,
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
      setStatus("success");
    } catch (error) {
      setErrorMessage("Failed to send booking request. Please try again.");
      setStatus("error");
      console.error(error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Close modal"
          type="button"
        >
          <X size={24} />
        </button>

        {/* Left panel - room info */}
        <div className="hidden md:flex md:w-1/3 bg-[#0f172a] p-10 flex-col justify-between text-white">
          <div>
            <h2 className="text-3xl font-bold mb-4">{room.room_type}</h2>
            <p className="text-slate-400 text-sm">{room.description || "Experience comfort at Green Garden."}</p>
          </div>
          <div className="bg-white/5 p-5 rounded-2xl flex gap-3 mt-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-emerald-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
            </svg>
            <p className="text-xs text-slate-300">
              Confirmation will be sent via email.
            </p>
          </div>
        </div>

        {/* Right panel - booking form */}
        <div className="flex-1 p-8 bg-white">
          {status === "success" ? (
            <div className="text-center py-16">
              <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold">Booking Sent!</h2>
              <button
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-900"
                type="button"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <input
                type="date"
                name="checkIn"
                value={checkIn}
                min={today}
                onChange={e => setCheckIn(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
                placeholder="dd-mm-yyyy"
                required
              />

              <input
                type="date"
                name="checkOut"
                value={checkOut}
                min={checkIn || today}
                onChange={e => setCheckOut(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
                placeholder="dd-mm-yyyy"
                required
              />

              <input
                type="text"
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
                placeholder="Name"
                required
              />

              <input
                type="tel"
                name="mobileNo"
                value={mobileNo}
                onChange={e => setMobileNo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
                placeholder="Mobile No."
                required
              />

              <input
                type="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
                placeholder="E-mail"
                required
              />

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addBreakfast}
                  onChange={e => setAddBreakfast(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded"
                />
                <span className="text-sm">Add Breakfast ₹200</span>
              </label>

              <div className="mt-4 text-lg font-bold">
                Total Price: <span className="text-emerald-600">₹{totalPrice}</span>
              </div>

              {status === "error" && (
                <p className="text-red-600 font-semibold">{errorMessage}</p>
              )}

              <button
                type="submit"
                className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                disabled={sending}
              >
                {sending ? "Sending..." : "Confirm Booking"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
