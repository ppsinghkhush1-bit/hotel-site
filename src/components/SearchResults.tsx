import { Calendar, Users, ChevronUp, ChevronDown, Search, MapPin, Wifi, Coffee, Car, Star, ChevronRight, Utensils } from 'lucide-react';
import { useState } from 'react';
import { SearchFilters } from './Hero';
import BookingModal from './BookingModal';

interface SearchResultsProps {
  filters: SearchFilters;
  onUpdateSearch: (filters: SearchFilters) => void;
}

interface Amenity {
  name: string;
  price: number;
  included: boolean;
}

interface Room {
  id: number;
  name: string;
  image: string;
  description: string;
  basePrice: number;
  rating: number;
  reviews: number;
  availableAmenities: Amenity[];
  maxGuests: number;
}

export default function SearchResults({ filters, onUpdateSearch }: SearchResultsProps) {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(filters);

  const rooms: Room[] = [
    {
      id: 1,
      name: "Deluxe Garden Suite",
      image: "/14.jpg",
      description: "Spacious room with garden view, king-size bed, and private balcony overlooking our beautiful green gardens.",
      basePrice: 8000,
      rating: 4.8,
      reviews: 124,
      availableAmenities: [
        { name: "Free WiFi", price: 0, included: true },
        { name: "Breakfast", price: 1500, included: true },
        { name: "Parking", price: 500, included: true },
        { name: "Air Conditioning", price: 2500, included: true }
      ],
      maxGuests: 2
    },
    {
      id: 2,
      name: "Premium Green Room",
      image: "/20.jpg",
      description: "Elegant room featuring modern amenities, comfortable furnishings, and stunning views of the property.",
      basePrice: 6500,
      rating: 4.6,
      reviews: 98,
      availableAmenities: [
        { name: "Free WiFi", price: 0, included: true },
        { name: "Breakfast", price: 1500, included: true },
        { name: "Parking", price: 500, included: false },
        { name: "Air Conditioning", price: 2000, included: true }
      ],
      maxGuests: 2
    },
    {
      id: 3,
      name: "Family Garden Suite",
      image: "/14.jpg",
      description: "Perfect for families with two bedrooms, living area, and access to garden facilities.",
      basePrice: 11000,
      rating: 4.9,
      reviews: 156,
      availableAmenities: [
        { name: "Free WiFi", price: 0, included: true },
        { name: "Breakfast", price: 2000, included: true },
        { name: "Parking", price: 500, included: true },
        { name: "Air Conditioning", price: 3000, included: true },
        { name: "Kitchen", price: 0, included: true }
      ],
      maxGuests: 4
    }
  ];

  const [selectedAmenities, setSelectedAmenities] = useState<Record<number, Amenity[]>>(
    rooms.reduce((acc, room) => ({
      ...acc,
      [room.id]: room.availableAmenities.filter(a => a.included)
    }), {})
  );

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  

  const handleSearch = () => {
    onUpdateSearch(searchFilters);
  };

  const handleBookNow = (room: Room) => {
    setSelectedRoomForBooking(room);
    setIsBookingModalOpen(true);
  };

  const incrementGuests = () => {
    setSearchFilters({ ...searchFilters, guests: searchFilters.guests + 1 });
  };

  const decrementGuests = () => {
    if (searchFilters.guests > 1) {
      setSearchFilters({ ...searchFilters, guests: searchFilters.guests - 1 });
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const toggleAmenity = (roomId: number, amenity: Amenity) => {
    setSelectedAmenities(prev => {
      const currentAmenities = prev[roomId] || [];
      const isSelected = currentAmenities.some(a => a.name === amenity.name);

      if (isSelected) {
        return {
          ...prev,
          [roomId]: currentAmenities.filter(a => a.name !== amenity.name)
        };
      } else {
        return {
          ...prev,
          [roomId]: [...currentAmenities, amenity]
        };
      }
    });
  };

  const calculateTotalPrice = (roomId: number, basePrice: number) => {
    const amenities = selectedAmenities[roomId] || [];
    const amenitiesTotal = amenities.reduce((sum, amenity) => sum + amenity.price, 0);
    return basePrice + amenitiesTotal;
  };

  const isAmenitySelected = (roomId: number, amenityName: string) => {
    const amenities = selectedAmenities[roomId] || [];
    return amenities.some(a => a.name === amenityName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 py-6 sticky top-[96px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 pointer-events-none z-10" size={18} />
                  <input
                    type="text"
                    value="Hotel Green Garden"
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Check-in
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400 pointer-events-none z-10" size={18} />
                  <input
                    type="date"
                    value={searchFilters.checkIn}
                    min={today}
                    onChange={(e) => setSearchFilters({ ...searchFilters, checkIn: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Check-out
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400 pointer-events-none z-10" size={18} />
                  <input
                    type="date"
                    value={searchFilters.checkOut}
                    min={searchFilters.checkIn || today}
                    onChange={(e) => setSearchFilters({ ...searchFilters, checkOut: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Guests
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 text-gray-400 pointer-events-none z-10" size={18} />
                  <div className="flex items-center border border-gray-300 rounded-md bg-white">
                    <span className="flex-1 pl-10 pr-2 py-2.5 font-medium text-gray-800">
                      {searchFilters.guests}
                    </span>
                    <div className="flex flex-col border-l border-gray-300">
                      <button
                        onClick={incrementGuests}
                        className="px-2 py-1 hover:bg-gray-100 transition-colors"
                      >
                        <ChevronUp size={14} className="text-gray-600" />
                      </button>
                      <button
                        onClick={decrementGuests}
                        className="px-2 py-1 hover:bg-gray-100 transition-colors border-t border-gray-300"
                        disabled={searchFilters.guests <= 1}
                      >
                        <ChevronDown size={14} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-md hover:bg-emerald-700 transition-colors font-medium text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Search size={18} />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Rooms</h2>
          <p className="text-gray-600 mt-1">
            {rooms.length} rooms available for your dates
            {searchFilters.checkIn && searchFilters.checkOut && (
              <span> • {searchFilters.checkIn} to {searchFilters.checkOut}</span>
            )}
          </p>
        </div>

        <div className="space-y-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative h-64 md:h-auto">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                <div className="col-span-2 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < Math.floor(room.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {room.rating} ({room.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Base: ₹{room.basePrice.toLocaleString('en-IN')}</div>
                      <div className="text-3xl font-bold text-emerald-600">₹{calculateTotalPrice(room.id, room.basePrice).toLocaleString('en-IN')}</div>
                      <div className="text-sm text-gray-600">per night</div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{room.description}</p>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Amenities:</h4>
                    <div className="flex flex-wrap gap-3">
                      {room.availableAmenities.map((amenity, index) => {
                        const isSelected = isAmenitySelected(room.id, amenity.name);
                        return (
                          <button
                            key={index}
                            onClick={() => toggleAmenity(room.id, amenity)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {amenity.name === "Free WiFi" && <Wifi size={14} />}
                            {amenity.name === "Breakfast" && <Coffee size={14} />}
                            {amenity.name === "Parking" && <Car size={14} />}
                            {amenity.name === "Kitchen" && <Utensils size={14} />}
                            {amenity.name}
                            {amenity.price > 0 && (
                              <span className="ml-1 text-xs">
                                (+₹{amenity.price.toLocaleString('en-IN')})
                              </span>
                            )}
                          </button>
                        );
                      })}
                      <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        <Users size={14} />
                        Up to {room.maxGuests} guests
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleBookNow(room)}
                      className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      Book Now
                      <ChevronRight size={18} />
                    </button>
                    <button className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors font-semibold">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No rooms available for the selected dates. Please try different dates.</p>
          </div>
        )}
      </div>

      {selectedRoomForBooking && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedRoomForBooking(null);
          }}
          room={selectedRoomForBooking}
          selectedAmenities={selectedAmenities[selectedRoomForBooking.id] || []}
          checkIn={searchFilters.checkIn}
          checkOut={searchFilters.checkOut}
          guests={searchFilters.guests}
        />
      )}
    </div>
  );
}
