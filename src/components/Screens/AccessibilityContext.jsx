// context/AccessibilityContext.js
import React, { createContext, useState, useContext } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  return (
    <AccessibilityContext.Provider value={{ accessibilityMode, setAccessibilityMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
