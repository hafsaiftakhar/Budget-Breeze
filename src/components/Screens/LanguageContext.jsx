// src/components/Screens/LanguageContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en"); // default English

  // App start par stored language load karo
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem("@user_language");
        if (storedLang) {
          setLanguage(storedLang);
        }
      } catch (e) {
        console.log("Failed to load language from storage", e);
      }
    };

    loadLanguage();
  }, []);

  // Language change karte waqt AsyncStorage mein save bhi karo
  const changeLanguage = async (newLang) => {
    try {
      await AsyncStorage.setItem("@user_language", newLang);
      setLanguage(newLang);
    } catch (e) {
      console.log("Failed to save language", e);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
