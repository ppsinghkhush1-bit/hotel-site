import { useState } from 'react';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import BookingModal from './BookingModal';
import RoomDetailsModal from './RoomDetailsModal';

interface RoomUnit {
  id: number;
  roomNumber: string;
  available: boolean;
  image: string;
  galleryImages: string[];
}

interface RoomCategory {
  id: number;
  name: string;
  basePrice: number;
  duration: string;
  image: string;
  description: string;
  maxGuests: number;
  rooms: RoomUnit[];
}

interface SelectedRoom {
  id: number;
  name: string;
  roomNumber: string;
  basePrice: number;
  duration: string;
  image: string;
  galleryImages: string[];
  description: string;
  maxGuests: number;
  available: boolean;
  selectedAmenitiesList: { name: string; price: number; included: boolean }[];
}

export default function RoomsPage() {
  const [roomCategories] = useState<RoomCategory[]>([
    {
      id: 1,
      name: 'Normal Room',
      basePrice: 1000,
      duration: '24 hours',
      image: '/201.jpeg',
      description: 'Affordable and comfortable room with essential facilities.',
      maxGuests: 2,
      rooms: [
        {
          id: 201,
          roomNumber: '201',
          available: true,
          image: '/201.jpeg',
          galleryImages: ['/201.jpeg', '/nr1 (201).jpeg']
        },
        {
          id: 202,
          roomNumber: '202',
          available: true,
          image: '/202.jpeg',
          galleryImages: ['/202.jpeg', '/nr (202).jpeg']
        },
        {
          id: 203,
          roomNumber: '203',
          available: true,
          image: '/203.jpeg',
          galleryImages: ['/203.jpeg']
        },
        {
          id: 204,
          roomNumber: '204',
          available: true,
          image: '/204.jpeg',
          galleryImages: ['/204.jpeg', '/nr (204).jpeg']
        }
      ]
    },
    {
      id: 2,
      name: 'Deluxe Room',
      basePrice: 1700,
      duration: '24 hours',
      image: '/de1.jpeg',
      description: 'Spacious deluxe room with premium interior and comfort.',
      maxGuests: 2,
      rooms: [
        {
          id: 205,
          roomNumber: '205',
          available: true,
          image: '/de1.jpeg',
          galleryImages: ['/de1.jpeg']
        },
        {
          id: 206,
          roomNumber: '206',
          available: true,
          image: '/de2.jpeg',
          galleryImages: ['/de2.jpeg']
        },
        {
          id: 207,
          roomNumber: '207',
          available: true,
          image: '/de3.jpeg',
          galleryImages: ['/de3.jpeg']
        },
        {
          id: 208,
          roomNumber: '208',
          available: true,
          image: '/de4.jpeg',
          galleryImages: ['/de4.jpeg']
        },
        {
          id: 209,
          roomNumber: '209',
          available: true,
          image: '/de1.jpeg',
          galleryImages: ['/de1.jpeg']
        },
        {
          id: 210,
          roomNumber: '210',
          available: true,
          image: '/de2.jpeg',
          galleryImages: ['/de2.jpeg']
        }
      ]
    },
    {
      id: 3,
      name: 'Luxury Room',
      basePrice: 2500,
      duration: '24 hours',
      image: '/luxury.jpeg',
      description: 'Luxury room with high-end features and elegant design.',
      maxGuests: 3,
      rooms: [
        {
          id: 301,
          roomNumber: '301',
          available: false,
          image: '/luxury.jpeg',
          galleryImages: ['/luxury.jpeg']
        },
        {
          id: 302,
          roomNumber: '302',
          available: false,
          image: '/luxury.jpeg',
          galleryImages: ['/luxury.jpeg']
        }
      ]
    }
  ]);

  const [expandedCategory, setExpandedCategory] = useState<number | null>(1);
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const BREAKFAST_PRICE = 200;

  const [breakfast, setBreakfast] = useState<{ [roomId: number]: boolean }>({});

  const toggleBreakfast = (roomId: number) => {
    setBreakfast((prev) => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  const handleBookNow = (category: RoomCategory, roomUnit: RoomUnit) => {
    if (!roomUnit.available) return;

    const finalPrice =
      category.basePrice + (breakfast[roomUnit.id] ? BREAKFAST_PRICE : 0);

    setSelectedRoom({
      id: roomUnit.id,
      name: category.name,
      roomNumber: roomUnit.roomNumber,
      basePrice: finalPrice,
      duration: category.duration,
      image: roomUnit.image,
      galleryImages: roomUnit.galleryImages,
      description: category.description,
      maxGuests: category.maxGuests,
      available: roomUnit.available,
      selectedAmenitiesList: breakfast[roomUnit.id]
        ? [{ name: 'Breakfast', price: BREAKFAST_PRICE, included: false }]
        : []
    });

    setShowBookingModal(true);
  };

  const handleViewDetails = (category: RoomCategory, roomUnit: RoomUnit) => {
    setSelectedRoom({
      id: roomUnit.id,
      name: category.name,
      roomNumber: roomUnit.roomNumber,
      basePrice: category.basePrice,
      duration: category.duration,
      image: roomUnit.image,
      galleryImages: roomUnit.galleryImages,
      description: category.description,
      maxGuests: category.maxGuests,
      available: roomUnit.available,
      selectedAmenitiesList: breakfast[roomUnit.id]
        ? [{ name: 'Breakfast', price: BREAKFAST_PRICE, included: false }]
        : []
    });

    setSelectedCategory(category);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Our Room Categories</h1>

      <div className="max-w-6xl mx-auto space-y-8">
        {roomCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-2xl shadow overflow-hidden">
            {/* Category Header */}
            <div
              className="p-6 flex items-center justify-between cursor-pointer border-b"
              onClick={() =>
                setExpandedCategory(expandedCategory === category.id ? null : category.id)
              }
            >
              <div>
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <p className="text-gray-600 mt-1">{category.description}</p>

                <div className="flex items-center gap-2 text-gray-600 mt-3">
                  <Users size={18} />
                  <span>Up to {category.maxGuests} guests</span>
                </div>

                <div className="text-2xl font-bold text-emerald-600 mt-3">
                  ₹{category.basePrice}
                </div>
              </div>

              <div>
                {expandedCategory === category.id ? (
                  <ChevronUp size={28} className="text-emerald-600" />
                ) : (
                  <ChevronDown size={28} className="text-emerald-600" />
                )}
              </div>
            </div>

            {/* Category Rooms */}
            {expandedCategory === category.id && (
              <div className="p-6 grid md:grid-cols-2 gap-6">
                {category.rooms.map((roomUnit) => {
                  const finalPrice =
                    category.basePrice +
                    (breakfast[roomUnit.id] ? BREAKFAST_PRICE : 0);

                  return (
                    <div
                      key={roomUnit.id}
                      className="border rounded-2xl overflow-hidden bg-white shadow-sm"
                    >
                      <div className="relative h-56">
                        <img
                          src={roomUnit.image}
                          alt={`${category.name} ${roomUnit.roomNumber}`}
                          className="w-full h-full object-cover"
                        />

                        {!roomUnit.available && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                              Under Maintenance
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="text-xl font-bold">
                          {category.name} - Room {roomUnit.roomNumber}
                        </h3>

                        <p
                          className={`mt-2 text-sm font-medium ${
                            roomUnit.available ? 'text-green-600' : 'text-red-500'
                          }`}
                        >
                          {roomUnit.available ? 'Available' : 'Under Maintenance'}
                        </p>

                        <div className="text-2xl font-bold text-emerald-600 mt-3">
                          ₹{finalPrice}
                        </div>

                        <button
                          onClick={() => toggleBreakfast(roomUnit.id)}
                          disabled={!roomUnit.available}
                          className={`mt-4 w-full px-4 py-2 rounded-lg border text-sm font-medium transition ${
                            roomUnit.available
                              ? breakfast[roomUnit.id]
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-gray-700 border-gray-300'
                              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          {roomUnit.available
                            ? breakfast[roomUnit.id]
                              ? `✓ Breakfast Added (+₹${BREAKFAST_PRICE})`
                              : `+ Add Breakfast ₹${BREAKFAST_PRICE}`
                            : 'Breakfast Unavailable'}
                        </button>

                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => handleViewDetails(category, roomUnit)}
                            className="flex-1 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg"
                          >
                            View Details
                          </button>

                          <button
                            onClick={() => handleBookNow(category, roomUnit)}
                            disabled={!roomUnit.available}
                            className={`flex-1 px-4 py-2 rounded-lg ${
                              roomUnit.available
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            }`}
                          >
                            {roomUnit.available ? 'Book Now' : 'Not Available'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Booking Modal */}
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

      {/* Details Modal */}
      {showDetailsModal && selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          onClose={() => setShowDetailsModal(false)}
          onBookNow={() => {
            setShowDetailsModal(false);

            if (selectedCategory && selectedRoom.available) {
              handleBookNow(selectedCategory, {
                id: selectedRoom.id,
                roomNumber: selectedRoom.roomNumber,
                available: selectedRoom.available,
                image: selectedRoom.image,
                galleryImages: selectedRoom.galleryImages
              });
            }
          }}
        />
      )}
    </div>
  );
}
