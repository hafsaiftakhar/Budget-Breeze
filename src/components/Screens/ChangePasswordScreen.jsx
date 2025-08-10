import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpeakOnPress from './SpeakOnPress'; // Import SpeakOnPress
import * as Speech from 'expo-speech'; // Import Speech
import { LanguageContext } from './LanguageContext'; // Import your LanguageContext

const translations = {
  en: {
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    errorNoPassword: "No password found. Please log in again.",
    errorIncorrectCurrent: "Current password is incorrect.",
    errorMismatch: "New passwords do not match.",
    success: "Password changed successfully!",
    fail: "Failed to update password.",
    somethingWrong: "Something went wrong. Please try again.",
    updateButton: "Update Password",
    speakCurrentPassword: "Current password",
    speakNewPassword: "New password",
    speakConfirmPassword: "Confirm new password",
    speakTapChange: "Tap to change your password",
  },
  ur: {
    changePassword: "پاسورڈ تبدیل کریں",
    currentPassword: "موجودہ پاسورڈ",
    newPassword: "نیا پاسورڈ",
    confirmPassword: "نیا پاسورڈ دوبارہ درج کریں",
    errorNoPassword: "کوئی پاسورڈ نہیں ملا۔ دوبارہ لاگ ان کریں۔",
    errorIncorrectCurrent: "موجودہ پاسورڈ غلط ہے۔",
    errorMismatch: "نئے پاسورڈز مماثل نہیں ہیں۔",
    success: "پاسورڈ کامیابی سے تبدیل ہوگیا!",
    fail: "پاسورڈ اپ ڈیٹ کرنے میں ناکامی۔",
    somethingWrong: "کچھ غلط ہوگیا۔ دوبارہ کوشش کریں۔",
    updateButton: "پاسورڈ اپ ڈیٹ کریں",
    speakCurrentPassword: "موجودہ پاسورڈ",
    speakNewPassword: "نیا پاسورڈ",
    speakConfirmPassword: "نیا پاسورڈ دوبارہ درج کریں",
    speakTapChange: "اپنا پاسورڈ تبدیل کرنے کے لیے ٹیپ کریں",
  },
  ar: {
    changePassword: "تغيير كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
    errorNoPassword: "لم يتم العثور على كلمة مرور. يرجى تسجيل الدخول مرة أخرى.",
    errorIncorrectCurrent: "كلمة المرور الحالية غير صحيحة.",
    errorMismatch: "كلمات المرور الجديدة غير متطابقة.",
    success: "تم تغيير كلمة المرور بنجاح!",
    fail: "فشل في تحديث كلمة المرور.",
    somethingWrong: "حدث خطأ ما. حاول مرة أخرى.",
    updateButton: "تحديث كلمة المرور",
    speakCurrentPassword: "كلمة المرور الحالية",
    speakNewPassword: "كلمة المرور الجديدة",
    speakConfirmPassword: "تأكيد كلمة المرور الجديدة",
    speakTapChange: "انقر لتغيير كلمة المرور الخاصة بك",
  },
  fr: {
    changePassword: "Changer le mot de passe",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le nouveau mot de passe",
    errorNoPassword: "Aucun mot de passe trouvé. Veuillez vous reconnecter.",
    errorIncorrectCurrent: "Le mot de passe actuel est incorrect.",
    errorMismatch: "Les nouveaux mots de passe ne correspondent pas.",
    success: "Mot de passe modifié avec succès!",
    fail: "Échec de la mise à jour du mot de passe.",
    somethingWrong: "Une erreur s'est produite. Veuillez réessayer.",
    updateButton: "Mettre à jour le mot de passe",
    speakCurrentPassword: "Mot de passe actuel",
    speakNewPassword: "Nouveau mot de passe",
    speakConfirmPassword: "Confirmer le nouveau mot de passe",
    speakTapChange: "Appuyez pour changer votre mot de passe",
  },
  es: {
    changePassword: "Cambiar contraseña",
    currentPassword: "Contraseña actual",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar nueva contraseña",
    errorNoPassword: "No se encontró contraseña. Por favor inicie sesión de nuevo.",
    errorIncorrectCurrent: "La contraseña actual es incorrecta.",
    errorMismatch: "Las nuevas contraseñas no coinciden.",
    success: "¡Contraseña cambiada con éxito!",
    fail: "Error al actualizar la contraseña.",
    somethingWrong: "Algo salió mal. Por favor, inténtelo de nuevo.",
    updateButton: "Actualizar contraseña",
    speakCurrentPassword: "Contraseña actual",
    speakNewPassword: "Nueva contraseña",
    speakConfirmPassword: "Confirmar nueva contraseña",
    speakTapChange: "Toque para cambiar su contraseña",
  }
};

const ChangePasswordScreen = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language] || translations.en;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [storedPassword, setStoredPassword] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchStoredPassword = async () => {
      try {
        const savedPassword = await AsyncStorage.getItem('password');
        if (savedPassword) {
          setStoredPassword(savedPassword);
        }
      } catch (error) {
        console.error('Error fetching stored password:', error);
      }
    };

    fetchStoredPassword();
  }, []);

  const handleChangePassword = async () => {
    const email = await AsyncStorage.getItem('email');

    if (!storedPassword) {
      Alert.alert(t.errorNoPassword);
      Speech.speak(t.errorNoPassword, { language });
      return;
    }

    if (storedPassword !== currentPassword) {
      Alert.alert(t.errorIncorrectCurrent);
      Speech.speak(t.errorIncorrectCurrent, { language });
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t.errorMismatch);
      Speech.speak(t.errorMismatch, { language });
      return;
    }

    try {
      const response = await fetch('http://192.168.100.8:3033/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, oldPassword: currentPassword, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.removeItem('password');
        Alert.alert(t.success, '', [
          { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
        ]);
        Speech.speak(t.success, { language });
      } else {
        Alert.alert(t.fail, data.message || '');
        Speech.speak(data.message || t.fail, { language });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert(t.somethingWrong);
      Speech.speak(t.somethingWrong, { language });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.changePassword}</Text>

      {/* Current Password */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={t.currentPassword}
          placeholderTextColor="#aaa"
          secureTextEntry={!showCurrentPassword}
          value={currentPassword}
          onChangeText={(text) => {
            setCurrentPassword(text);
            Speech.speak(text, { language });
          }}
          onFocus={() => Speech.speak(t.speakCurrentPassword, { language })}
        />
        <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
          <Ionicons name={showCurrentPassword ? 'eye' : 'eye-off'} size={22} color="gray" />
        </TouchableOpacity>
      </View>

      {/* New Password */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={t.newPassword}
          placeholderTextColor="#aaa"
          secureTextEntry={!showNewPassword}
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            Speech.speak(text, { language });
          }}
          onFocus={() => Speech.speak(t.speakNewPassword, { language })}
        />
        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
          <Ionicons name={showNewPassword ? 'eye' : 'eye-off'} size={22} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Confirm New Password */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={t.confirmPassword}
          placeholderTextColor="#aaa"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            Speech.speak(text, { language });
          }}
          onFocus={() => Speech.speak(t.speakConfirmPassword, { language })}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={22} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Use SpeakOnPress here for button */}
      <SpeakOnPress textToSpeak={t.speakTapChange}>
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>{t.updateButton}</Text>
        </TouchableOpacity>
      </SpeakOnPress>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  input: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
