import React, { useState, useMemo } from "react";
import emailjs from "@emailjs/browser";

// --- CONFIGURATION ---
const SERVICE_ID = "service_12y6xre";
const TEMPLATE_ID = "template_1scrkoq";
const PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

const ROOM_PRICES: Record<string, number> = {
  "Standard Room": 1500,
  "Deluxe Room": 1700,
  "Luxury Room": 2500,
};

const BREAKFAST_COST = 200;

// --- HELPER: Parse DD/MM/YYYY ---
const parseDate = (dateString: string): Date | null => {
  const parts = dateString.split("/");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;

  return new Date(year, month - 1, day);
};

// --- MODAL COMPONENT ---
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Form State
  const [hotel, setHotel] = useState<keyof typeof ROOM_PRICES>("Standard Room");
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const basePrice = ROOM_PRICES[hotel] || 0;

  // Calculate Nights
  const nights = useMemo(() => {
    const start = parseDate(checkIn);
    const end = parseDate(checkOut);
    if (!start || !end) return 1;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkIn, checkOut]);

  // Calculate Total Price
  const totalPrice = useMemo(() => {
    return (basePrice + (addBreakfast ? BREAKFAST_COST : 0)) * nights;
  }, [basePrice, addBreakfast, nights]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const startDate = parseDate(checkIn);
    const endDate = parseDate(checkOut);

    if (!startDate || !endDate || !name || !mobileNo || !email) {
      setMessage("Please fill all fields correctly (DD/MM/YYYY).");
      return;
    }

    setSending(true);

    const formatForEmail = (d: Date) => d.toISOString().split('T')[0];

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          room_type: hotel,
          base_price: basePrice,
          add_breakfast: addBreakfast ? "Yes" : "No",
          total_price: totalPrice.toString(),
          check_in: formatForEmail(startDate),
          check_out: formatForEmail(endDate),
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email,
        },
        PUBLIC_KEY
      );

      setMessage("Booking request sent successfully!");
      
      // Reset after success
      setTimeout(() => {
        setCheckIn("");
        setCheckOut("");
        setName("");
        setMobileNo("");
        setEmail("");
        setAddBreakfast(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error(error);
      setMessage("Failed to send. Please check your details.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-red-600">Book Your Stay</h2>
          <button onClick={onClose} className="text-3xl font-bold text-gray-400 hover:text-red-600">&times;</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-wrap gap-6 justify-center flex-1 content-start">
          
          {/* Room Type */}
          <div className="flex flex-col min-w-[200px] flex-1">
            <label className="text-xs font-semibold uppercase mb-1 text-gray-600">Room Type</label>
            <select
              value={hotel}
              onChange={(e) => setHotel(e.target.value as keyof typeof ROOM_PRICES)}
              className="border border-gray-400 rounded-md p-3 text-black w-full focus:outline-none focus:border-red-500"
              required
            >
              {Object.entries(ROOM_PRICES).map(([room, price]) => (
                <option key={room} value={room}>{room} (₹{price})</option>
              ))}
            </select>
          </div>

          {/* Check In */}
          <div className="flex flex-col min-w-[200px] flex-1">
            <label className="text-xs font-semibold uppercase mb-1 text-gray-600">Check In</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="border border-gray-400 rounded-md p-3 text-black w-full focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Check Out */}
          <div className="flex flex-col min-w-[200px] flex-1">
            <label className="text-xs font-semibold uppercase mb-1 text-gray-600">Check Out</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="border border-gray-400 rounded-md p-3 text-black w-full focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Name */}
          <div className="flex flex-col min-w-[200px] flex-1">
            <label className="text-xs font-semibold uppercase mb-1 text-gray-600">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-400 rounded-md p-3 text-black w-full focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-col min-w-[200px] flex-1">
            <label className="text-xs font-semibold uppercase mb-1 text-gray-600">Mobile No.</label>
            <input
              type="tel"
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
              className="border border-gray-400 rounded-md p-3 text-black w-full focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col min-w-[200px] flex-1">
            <label className="text-xs font-semibold uppercase mb-1 text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-400 rounded-md p-3 text-black w-full focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Breakfast */}
          <div className="w-full flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              checked={addBreakfast}
              onChange={(e) => setAddBreakfast(e.target.checked)}
              className="w-5 h-5 text-red-600"
            />
            <span className="text-gray-700 font-medium">Add Breakfast (+₹200)</span>
          </div>

          {/* Message */}
          {message && (
            <p className={`w-full text-center font-semibold ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}

          {/* Sticky Footer with Button */}
          <div className="w-full sticky bottom-0 bg-white py-4 mt-4 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xl font-bold text-gray-800">
              Total: <span className="text-red-600">₹{totalPrice.toLocaleString("en-IN")}</span>
              <span className="text-sm text-gray-500 ml-2">({nights} Nights)</span>
            </div>
            <button
              type="submit"
              disabled={sending}
              className={`w-full md:w-auto px-8 py-3 rounded-md font-bold text-white transition ${
                sending ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {sending ? "Sending..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Hotel Booking</h1>
      
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-red-700 transition"
      >
        Book Now
      </button>

      <BookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
