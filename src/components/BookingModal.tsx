import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_12y6xre";
const TEMPLATE_ID = "template_1scrkoq";
const PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

export default function BookingForm() {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    hotel: "Blossom",
    checkIn: "",
    checkOut: "",
    name: "",
    mobileNo: "",
    email: "",
  });

  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const key in formData) {
      if (!formData[key]) {
        setMessage(`Please enter your ${key}`);
        return;
      }
    }

    setSending(true);
    setMessage("");

    try {
      const result = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          hotel: formData.hotel,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          customer_name: formData.name,
          customer_mobile: formData.mobileNo,
          customer_email: formData.email,
        },
        PUBLIC_KEY
      );
      console.log("EmailJS result:", result);
      setMessage("Booking request sent successfully! Please check your email.");
      setFormData({
        hotel: "Blossom",
        checkIn: "",
        checkOut: "",
        name: "",
        mobileNo: "",
        email: "",
      });
    } catch (error) {
      console.error("EmailJS error:", error);
      setMessage("Failed to send booking request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-full px-4 py-4 font-sans">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 max-w-full overflow-x-auto">
        <select
          name="hotel"
          value={formData.hotel}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-28 text-black"
          aria-label="Select Hotel"
          required
        >
          <option>Blossom</option>
          <option>Hotel Green Garden</option>
        </select>

        <input
          type="date"
          name="checkIn"
          value={formData.checkIn}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-36 text-black"
          min={today}
          required
          aria-label="Check In"
        />

        <input
          type="date"
          name="checkOut"
          value={formData.checkOut}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-36 text-black"
          min={formData.checkIn || today}
          required
          aria-label="Check Out"
        />

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="border px-3 py-2 rounded w-40 text-black"
          required
          aria-label="Name"
        />

        <input
          type="tel"
          name="mobileNo"
          value={formData.mobileNo}
          onChange={handleChange}
          placeholder="+91 9999999999"
          className="border px-3 py-2 rounded w-36 text-black"
          required
          aria-label="Mobile No."
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="border px-3 py-2 rounded w-44 text-black"
          required
          aria-label="Email"
        />

        <button
          type="submit"
          disabled={sending}
          className={`border border-red-600 px-6 py-2 font-semibold rounded text-red-600 ${
            sending ? "opacity-50 cursor-not-allowed bg-red-600 text-white" : "hover:bg-red-600 hover:text-white"
          } transition`}
        >
          {sending ? "Sending..." : "Book Now"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center font-semibold ${
            message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
