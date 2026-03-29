import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_1scrkoq";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

export default function BookingBar() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const key in formData) {
      if (!formData[key as keyof typeof formData]) {
        setMessage(`Please fill the ${key} field.`);
        return;
      }
    }
    setMessage("");
    setSending(true);

    try {
      console.log("Sending email with data:", formData);

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          hotel: formData.hotel,
          check_in: formData.checkIn,
          check_out: formData.checkOut,
          customer_name: formData.name,
          customer_mobile: formData.mobileNo,
          customer_email: formData.email,
        },
        EMAILJS_PUBLIC_KEY
      );

      setMessage("Booking request sent successfully!");
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
      setMessage("Failed to send booking request. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-full px-4 py-4 font-sans">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 max-w-full overflow-x-auto">
        <select
          name="hotel"
          aria-label="Hotel"
          value={formData.hotel}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-28 text-black"
          required
        >
          <option>Blossom</option>
          <option>Hotel Green Garden</option>
        </select>

        <input
          type="date"
          name="checkIn"
          aria-label="Check In"
          value={formData.checkIn}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-36 text-black"
          min={today}
          required
        />

        <input
          type="date"
          name="checkOut"
          aria-label="Check Out"
          value={formData.checkOut}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-36 text-black"
          min={formData.checkIn || today}
          required
        />

        <input
          type="text"
          name="name"
          aria-label="Name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-40 text-black"
          required
        />

        <input
          type="tel"
          name="mobileNo"
          aria-label="Mobile No."
          placeholder="Mobile No."
          value={formData.mobileNo}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-36 text-black"
          required
        />

        <input
          type="email"
          name="email"
          aria-label="E-mail"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
          className="border px-3 py-2 rounded w-44 text-black"
          required
        />

        <button
          type="submit"
          disabled={sending}
          className={`border border-red-600 px-6 py-2 font-semibold rounded text-red-600 ${
            sending ? "opacity-60 cursor-not-allowed bg-red-600 text-white" : "hover:bg-red-600 hover:text-white"
          } transition`}
        >
          {sending ? "Sending..." : "Book Now"}
        </button>
      </form>

      {message && (
        <p className={`mt-4 text-center font-semibold ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </section>
  );
}
