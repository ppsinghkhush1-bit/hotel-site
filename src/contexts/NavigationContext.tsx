import { createContext, useContext, useState, ReactNode } from 'react';

type Page = 'home' | 'rooms' | 'hotel-details' | 'search-results' | 'contact' | 'about' | 'facilities' | 'around';

interface NavigationContextType {
  currentPage: Page;
  history: Page[];
  navigateTo: (page: Page) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [history, setHistory] = useState<Page[]>(['home']);

  const navigateTo = (page: Page) => {
    if (page !== currentPage) {
      setHistory(prev => [...prev, page]);
      setCurrentPage(page);
    }
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentPage(previousPage);
    }
  };

  const canGoBack = history.length > 1;

  return (
    <NavigationContext.Provider value={{ currentPage, history, navigateTo, goBack, canGoBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
