interface HeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

export default function Header({ onNavigate, currentSection }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div
            className="flex items-center gap-3 cursor-pointer group transition-transform hover:scale-105"
            onClick={() => onNavigate('home')}
          >
            <img
              src="/0686a251-5521-4b24-ae1b-98b367c188b9.png"
              alt="Hotel Green Garden Ludhiana"
              className="h-20 w-20 object-contain transition-all group-hover:drop-shadow-lg"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-800 tracking-wide">HOTEL GREEN GARDEN</span>
              <span className="text-xs font-medium text-emerald-600 tracking-widest">LUDHIANA</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-12">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-colors pb-1 ${
                currentSection === 'home'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`text-sm font-medium transition-colors pb-1 ${
                currentSection === 'about'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              About
            </button>
            <button
              onClick={() => onNavigate('hotels')}
              className={`text-sm font-medium transition-colors pb-1 ${
                currentSection === 'hotels'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Rooms
            </button>
            <button
              onClick={() => onNavigate('facilities')}
              className={`text-sm font-medium transition-colors pb-1 ${
                currentSection === 'facilities'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Facilities
            </button>
            <button
              onClick={() => onNavigate('around')}
              className={`text-sm font-medium transition-colors pb-1 ${
                currentSection === 'around'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Around Us
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`text-sm font-medium transition-colors pb-1 ${
                currentSection === 'contact'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Contact
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
