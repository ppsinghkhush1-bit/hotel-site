import { Calendar, Users, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';

interface BookingFormProps {
  onSearch?: (filters: { checkIn: string; checkOut: string; guests: number }) => void;
}

export default function BookingForm({ onSearch }: BookingFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const incrementGuests = () => setGuests((g) => Math.min(g + 1, 10));
  const decrementGuests = () => setGuests((g) => Math.max(g - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch({ checkIn, checkOut, guests });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto flex flex-wrap gap-6 items-center justify-center py-10 px-5
       bg-white/30 backdrop-blur-md rounded-3xl shadow-lg"
      style={{ minWidth: '320px' }}
    >
      {/* Check In */}
      <div className="flex flex-col w-40">
        <label className="flex items-center gap-2 text-white font-semibold tracking-wide text-xs uppercase mb-2">
          <Calendar size={16} /> CHECK-IN
        </label>
        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          placeholder="-- --"
          className="bg-white bg-opacity-30 text-black text-lg font-semibold rounded-xl px-5 py-3
            placeholder-black/50 focus:bg-opacity-50 focus:outline-none transition"
          required
        />
      </div>

      {/* Check Out */}
      <div className="flex flex-col w-40">
        <label className="flex items-center gap-2 text-white font-semibold tracking-wide text-xs uppercase mb-2">
          <Calendar size={16} /> CHECK-OUT
        </label>
        <input
          type="date"
          min={checkIn || today}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          placeholder="-- --"
          className="bg-white bg-opacity-30 text-black text-lg font-semibold rounded-xl px-5 py-3
            placeholder-black/50 focus:bg-opacity-50 focus:outline-none transition"
          required
        />
      </div>

      {/* Guests */}
      <div className="flex flex-col w-40">
        <label className="flex items-center gap-2 text-white font-semibold tracking-wide text-xs uppercase mb-2">
          <Users size={16} /> GUESTS
        </label>
        <div className="relative bg-white bg-opacity-30 rounded-xl flex items-center justify-center text-black font-semibold text-lg px-5 py-3">
          <button
            type="button"
            onClick={decrementGuests}
            disabled={guests === 1}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 disabled:opacity-50"
            aria-label="Decrease Guests"
          >
            <ChevronDown size={20} />
          </button>
          <span className="mx-auto select-none">{guests} Guest{guests > 1 ? 's' : ''}</span>
          <button
            type="button"
            onClick={incrementGuests}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
            aria-label="Increase Guests"
          >
            <ChevronUp size={20} />
          </button>
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-lg 
          rounded-xl py-3 px-10 flex items-center gap-3 shadow-lg transition"
      >
        <Search size={22} />
        SEARCH ROOMS
      </button>
    </form>
  );
}
