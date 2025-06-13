import React, { useState, useEffect } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "./ThemeContext"; // ✅ Ensure Correct Import

import LandingPage from "./LandingPage";
import LoginScreen from "./LoginScreen";
import SignupScreen from "./SignupScreen";
import DrawerNavigator from "./DrawerNavigator";
import ChangePasswordScreen from "./ChangePasswordScreen";

const Stack = createStackNavigator();

const MainStack = () => {
  const { theme } = useTheme(); // ✅ Get theme from context
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("userToken"); // Token store karna hoga login ke time
      setIsLoggedIn(!!token);
    };
    checkLoginStatus();
  }, []);

  return (
    <NavigationContainer theme={theme === "dark" ? DarkTheme : DefaultTheme}>
      {isLoggedIn ? (
        <DrawerNavigator />
      ) : (
        <Stack.Navigator initialRouteName="LandingPage">
          <Stack.Screen name="LandingPage" component={LandingPage} options={{ headerShown: false }} />
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default MainStack;
