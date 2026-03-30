import { ArrowDownCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const images = ["/45.jpg", "/20.jpg", "/29.jpg"];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative">
      <div className="relative h-[600px] md:h-[700px] overflow-hidden">
        {images.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={`Hotel Green Garden - Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div
            key={currentImageIndex}
            className="text-center text-white max-w-4xl -mt-20"
          >
            <div className="overflow-hidden">
              <h1 className="hero-reveal text-5xl md:text-7xl font-bold mb-4 tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                Welcome to Hotel Green Garden
              </h1>
            </div>

            <div className="overflow-hidden">
              <p className="hero-reveal-delay text-xl md:text-2xl text-white/90 font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Experience Luxury & Comfort in Ludhiana
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Booking Text */}
        <div className="absolute bottom-0 left-0 right-0 pb-12 flex justify-center px-4">
          <div
            key={`book-${currentImageIndex}`}
            className="text-center text-white max-w-3xl"
          >
            <div className="overflow-hidden">
              <div className="book-reveal flex flex-col items-center">
                <ArrowDownCircle
                  size={52}
                  className="mb-4 text-white animate-bounce drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                />

                <h2 className="text-2xl md:text-4xl font-bold mb-3 tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  Book From Below
                </h2>

                <p className="text-base md:text-lg text-white/95 font-medium leading-relaxed max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  Scroll down to discover our rooms and reserve your stay with
                  the best comfort, luxury, and direct booking benefits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
