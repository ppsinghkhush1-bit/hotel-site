import React, { useMemo, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { ArrowLeft, Calendar, X } from "lucide-react";

// --- CONFIGURATION ---
const SERVICE_ID = "service_12y6xre";
const TEMPLATE_ID = "template_1scrkoq";
const PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

const ROOMS = [
  { name: "Standard Room", price: 1500, available: true },
  { name: "Deluxe Room", price: 1700, available: true },
  { name: "Luxury Room", price: 2500, available: false },
] as const;

const BREAKFAST_COST = 200;

// --- DATE HELPERS ---
const parseDisplayDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.length !== 10) return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000) return null;

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
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

const toDisplayFormat = (yyyymmdd: string): string => {
  if (!yyyymmdd) return "";
  const parts = yyyymmdd.split("-");
  if (parts.length !== 3) return "";
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatDateForEmail = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --- DATE INPUT COMPONENT ---
interface DateInputProps {
  value: string;
  onChange: (val: string) => void;
  minDate?: string;
  placeholder?: string;
  label: string;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  minDate,
  placeholder = "DD/MM/YYYY",
  label,
}) => {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");

    if (raw.length > 8) raw = raw.slice(0, 8);

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
    if (hiddenRef.current) {
      try {
        (
          hiddenRef.current as HTMLInputElement & {
            showPicker?: () => void;
          }
        ).showPicker?.();
      } catch {
        hiddenRef.current.click();
      }
    }
  };

  return (
    <div className="flex flex-col min-w-[220px] flex-1">
      <label className="text-xs font-semibold uppercase mb-1 text-gray-600">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="border border-gray-400 rounded-md p-3 pr-12 text-black w-full focus:outline-none focus:border-red-500"
        />

        <button
          type="button"
          onClick={openPicker}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition"
          aria-label={`Open ${label} calendar`}
        >
          <Calendar size={20} />
        </button>

        <input
          ref={hiddenRef}
          type="date"
          value={toNativeFormat(value)}
          min={minDate}
          onChange={handleNativeChange}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          tabIndex={-1}
        />
      </div>
    </div>
  );
};

// --- BOOKING PAGE / POPUP ---
interface BookingPageProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

