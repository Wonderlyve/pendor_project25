
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Toujours commencer en mode clair par défaut
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Récupérer uniquement la préférence du localStorage, ignorer la préférence système
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      const isDark = JSON.parse(savedTheme);
      setIsDarkMode(isDark);
      updateTheme(isDark);
    } else {
      // Toujours commencer en mode clair, ne pas utiliser la préférence système
      setIsDarkMode(false);
      updateTheme(false);
    }
  }, []);

  const updateTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    updateTheme(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
    updateTheme(isDark);
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
