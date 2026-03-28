import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import RoomDetailsModal from './RoomDetailsModal';
import BookingModal from './BookingModal';

export default function FeaturedRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [bookingRoom, setBookingRoom] = useState<any | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase.from('rooms').select('*');

    if (error) {
      console.error(error);
      return;
    }

    // ✅ Only 3 rooms + remove duplicates
    const filtered = Array.from(
      new Map(
        data
          .filter((room) =>
            ['Standard Room', 'Deluxe Room', 'Luxury Suite'].includes(room.room_type)
          )
          .map((room) => [room.room_type, room])
      ).values()
    );

    setRooms(filtered);
  };

  // ✅ Best image logic
  const getBestImage = (room: any) => {
    if (room.gallery_images && room.gallery_images.length > 0) {
      return room.gallery_images[0];
    }
    return room.image_url || '/hotel-room.jpg';
  };

  return (
    <section className="py-20 bg-gray-50">
      <h2 className="text-4xl font-bold text-center mb-12">Our Rooms</h2>

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 px-4">

        {rooms.map((room) => {
          const isAvailable = Number(room.available_rooms) > 0;

          return (
            <div
              key={room.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full"
            >

              {/* IMAGE */}
              <div className="relative">
                <img
                  src={getBestImage(room)}
                  onError={(e) => (e.currentTarget.src = '/hotel-room.jpg')}
                  className="w-full h-60 object-cover"
                />

                {!isAvailable && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    Not Available
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-5 flex flex-col flex-grow">

                <h3 className="text-xl font-bold mb-2">
                  {room.room_type}
                </h3>

                <p className="text-gray-600 mb-3 flex-grow">
                  {room.description}
                </p>

                <div className="text-green-600 font-bold mb-4">
                  ₹{room.price_per_night}/night
                </div>

                {/* BUTTONS */}
                <div className="flex gap-3 mt-auto">

                  {/* VIEW MORE */}
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg font-semibold"
                  >
                    View More
                  </button>

                  {/* BOOK NOW */}
                  <button
                    onClick={() => isAvailable && setBookingRoom(room)}
                    disabled={!isAvailable}
                    className={`flex-1 py-2 rounded-lg font-semibold text-white ${
                      isAvailable
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? 'Book Now' : 'Sold Out'}
                  </button>

                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* VIEW MORE MODAL */}
      {selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onBook={() => {
            setBookingRoom(selectedRoom);
            setSelectedRoom(null);
          }}
        />
      )}

      {/* BOOKING MODAL */}
      {bookingRoom && (
        <BookingModal
          room={bookingRoom}
          onClose={() => setBookingRoom(null)}
        />
      )}
    </section>
  );
}