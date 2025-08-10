// src/components/Screens/CurrencyContext.js

import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState({
    code: "PKR",
    symbol: "₨",
    rate: 1, // Default rate for PKR
  });

  // App start par stored currency load karo
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const storedCurrency = await AsyncStorage.getItem("@user_currency");
        if (storedCurrency) {
          setCurrency(JSON.parse(storedCurrency));
        }
      } catch (e) {
        console.log("Failed to load currency from storage", e);
      }
    };
    loadCurrency();
  }, []);

  // Currency change karte waqt AsyncStorage mein save bhi karo
  const changeCurrency = async (newCurrency) => {
    try {
      setCurrency(newCurrency);
      await AsyncStorage.setItem("@user_currency", JSON.stringify(newCurrency));
    } catch (e) {
      console.log("Failed to save currency", e);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyProvider;
