import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Language, Translations, translations } from '../translations';

interface LanguageContextType {
  language: Language;
  t: Translations;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use Amharic as default as requested
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      return saved || 'am';
    }
    return 'am';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    // Add font or class to body if needed for Amharic
    if (language === 'am') {
      document.documentElement.lang = 'am';
    } else {
      document.documentElement.lang = 'en';
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'am' : 'en'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
