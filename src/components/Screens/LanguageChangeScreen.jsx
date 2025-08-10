// src/components/Screens/LanguageChangeScreen.js
import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import * as Speech from "expo-speech";
import { LanguageContext } from "./LanguageContext";

const languages = [
  { code: "en", name: "English" },
  { code: "ur", name: "Urdu" },
  { code: "ar", name: "Arabic" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
];

const LanguageChangeScreen = () => {
  const { language, changeLanguage } = useContext(LanguageContext);

  const handleLanguagePress = (item) => {
    changeLanguage(item.code);

    // Accessibility speech - optional
    Speech.speak(item.name, {
      language: item.code,
    });
  };

  const renderItem = ({ item }) => {
    const isSelected = item.code === language;
    return (
      <TouchableOpacity
        style={[styles.itemContainer, isSelected && styles.selectedItem]}
        onPress={() => handleLanguagePress(item)}
      >
        <Text style={styles.languageName}>{item.name} ({item.code})</Text>
        {isSelected && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Language</Text>
      <FlatList
        data={languages}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        extraData={language}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  itemContainer: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  selectedItem: {
    backgroundColor: "#d0e8ff",
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    color: "#222",
  },
  checkMark: {
    fontSize: 18,
    color: "#007bff",
    fontWeight: "bold",
  },
});

export default LanguageChangeScreen;
