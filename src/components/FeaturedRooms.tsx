import React, { useState, useMemo } from "react";
import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_12y6xre";
const TEMPLATE_ID = "template_1scrkoq";
const PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

const ROOMS = [
  { name: "Standard Room", price: 1500, available: true },
  { name: "Deluxe Room", price: 1700, available: false },
  { name: "Luxury Room", price: 2500, available: false },
];

export default function BookingForm() {
  const today = new Date().toISOString().split("T")[0];
  const BREAKFAST_PRICE = 200;

  const [selectedRoom, setSelectedRoom] = useState(ROOMS[0]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }, [checkIn, checkOut]);

  const totalPrice = useMemo(() => {
    const base = selectedRoom.price;
    const breakfast = addBreakfast ? BREAKFAST_PRICE : 0;
    return (base + breakfast) * nights;
  }, [selectedRoom, addBreakfast, nights]);

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomName = e.target.value;
    const found = ROOMS.find((r) => r.name === roomName);
    if (found) {
      setSelectedRoom(found);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn || !checkOut || !name || !mobileNo || !email) {
      setMessage("Please fill all the fields.");
      return;
    }
    if (!selectedRoom.available) {
      setMessage("Selected room is not available.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          room_type: selectedRoom.name,
          base_price: selectedRoom.price,
          add_breakfast: addBreakfast ? "Yes" : "No",
          total_price: totalPrice.toString(),
          check_in: checkIn,
          check_out: checkOut,
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email,
        },
        PUBLIC_KEY
      );
      setMessage("Booking request sent successfully!");
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
      setAddBreakfast(false);
      setSelectedRoom(ROOMS[0]);
    } catch (err) {
      setMessage("Failed to send booking request. Please try again.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-full px-6 py-6 font-sans bg-transparent">
      <form onSubmit={handleSubmit} className="flex flex-nowrap items-center gap-3 max-w-full overflow-x-auto">
        <select
          value={selectedRoom.name}
          onChange={handleRoomChange}
          className="border border-black rounded px-4 py-2 min-w-[160px]"
          aria-label="Room"
          required
        >
          {ROOMS.map(({ name, available }) => (
            <option key={name} value={name} disabled={!available}>
              {name} {available ? "" : "(Not Available)"}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="checkIn"
          value={checkIn}
          min={today}
          onChange={(e) => setCheckIn(e.target.value)}
          className="border border-black rounded px-4 py-2 min-w-[140px]"
          placeholder="dd-mm-yyyy"
          required
        />

        <input
          type="date"
          name="checkOut"
          value={checkOut}
          min={checkIn || today}
          onChange={(e) => setCheckOut(e.target.value)}
          className="border border-black rounded px-4 py-2 min-w-[140px]"
          placeholder="dd-mm-yyyy"
          required
        />

        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="border border-black rounded px-4 py-2 min-w-[160px]"
          required
        />

        <input
          type="tel"
          name="mobileNo"
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          placeholder="Mobile No."
          className="border border-black rounded px-4 py-2 min-w-[140px]"
          required
        />

        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="border border-black rounded px-4 py-2 min-w-[180px]"
          required
        />

        <label className="inline-flex items-center min-w-[140px] gap-2 text-black text-xs font-semibold whitespace-nowrap select-none">
          <input
            type="checkbox"
            checked={addBreakfast}
            onChange={(e) => setAddBreakfast(e.target.checked)}
            className="w-4 h-4"
          />
          Add Breakfast ₹200
        </label>

        <div className="min-w-[140px] font-bold text-lg flex items-center justify-center text-black whitespace-nowrap">
          ₹{totalPrice.toLocaleString("en-IN")}
        </div>

        <button
          type="submit"
          disabled={sending || !selectedRoom.available}
          className={`ml-3 border border-red-600 rounded px-6 py-3 font-bold transition ${
            sending
              ? "bg-red-600 text-white cursor-not-allowed opacity-50"
              : "text-red-600 hover:bg-red-600 hover:text-white"
          }`}
        >
          {sending ? "Booking..." : selectedRoom.available ? "Book Now" : "Not Available"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center text-sm font-semibold ${
            message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {/* Contact Info Bar */}
      <div className="mt-8 bg-[#473605] text-white text-center py-3 text-sm font-semibold tracking-wide rounded-md select-none">
        Phone No. +91 80191600498 | Reservation Number | Email:{" "}
        <a href="mailto:reservations@blossomhotels.in" className="underline hover:text-gray-200">
          reservations@blossomhotels.in
        </a>
      </div>

      {/* Benefits Banner */}
      <div className="mt-8 overflow-x-auto">
        <div
          className="relative bg-black bg-opacity-90 rounded-lg shadow-lg flex items-center justify-between px-6 py-4 whitespace-nowrap text-white font-bold text-xl max-w-full"
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

          <div className="flex space-x-12 ml-10 text-base font-semibold items-center">
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
    <div className="flex items-center space-x-2 whitespace-nowrap">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 flex-shrink-0"
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
