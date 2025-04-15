import React, { useContext, createContext } from 'react';
import { useColorScheme } from 'react-native';

const LightTheme = {
  primary: '#007AFF',
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  border: '#C7C7CC',
  notification: '#FF3B30',
};

const DarkTheme = {
  primary: '#0A84FF',
  background: '#1C1C1E',
  card: '#2C2C2E',
  text: '#FFFFFF',
  border: '#38383A',
  notification: '#FF453A',
};

export const ThemeContext = createContext({
  dark: false,
  colors: LightTheme,
});

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    dark: isDark,
    colors: isDark ? DarkTheme : LightTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 