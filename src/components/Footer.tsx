import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  onNavigate?: (section: string) => void;
}

export default function Footer({ onNavigate }: FooterProps = {}) {
  return (
    <footer className="bg-slate-900 text-white mt-20" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="group">
            <div className="flex items-center gap-4 mb-6">
              {/* Fixed image - using your exact PNG filename */}
              <img
                src="/0686a251-5521-4b24-ae1b-98b367c188b9.png"
                alt="Hotel Green Garden Ludhiana Logo"
                width={80}
                height={80}
                loading="lazy"
                className="h-20 w-20 object-contain transition-all duration-300 group-hover:drop-shadow-2xl group-hover:scale-105"
                onError={(e) => {
                  // Fallback to placeholder if image fails
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiM0QjNTN0YiLz4KPHRleHQgeD0iNDAiIHk9IjQ4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIj5Ib3RlbDwvdGV4dD4KPC9zdmc+';
                }}
              />
              <div className="flex flex-col justify-center">
                <span className="text-lg font-bold text-white tracking-wide leading-tight">
                  HOTEL GREEN GARDEN
                </span>
                <span className="text-xs font-medium text-emerald-400 tracking-widest uppercase">
                  LUDHIANA
                </span>
              </div>
            </div>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              Experience luxury accommodations in Ludhiana. Your comfort is our priority. 
              Book now for the best rates!
            </p>
            <div className="flex gap-3" role="group" aria-label="Social media links">
              <a 
                href="https://www.facebook.com/share/1GeLCVSrS9/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Hotel Green Garden on Facebook"
                className="group/social w-11 h-11 bg-gray-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-lg border border-gray-700/50 hover:border-emerald-500/50"
              >
                <Facebook size={20} aria-hidden="true" />
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on X (Twitter)"
                className="group/social w-11 h-11 bg-gray-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-lg border border-gray-700/50 hover:border-emerald-500/50"
              >
                <Twitter size={20} aria-hidden="true" />
              </a>
              <a 
                href="https://www.instagram.com/hotelgreengarden_?igsh=MWhkMWVuOHFpaHhtaQ==" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Hotel Green Garden on Instagram"
                className="group/social w-11 h-11 bg-gray-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-lg border border-gray-700/50 hover:border-emerald-500/50"
              >
                <Instagram size={20} aria-hidden="true" />
              </a>
              <a 
                href="https://www.linkedin.com/in/hotel-green-garden-8311703ba/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Hotel Green Garden on LinkedIn"
                className="group/social w-11 h-11 bg-gray-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-lg border border-gray-700/50 hover:border-emerald-500/50"
              >
                <Linkedin size={20} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 uppercase tracking-wide text-white">Quick Links</h3>
            <nav aria-label="Quick navigation">
              <ul className="space-y-3 text-gray-400">
                {[
                  { id: 'about', label: 'About Us' },
                  { id: 'hotels', label: 'Our Rooms' },
                  { id: 'facilities', label: 'Facilities' },
                  { id: 'around', label: 'Around Us' },
                  { id: 'contact', label: 'Contact' }
                ].map(({ id, label }) => (
                  <li key={id}>
                    <button 
                      onClick={() => onNavigate?.(id)}
                      className="hover:text-emerald-400 transition-all duration-200 text-left w-full py-2 px-2 font-medium rounded-lg hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 hover:shadow-md"
                      aria-label={`Navigate to ${label.toLowerCase()}`}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 uppercase tracking-wide text-white">Our Services</h3>
            <ul className="space-y-3 text-gray-400 text-sm" role="list">
              {[
                'Free WiFi',
                'Complimentary Breakfast', 
                'Free Parking',
                '24/7 Front Desk',
                'Room Service',
                'Laundry Service'
              ].map((service, index) => (
                <li key={index} className="hover:text-emerald-400 transition-all duration-200 flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-800/30">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 uppercase tracking-wide text-white">Contact Info</h3>
            <ul className="space-y-4 text-gray-400 text-sm" role="list">
              <li className="flex items-start gap-4 group/contact p-3 rounded-xl hover:bg-slate-800/30 transition-all duration-200">
                <Phone size={22} className="mt-1 flex-shrink-0 text-emerald-400 group-hover/contact:scale-110 group-hover/contact:rotate-12 transition-transform duration-200" />
                <a 
                  href="tel:+917814391779"
                  className="hover:text-emerald-400 transition-all duration-200 font-semibold text-base group-hover/contact:underline"
                >
                  +91 78143 91779
                </a>
              </li>
              <li className="flex items-start gap-4 group/contact p-3 rounded-xl hover:bg-slate-800/30 transition-all duration-200">
                <Mail size={22} className="mt-1 flex-shrink-0 text-emerald-400 group-hover/contact:scale-110 group-hover/contact:rotate-12 transition-transform duration-200" />
                <a 
                  href="mailto:hotelgreengarden0112@gmail.com"
                  className="hover:text-emerald-400 transition-all duration-200 font-semibold text-base group-hover/contact:underline break-words"
                >
                  hotelgreengarden0112@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-800/30 transition-all duration-200">
                <MapPin size={22} className="mt-1 flex-shrink-0 text-emerald-400" />
                <address className="not-italic text-sm break-words font-medium">
                  <div>Tajpur Rd, opp. HDFC BANK</div>
                  <div>Guru Ram Das Nagar, Bhamian Khurd</div>
                  <div className="font-bold text-emerald-400">Ludhiana, Punjab 141008</div>
                </address>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 pb-6 text-center text-gray-400 text-xs bg-gradient-to-r from-slate-900/50 to-transparent">
          <p className="max-w-2xl mx-auto">
            &copy; {new Date().getFullYear()} HOTEL GREEN GARDEN. All rights reserved. | 
            <a href="/privacy" className="hover:text-emerald-400 transition-colors font-semibold ml-2 px-2 py-1 rounded bg-slate-800/50 hover:bg-emerald-500/20">
              Privacy Policy
            </a> | 
            <a href="/terms" className="hover:text-emerald-400 transition-colors font-semibold ml-2 px-2 py-1 rounded bg-slate-800/50 hover:bg-emerald-500/20">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
