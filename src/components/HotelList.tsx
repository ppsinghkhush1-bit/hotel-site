import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Hotel } from '../lib/database.types';
import HotelCard from './HotelCard';
import { Loader2 } from 'lucide-react';

interface HotelListProps {
  onHotelSelect: (hotel: Hotel) => void;
  filters?: {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  };
}

export default function HotelList({ onHotelSelect, filters }: HotelListProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, [filters]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      let query = supabase.from('hotels').select('*');

      if (filters?.location) {
        query = query.or(`city.ilike.%${filters.location}%,country.ilike.%${filters.location}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setHotels(data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-gray-600">No hotels found</p>
        <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-slate-900 mb-2">
          {filters?.location ? `Hotels in ${filters.location}` : 'Featured Hotels'}
        </h2>
        <p className="text-gray-600">Discover {hotels.length} amazing properties</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            onClick={() => onHotelSelect(hotel)}
          />
        ))}
      </div>
    </div>
  );
}
