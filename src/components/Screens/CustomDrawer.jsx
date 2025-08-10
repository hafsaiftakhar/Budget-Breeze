import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext"; // ✅ Import Theme

const CustomDrawer = () => {

  const { theme } = useTheme(); // ✅ Get Theme
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const storedFirstName = await AsyncStorage.getItem("first_name");
      const storedLastName = await AsyncStorage.getItem("last_name");

      if (storedFirstName && storedLastName) {
        setFirstName(storedFirstName);
        setLastName(storedLastName);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Drawer Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Welcome, {firstName} {lastName}!</Text>
      </View>

     

      {/* Settings Options */}
      <View style={styles.settingsContainer}>
        <Text style={styles.option}>Change Password</Text>
        <Text style={styles.option}>Notification Settings</Text>
        <Text style={[styles.option, { color: "red" }]}>Logout</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    backgroundColor: "#6200ea", // Purple background
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  settingsContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  option: {
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
});

export default CustomDrawer;
