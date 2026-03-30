import React, { useEffect, useMemo, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { ArrowLeft, Calendar, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

// --- CONFIGURATION ---
const SERVICE_ID = "service_12y6xre";
const TEMPLATE_ID = "template_1scrkoq";
const PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

const BREAKFAST_COST = 200;

// --- ROOM DATA ---
const ROOM_CATEGORIES = [
  {
    name: "Normal Room",
    price: 1000,
    rooms: [
      { roomNumber: "201", available: true },
      { roomNumber: "202", available: true },
      { roomNumber: "203", available: true },
      { roomNumber: "204", available: true },
    ],
  },
  {
    name: "Deluxe Room",
    price: 1700,
    rooms: [
      { roomNumber: "205", available: true },
      { roomNumber: "206", available: true },
      { roomNumber: "207", available: true },
      { roomNumber: "208", available: true },
      { roomNumber: "209", available: true },
      { roomNumber: "210", available: true },
    ],
  },
  {
    name: "Luxury Room",
    price: 2500,
    rooms: [
      { roomNumber: "301", available: false },
      { roomNumber: "302", available: false },
    ],
  },
] as const;

// --- DATE HELPERS ---
const parseDisplayDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.length !== 10) return null;

  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const toNativeFormat = (ddmmyyyy: string): string => {
  if (!ddmmyyyy || ddmmyyyy.length !== 10) return "";
  const parts = ddmmyyyy.split("/");
  if (parts.length !== 3) return "";
  return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
};

const toDisplayFormat = (yyyymmdd: string): string => {
  if (!yyyymmdd || yyyymmdd.length !== 10) return "";
  const parts = yyyymmdd.split("-");
  if (parts.length !== 3) return "";
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatDateForEmail = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// --- DATE INPUT COMPONENT ---
interface DateInputProps {
  value: string;
  onChange: (val: string) => void;
  minDate?: string;
  label: string;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  minDate,
  label,
}) => {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 8);

    let formatted = raw;
    if (raw.length > 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    } else if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }

    onChange(formatted);
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(toDisplayFormat(e.target.value));
  };

  const openPicker = () => {
    hiddenRef.current?.showPicker?.();
  };

  return (
    <div className="flex flex-col min-w-[220px] flex-1">
      <label className="text-xs font-semibold uppercase mb-2 text-gray-700 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleTextChange}
          placeholder="DD/MM/YYYY"
          className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 pr-12"
        />
        <button
          type="button"
          onClick={openPicker}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <Calendar size={20} />
        </button>
        <input
          ref={hiddenRef}
          type="date"
          value={toNativeFormat(value)}
          min={minDate}
          onChange={handleNativeChange}
          className="absolute opacity-0 pointer-events-none"
        />
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
interface BookingPageProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ isOpen, onClose, onBack }) => {
  const today = new Date().toISOString().split("T")[0];

  const [selectedCategoryName, setSelectedCategoryName] = useState("Normal Room");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState("201");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const selectedCategory = ROOM_CATEGORIES.find((c) => c.name === selectedCategoryName) || ROOM_CATEGORIES[0];
  const availableRooms = selectedCategory.rooms;
  const selectedRoom = availableRooms.find((r) => r.roomNumber === selectedRoomNumber) || availableRooms[0];

  // Auto-select first available room
  useEffect(() => {
    const firstAvailable = availableRooms.find(r => r.available);
    if (firstAvailable && selectedRoomNumber !== firstAvailable.roomNumber) {
      setSelectedRoomNumber(firstAvailable.roomNumber);
    }
  }, [selectedCategoryName, availableRooms]);

