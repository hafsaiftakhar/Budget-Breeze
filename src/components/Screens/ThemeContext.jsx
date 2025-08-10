import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native"; // Auto detect system theme

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme(); // "dark" or "light"
  const [theme, setTheme] = useState(systemTheme || "light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
