import React, { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import emailjs from "@emailjs/browser";
import { format, differenceInCalendarDays } from "date-fns";

// --- CONFIGURATION ---
const SERVICE_ID = "service_12y6xre";
const TEMPLATE_ID = "template_1scrkoq";
const PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

const ROOM_PRICES: Record<string, number> = {
  "Standard Room": 1500,
  "Deluxe Room": 1700,
  "Luxury Room": 2500,
};

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  if (!isOpen) return null;

  const today = new Date();
  const BREAKFAST_COST = 200;

  // Form State
  const [hotel, setHotel] = useState<keyof typeof ROOM_PRICES>("Standard Room");
  const [checkInDate, setCheckInDate] = useState<Date | null>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(new Date(today.getTime() + 24 * 60 * 60 * 1000));
  
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);
  
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const basePrice = ROOM_PRICES[hotel] || 0;

  // Calculate Nights
  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const diff = differenceInCalendarDays(checkOutDate, checkInDate);
    return diff > 0 ? diff : 1;
  }, [checkInDate, checkOutDate]);

  // Calculate Total Price
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

    // Format dates for EmailJS
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
      
      // Reset Form after success
      setTimeout(() => {
        setCheckInDate(new Date());
        setCheckOutDate(new Date(today.getTime() + 24 * 60 * 60 * 1000));
        setName("");
        setMobileNo("");
        setEmail("");
        setAddBreakfast(false);
        onClose(); // Close modal
      }, 2000);

    } catch (error) {
      console.error("EmailJS error:", error);
      setMessage("Failed to send booking request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-red-600">Book Your Stay</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-wrap gap-6 justify-center">
          
          {/* Room Type */}
          <div className="flex flex-col min-w-[200px] flex-1">
            <label className="text-xs font-semibold uppercase mb-1 text-gray-600">Room Type</label>
            <select
              value={hotel}
              onChange={(e) => setHotel(e.target.value as keyof typeof ROOM_PRICES)}
              className="border border-gray-300 rounded-md p-3 text-black focus:outline-none focus:border-red-500"
              required
            >
              {Object.entries(ROOM_PRICES).map(([roomName, price]) => (
                <option key={roomName} value={roomName}>
                  {roomName} - ₹{price}
                </option>
              ))}
            </select>
          </div>

          {/* Check In */}
          <div className="flex flex-col min-w-[200px] flex-1">
            <label className="text-xs font-semibold uppercase mb-1 text-gray-600">Check In</label>
            <DatePicker
              selected={checkInDate}
              onChange={(date) => setCheckInDate(date)}
              selectsStart
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={today}
              dateFormat="yyyy-MM-dd"
              className="border border-gray-300 rounded-md p-3 text-black w-full focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Check Out */}
          <div className="flex flex-col min-w-[200px] flex-1">
            <label className="text-xs font-semibold uppercase mb-1 text-gray-600">Check Out</label>
            <DatePicker
              selected={checkOutDate}
              onChange={(date) => setCheckOutDate(date)}
              selectsEnd
              startDate={checkInDate}
              endDate={checkOutDate}
              minDate={checkInDate || today}
              dateFormat="yyyy-MM-dd"
              className="border border-gray-300 rounded-md p-3 text-black w-full focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Name */}
          <div className="flex flex-col min-w-[200px] flex-1">
            <label className="text-xs font-semibold uppercase mb-1 text-gray-600">Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-md p-3 text-black focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-col min-w-[200px] flex-1">
            <label className="text-xs font-semibold uppercase mb-1 text-gray-600">Mobile Number</label>
            <input
              type="tel"
              placeholder="+91 9876543210"
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
              className="border border-gray-300 rounded-md p-3 text-black focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col min-w-[200px] flex-1">
            <label className="text-xs font-semibold uppercase mb-1 text-gray-600">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-md p-3 text-black focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Breakfast Checkbox */}
          <div className="w-full flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              id="breakfast"
              checked={addBreakfast}
              onChange={(e) => setAddBreakfast(e.target.checked)}
              className="w-5 h-5 text-red-600"
            />
            <label htmlFor="breakfast" className="text-gray-700 font-medium">
              Add Breakfast (+₹200/night)
            </label>
          </div>

          {/* Total Price & Submit */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-800">
              Total Price: <span className="text-red-600">₹{totalPrice.toLocaleString("en-IN")}</span>
              <span className="text-sm font-normal text-gray-500 ml-2">({nights} Nights)</span>
            </div>

            <button
              type="submit"
              disabled={sending}
              className={`px-8 py-3 rounded-md font-bold transition shadow-md ${
                sending 
                  ? "bg-gray-400 text-white cursor-not-allowed" 
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {sending ? "Sending..." : "Confirm Booking"}
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <p className={`w-full text-center text-sm font-semibold mt-2 ${
              message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
            }`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
