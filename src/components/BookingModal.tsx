import React, { useState, useMemo } from "react";
import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_12y6xre";
const TEMPLATE_ID = "template_1scrkoq";
const PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

interface BookingFormProps {
  roomName: string;
  basePrice: number;
}

export default function BookingForm({ roomName, basePrice }: BookingFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const BREAKFAST_PRICE = 200;

  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    name: "",
    mobileNo: "",
    email: "",
    addBreakfast: false,
  });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const nights = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 1;
    const start = new Date(form.checkIn);
    const end = new Date(form.checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [form.checkIn, form.checkOut]);

  const totalPrice = (basePrice + (form.addBreakfast ? BREAKFAST_PRICE : 0)) * nights;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload!

    // Simple validation
    for (const key in form) {
      if (key !== "addBreakfast" && !form[key as keyof typeof form]) {
        setMessage(`Please enter your ${key}`);
        return;
      }
    }

    setSending(true);
    setMessage("");

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          room_type: roomName,
          base_price: basePrice,
          add_breakfast: form.addBreakfast ? "Yes" : "No",
          total_price: totalPrice.toString(), // Send number/string only, no ₹ prefix
          check_in: form.checkIn,
          check_out: form.checkOut,
          customer_name: form.name,
          customer_mobile: form.mobileNo,
          customer_email: form.email,
        },
        PUBLIC_KEY
      );

      setMessage("Booking request sent successfully!");
      setForm({
        checkIn: "",
        checkOut: "",
        name: "",
        mobileNo: "",
        email: "",
        addBreakfast: false,
      });
    } catch (error) {
      console.error(error);
      setMessage("Failed to send booking request. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-full py-6 px-6 font-sans bg-transparent">
      <form onSubmit={handleSubmit} className="flex flex-nowrap items-center gap-4 overflow-x-auto max-w-full">
        <div className="min-w-[160px] font-semibold truncate text-black">{roomName}</div>

        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-bold uppercase mb-1 text-black" htmlFor="checkIn">Check In</label>
          <input
            id="checkIn"
            type="date"
            name="checkIn"
            value={form.checkIn}
            min={today}
            onChange={handleChange}
            required
            className="border border-gray-400 rounded-md p-2 text-black"
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-bold uppercase mb-1 text-black" htmlFor="checkOut">Check Out</label>
          <input
            id="checkOut"
            type="date"
            name="checkOut"
            value={form.checkOut}
            min={form.checkIn || today}
            onChange={handleChange}
            required
            className="border border-gray-400 rounded-md p-2 text-black"
          />
        </div>

        <div className="flex flex-col min-w-[160px]">
          <label className="text-xs font-bold uppercase mb-1 text-black" htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            required
            className="border border-gray-400 rounded-md p-2 text-black"
          />
        </div>

        <div className="flex flex-col min-w-[140px]">
          <label className="text-xs font-bold uppercase mb-1 text-black" htmlFor="mobileNo">Mobile No.</label>
          <input
            id="mobileNo"
            type="tel"
            name="mobileNo"
            placeholder="+91 9000000000"
            value={form.mobileNo}
            onChange={handleChange}
            required
            className="border border-gray-400 rounded-md p-2 text-black"
          />
        </div>

        <div className="flex flex-col min-w-[180px]">
          <label className="text-xs font-bold uppercase mb-1 text-black" htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            className="border border-gray-400 rounded-md p-2 text-black"
          />
        </div>

        <label className="inline-flex items-center min-w-[140px] gap-2 text-black text-xs font-semibold whitespace-nowrap">
          <input
            type="checkbox"
            name="addBreakfast"
            checked={form.addBreakfast}
            onChange={handleChange}
            className="w-4 h-4"
          />
          Add Breakfast ₹200
        </label>

        <div className="min-w-[140px] font-bold text-lg flex items-center justify-center text-black whitespace-nowrap">
          ₹{((basePrice + (form.addBreakfast ? 200 : 0)) * nights).toLocaleString("en-IN")}
        </div>

        <button
          type="submit"
          disabled={sending}
          className={`min-w-[140px] px-6 py-3 rounded border border-red-600 font-bold transition ${
            sending ? "opacity-50 cursor-not-allowed bg-red-600 text-white" : "text-red-600 hover:bg-red-600 hover:text-white"
          }`}
        >
          {sending ? "Booking..." : "Book Now"}
        </button>
      </form>

      {message && (
        <p className={`mt-3 text-center text-sm font-semibold ${message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </section>
  );
}
