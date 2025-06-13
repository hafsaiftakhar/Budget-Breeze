import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LogOut, Lock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import SpeakOnPress from "./SpeakOnPress";
import * as FileSystem from "expo-file-system";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const SettingsScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedFirstName = await AsyncStorage.getItem("first_name");
        const storedLastName = await AsyncStorage.getItem("last_name");
        if (storedFirstName) setFirstName(storedFirstName);
        if (storedLastName) setLastName(storedLastName);
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const getInitials = () => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  };

 const uploadMysqlBackup = async () => {
   try {
     const backupApiUrl = "http://192.168.100.8:3033/api/backup";
     const response = await fetch(backupApiUrl);
     if (!response.ok) throw new Error("Failed to fetch backup");
 
     const data = await response.json();
     if (data.error) {
       Alert.alert("Backup Error", data.error);
       return;
     }
 
     const { transactions = [], budgets = [] } = data;
 
     // Filter transactions to required fields
     const filteredTransactions = transactions.map(({ id, type, amount, category, date }) => ({
       id,
       type,
       amount,
       category,
       date,
     }));
 
     const filteredBudgets = budgets.map(({ id, category, amount, createdAt }) => ({
       id,
       category,
       amount,
       createdAt,
     }));
 
     const htmlContent = `
       <html>
         <head>
           <style>
             body { font-family: Arial; padding: 20px; }
             h1 { color: #004a99; }
             h2 { margin-top: 30px; color: #007bff; }
             table { width: 100%; border-collapse: collapse; margin-top: 10px; }
             th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; text-align: left; }
             th { background-color: #f0f0f0; }
           </style>
         </head>
         <body>
           <h1>📊 Budget Breeze Backup</h1>
           <p>Generated on: ${new Date().toLocaleString()}</p>
 
           <h2>💸 Transactions</h2>
           <table>
             <tr><th>#</th><th>ID</th><th>Type</th><th>Amount</th><th>Category</th><th>Date</th></tr>
             ${filteredTransactions.map((t, i) =>
               `<tr><td>${i + 1}</td><td>${t.id}</td><td>${t.type}</td><td>${t.amount}</td><td>${t.category}</td><td>${t.date}</td></tr>`
             ).join("")}
           </table>
 
           <h2>📅 Budgets</h2>
           <table>
             <tr><th>ID</th><th>Category</th><th>Amount</th><th>CreatedAt</th></tr>
             ${filteredBudgets.map((b) =>
               `<tr><td>${b.id}</td><td>${b.category}</td><td>${b.amount}</td> <td>${new Date(b.created_at).toLocaleDateString()}</td>
/td></tr>`
             ).join("")}
           </table>
         </body>
       </html>
     `;
 
     const { uri } = await Print.printToFileAsync({ html: htmlContent });
 
     const newPath = `${FileSystem.documentDirectory}budget_breeze_backup_${Date.now()}.pdf`;
     await FileSystem.copyAsync({ from: uri, to: newPath });
 
     Alert.alert("Backup Complete", "PDF saved successfully.");
 
     if (Platform.OS !== "web") {
       const isAvailable = await Sharing.isAvailableAsync();
       if (isAvailable) {
         await Sharing.shareAsync(newPath);
       }
     }
   } catch (error) {
     console.error("Backup error:", error);
     Alert.alert("Backup Failed", "Something went wrong while generating the backup.");
   }
 };
 

  // 🟡 Fix: Wrap this JSX with `return (...)`
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#007bff", "#0056b3"]} style={styles.headerContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <Text style={styles.headerText}>Welcome,</Text>
        <Text style={styles.nameText}>
          {firstName} {lastName}!
        </Text>
      </LinearGradient>

      <View style={styles.settingsContainer}>
        <SpeakOnPress
          textToSpeak="Navigating to Change Password screen"
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <View style={styles.option}>
            <Lock size={24} color="#666" />
            <Text style={styles.optionText}>Change Password</Text>
          </View>
        </SpeakOnPress>

        <SpeakOnPress
          textToSpeak="Navigating to Accessibility Mode screen"
          onPress={() => navigation.navigate("Accessibility")}
        >
          <View style={styles.option}>
            <Ionicons name="accessibility" size={24} color="#666" />
            <Text style={styles.optionText}>Accessibility Mode</Text>
          </View>
        </SpeakOnPress>

        <SpeakOnPress textToSpeak="Uploading backup to cloud" onPress={uploadMysqlBackup}>
          <View style={styles.option}>
            <Ionicons name="cloud-upload-outline" size={24} color="#666" />
            <Text style={styles.optionText}>Backup to Cloud</Text>
          </View>
        </SpeakOnPress>

        <SpeakOnPress
          textToSpeak="Navigating to Logout screen"
          onPress={() => navigation.navigate("LogoutScreen")}
        >
          <View style={styles.logoutButton}>
            <LogOut size={22} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </SpeakOnPress>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  headerContainer: {
    paddingVertical: 50,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#004a99",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  headerText: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  nameText: { fontSize: 18, fontWeight: "600", color: "#fff", marginTop: 5 },
  settingsContainer: { marginTop: 30, paddingHorizontal: 20 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 12,
  },
  optionText: { fontSize: 18, color: "#333", marginLeft: 15, fontWeight: "500" },
  logoutButton: {
    marginTop: 40,
    backgroundColor: "#ff3b30",
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#ff3b30",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  logoutText: { fontSize: 18, color: "#fff", marginLeft: 10, fontWeight: "600" },
});

export default SettingsScreen;
