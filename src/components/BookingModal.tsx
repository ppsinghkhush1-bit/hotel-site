import React, { useState, useEffect, useMemo } from "react";
import emailjs from "@emailjs/browser";
import { X, CheckCircle } from "lucide-react";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_mz16rsu";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

export default function BookingSection({ room }: { room: { room_type: string; price_per_night: number } }) {
  // Form state
  const [formData, setFormData] = useState({
    hotel: "Blossom",
    checkIn: "",
    checkOut: "",
    name: "",
    mobileNo: "",
    email: "",
    addBreakfast: false,
  });

  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Calculate number of nights between checkIn and checkOut
  const totalNights = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 1;
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [formData.checkIn, formData.checkOut]);

  // Calculate total price with optional breakfast
  const totalPrice = useMemo(() => {
    const price = room?.price_per_night || 0;
    const breakfastPrice = formData.addBreakfast ? 200 : 0;
    return (price + breakfastPrice) * totalNights;
  }, [room, formData.addBreakfast, totalNights]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    const value = type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // On main form submit, show modal for final confirmation
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.hotel ||
      !formData.checkIn ||
      !formData.checkOut ||
      !formData.name ||
      !formData.mobileNo ||
      !formData.email
    ) {
      setErrorMsg("Please fill all fields before proceeding.");
      return;
    }
    setErrorMsg("");
    setShowModal(true);
  };

  // Confirm booking: send email with EmailJS
  const confirmBooking = async () => {
    setSending(true);
    setBookingStatus("idle");
    setErrorMsg("");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.mobileNo,
          hotel: formData.hotel,
          room_type: room?.room_type || "Room",
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          add_breakfast: formData.addBreakfast ? "Yes" : "No",
          total_nights: totalNights.toString(),
          total_price: `₹${totalPrice}`,
        },
        EMAILJS_PUBLIC_KEY
      );
      setBookingStatus("success");
    } catch (error) {
      setBookingStatus("error");
      setErrorMsg("Failed to send booking. Please try again later.");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  // Close modal resets booking status and closes
  const closeModal = () => {
    setShowModal(false);
    setBookingStatus("idle");
    setErrorMsg("");
  };

  return (
    <>
      {/* Booking Form Bar */}
      <form
        onSubmit={handleFormSubmit}
        className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6 items-end"
      >
        {/* Hotel */}
        <InputGroup label="Hotel">
          <select
            name="hotel"
            value={formData.hotel}
            onChange={handleInputChange}
            className="input-style"
          >
            <option>Blossom</option>
            <option>Hotel Green Garden</option>
          </select>
        </InputGroup>

        {/* Check In */}
        <InputGroup label="Check In">
          <input
            type="date"
            name="checkIn"
            min={new Date().toISOString().split("T")[0]}
            value={formData.checkIn}
            onChange={handleInputChange}
            className="input-style"
            required
          />
        </InputGroup>

        {/* Check Out */}
        <InputGroup label="Check Out">
          <input
            type="date"
            name="checkOut"
            min={formData.checkIn || new Date().toISOString().split("T")[0]}
            value={formData.checkOut}
            onChange={handleInputChange}
            className="input-style"
            required
          />
        </InputGroup>

        {/* Name */}
        <InputGroup label="Full Name">
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleInputChange}
            className="input-style"
            required
          />
        </InputGroup>

        {/* Mobile No */}
        <InputGroup label="Mobile">
          <input
            type="tel"
            name="mobileNo"
            placeholder="+91-XXXXXXXXXX"
            value={formData.mobileNo}
            onChange={handleInputChange}
            className="input-style"
            required
          />
        </InputGroup>

        {/* Email */}
        <InputGroup label="Email">
          <input
            type="email"
            name="email"
            placeholder="alex@mail.com"
            value={formData.email}
            onChange={handleInputChange}
            className="input-style"
            required
          />
        </InputGroup>

        {/* Add Breakfast checkbox */}
        <div className="flex items-center space-x-2 lg:col-span-7">
          <input
            id="addBreakfast"
            type="checkbox"
            name="addBreakfast"
            checked={formData.addBreakfast}
            onChange={handleInputChange}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="addBreakfast" className="text-gray-700 text-sm select-none">
            + Add Breakfast ₹200
          </label>
        </div>

        {/* Book Now button */}
        <button
          type="submit"
          className="lg:col-span-7 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition transform hover:scale-105 shadow-lg"
          disabled={sending}
        >
          {sending ? "Please wait..." : "Book Now"}
        </button>
      </form>

      {/* Error message */}
      {errorMsg && (
        <p className="mt-4 text-red-600 text-center font-semibold max-w-7xl mx-auto">{errorMsg}</p>
      )}

      {/* Booking Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 relative animate-fadeIn">
            <button
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-900"
              aria-label="Close modal"
              onClick={closeModal}
            >
              <X size={24} />
            </button>

            {bookingStatus === "success" ? (
              <div className="text-center">
                <CheckCircle size={64} className="mx-auto text-emerald-500 mb-6" />
                <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
                <p className="text-gray-700 mb-8">Thanks for booking at {formData.hotel}.</p>
                <button
                  onClick={closeModal}
                  className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">Confirm Your Booking</h2>
                <div className="space-y-4">
                  <Detail label="Hotel" value={formData.hotel} />
                  <Detail label="Room Type" value={room.room_type} />
                  <Detail label="Check In" value={formData.checkIn} />
                  <Detail label="Check Out" value={formData.checkOut} />
                  <Detail label="Nights" value={totalNights + " night(s)"} />
                  <Detail label="Name" value={formData.name} />
                  <Detail label="Mobile" value={formData.mobileNo} />
                  <Detail label="Email" value={formData.email} />
                  <Detail label="Breakfast Included" value={formData.addBreakfast ? "Yes" : "No"} />
                  <Detail label="Total Price" value={`₹${totalPrice}`} />
                </div>
                <button
                  onClick={confirmBooking}
                  disabled={sending}
                  className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-70"
                >
                  {sending ? "Sending..." : "Confirm & Send Booking"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function InputGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-200 py-2">
      <span className="font-semibold text-gray-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}
