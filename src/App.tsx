import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero, { SearchFilters } from './components/Hero';
import HotelList from './components/HotelList';
import HotelDetails from './components/HotelDetails';
import SearchResults from './components/SearchResults';
import RoomsPage from './components/RoomsPage';
import RoomDetailsPage from './components/RoomDetailsPage';
import Footer from './components/Footer';
import FAQ from './components/FAQ';
import FeaturedRooms from './components/FeaturedRooms';
import ContactForm from './components/ContactForm';
import Facilities from './components/Facilities';
import AroundUs from './components/AroundUs';
import About from './components/About';
import { useNavigation } from './contexts/NavigationContext';
import type { Hotel } from './lib/database.types';

type ViewMode = 'home' | 'hotels' | 'details' | 'about' | 'contact' | 'search' | 'facilities' | 'around' | 'room-details';

function App() {
  const { currentPage, navigateTo, goBack, canGoBack } = useNavigation();
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setCurrentView('search');
    navigateTo('search-results');
  };

  const handleUpdateSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleHotelSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setCurrentView('details');
    navigateTo('hotel-details');
  };

  const handleNavigate = (section: string) => {
    setCurrentView(section as ViewMode);
    setSelectedHotel(null);

    const pageMap: { [key: string]: any } = {
      'home': 'home',
      'hotels': 'rooms',
      'search': 'rooms',
      'contact': 'contact',
      'about': 'about',
      'facilities': 'facilities',
      'around': 'around'
    };

    if (pageMap[section]) {
      navigateTo(pageMap[section]);
    }
  };

  const handleBackClick = () => {
    goBack();
  };

  useEffect(() => {
    const pageToViewMap: { [key: string]: ViewMode } = {
      'home': 'home',
      'rooms': 'hotels',
      'hotel-details': 'details',
      'search-results': 'search',
      'contact': 'contact',
      'about': 'about',
      'facilities': 'facilities',
      'around': 'around',
      'room-details': 'room-details'
    };

    if (pageToViewMap[currentPage]) {
      setCurrentView(pageToViewMap[currentPage]);
      if (currentPage === 'home') {
        setSelectedHotel(null);
      }
    }
  }, [currentPage]);

  const showBackButton = canGoBack && (currentView === 'details' || currentPage === 'hotel-details');

  if (window.location.pathname === '/room-details') {
    return <RoomDetailsPage />;
  }

  return (
    <div className="min-h-screen bg-white">
      {showBackButton && (
        <button
          onClick={handleBackClick}
          className="fixed top-24 left-4 z-40 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2 transition-all hover:shadow-xl"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="font-medium">Back</span>
        </button>
      )}
      <Header onNavigate={handleNavigate} currentSection={currentView} />

      {currentView === 'home' && (
        <>
          <Hero onSearch={handleSearch} />
          <FeaturedRooms />
          <FAQ />
        </>
      )}

      {currentView === 'search' && (
        <RoomsPage />
      )}

      {currentView === 'hotels' && (
        <RoomsPage />
      )}

      {currentView === 'details' && selectedHotel && (
        <HotelDetails hotel={selectedHotel} onBack={() => setCurrentView('hotels')} />
      )}

      {currentView === 'about' && <About />}

      {currentView === 'facilities' && <Facilities />}

      {currentView === 'around' && <AroundUs />}

      {currentView === 'contact' && <ContactForm />}

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
