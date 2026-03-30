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
              {/* Railway CDN-optimized image with fallback */}
              <picture>
                <source 
                  srcSet="/0686a251-5521-4b24-ae1b-98b367c188b9.webp" 
                  type="image/webp"
                />
                <img
                  src="/0686a251-5521-4b24-ae1b-98b367c188b9.png"
                  alt="Hotel Green Garden Ludhiana Logo"
                  width={80}
                  height={80}
                  loading="lazy"
                  className="h-20 w-20 object-contain transition-all group-hover:drop-shadow-lg"
                />
              </picture>
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
            </p>
            <div className="flex gap-3" role="group" aria-label="Social media links">
              <a 
                href="https://www.facebook.com/share/1GeLCVSrS9/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                aria-label="Follow us on Facebook"
                className="group/social w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <Facebook size={20} aria-hidden="true" />
              </a>
              <a 
                href="https://x.com/hotelgreengarden" 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                aria-label="Follow us on X (Twitter)"
                className="group/social w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <Twitter size={20} aria-hidden="true" />
              </a>
              <a 
                href="https://www.instagram.com/hotelgreengarden_?igsh=MWhkMWVuOHFpaHhtaQ==" 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                aria-label="Follow us on Instagram"
                className="group/social w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <Instagram size={20} aria-hidden="true" />
              </a>
              <a 
                href="https://www.linkedin.com/in/hotel-green-garden-8311703ba/" 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                aria-label="Connect with us on LinkedIn"
                className="group/social w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <Linkedin size={20} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 uppercase tracking-wide">Quick Links</h3>
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
                      className="hover:text-emerald-400 transition-colors duration-200 text-left w-full py-1 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
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
            <h3 className="text-lg font-bold mb-6 uppercase tracking-wide">Our Services</h3>
            <ul className="space-y-3 text-gray-400 text-sm" role="list">
              {[
                'Free WiFi',
                'Complimentary Breakfast', 
                'Free Parking',
                '24/7 Front Desk',
                'Room Service'
              ].map((service, index) => (
                <li key={index} className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 uppercase tracking-wide">Contact Info</h3>
            <ul className="space-y-4 text-gray-400 text-sm" role="list">
              <li className="flex items-start gap-3 group/contact">
                <Phone size={20} className="mt-1 flex-shrink-0 text-emerald-400 group-hover/contact:scale-110 transition-transform" />
                <a 
                  href="tel:+917814391779"
                  className="hover:text-emerald-400 transition-colors font-medium group-hover/contact:underline"
                >
                  +91 78143 91779
                </a>
              </li>
              <li className="flex items-start gap-3 group/contact">
                <Mail size={20} className="mt-1 flex-shrink-0 text-emerald-400 group-hover/contact:scale-110 transition-transform" />
                <a 
                  href="mailto:hotelgreengarden0112@gmail.com"
                  className="hover:text-emerald-400 transition-colors font-medium group-hover/contact:underline break-words"
                >
                  hotelgreengarden0112@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={20} className="mt-1 flex-shrink-0 text-emerald-400" />
                <address className="not-italic break-words">
                  Hotel Green Garden<br />
                  <span className="font-medium">Tajpur Rd, opp. HDFC BANK</span><br />
                  Guru Ram Das Nagar, Bhamian Khurd<br />
                  Ludhiana, Punjab 141008
                </address>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-xs">
          <p>
            &copy; {new Date().getFullYear()} HOTEL GREEN GARDEN. 
            All rights reserved. | 
            <a href="/privacy" className="hover:text-emerald-400 transition-colors font-medium ml-1">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
