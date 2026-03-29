import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = "service_12y6xre";
const EMAILJS_TEMPLATE_ID = "template_mz16rsu";
const EMAILJS_PUBLIC_KEY = "bsmrGxOAEmpS7_WtU";

export default function BookingBar() {
  const today = new Date().toISOString().split("T")[0];

  // State for form values
  const [form, setForm] = useState({
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
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    for (const key in form) {
      if (!form[key as keyof typeof form]) {
        setMessage("Please fill all fields.");
        return;
      }
    }

    setSending(true);
    setMessage("");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          hotel: form.hotel,
          check_in: form.checkIn,
          check_out: form.checkOut,
          customer_name: form.name,
          customer_mobile: form.mobileNo,
          customer_email: form.email,
        },
        EMAILJS_PUBLIC_KEY
      );
      setMessage("Booking request sent successfully!");
      setForm({
        hotel: "Blossom",
        checkIn: "",
        checkOut: "",
        name: "",
        mobileNo: "",
        email: "",
      });
    } catch (error) {
      setMessage("Failed to send booking request. Please try again.");
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="px-4 py-4 font-sans bg-transparent max-w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-nowrap items-center gap-3 max-w-full overflow-x-auto"
      >
        <select
          name="hotel"
          aria-label="Hotel"
          value={form.hotel}
          onChange={handleChange}
          className="border border-black rounded px-4 py-2 min-w-[140px]"
          required
        >
          <option>Blossom</option>
          <option>Hotel Green Garden</option>
        </select>

        <input
          type="date"
          name="checkIn"
          aria-label="Check In"
          placeholder="dd-mm-yyyy"
          value={form.checkIn}
          onChange={handleChange}
          className="border border-black rounded px-4 py-2 min-w-[140px]"
          min={today}
          required
        />

        <input
          type="date"
          name="checkOut"
          aria-label="Check Out"
          placeholder="dd-mm-yyyy"
          value={form.checkOut}
          onChange={handleChange}
          className="border border-black rounded px-4 py-2 min-w-[140px]"
          min={form.checkIn || today}
          required
        />

        <input
          type="text"
          name="name"
          aria-label="Name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="border border-black rounded px-4 py-2 min-w-[160px]"
          required
        />

        <input
          type="tel"
          name="mobileNo"
          aria-label="Mobile No."
          placeholder="Mobile No."
          value={form.mobileNo}
          onChange={handleChange}
          className="border border-black rounded px-4 py-2 min-w-[140px]"
          required
        />

        <input
          type="email"
          name="email"
          aria-label="Email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          className="border border-black rounded px-4 py-2 min-w-[180px]"
          required
        />

        <button
          type="submit"
          disabled={sending}
          className={`ml-3 border border-red-600 text-red-600 font-bold rounded px-6 py-3 transition ${
            sending ? "bg-red-600 text-white cursor-not-allowed opacity-50" : "hover:bg-red-600 hover:text-white"
          }`}
        >
          {sending ? "Sending..." : "Book Now"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center text-sm font-semibold ${
            message.includes("successfully") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {/* Contact Info Bar */}
      <div className="mt-8 w-full bg-[#473605] text-white text-center py-3 text-sm font-semibold tracking-wide rounded-md select-none">
        Phone No. +91 80191600498 | Reservation Number | Email:{" "}
        <a href="mailto:reservations@blossomhotels.in" className="underline hover:text-gray-200">
          reservations@blossomhotels.in
        </a>
      </div>

      {/* Benefits Banner */}
      <div className="mt-8 max-w-full overflow-x-auto">
        <div
          className="relative bg-black bg-opacity-90 rounded-lg shadow-lg flex items-center justify-between px-6 py-4 whitespace-nowrap text-white font-bold text-xl"
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

          <div className="flex space-x-16 ml-10 text-base font-semibold">
            <IconWithText
              title="ROOM UPGRADE"
              path1="M3 10h2v4H3v-4zm4 0h2v4H7v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4zM21 10h-2v4h2v-4z"
              path2="M17 10V5a2 2 0 00-2-2H9a2 2 0 00-2 2v5h10z"
            />
            <IconWithText
              title="EARLY CHECK-IN"
              path1="M8 7V3m8 4V3m-4 18v-4m-2-5h4m-6 7a9 9 0 11-2-7.89M12 8v4l2 2"
            />
            <IconWithText
              title="LATE CHECK-OUT"
              path1="M12 4v2m0 12v2m8-10h-3M7 8H4m16 4h-3M7 16H4m14.364-1.636l-2.121-2.12M7.757 7.757L5.636 5.636m0 10.728l2.121-2.12M16.243 16.243l2.121 2.122"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function IconWithText({
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
