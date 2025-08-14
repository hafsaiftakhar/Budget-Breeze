import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Toast from "react-native-toast-message";

// Screens
import SplashScreen from "./src/components/Screens/SplashScreen";
import LandingPage from "./src/components/Screens/LandingPage";
import LoginScreen from "./src/components/Screens/LoginScreen";
import SignupScreen from "./src/components/Screens/SignupScreen";
import DrawerNavigator from "./src/components/Screens/DrawerNavigator";
import ChangePasswordScreen from "./src/components/Screens/ChangePasswordScreen";
import LogoutScreen from "./src/components/Screens/LogoutScreen";
import NotificationScreen from './src/components/Screens/NotificationScreen';

// Context Providers
import { AccessibilityProvider } from "./src/components/Screens/AccessibilityContext";
import { CurrencyProvider } from "./src/components/Screens/CurrencyContext";
import { LanguageProvider } from "./src/components/Screens/LanguageContext";

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  // Splash + login check
  useEffect(() => {
    let timer;
    const checkLogin = async () => {
      try {
        const status = await AsyncStorage.getItem('isLoggedIn');
        const id = await AsyncStorage.getItem('user_id');
        setIsLoggedIn(status === 'true');
        setUserId(id);
      } catch (error) {
        console.log("Error reading login status", error);
      } finally {
        timer = setTimeout(() => setIsLoading(false), 2000);
      }
    };
    checkLogin();
    return () => clearTimeout(timer);
  }, []);

  // Notification tap listener
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const reminderId = response.notification.request.content.data.reminderId;
      // handle notification navigation if needed
    });
    return () => subscription.remove();
  }, []);

  return (
    <AccessibilityProvider>
      <CurrencyProvider>
        <LanguageProvider>
          <NavigationContainer>
            {isLoading ? (
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
              </Stack.Navigator>
            ) : isLoggedIn ? (
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                {/* Main Drawer */}
                <Stack.Screen name="DrawerNavigator">
                  {props => <DrawerNavigator {...props} setIsLoggedIn={setIsLoggedIn} userId={userId} />}
                </Stack.Screen>

                {/* Other Screens */}
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true }} />
                <Stack.Screen name="LogoutScreen">
                  {props => <LogoutScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
                </Stack.Screen>
                <Stack.Screen name="ReminderScreen" component={NotificationScreen} options={{ headerShown: true }} />
              </Stack.Navigator>
            ) : (
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="LandingPage" component={LandingPage} />
                <Stack.Screen name="Login">
                  {props => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
                </Stack.Screen>
                <Stack.Screen name="Signup" component={SignupScreen} />
              </Stack.Navigator>
            )}
            <Toast />
          </NavigationContainer>
        </LanguageProvider>
      </CurrencyProvider>
    </AccessibilityProvider>
  );
};

export default App;
