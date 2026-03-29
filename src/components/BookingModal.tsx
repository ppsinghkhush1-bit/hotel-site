import React, { useState, useMemo } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_1scrkoq";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

interface Room {
  id: number;
  name: string;
  price_per_night: number;
  available: boolean;
}

const rooms: Room[] = [
  { id: 1, name: "Deluxe Garden Suite", price_per_night: 2500, available: true },
  { id: 2, name: "Premium Green Room", price_per_night: 3200, available: true },
  { id: 3, name: "Family Suite", price_per_night: 4000, available: false } // example unavailable room
];

export default function RoomsBooking() {
  const today = new Date().toISOString().split("T")[0];

  // State to track which room was selected for booking:
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Booking form states:
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [addBreakfast, setAddBreakfast] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Calculate nights (default 1)
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diff =
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  // Total price calculation:
  const totalPrice = useMemo(() => {
    if (!selectedRoom) return 0;
    const base = selectedRoom.price_per_night;
    const breakfast = addBreakfast ? 200 : 0;
    return (base + breakfast) * nights;
  }, [selectedRoom, addBreakfast, nights]);

  // When clicking “Book Now” on room card
  const handleRoomBookClick = (room: Room) => {
    if (!room.available) {
      alert("This room is not currently available.");
      return;
    }
    setSelectedRoom(room);
    // Reset form fields on new room selection
    setCheckIn("");
    setCheckOut("");
    setName("");
    setMobileNo("");
    setEmail("");
    setAddBreakfast(false);
    setMessage("");
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedRoom ||
      !checkIn ||
      !checkOut ||
      !name.trim() ||
      !mobileNo.trim() ||
      !email.trim()
    ) {
      setMessage("Please fill in all the fields.");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          room_type: selectedRoom.name,
          base_price: selectedRoom.price_per_night.toString(),
          add_breakfast: addBreakfast ? "Yes" : "No",
          total_price: `₹${totalPrice}`,
          check_in: checkIn,
          check_out: checkOut,
          customer_name: name,
          customer_mobile: mobileNo,
          customer_email: email
        },
        EMAILJS_PUBLIC_KEY
      );

      setMessage("Booking request sent successfully!");
      // Optionally reset form or room selection after success
      setSelectedRoom(null);
      setCheckIn("");
      setCheckOut("");
      setName("");
      setMobileNo("");
      setEmail("");
      setAddBreakfast(false);
    } catch (error) {
      console.error("Booking send error:", error);
      setMessage("Failed to send booking request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Available Rooms</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {rooms.map((room) => (
          <div key={room.id} className="border rounded p-4 shadow flex flex-col">
            <h2 className="font-semibold text-xl">{room.name}</h2>
            <p className="text-green-700 font-bold text-lg mb-4">
              ₹{room.price_per_night.toLocaleString("en-IN")}
            </p>
            {!room.available ? (
              <button
                disabled
                className="py-2 px-4 rounded bg-gray-400 text-white cursor-not-allowed"
              >
                Not Available
              </button>
            ) : (
              <button
                onClick={() => handleRoomBookClick(room)}
                className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Book Now
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Booking Form Bar shown only when a room is selected */}
      {selectedRoom && (
        <section className="sticky bottom-0 bg-white border-t border-gray-300 shadow-lg p-4">
          <form
            onSubmit={handleBookingSubmit}
            className="flex flex-nowrap items-center gap-4 max-w-full overflow-x-auto"
          >
            {/* Room Name (read-only display) */}
            <div className="min-w-[150px] font-bold text-gray-900 truncate">
              {selectedRoom.name}
            </div>

            {/* Check In */}
            <div className="flex flex-col min-w-[140px]">
              <label
                htmlFor="checkIn"
                className="text-xs font-semibold uppercase mb-1 text-gray-700"
              >
                Check In
              </label>
              <input
                id="checkIn"
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                className="border border-gray-400 rounded-md px-3 py-2"
                required
              />
            </div>

            {/* Check Out */}
            <div className="flex flex-col min-w-[140px]">
              <label
                htmlFor="checkOut"
                className="text-xs font-semibold uppercase mb-1 text-gray-700"
              >
                Check Out
              </label>
              <input
                id="checkOut"
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                className="border border-gray-400 rounded-md px-3 py-2"
                required
              />
            </div>

            {/* Name */}
            <div className="flex flex-col min-w-[160px]">
              <label
                htmlFor="name"
                className="text-xs font-semibold uppercase mb-1 text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="border border-gray-400 rounded-md px-3 py-2"
                required
              />
            </div>

            {/* Mobile */}
            <div className="flex flex-col min-w-[140px]">
              <label
                htmlFor="mobileNo"
                className="text-xs font-semibold uppercase mb-1 text-gray-700"
              >
                Mobile No.
              </label>
              <input
                id="mobileNo"
                type="tel"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                placeholder="+91 9000000000"
                className="border border-gray-400 rounded-md px-3 py-2"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col min-w-[180px]">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase mb-1 text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="border border-gray-400 rounded-md px-3 py-2"
                required
              />
            </div>

            {/* Breakfast checkbox */}
            <label className="inline-flex items-center min-w-[140px] gap-2 text-gray-700 text-xs font-semibold whitespace-nowrap">
              <input
                type="checkbox"
                checked={addBreakfast}
                onChange={(e) => setAddBreakfast(e.target.checked)}
                className="w-4 h-4"
              />
              Add Breakfast ₹200
            </label>

            {/* Total Price */}
            <div className="min-w-[140px] font-bold text-lg flex items-center justify-center whitespace-nowrap text-gray-900">
              ₹{totalPrice.toLocaleString("en-IN")}
            </div>

            {/* Book Now button */}
            <button
              type="submit"
              disabled={sending}
              className={`min-w-[130px] px-6 py-3 rounded border border-red-600 font-bold transition ${
                sending
                  ? "bg-red-600 text-white cursor-not-allowed opacity-50"
                  : "text-red-600 hover:bg-red-600 hover:text-white"
              }`}
            >
              {sending ? "Booking..." : "Book Now"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-3 mx-auto max-w-2xl text-center font-semibold ${
                message.includes("success")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
