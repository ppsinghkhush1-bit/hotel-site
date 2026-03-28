import { MapPin, Star, Wifi, Car, Coffee, Utensils } from 'lucide-react';
import type { Hotel } from '../lib/database.types';

interface HotelCardProps {
  hotel: Hotel;
  onClick: () => void;
}

export default function HotelCard({ hotel, onClick }: HotelCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={hotel.image_url}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          ₹{hotel.price_per_night.toLocaleString('en-IN')}/night
        </div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
          {Array.from({ length: hotel.star_rating }).map((_, i) => (
            <Star key={i} size={14} className="fill-amber-500 text-amber-500" />
          ))}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
          {hotel.name}
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin size={16} className="mr-1" />
          <span className="text-sm">{hotel.city}, {hotel.country}</span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {hotel.description}
        </p>

        <div className="flex items-center gap-3 text-gray-500 mb-4">
          <Wifi size={18} />
          <Car size={18} />
          <Coffee size={18} />
          <Utensils size={18} />
        </div>

        <button className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-emerald-600 transition-colors font-medium">
          View Details
        </button>
      </div>
    </div>
  );
}
