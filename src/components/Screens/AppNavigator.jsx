// AppNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import SplashScreen from "./src/components/screens/SplashScreen";
import DrawerNavigator from "./DrawerNavigator";
import { useAccessibility } from './AccessibilityContext';  // accessibility context ka path check karo


const Stack = createStackNavigator();
  const { accessibilityMode, setAccessibilityMode } = useAccessibility();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
