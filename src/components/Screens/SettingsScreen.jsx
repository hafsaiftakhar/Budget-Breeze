import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LogOut, Lock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import SpeakOnPress from "./SpeakOnPress";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { useAccessibility } from "./AccessibilityContext";
import { LanguageContext } from "./LanguageContext";  // Language context import

const translations = {
  en: {
    welcome: "Welcome,",
    changePassword: "Change Password",
    accessibilityMode: "Accessibility Mode",
    backupToCloud: "Backup to Cloud",
    restoreFromCloud: "Restore from Cloud",
    logout: "Logout",
    guestName: "Guest",
    pdfSaved: "PDF saved successfully.",
    backupComplete: "Backup Complete",
    restoreComplete: "Restore Complete",
    restoreFailed: "Restore Failed",
    backupFailed: "Backup Failed",
    restoreComplete: "Restore Complete",
    transactionsRestored: "Transactions restored:",
    budgetsRestored: "Budgets restored:",
    restoredAt: "Restored at:",
  },
  ur: {
    welcome: "خوش آمدید،",
    changePassword: "پاس ورڈ تبدیل کریں",
    accessibilityMode: "دستیابی کا موڈ",
    backupToCloud: "کلاؤڈ پر بیک اپ",
    restoreFromCloud: "کلاؤڈ سے بحالی",
    logout: "لاگ آؤٹ",
    guestName: "مہمان",
    pdfSaved: "پی ڈی ایف کامیابی سے محفوظ ہو گیا۔",
    backupComplete: "بیک اپ مکمل ہوا",
    restoreComplete: "بیک اپ بحال ہو گیا",
    restoreFailed: "بحالی ناکام",
    backupFailed: "بیک اپ ناکام",
     restoreComplete: "بحالی مکمل ہو گئی",
    transactionsRestored: "ٹرانزیکشنز بحال ہو گئیں:",
    budgetsRestored: "بجٹس بحال ہو گئے:",
    restoredAt: "بحالی کی تاریخ:",
  },
  ar: {
    welcome: "مرحبا،",
    changePassword: "تغيير كلمة المرور",
    accessibilityMode: "وضع إمكانية الوصول",
    backupToCloud: "نسخة احتياطية إلى السحابة",
    restoreFromCloud: "استعادة من السحابة",
    logout: "تسجيل خروج",
    guestName: "ضيف",
    pdfSaved: "تم حفظ ملف PDF بنجاح.",
    backupComplete: "اكتمل النسخ الاحتياطي",
    restoreComplete: "تم الاستعادة",
    restoreFailed: "فشل الاستعادة",
    backupFailed: "فشل النسخ الاحتياطي",
     restoreComplete: "اكتمل الاستعادة",
    transactionsRestored: "تمت استعادة المعاملات:",
    budgetsRestored: "تمت استعادة الميزانيات:",
    restoredAt: "تاريخ الاستعادة:",
  },
  fr: {
    welcome: "Bienvenue,",
    changePassword: "Changer le mot de passe",
    accessibilityMode: "Mode Accessibilité",
    backupToCloud: "Sauvegarder sur le Cloud",
    restoreFromCloud: "Restaurer depuis le Cloud",
    logout: "Se déconnecter",
    guestName: "Invité",
    pdfSaved: "PDF enregistré avec succès.",
    backupComplete: "Sauvegarde terminée",
    restoreComplete: "Restauration terminée",
    restoreFailed: "Échec de la restauration",
    backupFailed: "Échec de la sauvegarde",
     restoreComplete: "Restauration terminée",
    transactionsRestored: "Transactions restaurées :",
    budgetsRestored: "Budgets restaurés :",
    restoredAt: "Restauré à :",
  },
  es: {
    welcome: "Bienvenido,",
    changePassword: "Cambiar contraseña",
    accessibilityMode: "Modo accesibilidad",
    backupToCloud: "Copia de seguridad en la nube",
    restoreFromCloud: "Restaurar desde la nube",
    logout: "Cerrar sesión",
    guestName: "Invitado",
    pdfSaved: "PDF guardado con éxito.",
    backupComplete: "Copia de seguridad completa",
    restoreComplete: "Restauración completa",
    restoreFailed: "Error al restaurar",
    backupFailed: "Error al hacer copia de seguridad",
       restoreComplete: "Restauración completa",
    transactionsRestored: "Transacciones restauradas:",
    budgetsRestored: "Presupuestos restaurados:",
    restoredAt: "Restaurado en:",
  },
};

const SettingsScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigation = useNavigation();
  const { accessibilityMode } = useAccessibility();
  const { language } = useContext(LanguageContext);
  const t = translations[language] || translations.en;

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

  // Backup to cloud function
  const uploadMysqlBackup = async () => {
    try {
      const backupApiUrl = "http://192.168.100.8:3033/api/backup";
      const response = await fetch(backupApiUrl);
      if (!response.ok) throw new Error("Failed to fetch backup");

      const data = await response.json();
      if (data.error) {
        Alert.alert(t.backupFailed, data.error);
        return;
      }

      const { transactions = [], budgets = [] } = data;

      const filteredTransactions = transactions.map(({ id, type, amount, category, date }) => ({
        id, type, amount, category, date,
      }));

      const filteredBudgets = budgets.map(({ id, category, amount, created_at }) => ({
        id, category, amount, createdAt: created_at,
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
              <tr><th>ID</th><th>Category</th><th>Amount</th><th>Created At</th></tr>
              ${filteredBudgets.map((b) =>
                `<tr><td>${b.id}</td><td>${b.category}</td><td>${b.amount}</td><td>${new Date(b.createdAt).toLocaleDateString()}</td></tr>`
              ).join("")}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const newPath = `${FileSystem.documentDirectory}budget_breeze_backup_${Date.now()}.pdf`;
      await FileSystem.copyAsync({ from: uri, to: newPath });

      Alert.alert(t.backupComplete, t.pdfSaved);

      if (Platform.OS !== "web") {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(newPath);
        }
      }
    } catch (error) {
      console.error("Backup error:", error);
      Alert.alert(t.backupFailed, "Something went wrong while generating the backup.");
    }
  };

  // Restore from cloud function
 const restoreMysqlBackup = async () => {
  try {
    const backupApiUrl = "http://192.168.100.8:3033/api/backup";
    const restoreApiUrl = "http://192.168.100.8:3033/api/backup/restore";

    const response = await fetch(backupApiUrl);
    if (!response.ok) throw new Error("Failed to fetch backup data");
    const data = await response.json();

    const { transactions = [], budgets = [] } = data;

    const restoreResponse = await fetch(restoreApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions, budgets }),
    });

    const restoreData = await restoreResponse.json();

    if (restoreData.error) {
      Alert.alert(t.restoreFailed || "Restore Failed", restoreData.error);
    } else {
      Alert.alert(
        t.restoreComplete,
        `${t.transactionsRestored} ${restoreData.transactionsRestored ?? transactions.length}\n` +
        `${t.budgetsRestored} ${restoreData.budgetsRestored ?? budgets.length}\n` +
        `${t.restoredAt} ${restoreData.restoredAt ? new Date(restoreData.restoredAt).toLocaleString(language) : new Date().toLocaleString(language)}`,
        [{ text: "OK", onPress: () => { /* refresh logic agar chahiye */ } }]
      );
    }
  } catch (error) {
    console.error("Restore error:", error);
    Alert.alert(t.restoreFailed || "Restore Failed", "Something went wrong while restoring data.");
  }
};


  // Accessibility aware button wrapper
  const MaybeSpeakOnPress = ({ textToSpeak, onPress, children }) => {
    if (accessibilityMode) {
      return (
        <SpeakOnPress textToSpeak={textToSpeak} onPress={onPress}>
          {children}
        </SpeakOnPress>
      );
    }
    return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#007bff", "#0056b3"]} style={styles.headerContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <Text style={styles.headerText}>{t.welcome}</Text>
        <Text style={styles.nameText}>
          {(firstName || lastName) ? `${firstName} ${lastName}` : t.guestName}
        </Text>
      </LinearGradient>

      <View style={styles.settingsContainer}>
        <MaybeSpeakOnPress
          textToSpeak={t.changePassword}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <View style={styles.option}>
            <Lock size={24} color="#666" />
            <Text style={styles.optionText}>{t.changePassword}</Text>
          </View>
        </MaybeSpeakOnPress>

        <MaybeSpeakOnPress
          textToSpeak={t.accessibilityMode}
          onPress={() => navigation.navigate("Accessibility")}
        >
          <View style={styles.option}>
            <Ionicons name="accessibility" size={24} color="#666" />
            <Text style={styles.optionText}>{t.accessibilityMode}</Text>
          </View>
        </MaybeSpeakOnPress>

        <MaybeSpeakOnPress
          textToSpeak={t.backupToCloud}
          onPress={uploadMysqlBackup}
        >
          <View style={styles.option}>
            <Ionicons name="cloud-upload-outline" size={24} color="#666" />
            <Text style={styles.optionText}>{t.backupToCloud}</Text>
          </View>
        </MaybeSpeakOnPress>

        <MaybeSpeakOnPress
          textToSpeak={t.restoreFromCloud}
          onPress={restoreMysqlBackup}
        >
          <View style={styles.option}>
            <Ionicons name="cloud-download-outline" size={24} color="#666" />
            <Text style={styles.optionText}>{t.restoreFromCloud}</Text>
          </View>
        </MaybeSpeakOnPress>

        <MaybeSpeakOnPress
          textToSpeak={t.logout}
          onPress={() => navigation.navigate("LogoutScreen")}
        >
          <View style={styles.logoutButton}>
            <LogOut size={22} color="#fff" />
            <Text style={styles.logoutText}>{t.logout}</Text>
          </View>
        </MaybeSpeakOnPress>
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
