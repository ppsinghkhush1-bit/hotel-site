import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  onNavigate?: (section: string) => void;
}

export default function Footer({ onNavigate }: FooterProps = {}) {
  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/0686a251-5521-4b24-ae1b-98b367c188b9.png"
                alt="Hotel Green Garden Ludhiana"
                className="h-20 w-20 object-contain transition-all group-hover:drop-shadow-lg"
              />
              <div className="flex flex-col justify-center">
                <span className="text-lg font-bold text-white tracking-wide leading-tight">HOTEL GREEN GARDEN</span>
                <span className="text-xs font-medium text-emerald-400 tracking-widest">LUDHIANA</span>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Experience luxury accommodations in Ludhiana. Your comfort is our priority.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/share/1GeLCVSrS9/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://www.instagram.com/hotelgreengarden_?igsh=MWhkMWVuOHFpaHhtaQ==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/in/hotel-green-garden-8311703ba/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={() => onNavigate?.('about')} className="hover:text-emerald-600 transition-colors text-left">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('hotels')} className="hover:text-emerald-600 transition-colors text-left">
                  Our Rooms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('facilities')} className="hover:text-emerald-600 transition-colors text-left">
                  Facilities
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('around')} className="hover:text-emerald-600 transition-colors text-left">
                  Around Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('contact')} className="hover:text-emerald-600 transition-colors text-left">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Our Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-emerald-600 transition-colors">Free WiFi</li>
              <li className="hover:text-emerald-600 transition-colors">Complimentary Breakfast</li>
              <li className="hover:text-emerald-600 transition-colors">Free Parking</li>
              <li className="hover:text-emerald-600 transition-colors">24/7 Front Desk</li>
              <li className="hover:text-emerald-600 transition-colors">Room Service</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2">
                <Phone size={18} className="mt-1 flex-shrink-0" />
                <a href="tel:7814391779" className="hover:text-emerald-600 transition-colors">78143 91779</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={18} className="mt-1 flex-shrink-0" />
                <a href="mailto:hotelgreengarden0112@gmail.com" className="hover:text-emerald-600 transition-colors">hotelgreengarden0112@gmail.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>hotel green garden, Tajpur Rd, opp. HDFC BANK, Guru Ram Das Nagar, Bhamian Khurd, Ludhiana, Punjab 141008</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2026 HOTEL GREEN GARDEN. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
