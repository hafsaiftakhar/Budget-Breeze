import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

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
import Accessibility from "./src/components/Screens/Accessibility";
import GoalScreen from "./src/components/Screens/GoalScreen";

import ForgotPassword from "./src/components/Screens/ForgotPassword";
import OTPVerification from "./src/components/Screens/OTPVerification";
import NewPassword from "./src/components/Screens/NewPassword";

import { AccessibilityProvider } from "./src/components/Screens/AccessibilityContext";

const Stack = createStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AccessibilityProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="LandingPage" component={LandingPage} options={{ headerShown: false }} />
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} options={{ headerShown: false }} />}
          </Stack.Screen>
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true }} />
          <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="LogoutScreen" component={LogoutScreen} options={{ headerShown: true }} />
          <Stack.Screen name="Accessibility" component={Accessibility} options={{ headerShown: true }} />
          <Stack.Screen name="SpendingInsights" component={SpendingInsights} options={{ headerShown: true }} />
          <Stack.Screen name="SpendingInsightsWeekly" component={SpendingInsightsWeekly} options={{ headerShown: true }} />
          <Stack.Screen name="SpendingInsightsMonthly" component={SpendingInsightsMonthly} options={{ headerShown: true }} />
          <Stack.Screen name="GoalScreen" component={GoalScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: true }} />
          <Stack.Screen name="VerifyOTP" component={OTPVerification} />
          <Stack.Screen name="NewPassword" component={NewPassword} options={{ headerShown: true }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AccessibilityProvider>
  );
};

export default App;
