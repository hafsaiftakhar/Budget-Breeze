import React, { useEffect, useContext } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { useAccessibility } from './AccessibilityContext';
import { LanguageContext } from './LanguageContext'; // Import LanguageContext

const translations = {
  en: {
    accessibilitySettings: "Accessibility Settings",
    enableTextToSpeech: "Enable Text-to-Speech",
    statusOn: "Accessibility Mode is On",
    statusOff: "Accessibility Mode is Off",
    speechOn: "Accessibility mode is now ON",
  },
  ur: {
    accessibilitySettings: "دستیابی کی ترتیبات",
    enableTextToSpeech: "ٹیکسٹ سے تقریر فعال کریں",
    statusOn: "دستیابی موڈ آن ہے",
    statusOff: "دستیابی موڈ بند ہے",
    speechOn: "دستیابی موڈ اب فعال ہے",
  },
  ar: {
    accessibilitySettings: "إعدادات إمكانية الوصول",
    enableTextToSpeech: "تمكين تحويل النص إلى كلام",
    statusOn: "وضع إمكانية الوصول مفعل",
    statusOff: "وضع إمكانية الوصول متوقف",
    speechOn: "تم تفعيل وضع إمكانية الوصول الآن",
  },
  fr: {
    accessibilitySettings: "Paramètres d'accessibilité",
    enableTextToSpeech: "Activer la synthèse vocale",
    statusOn: "Le mode accessibilité est activé",
    statusOff: "Le mode accessibilité est désactivé",
    speechOn: "Le mode accessibilité est maintenant activé",
  },
  es: {
    accessibilitySettings: "Configuración de accesibilidad",
    enableTextToSpeech: "Activar texto a voz",
    statusOn: "El modo de accesibilidad está activado",
    statusOff: "El modo de accesibilidad está desactivado",
    speechOn: "El modo de accesibilidad está activado ahora",
  },
};

const Accessibility = () => {
  const { accessibilityMode, setAccessibilityMode } = useAccessibility();
  const { language } = useContext(LanguageContext);
  const t = translations[language] || translations.en;

  useEffect(() => {
    if (accessibilityMode) {
      Speech.speak(t.speechOn, { language });
    } else {
      Speech.stop();
    }
  }, [accessibilityMode, language]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.accessibilitySettings}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>{t.enableTextToSpeech}</Text>
        <Switch
          value={accessibilityMode}
          onValueChange={() => setAccessibilityMode(prev => !prev)}
        />
      </View>

      <Text style={styles.status}>
        {accessibilityMode ? t.statusOn : t.statusOff}
      </Text>
    </View>
  );
};

export default Accessibility;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
  },
  status: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
});
