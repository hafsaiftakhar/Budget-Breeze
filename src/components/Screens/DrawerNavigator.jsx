import React, { useEffect, useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BottomTabs from "./BottomTabs";
import SettingsScreen from "./SettingsScreen";
import ChangePasswordScreen from "./ChangePasswordScreen";
import LoginScreen from "./LoginScreen";
import LogoutScreen from "./LogoutScreen";
import SignupScreen from "./SignupScreen";
import Accessibility from "./Accessibility";
import ReminderScreen from "./ReminderScreen";

const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ setIsLoggedIn, route }) => {
  // 👇 userId ko route se ya AsyncStorage se load karo
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      // Pehle route params check karo
      const routeUserId = route?.params?.userId;
      if (routeUserId) {
        setUserId(routeUserId);
        await AsyncStorage.setItem("user_id", String(routeUserId)); // store locally
      } else {
        // Agar route me na ho to AsyncStorage se load karo
        const storedUserId = await AsyncStorage.getItem("user_id");
        if (storedUserId) setUserId(storedUserId);
      }
    };
    loadUser();
  }, [route]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <SettingsScreen {...props} userId={userId} />} // userId pass
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
      }}
    >
      <Drawer.Screen name="Home">
        {props => <BottomTabs {...props} userId={userId} />}
      </Drawer.Screen>

      <Drawer.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true }} />
      <Drawer.Screen name="Signup" component={SignupScreen} options={{ headerShown: true }} />

      <Drawer.Screen name="LogoutScreen">
        {props => <LogoutScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Drawer.Screen>

      <Drawer.Screen name="ReminderScreen" component={ReminderScreen} options={{ headerShown: true }} />
      <Drawer.Screen name="Accessability Mode" component={Accessibility} options={{ headerShown: true }} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
