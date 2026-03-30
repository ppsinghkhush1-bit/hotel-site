import React, { useEffect, useMemo, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { ArrowLeft, Calendar, X } from "lucide-react";

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
  if (!ddmmyyyy) return "";
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
      <label className="text-xs font-semibold mb-1 text-gray-600">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleTextChange}
          placeholder="DD/MM/YYYY"
          className="border p-3 pr-10 rounded-md w-full"
        />

        <button
          type="button"
          onClick={openPicker}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <Calendar size={18} />
        </button>

        <input
          ref={hiddenRef}
          type="date"
          value={toNativeFormat(value)}
          min={minDate}
          onChange={handleNativeChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const BookingPage = ({ isOpen, onClose, onBack }: any) => {
  const today = new Date().toISOString().split("T")[0];

  const [selectedCategoryName, setSelectedCategoryName] =
    useState("Normal Room");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState("201");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");

  const [addBreakfast, setAddBreakfast] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const selectedCategory =
    ROOM_CATEGORIES.find((c) => c.name === selectedCategoryName)!;

  const availableRooms = selectedCategory.rooms;

  const selectedRoom =
    availableRooms.find((r) => r.roomNumber === selectedRoomNumber)!;

  const nights = useMemo(() => {
    const start = parseDisplayDate(checkIn);
    const end = parseDisplayDate(checkOut);
    if (!start || !end) return 1;
    return Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
  }, [checkIn, checkOut]);

  const totalPrice =
    (selectedCategory.price + (addBreakfast ? BREAKFAST_COST : 0)) * nights;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const start = parseDisplayDate(checkIn);
    const end = parseDisplayDate(checkOut);

    if (!start || !end) return setMessage("Invalid dates");
    if (!name || !mobileNo || !email)
      return setMessage("Fill all fields");

    setSending(true);

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          room_type: selectedCategory.name,
          room_number: selectedRoom.roomNumber,
          total_price: totalPrice,
          nights,
          check_in: formatDateForEmail(start),
          check_out: formatDateForEmail(end),
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email,
        },
        PUBLIC_KEY
      );

      setMessage("Booking sent successfully!");
    } catch (err) {
      setMessage("Error sending booking");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="p-6">
      <button onClick={onBack}>
        <ArrowLeft /> Back
      </button>

      <button onClick={onClose}>
        <X /> Close
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
        <select
          value={selectedCategoryName}
          onChange={(e) => setSelectedCategoryName(e.target.value)}
        >
          {ROOM_CATEGORIES.map((c) => (
            <option key={c.name}>{c.name}</option>
          ))}
        </select>

        <select
          value={selectedRoomNumber}
          onChange={(e) => setSelectedRoomNumber(e.target.value)}
        >
          {availableRooms.map((r) => (
            <option key={r.roomNumber} value={r.roomNumber}>
              {r.roomNumber}
            </option>
          ))}
        </select>

        <DateInput
          label="Check In"
          value={checkIn}
          onChange={setCheckIn}
          minDate={today}
        />

        <DateInput
          label="Check Out"
          value={checkOut}
          onChange={setCheckOut}
          minDate={today}
        />

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Mobile"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={addBreakfast}
            onChange={(e) => setAddBreakfast(e.target.checked)}
          />
          Add Breakfast
        </label>

        <p>Total: ₹{totalPrice}</p>

        {message && (
          <p
            className={
              message.includes("success") ? "text-green-600" : "text-red-600"
            }
          >
            {message}
          </p>
        )}

        <button type="submit" disabled={sending}>
          {sending ? "Sending..." : "Book Now"}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;
