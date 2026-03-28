import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import BookingModal from './BookingModal';
import RoomDetailsModal from './RoomDetailsModal';

interface Room {
  id: number;
  name: string;
  basePrice: number;
  duration: string;
  image: string;
  galleryImages: string[];
  description: string;
  maxGuests: number;
  available: boolean;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ✅ BREAKFAST STATE
  const [breakfast, setBreakfast] = useState<{ [roomId: number]: boolean }>({});

  useEffect(() => {
    const data: Room[] = [
      {
        id: 1,
        name: "Standard Room",
        basePrice: 1500,
        duration: "24 hours",
        image: "/10.jpg",
        galleryImages: [
          "/10.jpg",
          "/9.jpg",
          "/standard2.png",
          "/image copy.png"
        ],
        description: "Affordable and comfortable room with essential facilities.",
        maxGuests: 2,
        available: true
      },
      {
        id: 2,
        name: "Deluxe Room",
        basePrice: 1700,
        duration: "24 hours",
        image: "/de1.jpeg",
        galleryImages: [
          "/de1.jpeg",
          "/de2.jpeg",
          "/de3.jpeg",
          "/de4.jpeg"
        ],
        description: "Spacious deluxe room with premium interior and comfort.",
        maxGuests: 2,
        available: true
      },
      {
        id: 3,
        name: "Luxury Room",
        basePrice: 2500,
        duration: "24 hours",
        image: "/de1.jpeg",
        galleryImages: ["/de1.jpeg"],
        description: "Luxury room with high-end features and design.",
        maxGuests: 3,
        available: false
      }
    ];

    setRooms(data);
  }, []);

  // ✅ TOGGLE BREAKFAST
  const toggleBreakfast = (roomId: number) => {
    setBreakfast(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  // ✅ BOOK
  const handleBookNow = (room: Room) => {
    const finalPrice =
      room.basePrice + (breakfast[room.id] ? 200 : 0);

    setSelectedRoom({
      ...room,
      basePrice: finalPrice,
      selectedAmenitiesList: breakfast[room.id]
        ? [{ name: "Breakfast", price: 200, included: false }]
        : []
    });

    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Our Rooms</h1>

      <div className="max-w-6xl mx-auto space-y-8">
        {rooms.map((room) => {
          const price =
            room.basePrice + (breakfast[room.id] ? 200 : 0);

          return (
            <div key={room.id} className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="grid md:grid-cols-3">

                {/* IMAGE */}
                <div className="relative h-64">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />

                  {!room.available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                        Under Maintenance
                      </span>
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="md:col-span-2 p-6 flex flex-col justify-between">

                  <div>
                    <h2 className="text-2xl font-bold mb-2">{room.name}</h2>
                    <p className="text-gray-600 mb-4">{room.description}</p>

                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <Users size={18} />
                      <span>Up to {room.maxGuests} guests</span>
                    </div>

                    {/* PRICE */}
                    <div className="text-3xl font-bold text-emerald-600 mb-4">
                      ₹{price}
                    </div>

                    {/* BREAKFAST BUTTON */}
                    <button
                      onClick={() => toggleBreakfast(room.id)}
                      disabled={!room.available}
                      className={`mb-4 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        breakfast[room.id]
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {breakfast[room.id]
                        ? "✓ Breakfast Added (+₹200)"
                        : "+ Add Breakfast ₹200"}
                    </button>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setShowDetailsModal(true);
                      }}
                      className="px-5 py-2 border border-emerald-600 text-emerald-600 rounded-lg"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleBookNow(room)}
                      disabled={!room.available}
                      className={`px-6 py-2 rounded-lg ${
                        room.available
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {room.available ? "Book Now" : "Not Available"}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && selectedRoom && (
        <BookingModal
          room={selectedRoom}
          selectedAmenities={selectedRoom.selectedAmenitiesList || []}
          checkIn=""
          checkOut=""
          guests={2}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {/* DETAILS MODAL */}
      {showDetailsModal && selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          onClose={() => setShowDetailsModal(false)}
          onBookNow={() => {
            setShowDetailsModal(false);
            handleBookNow(selectedRoom);
          }}
        />
      )}
    </div>
  );
}