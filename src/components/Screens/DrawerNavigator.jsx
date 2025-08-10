import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import BottomTabs from "./BottomTabs";
import SettingsScreen from "./SettingsScreen"; // ✅ CustomDrawer ki jagah SettingsScreen use ho rahi hai
import ChangePasswordScreen from "./ChangePasswordScreen";
import LoginScreen from "./LoginScreen";
import LogoutScreen from "./LogoutScreen";
import SignupScreen from "./SignupScreen";
import Accessibility from "./Accessibility";
import ReminderScreen from "./ReminderScreen";


  


const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ setIsLoggedIn }) => {
 
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SettingsScreen {...props} />} // ✅ CustomDrawer ki jagah SettingsScreen
      screenOptions={{
        headerShown: false,
        drawerType: "slide",
      }}
    >
      <Drawer.Screen name="Home" component={BottomTabs} />
      <Drawer.Screen name="ChangePassword" component={ChangePasswordScreen} options={{headerShown:true}}/>
      <Drawer.Screen name="Signup" component={SignupScreen} options={{headerShown:true}} />
      <Drawer.Screen name="LogoutScreen">
        {props => <LogoutScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Drawer.Screen>
      <Drawer.Screen name="ReminderScreen" component={ReminderScreen} options={{headerShown:true}} />
      <Drawer.Screen name="Accessability Mode" component={Accessibility} options={{headerShown:true}}/> 
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;