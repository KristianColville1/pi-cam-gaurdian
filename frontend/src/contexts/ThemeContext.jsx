import React, { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext();

/**
 * ThemeProvider component - manages light/dark mode
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Apply theme to document and Bootstrap
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.setAttribute('data-bs-theme', 'dark');
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      root.setAttribute('data-bs-theme', 'light');
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

