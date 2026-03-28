import { useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Users, ZoomIn, ZoomOut } from 'lucide-react';

interface Room {
  id: number;
  name: string;
  basePrice: number;
  duration: string;
  image: string;
  galleryImages?: string[];
  description: string;
  maxGuests: number;
  available: boolean;
}

interface RoomDetailsModalProps {
  room: Room;
  onClose: () => void;
  onBookNow: () => void;
}

export default function RoomDetailsModal({
  room,
  onClose,
  onBookNow,
}: RoomDetailsModalProps) {
  const images = useMemo(() => {
    const gallery = room.galleryImages && room.galleryImages.length > 0
      ? room.galleryImages
      : [room.image];

    return gallery.filter(Boolean);
  }, [room]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetZoom();
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
    resetZoom();
  };

  const resetZoom = () => {
    setZoom(1);
    setIsZoomMode(false);
    setTranslate({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setIsZoomMode(true);
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) {
        setIsZoomMode(false);
        setTranslate({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextImage();
    } else if (distance < -minSwipeDistance) {
      prevImage();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomMode || zoom <= 1) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 60;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 60;

    setTranslate({ x, y });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, images.length]);

  useEffect(() => {
    resetZoom();
  }, [currentIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{room.name}</h2>
            <p className="text-sm text-gray-500">Swipe, zoom, and browse gallery</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={22} />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-0 overflow-hidden">
          <div className="bg-black">
            <div
              className="relative h-[420px] sm:h-[500px] overflow-hidden touch-pan-y select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseMove={handleMouseMove}
            >
              <img
                src={images[currentIndex]}
                alt={`${room.name} ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 cursor-zoom-in"
                style={{
                  transform: `scale(${zoom}) translate(${translate.x}px, ${translate.y}px)`,
                }}
                onDoubleClick={() => {
                  if (zoom === 1) {
                    setIsZoomMode(true);
                    setZoom(2);
                  } else {
                    resetZoom();
                  }
                }}
                onError={(e) => {
                  e.currentTarget.src = room.image || '/10.jpg';
                }}
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-gray-900 p-2 rounded-full shadow"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white text-gray-900 p-2 rounded-full shadow"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                  {currentIndex + 1} / {images.length}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={zoomOut}
                    className="bg-white/85 hover:bg-white text-gray-900 p-2 rounded-full shadow"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <button
                    onClick={zoomIn}
                    className="bg-white/85 hover:bg-white text-gray-900 p-2 rounded-full shadow"
                  >
                    <ZoomIn size={18} />
                  </button>
                </div>
              </div>
            </div>

            {images.length > 1 && (
              <div className="p-3 bg-neutral-950 flex gap-3 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition ${
                      currentIndex === index
                        ? 'border-emerald-500'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = room.image || '/10.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto">
            <div className="mb-6">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                ₹{room.basePrice}
              </div>
              <div className="text-gray-600">{room.duration}</div>
            </div>

            <div className="flex items-center gap-2 text-gray-700 mb-6">
              <Users size={18} />
              <span>Up to {room.maxGuests} guests</span>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About this room</h3>
              <p className="text-gray-600 leading-relaxed">{room.description}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Room highlights</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">Comfortable stay</div>
                <div className="bg-gray-50 rounded-lg p-3">Clean interiors</div>
                <div className="bg-gray-50 rounded-lg p-3">Private room</div>
                <div className="bg-gray-50 rounded-lg p-3">Great for couples/family</div>
              </div>
            </div>

            {!room.available && (
              <div className="mb-6 bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 font-medium">
                This room is currently under maintenance.
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>

              <button
                onClick={onBookNow}
                disabled={!room.available}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  room.available
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {room.available ? 'Book Now' : 'Not Available'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}