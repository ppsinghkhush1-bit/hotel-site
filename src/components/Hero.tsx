import { ChevronUp, ChevronDown, Calendar, Users, Search } from "lucide-react";
import { useState, useEffect } from "react";

interface HeroProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export default function Hero({ onSearch }: HeroProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const images = ["/45.jpg", "/20.jpg", "/29.jpg"];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleSearch = () => {
    onSearch(filters);
  };

  const incrementGuests = () => {
    setFilters({ ...filters, guests: filters.guests + 1 });
  };

  const decrementGuests = () => {
    if (filters.guests > 1) {
      setFilters({ ...filters, guests: filters.guests - 1 });
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return { day: "--", month: "---", year: "" };
    const date = new Date(dateString + "T00:00:00");
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      year: date.getFullYear().toString(),
    };
  };

  const checkInDate = formatDisplayDate(filters.checkIn);
  const checkOutDate = formatDisplayDate(filters.checkOut);

  return (
    <section className="relative">
      <div className="relative h-[600px] md:h-[700px] overflow-hidden">
        {images.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={`Hotel Green Garden - Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>

        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div
            key={currentImageIndex}
            className="text-center text-white max-w-4xl -mt-20"
          >
            <div className="overflow-hidden">
              <h1 className="hero-reveal text-5xl md:text-7xl font-bold mb-4 tracking-tight">
                Welcome to Hotel Green Garden
              </h1>
            </div>

            <div className="overflow-hidden">
              <p className="hero-reveal-delay text-xl md:text-2xl text-white/90 font-light">
                Experience Luxury & Comfort in Ludhiana
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pb-12 flex justify-center px-4">
          <div className="p-8 max-w-5xl w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wide mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  <Calendar
                    size={18}
                    className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  />
                  Check-in
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.checkIn}
                    min={today}
                    onChange={(e) =>
                      setFilters({ ...filters, checkIn: e.target.value })
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white/30 group-hover:border-white group-hover:bg-white/20 transition-all cursor-pointer shadow-2xl">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                        {checkInDate.day}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                          {checkInDate.month}
                        </span>
                        <span className="text-xs text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                          {checkInDate.year}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wide mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  <Calendar
                    size={18}
                    className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  />
                  Check-out
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.checkOut}
                    min={filters.checkIn || today}
                    onChange={(e) =>
                      setFilters({ ...filters, checkOut: e.target.value })
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white/30 group-hover:border-white group-hover:bg-white/20 transition-all cursor-pointer shadow-2xl">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                        {checkOutDate.day}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                          {checkOutDate.month}
                        </span>
                        <span className="text-xs text-white/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                          {checkOutDate.year}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wide mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  <Users
                    size={18}
                    className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                  />
                  Guests
                </label>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white/30 group-hover:border-white group-hover:bg-white/20 transition-all shadow-2xl">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={decrementGuests}
                      disabled={filters.guests <= 1}
                      className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-white hover:bg-white/30 hover:border-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                    >
                      <ChevronDown size={22} strokeWidth={2.5} />
                    </button>
                    <div className="flex flex-col items-center">
                      <span className="text-5xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                        {filters.guests}
                      </span>
                      <span className="text-xs text-white/95 mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-semibold">
                        {filters.guests === 1 ? "Guest" : "Guests"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={incrementGuests}
                      className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-white hover:bg-white/30 hover:border-white transition-all shadow-lg"
                    >
                      <ChevronUp size={22} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full bg-emerald-600 text-white px-6 py-7 rounded-2xl hover:bg-emerald-500 transition-all font-bold text-base uppercase tracking-wide shadow-2xl hover:shadow-emerald-500/50 transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3 border-2 border-white/40"
                >
                  <Search size={22} strokeWidth={2.5} />
                  Search Rooms
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