  const nights = useMemo(() => {
    const start = parseDisplayDate(checkIn);
    const end = parseDisplayDate(checkOut);
    if (!start || !end) return 1;
    const diffTime = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const totalPrice = (selectedCategory.price + (addBreakfast ? BREAKFAST_COST : 0)) * nights;

  const resetForm = () => {
    setSelectedCategoryName("Normal Room");
    setSelectedRoomNumber("201");
    setCheckIn("");
    setCheckOut("");
    setName("");
    setMobileNo("");
    setEmail("");
    setAddBreakfast(false);
    setMessage("");
    setMessageType("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    // Validation
    const startDate = parseDisplayDate(checkIn);
    const endDate = parseDisplayDate(checkOut);

    if (!startDate || !endDate) {
      setMessage("Please enter valid check-in and check-out dates (DD/MM/YYYY)");
      setMessageType("error");
      return;
    }

    if (startDate < new Date()) {
      setMessage("Check-in date cannot be in the past");
      setMessageType("error");
      return;
    }

    if (endDate <= startDate) {
      setMessage("Check-out date must be after check-in date");
      setMessageType("error");
      return;
    }

    if (!name.trim() || !mobileNo.trim() || !email.trim()) {
      setMessage("Please fill in all guest details");
      setMessageType("error");
      return;
    }

    if (mobileNo.length !== 10 || isNaN(Number(mobileNo))) {
      setMessage("Please enter a valid 10-digit mobile number");
      setMessageType("error");
      return;
    }

    if (!selectedRoom.available) {
      setMessage("Selected room is currently unavailable");
      setMessageType("error");
      return;
    }

    setSending(true);

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          room_type: selectedCategory.name,
          room_number: selectedRoom.roomNumber,
          base_price: selectedCategory.price,
          breakfast: addBreakfast ? "Yes (+₹" + BREAKFAST_COST + "/night)" : "No",
          total_price: totalPrice,
          nights: nights,
          check_in: formatDateForEmail(startDate),
          check_out: formatDateForEmail(endDate),
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email,
          booking_status: "Pending Confirmation",
        },
        PUBLIC_KEY
      );

      setMessage("✅ Booking request sent successfully! We'll call you within 30 minutes to confirm.");
      setMessageType("success");
      
      // Auto reset after 3 seconds
      setTimeout(() => {
        resetForm();
        onClose();
      }, 3000);

    } catch (error) {
      console.error("Booking error:", error);
      setMessage("❌ Failed to send booking. Please try again or call +91 78143 91779");
      setMessageType("error");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 border-b-2 border-emerald-800">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 p-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-200 text-white font-semibold"
            >
              <ArrowLeft size={24} />
              Back to Rooms
            </button>
            
            <h2 className="text-3xl font-bold">Book Your Stay</h2>
            
            <button
              onClick={onClose}
              className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-200"
              aria-label="Close booking"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {/* Success/Error Message */}
          {message && (
            <div className={`p-6 rounded-2xl border-4 mb-8 text-lg font-semibold flex items-center gap-4 shadow-lg transition-all duration-300 ${
              messageType === "success"
                ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                : "bg-red-50 border-red-400 text-red-800"
            }`}>
              {messageType === "success" ? (
                <CheckCircle size={32} className="text-emerald-500" />
              ) : (
                <AlertCircle size={32} className="text-red-500" />
              )}
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase mb-3 text-gray-700 tracking-wide">
                  Room Category
                </label>
                <select
                  value={selectedCategoryName}
                  onChange={(e) => setSelectedCategoryName(e.target.value)}
                  className="w-full p-5 border-2 border-gray-300 rounded-2xl text-lg font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 hover:shadow-md"
                  required
                >
                  {ROOM_CATEGORIES.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name} - ₹{category.price}/night
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-3 text-gray-700 tracking-wide">
                  Room Number
                </label>
                <select
                  value={selectedRoomNumber}
                  onChange={(e) => setSelectedRoomNumber(e.target.value)}
                  className="w-full p-5 border-2 border-gray-300 rounded-2xl text-lg font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 hover:shadow-md"
                  required
                >
                  {availableRooms.map((room) => (
                    <option key={room.roomNumber} value={room.roomNumber} disabled={!room.available}>
                      {room.roomNumber} {room.available ? "✅ Available" : "🔧 Unavailable"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DateInput label="Check In" value={checkIn} onChange={setCheckIn} minDate={today} />
              <DateInput label="Check Out" value={checkOut} onChange={setCheckOut} minDate={today} />
            </div>

            {/* Guest Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase mb-3 text-gray-700 tracking-wide">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-5 border-2 border-gray-300 rounded-2xl text-lg font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 hover:shadow-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-3 text-gray-700 tracking-wide">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={mobileNo}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setMobileNo(value);
                  }}
                  className="w-full p-5 border-2 border-gray-300 rounded-2xl text-lg font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 hover:shadow-md"
                  placeholder="10 digits"
                  required
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-3 text-gray-700 tracking-wide">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-5 border-2 border-gray-300 rounded-2xl text-lg font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 hover:shadow-md"
                  required
                />
              </div>
            </div>

            {/* Breakfast & Summary */}
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-200">
              <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    id="breakfast"
                    type="checkbox"
                    checked={addBreakfast}
                    onChange={(e) => setAddBreakfast(e.target.checked)}
                    className="w-6 h-6 text-emerald-600 rounded-lg focus:ring-emerald-500"
                  />
                  <label htmlFor="breakfast" className="text-xl font-bold text-gray-800 cursor-pointer">
                    Add Complimentary Breakfast (+₹{BREAKFAST_COST}/night per person)
                  </label>
                </div>
                
                <div className="text-2xl font-bold text-emerald-700 bg-white px-6 py-3 rounded-2xl shadow-lg">
                  Total: ₹{totalPrice.toLocaleString()} ({nights} night{nights > 1 ? 's' : ''})
                </div>
              </div>
            </div>

            {/* Book Now Button */}
            <button
              type="submit"
              disabled={sending || !selectedRoom.available}
              className={`w-full py-6 px-8 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl ${
                sending || !selectedRoom.available
                  ? "bg-gray-400 cursor-not-allowed text-gray-600 shadow-none"
                  : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {sending ? (
                <>
                  <Loader2 className="animate-spin" size={26} />
                  Processing Booking...
                </>
              ) : !selectedRoom.available ? (
                <>
                  <AlertCircle size={26} />
                  Room Unavailable
                </>
              ) : (
                <>
                  <CheckCircle size={26} />
                  Confirm Booking Now
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
