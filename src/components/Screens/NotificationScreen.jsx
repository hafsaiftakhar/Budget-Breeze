import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, Button, Alert } from "react-native";

const NotificationScreen = () => {
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [goalReminderEnabled, setGoalReminderEnabled] = useState(false);

  const toggleDailyReminder = (value) => {
    setDailyReminderEnabled(value);
    if (value) {
      Alert.alert("Reminder Enabled", "Daily reminder has been turned ON.");
      // Yahan aap apni local logic laga sakti hain, jaise koi flag save karna AsyncStorage me
    } else {
      Alert.alert("Reminder Disabled", "Daily reminder has been turned OFF.");
    }
  };

  const toggleGoalReminder = (value) => {
    setGoalReminderEnabled(value);
    if (value) {
      Alert.alert("Goal Reminder Enabled", "You will be reminded about your goals.");
    } else {
      Alert.alert("Goal Reminder Disabled", "Goal reminders are turned OFF.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mauj Screen - Notifications Alternative</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Daily Reminder</Text>
        <Switch value={dailyReminderEnabled} onValueChange={toggleDailyReminder} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Goal Reminder</Text>
        <Switch value={goalReminderEnabled} onValueChange={toggleGoalReminder} />
      </View>

      <Button
        title="Show Daily Reminder Now"
        onPress={() => {
          if (dailyReminderEnabled) {
            Alert.alert("Daily Reminder", "Don't forget to update your expenses today!");
          } else {
            Alert.alert("Reminder Off", "Enable daily reminder to get notifications.");
          }
        }}
      />

      <Button
        title="Show Goal Reminder Now"
        onPress={() => {
          if (goalReminderEnabled) {
            Alert.alert("Goal Reminder", "You have a goal deadline approaching!");
          } else {
            Alert.alert("Reminder Off", "Enable goal reminder to get notifications.");
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", justifyContent: "center" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 40, textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 20 },
  label: { fontSize: 18 },
});

export default NotificationScreen;
