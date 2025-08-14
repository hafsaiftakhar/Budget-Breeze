import React, { useEffect, useState } from "react";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BottomTabs from "./BottomTabs";
import ChangePasswordScreen from "./ChangePasswordScreen";
import Accessibility from "./Accessibility";

const Drawer = createDrawerNavigator();

// Custom drawer content for 3 lines
const CustomDrawerContent = ({ navigation, setIsLoggedIn }) => {
  return (
    <DrawerContentScrollView contentContainerStyle={{ flex: 1 }}>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("ChangePassword")}>
        <Text style={styles.text}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate("Accessibility")}>
        <Text style={styles.text}>Accessibility Mode</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={async () => {
          await AsyncStorage.removeItem("user_id");
          setIsLoggedIn(false); // logout
        }}
      >
        <Text style={styles.text}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = ({ setIsLoggedIn }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUserId = await AsyncStorage.getItem("user_id");
      if (storedUserId) setUserId(storedUserId);
    };
    loadUser();
  }, []);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} setIsLoggedIn={setIsLoggedIn} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home">
        {(props) => <BottomTabs {...props} userId={userId} />}
      </Drawer.Screen>

      <Drawer.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true }} />
      <Drawer.Screen name="Accessibility" component={Accessibility} options={{ headerShown: true }} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  item: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#eee" },
  text: { fontSize: 16, fontWeight: "bold" },
});

export default DrawerNavigator;
