import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, Text } from "react-native";
import {
  Home,
  BarChart,
  Plus,
  Lightbulb,
  MoreHorizontal,
  Menu,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as Speech from "expo-speech";

import AISuggestionsScreen from "./AISuggestionsScreen"; // no longer used directly here
import TransactionsScreen from "./TransactionScreen";
import ReportsScreen from "./ReportsScreen";
import Dashboard from "./Dashboard";
import BudgetScreen from "./BudgetScreen";
import MoreScreen from "./MoreScreen"; // import your MoreScreen here
import SpeakOnPress from "./SpeakOnPress";

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ onPress, focused }) => {
  const handlePress = () => {
    Speech.speak("Navigate to Transactions Screen");
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        position: "absolute",
        bottom: 10,
        left: "50%",
        transform: [{ translateX: -30 }],
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: focused ? "blue" : "#000",
        borderRadius: 50,
        width: 60,
        height: 60,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      }}
    >
      <Plus size={32} color="#fff" />
    </TouchableOpacity>
  );
};

const BottomTabs = () => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          position: "relative",
          bottom: 0,
          backgroundColor: "#ffffff",
          borderRadius: 15,
          height: 70,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({ color }) => (
            <SpeakOnPress textToSpeak="Navigating to Home Screen" navigateTo="Dashboard">
              <Home size={28} color={color} />
            </SpeakOnPress>
          ),
          tabBarLabel: () => (
            <SpeakOnPress textToSpeak="Home">
              <Text>Home</Text>
            </SpeakOnPress>
          ),
          headerShown: true,
          headerLeft: () => (
            <View style={{ marginLeft: 15 }}>
              <SpeakOnPress textToSpeak="Open Menu" navigateTo="Settings">
                <TouchableOpacity
                  onPress={() => {
                    Speech.speak("Opening Menu");
                    navigation.openDrawer();
                  }}
                >
                  <Menu size={30} color="black" />
                </TouchableOpacity>
              </SpeakOnPress>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Budgets" // was Suggestions, now Budgets
        component={BudgetScreen} // was AISuggestionsScreen, now BudgetScreen
        options={{
          tabBarIcon: ({ color }) => (
            <SpeakOnPress textToSpeak="Navigating to Budgets Screen" navigateTo="Budgets">
              <MoreHorizontal size={28} color={color} />
            </SpeakOnPress>
          ),
          tabBarLabel: () => (
            <SpeakOnPress textToSpeak="Budgets">
              <Text>Budgets</Text>
            </SpeakOnPress>
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} focused={props.accessibilityState.selected} />
          ),
          tabBarLabel: () => null,
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <SpeakOnPress textToSpeak="Navigating to Reports Screen" navigateTo="Reports">
              <BarChart size={28} color={color} />
            </SpeakOnPress>
          ),
          tabBarLabel: () => (
            <SpeakOnPress textToSpeak="Reports">
              <Text>Report</Text>
            </SpeakOnPress>
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="More" // was Budget, now More
        component={MoreScreen} // Use MoreScreen component here
        options={{
          tabBarIcon: ({ color }) => (
            <SpeakOnPress textToSpeak="Navigating to More Screen" navigateTo="More">
              <Lightbulb size={28} color={color} />
            </SpeakOnPress>
          ),
          tabBarLabel: () => (
            <SpeakOnPress textToSpeak="More">
              <Text>More</Text>
            </SpeakOnPress>
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
