import { useState, useEffect } from 'react';
import { Users, MapPin, Phone, Mail, Star, ShieldCheck, Zap } from 'lucide-react';
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
  const [breakfast, setBreakfast] = useState<{ [roomId: number]: boolean }>({});

  useEffect(() => {
    const data: Room[] = [
      {
        id: 1,
        name: "Standard Room",
        basePrice: 1500,
        duration: "24 hours",
        image: "/10.jpg",
        galleryImages: ["/10.jpg", "/9.jpg", "/standard2.png", "/image copy.png"],
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
        galleryImages: ["/de1.jpeg", "/de2.jpeg", "/de3.jpeg", "/de4.jpeg"],
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

  const toggleBreakfast = (roomId: number) => {
    setBreakfast(prev => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  const handleBookNow = (room: Room) => {
    const finalPrice = room.basePrice + (breakfast[room.id] ? 200 : 0);
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
    <div className="min-h-screen bg-[#fdfdfd] text-neutral-900">
      
      {/* --- TOP CONTACT HEADER --- */}
      <div className="bg-neutral-900 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[11px] font-bold uppercase tracking-[0.2em]">
          <div className="flex items-center gap-6 mb-2 md:mb-0">
            <div className="flex items-center gap-2"><MapPin size={14} className="text-emerald-500"/> Ludhiana, Punjab</div>
            <div className="flex items-center gap-2"><Phone size={14} className="text-emerald-500"/> 07814 91779</div>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-emerald-500"/> hotelgreengarden0112@gmail.com
          </div>
        </div>
      </div>

      {/* --- MAIN HERO SECTION --- */}
      <header className="py-20 px-4 text-center border-b border-neutral-100 bg-white">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center gap-1 text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
          </div>
          <h1 className="text-6xl md:text-7xl font-serif italic tracking-tighter text-neutral-900">Hotel Green Garden</h1>
          <p className="text-neutral-500 font-medium max-w-lg mx-auto leading-relaxed">
            Opp. Govt. ITI College, Civil Lines, Ludhiana, Punjab 141001
          </p>
          <div className="pt-6 flex justify-center gap-4">
            <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
              <ShieldCheck size={14}/> Verified Property
            </span>
          </div>
        </div>
      </header>

      {/* --- ROOMS GRID --- */}
      <div className="max-w-6xl mx-auto py-20 px-4 space-y-12">
        {rooms.map((room) => {
          const price = room.basePrice + (breakfast[room.id] ? 200 : 0);

          return (
            <div key={room.id} className="group bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <div className="grid md:grid-cols-12 items-stretch">

                {/* IMAGE PANEL */}
                <div className="md:col-span-5 relative h-[350px] md:h-auto overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {!room.available && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                        Currently Occupied
                      </span>
                    </div>
                  )}
                  <div className="absolute top-6 left-6">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg">
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 leading-none mb-1">Starts at</p>
                      <p className="text-xl font-black italic text-neutral-900 leading-none">₹{room.basePrice}</p>
                    </div>
                  </div>
                </div>

                {/* CONTENT PANEL */}
                <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                       <h2 className="text-4xl font-serif italic text-neutral-900">{room.name}</h2>
                       <Zap size={24} className="text-emerald-500 fill-emerald-500 opacity-20" />
                    </div>
                    <p className="text-neutral-500 mb-8 leading-relaxed max-w-md">{room.description}</p>

                    <div className="flex flex-wrap gap-6 mb-8 text-[11px] font-bold uppercase tracking-widest text-neutral-400 border-b border-neutral-50 pb-8">
                      <div className="flex items-center gap-2"><Users size={16} className="text-emerald-500"/> {room.maxGuests} Guests</div>
                      <div className="flex items-center gap-2"><Zap size={16} className="text-emerald-500"/> High-Speed WiFi</div>
                    </div>

                    {/* DYNAMIC PRICE & ADD-ON */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div>
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Total Stay Value</p>
                         <p className="text-5xl font-black italic tracking-tighter">₹{price.toLocaleString()}</p>
                      </div>
                      
                      <button
                        onClick={() => toggleBreakfast(room.id)}
                        disabled={!room.available}
                        className={`px-6 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          breakfast[room.id]
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200'
                            : 'bg-white text-neutral-400 border-neutral-100 hover:border-neutral-300'
                        }`}
                      >
                        {breakfast[room.id] ? "✓ Breakfast Included" : "+ Add Breakfast ₹200"}
                      </button>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-4 mt-12">
                    <button
                      onClick={() => { setSelectedRoom(room); setShowDetailsModal(true); }}
                      className="flex-1 py-5 border border-neutral-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:bg-neutral-50 hover:text-black transition-all"
                    >
                      Room Details
                    </button>

                    <button
                      onClick={() => handleBookNow(room)}
                      disabled={!room.available}
                      className={`flex-[2] py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                        room.available
                          ? 'bg-neutral-900 text-white hover:bg-emerald-600'
                          : 'bg-neutral-100 text-neutral-300 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {room.available ? "Confirm Booking Now" : "Currently Unavailable"}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* --- FOOTER INFO --- */}
      <footer className="bg-neutral-50 py-20 px-4 border-t border-neutral-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="space-y-4">
             <h4 className="text-xl font-serif italic">Hotel Green Garden</h4>
             <p className="text-sm text-neutral-500 leading-relaxed">
               Opp. Govt. ITI College, Civil Lines<br/>
               Ludhiana, Punjab 141001
             </p>
          </div>
          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Direct Contact</h4>
             <p className="text-xl font-bold">07814 91779</p>
             <p className="text-sm text-neutral-500">hotelgreengarden0112@gmail.com</p>
          </div>
          <div className="flex flex-col justify-center items-center md:items-end">
             <div className="bg-emerald-600 text-white p-6 rounded-[2rem] text-center w-full max-w-[250px]">
                <p className="text-[10px] font-black uppercase mb-1">Best Rates</p>
                <p className="text-lg font-serif italic">Guaranteed on Site</p>
             </div>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {showBookingModal && selectedRoom && (
        <BookingModal
          isOpen={showBookingModal}
          room={selectedRoom}
          onClose={() => setShowBookingModal(false)}
        />
      )}

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
