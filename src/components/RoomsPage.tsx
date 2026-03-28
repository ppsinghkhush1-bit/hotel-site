import { useState, useEffect } from 'react';
import { Users, MapPin, Phone, Mail, Star, ShieldCheck, Zap } from 'lucide-react';
import BookingModal from './BookingModal';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [breakfast, setBreakfast] = useState<{ [roomId: number]: boolean }>({});

  useEffect(() => {
    const data = [
      { id: 1, name: "Standard Room", basePrice: 1500, image: "/10.jpg", description: "Affordable and comfortable room.", maxGuests: 2, available: true },
      { id: 2, name: "Deluxe Room", basePrice: 1700, image: "/de1.jpeg", description: "Spacious deluxe room with premium interior.", maxGuests: 2, available: true },
      { id: 3, name: "Luxury Room", basePrice: 2500, image: "/de1.jpeg", description: "High-end features and design.", maxGuests: 3, available: true }
    ];
    setRooms(data);
  }, []);

  const handleBookNow = (room: any) => {
    const finalPrice = room.basePrice + (breakfast[room.id] ? 200 : 0);
    setSelectedRoom({ ...room, basePrice: finalPrice });
    setIsModalOpen(true); // Yeh line modal kholegi
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Address */}
      <header className="py-12 px-4 text-center border-b">
        <h1 className="text-5xl font-serif italic mb-2">Hotel Green Garden</h1>
        <p className="text-neutral-500 text-sm">Opp. Govt. ITI College, Civil Lines, Ludhiana, Punjab 141001</p>
        <div className="flex justify-center gap-4 mt-4 text-xs font-bold text-emerald-600">
           <span>📞 07814 91779</span>
           <span>✉️ hotelgreengarden0112@gmail.com</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
        {rooms.map((room) => (
          <div key={room.id} className="border rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-sm">
            <img src={room.image} className="md:w-1/3 h-64 object-cover" alt={room.name} />
            <div className="p-8 flex-1">
              <h2 className="text-3xl font-serif mb-2">{room.name}</h2>
              <p className="text-2xl font-black text-emerald-600 mb-6">₹{room.basePrice + (breakfast[room.id] ? 200 : 0)}</p>
              <button 
                onClick={() => handleBookNow(room)}
                className="bg-black text-white px-10 py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CALLING */}
      {selectedRoom && (
        <BookingModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          room={selectedRoom} 
        />
      )}
    </div>
  );
}
