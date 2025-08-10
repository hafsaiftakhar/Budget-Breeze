import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import Toast from "react-native-toast-message";
 // apne path ke hisaab se path adjust karein


import { navigationRef, isReadyRef, tryPendingNavigation, navigate } from './src/components/Screens/NavigationRef';

// Screens
import SplashScreen from "./src/components/Screens/SplashScreen";
import LandingPage from "./src/components/Screens/LandingPage";
import LoginScreen from "./src/components/Screens/LoginScreen";
import SignupScreen from "./src/components/Screens/SignupScreen";
import DrawerNavigator from "./src/components/Screens/DrawerNavigator";
import ChangePasswordScreen from "./src/components/Screens/ChangePasswordScreen";
import LogoutScreen from "./src/components/Screens/LogoutScreen";
import SpendingInsights from "./src/components/Screens/SpendingInsights";
import SpendingInsightsWeekly from "./src/components/Screens/SpendingInsightsWeekly";
import SpendingInsightsMonthly from "./src/components/Screens/SpendingInsightsMonthly";
import ForgotPassword from "./src/components/Screens/ForgotPassword";
import OTPVerificationScreen from "./src/components/Screens/OTPVerification";
import NewPasswordScreen from "./src/components/Screens/NewPassword";
import Accessibility from "./src/components/Screens/Accessibility";
import GoalScreen from "./src/components/Screens/GoalScreen";
import LanguageChangeScreen from "./src/components/Screens/LanguageChangeScreen";
import TransactionScreen from "./src/components/Screens/TransactionScreen";
import CurrencyChangeScreen from "./src/components/Screens/CurrencyChangeScreen";
import NotificationScreen from './src/components/Screens/NotificationScreen';
import SpeakOnPress from "./src/components/Screens/SpeakOnPress";
import FaqsScreen from "./src/components/Screens/FAQScreen";
import PastSpendingSuggestionScreen from "./src/components/Screens/PastSpendingSuggestionScreen";


import { AccessibilityProvider } from "./src/components/Screens/AccessibilityContext";
import { CurrencyProvider } from "./src/components/Screens/CurrencyContext";
import { LanguageProvider } from "./src/components/Screens/LanguageContext";

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true); // For splash screen delay
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    let timer;
    const checkLogin = async () => {
      try {
        const status = await AsyncStorage.getItem('isLoggedIn');
        setIsLoggedIn(status === 'true');
      } catch (error) {
        console.log("Error reading login status", error);
      } finally {
        timer = setTimeout(() => {
          setIsLoading(false);
        }, 2000); // 2 seconds splash delay
      }
    };
    checkLogin();

    return () => clearTimeout(timer);
  }, []);

  // Notification tap handler
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const reminderId = response.notification.request.content.data.reminderId;
      if (isReadyRef.current && navigationRef.current) {
        navigate('DrawerNavigator', {
          screen: 'ReminderScreen',
          params: { completeReminderId: reminderId },
        });
      } else {
        tryPendingNavigation({
          screen: 'DrawerNavigator',
          params: {
            screen: 'ReminderScreen',
            params: { completeReminderId: reminderId },
          }
        });
      }
    });

    return () => subscription.remove();
  }, []);

  // Manage navigationRef readiness
  useEffect(() => {
    isReadyRef.current = false;
    return () => {
      isReadyRef.current = false;
    };
  }, []);

  return (
    <AccessibilityProvider>
      <CurrencyProvider>
        <LanguageProvider>
          <NavigationContainer
            ref={navigationRef}
            onReady={() => {
              isReadyRef.current = true;
              tryPendingNavigation();
            }}
          >
            {isLoading ? (
              // Show splash screen while loading
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
              </Stack.Navigator>
            ) : isLoggedIn ? (
              // User logged in stack
              <Stack.Navigator>
                <Stack.Screen name="DrawerNavigator" options={{ headerShown: false }}>
                  {(props) => <DrawerNavigator {...props} setIsLoggedIn={setIsLoggedIn} />}
                </Stack.Screen>

                <Stack.Screen name="ReminderScreen" component={NotificationScreen} options={{ headerShown: true }} />

                <Stack.Screen
                  name="ChangePassword"
                  component={ChangePasswordScreen}
                  options={({ navigation }) => ({
                    headerShown: true,
                    headerLeft: () => (
                      <SpeakOnPress textToSpeak="Go back" onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color="black" style={{ marginLeft: 15 }} />
                      </SpeakOnPress>
                    ),
                  })}
                />

                <Stack.Screen
                  name="LogoutScreen"
                  options={({ navigation }) => ({
                    headerShown: true,
                    headerLeft: () => (
                      <SpeakOnPress textToSpeak="Go back" onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color="black" style={{ marginLeft: 15 }} />
                      </SpeakOnPress>
                    ),
                  })}
                >
                  {(props) => <LogoutScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
                </Stack.Screen>

                <Stack.Screen name="Accessibility" component={Accessibility} options={{ headerShown: true }} />
                <Stack.Screen name="SpendingInsights" component={SpendingInsights} options={{ headerShown: true }} />
                <Stack.Screen name="SpendingInsightsWeekly" component={SpendingInsightsWeekly} options={{ headerShown: true }} />
                <Stack.Screen name="SpendingInsightsMonthly" component={SpendingInsightsMonthly} options={{ headerShown: true }} />
                <Stack.Screen name="GoalScreen" component={GoalScreen} options={{ headerShown: true }} />
                <Stack.Screen name="Transaction" component={TransactionScreen} options={{ headerShown: true }} />
                <Stack.Screen name="CurrencyChangeScreen" component={CurrencyChangeScreen} options={{ headerShown: true }} />
                <Stack.Screen name="LanguageChangeScreen" component={LanguageChangeScreen} options={{ headerShown: true }} />
                <Stack.Screen 
  name="FAQScreen" 
  component={FaqsScreen} 
  options={{ headerShown: true, title: 'FAQs' }} 
/>
<Stack.Screen
  name="PastSpendingSuggestionScreen"
  component={PastSpendingSuggestionScreen}
  options={{ headerShown: true, title: 'Past Spending' }}
/>


              </Stack.Navigator>
            ) : (
              // User not logged in stack (auth)
              <Stack.Navigator>
                <Stack.Screen name="LandingPage" component={LandingPage} options={{ headerShown: false }} />
                <Stack.Screen name="Login" options={{ headerShown: false }}>
                  {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
                </Stack.Screen>
                <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: true }} />
                <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} options={{ headerShown: true }} />
                <Stack.Screen name="NewPassword" component={NewPasswordScreen} options={{ headerShown: true }} />
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
