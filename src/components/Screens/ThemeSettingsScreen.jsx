import React from "react";
import { View, Text, Button } from "react-native";
import { useTheme } from "./ThemeContext"; // Ensure correct path

const ThemeSettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme === "dark" ? "#000" : "#fff" }}>
      <Text style={{ color: theme === "dark" ? "#fff" : "#000" }}>Current Theme: {theme}</Text>
      <Button title="Toggle Theme" onPress={toggleTheme} />
    </View>
  );
};

export default ThemeSettingsScreen;
