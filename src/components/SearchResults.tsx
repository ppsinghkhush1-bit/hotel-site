interface BookingFormProps {
  onSearch?: (filters: { checkIn: string; checkOut: string; guests: number }) => void;
}

export default function BookingForm({ onSearch }: BookingFormProps) {
  return (
    <section
      className="max-w-5xl mx-auto py-10 px-5 bg-white/30 backdrop-blur-md rounded-3xl shadow-lg text-center"
      style={{ minWidth: "320px" }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
        Book Your Room Now
      </h2>

      <p className="text-white text-base md:text-lg font-medium leading-relaxed">
        For room bookings and reservations, please contact us directly.
      </p>

      <p className="text-white text-base md:text-lg font-medium mt-2">
        Call us at{" "}
        <a
          href="tel:+910781491779"
          className="underline font-bold hover:text-gray-200 transition"
        >
          +91 07814 91779
        </a>{" "}
        or email us at{" "}
        <a
          href="mailto:hotelgreengarden0112@gmail.com"
          className="underline font-bold hover:text-gray-200 transition"
        >
          hotelgreengarden0112@gmail.com
        </a>
      </p>
    </section>
  );
}
