import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const SERVICE_ID = 'service_12y6xre';
const TEMPLATE_ID = 'template_1scrkoq';
const PUBLIC_KEY = 'bsmrGxOAEmpS7_WtU';

export default function BookingForm() {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    hotel: "Blossom",
    checkIn: "",
    checkOut: "",
    name: "",
    mobile: "",
    email: "",
  });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    for (const key in formData) {
      if (!formData[key as keyof typeof formData]) {
        alert(`Please enter ${key}`);
        return;
      }
    }

    setSending(true);
    setMessage("");
    console.log("Sending email with data:", formData);

    try {
      const result = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          hotel: formData.hotel,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          customer_name: formData.name,
          customer_mobile: formData.mobile,
          customer_email: formData.email,
        },
        PUBLIC_KEY
      );
      console.log("EmailJS result:", result);
      alert("Booking request sent successfully!");
      setMessage("Booking sent; please check email (sometimes spam folder).");
      setFormData({
        hotel: "Blossom",
        checkIn: "",
        checkOut: "",
        name: "",
        mobile: "",
        email: "",
      });
    } catch (error) {
      console.error("EmailJS error:", error);
      alert("Failed to send booking request, please try again.");
      setMessage("Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="p-4 max-w-full font-sans">
      <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap items-center">
        <select
          name="hotel"
          onChange={handleChange}
          value={formData.hotel}
          className="border p-2 rounded text-black min-w-[140px]"
          required
        >
          <option>Blossom</option>
          <option>Hotel Green Garden</option>
        </select>

        <input
          type="date"
          name="checkIn"
          min={today}
          onChange={handleChange}
          value={formData.checkIn}
          className="border p-2 rounded text-black min-w-[140px]"
          required
        />
        <input
          type="date"
          name="checkOut"
          min={formData.checkIn || today}
          onChange={handleChange}
          value={formData.checkOut}
          className="border p-2 rounded text-black min-w-[140px]"
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          value={formData.name}
          className="border p-2 rounded text-black min-w-[160px]"
          required
        />
        <input
          type="tel"
          name="mobile"
          placeholder="+91..."
          onChange={handleChange}
          value={formData.mobile}
          className="border p-2 rounded text-black min-w-[140px]"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          onChange={handleChange}
          value={formData.email}
          className="border p-2 rounded text-black min-w-[180px]"
          required
        />
        <button
          type="submit"
          disabled={sending}
          className={`border border-red-600 p-3 rounded font-semibold min-w-[130px] transition ${
            sending ? "opacity-50 cursor-not-allowed bg-red-600 text-white" : "text-red-600 hover:bg-red-600 hover:text-white"
          }`}
        >
          {sending ? "Sending..." : "Book Now"}
        </button>
      </form>
      {message && <p className="mt-3 text-center text-sm font-semibold">{message}</p>}
    </section>
  );
}