const BookingPage: React.FC<BookingPageProps> = ({
  isOpen,
  onClose,
  onBack,
}) => {
  const today = new Date().toISOString().split("T")[0];

  const [selectedRoomName, setSelectedRoomName] = useState<(typeof ROOMS)[number]["name"]>("Standard Room");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const selectedRoom =
    ROOMS.find((room) => room.name === selectedRoomName) ?? ROOMS[0];

  const basePrice = selectedRoom.price;

  const nights = useMemo(() => {
    const start = parseDisplayDate(checkIn);
    const end = parseDisplayDate(checkOut);

    if (!start || !end) return 1;

    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 1;
  }, [checkIn, checkOut]);

  const totalPrice = useMemo(() => {
    return (basePrice + (addBreakfast ? BREAKFAST_COST : 0)) * nights;
  }, [basePrice, addBreakfast, nights]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const startDate = parseDisplayDate(checkIn);
    const endDate = parseDisplayDate(checkOut);

    if (!startDate || !endDate) {
      setMessage("Please enter valid dates in DD/MM/YYYY format.");
      return;
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (startDate < todayDate) {
      setMessage("Check-in date cannot be before today.");
      return;
    }

    if (endDate <= startDate) {
      setMessage("Check-out date must be after check-in date.");
      return;
    }

    if (!name.trim() || !mobileNo.trim() || !email.trim()) {
      setMessage("Please fill all fields.");
      return;
    }

    if (!selectedRoom.available) {
      setMessage("Selected room is currently unavailable.");
      return;
    }

    setSending(true);

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          room_type: selectedRoom.name,
          base_price: basePrice,
          add_breakfast: addBreakfast ? "Yes" : "No",
          total_price: totalPrice.toString(),
          check_in: formatDateForEmail(startDate),
          check_out: formatDateForEmail(endDate),
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email,
        },
        PUBLIC_KEY
      );

      setMessage("Booking request sent successfully!");

      setTimeout(() => {
        setSelectedRoomName("Standard Room");
        setCheckIn("");
        setCheckOut("");
        setName("");
        setMobileNo("");
        setEmail("");
        setAddBreakfast(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage("Failed to send booking request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-red-600 font-semibold transition"
            >
              <ArrowLeft size={20} />
              Back
            </button>

            <h2 className="text-xl md:text-2xl font-bold text-red-600">
              Book Your Stay
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-red-600 font-semibold transition"
            >
              <X size={22} />
              Close
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 bg-red-600 text-white">
              <h3 className="text-2xl font-bold">Complete Your Booking</h3>
              <p className="text-white/90 mt-1">
                Fill in your details and submit your booking request.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 flex flex-wrap gap-6 justify-center"
            >
              <div className="flex flex-col min-w-[220px] flex-1">
                <label className="text-xs font-semibold uppercase mb-1 text-gray-600">
                  Room Type
                </label>
                <select
                  value={selectedRoomName}
                  onChange={(e) =>
                    setSelectedRoomName(
                      e.target.value as (typeof ROOMS)[number]["name"]
                    )
                  }
                  className="border border-gray-400 rounded-md p-3 text-black w-full focus:outline-none focus:border-red-500"
                  required
                >
                  {ROOMS.map((room) => (
                    <option
                      key={room.name}
                      value={room.name}
                      disabled={!room.available}
                    >
                      {room.name} (₹{room.price}){" "}
                      {!room.available ? "- Unavailable" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <DateInput
                label="Check In"
                value={checkIn}
                onChange={setCheckIn}
                minDate={today}
                placeholder="DD/MM/YYYY"
              />

              <DateInput
                label="Check Out"
                value={checkOut}
                onChange={setCheckOut}
                minDate={toNativeFormat(checkIn) || today}
                placeholder="DD/MM/YYYY"
              />

              <div className="flex flex-col min-w-[220px] flex-1">
                <label className="text-xs font-semibold uppercase mb-1 text-gray-600">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-gray-400 rounded-md p-3 text-black w-full focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex flex-col min-w-[220px] flex-1">
                <label className="text-xs font-semibold uppercase mb-1 text-gray-600">
                  Mobile No.
                </label>
                <input
                  type="tel"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  className="border border-gray-400 rounded-md p-3 text-black w-full focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex flex-col min-w-[220px] flex-1">
                <label className="text-xs font-semibold uppercase mb-1 text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-gray-400 rounded-md p-3 text-black w-full focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="w-full flex items-center gap-3 mt-2">
                <input
                  id="breakfast"
                  type="checkbox"
                  checked={addBreakfast}
                  onChange={(e) => setAddBreakfast(e.target.checked)}
                  className="w-5 h-5 text-red-600"
                />
                <label
                  htmlFor="breakfast"
                  className="text-gray-700 font-medium cursor-pointer"
                >
                  Add Breakfast (+₹200 per night)
                </label>
              </div>

              {message && (
                <p
                  className={`w-full text-center font-semibold ${
                    message.toLowerCase().includes("success")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}

              <div className="w-full mt-4 border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-xl font-bold text-gray-800">
                  Total:{" "}
                  <span className="text-red-600">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({nights} Night{nights > 1 ? "s" : ""})
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={sending || !selectedRoom.available}
                  className={`w-full md:w-auto px-8 py-3 rounded-md font-bold text-white transition ${
                    sending || !selectedRoom.available
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {sending
                    ? "Sending..."
                    : !selectedRoom.available
                    ? "Room Unavailable"
                    : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
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

      <BookingPage
        isOpen={isOpen}
        onBack={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
