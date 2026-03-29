import { Calendar, Users, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';

interface BookingFormProps {
  onSearch: (filters: { checkIn: string; checkOut: string; guests: number }) => void;
}

export function BookingForm({ onSearch }: BookingFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const incrementGuests = () => setGuests((g) => Math.min(g + 1, 10));
  const decrementGuests = () => setGuests((g) => Math.max(g - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ checkIn, checkOut, guests });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/20 backdrop-blur-md rounded-xl shadow-lg max-w-4xl mx-auto p-6 flex flex-col md:flex-row items-center gap-6"
    >
      {/* Check-In */}
      <div className="flex flex-col text-white text-sm font-semibold uppercase">
        <label className="mb-1 flex items-center gap-1">
          <Calendar size={16} /> Check-In
        </label>
        <input
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="bg-white bg-opacity-30 focus:bg-opacity-50 rounded-md px-4 py-2 text-black shadow-md"
          required
        />
      </div>

      {/* Check-Out */}
      <div className="flex flex-col text-white text-sm font-semibold uppercase">
        <label className="mb-1 flex items-center gap-1">
          <Calendar size={16} /> Check-Out
        </label>
        <input
          type="date"
          min={checkIn || today}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="bg-white bg-opacity-30 focus:bg-opacity-50 rounded-md px-4 py-2 text-black shadow-md"
          required
        />
      </div>

      {/* Guests */}
      <div className="flex flex-col text-white text-sm font-semibold uppercase">
        <label className="mb-1 flex items-center gap-1">
          <Users size={16} /> Guests
        </label>
        <div className="flex items-center bg-white bg-opacity-30 focus-within:bg-opacity-50 rounded-md shadow-md px-3 py-2 max-w-[120px]">
          <button
            type="button"
            onClick={decrementGuests}
            disabled={guests <= 1}
            className="text-white disabled:opacity-50"
          >
            <ChevronDown size={18} />
          </button>
          <span className="mx-4 text-black font-semibold select-none">{guests}</span>
          <button
            type="button"
            onClick={incrementGuests}
            className="text-white"
          >
            <ChevronUp size={18} />
          </button>
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-bold uppercase rounded-lg py-3 px-8 shadow-md flex items-center gap-2"
      >
        <Search size={18} />
        Search Rooms
      </button>
    </form>
  );
}
