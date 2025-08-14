import React from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LogoutScreen = ({ setIsLoggedIn }) => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setIsLoggedIn(false); // App.js automatically will show Auth stack
      Alert.alert("Success", "Logged out successfully");
    } catch (error) {
      Alert.alert("Logout Error", error.message || "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Are you sure you want to logout?</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  text: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
});

export default LogoutScreen;
