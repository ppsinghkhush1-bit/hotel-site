import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Star, Users, Bed, Maximize } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Hotel, Room, Amenity, Review } from '../lib/database.types';
import BookingForm from './BookingForm';

interface HotelDetailsProps {
  hotel: Hotel;
  onBack: () => void;
}

export default function HotelDetails({ hotel, onBack }: HotelDetailsProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchHotelData();
  }, [hotel.id]);

const fetchHotelData = async () => {
  try {
    console.log('HOTEL ID:', hotel.id);

    const [roomsRes, amenitiesRes, reviewsRes] = await Promise.all([
      supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', hotel.id), // make sure DB has same hotel_id

      supabase
        .from('amenities')
        .select('*')
        .eq('hotel_id', hotel.id),

      supabase
        .from('reviews')
        .select('*')
        .eq('hotel_id', hotel.id)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    if (roomsRes.error) {
      console.error('Rooms error:', roomsRes.error);
    } else {
      console.log('ROOMS:', roomsRes.data);
      setRooms(roomsRes.data || []);
    }

    if (amenitiesRes.error) {
      console.error('Amenities error:', amenitiesRes.error);
    } else {
      setAmenities(amenitiesRes.data || []);
    }

    if (reviewsRes.error) {
      console.error('Reviews error:', reviewsRes.error);
    } else {
      setReviews(reviewsRes.data || []);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
};

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : hotel.star_rating.toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Hotels
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="relative h-96">
            <img
              src={hotel.image_url}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: hotel.star_rating }).map((_, i) => (
                  <Star key={i} size={20} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <h1 className="text-5xl font-bold mb-2">{hotel.name}</h1>
              <div className="flex items-center text-lg">
                <MapPin size={20} className="mr-2" />
                <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">About this Hotel</h2>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">{hotel.description}</p>

                <h3 className="text-2xl font-bold text-slate-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2 text-gray-700">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">{amenity.icon}</span>
                      </div>
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl h-fit">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-amber-600 mb-2">{averageRating}</div>
                  <div className="flex justify-center mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">{reviews.length} reviews</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-8">
              <h3 className="text-3xl font-bold text-slate-900 mb-6">Available Rooms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.map((room) => (
                  <div key={room.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={room.image_url}
                      alt={room.room_type}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{room.room_type}</h4>
                      <p className="text-gray-600 mb-4">{room.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{room.max_occupancy} guests</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed size={16} />
                          <span>{room.bed_type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize size={16} />
                          <span>{room.size_sqm} m²</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-3xl font-bold text-amber-600">₹{room.price_per_night.toLocaleString('en-IN')}</span>
                          <span className="text-gray-600">/night</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowBookingForm(true);
                          }}
                          className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="border-t pt-8 mt-8">
                <h3 className="text-3xl font-bold text-slate-900 mb-6">Guest Reviews</h3>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-slate-900">{review.guest_name}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBookingForm && selectedRoom && (
        <BookingForm
          hotel={hotel}
          room={selectedRoom}
          onClose={() => {
            setShowBookingForm(false);
            setSelectedRoom(null);
          }}
        />
      )}
    </div>
  );
}
