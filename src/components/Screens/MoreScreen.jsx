import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LanguageContext } from "./LanguageContext";
import { useAccessibility } from "./AccessibilityContext"; // ✅ accessibility context
import SpeakOnPress from "./SpeakOnPress"; // ✅ speech wrapper

const translations = {
  en: {
    goals: "Goals",
    goalsDesc: "Create your personal goals to stay motivated.",
    currency: "Currency Change",
    currencyDesc: "Switch between different currencies.",
    language: "Language",
    languageDesc: "Change app language.",
    notifications: "Notifications",
    notificationsDesc: "Manage reminders and alerts.",
    faqs: "FAQs",
    faqsDesc: "Frequently Asked Questions.",
    privacy: "Privacy",
    privacyDesc: "Manage your privacy settings.",
    security: "Security",
    securityDesc: "Manage your security options.",
    pastSpending: "Past Spending",
    pastSpendingDesc: "View your past income, expenses, and suggestions.",
  },
  ur: {
    goals: "اہداف",
    goalsDesc: "متحرک رہنے کے لیے اپنے ذاتی اہداف بنائیں۔",
    currency: "کرنسی تبدیل کریں",
    currencyDesc: "مختلف کرنسیوں کے درمیان سوئچ کریں۔",
    language: "زبان",
    languageDesc: "ایپ کی زبان تبدیل کریں۔",
    notifications: "اطلاعات",
    notificationsDesc: "یاد دہانیوں اور الرٹس کا انتظام کریں۔",
    faqs: "اکثر پوچھے گئے سوالات",
    faqsDesc: "اکثر پوچھے گئے سوالات کا حصہ۔",
    privacy: "رازداری",
    privacyDesc: "اپنی رازداری کی ترتیبات کا انتظام کریں۔",
    security: "سلامتی",
    securityDesc: "اپنے سیکیورٹی آپشنز کا انتظام کریں۔",
    pastSpending: "گزشتہ اخراجات",
    pastSpendingDesc: "اپنی پچھلی آمدنی، اخراجات، اور تجاویز دیکھیں۔",
  },
  ar: {
    goals: "الأهداف",
    goalsDesc: "أنشئ أهدافك الشخصية للبقاء متحمسًا.",
    currency: "تغيير العملة",
    currencyDesc: "التبديل بين العملات المختلفة.",
    language: "اللغة",
    languageDesc: "تغيير لغة التطبيق.",
    notifications: "الإشعارات",
    notificationsDesc: "إدارة التذكيرات والتنبيهات.",
    faqs: "الأسئلة الشائعة",
    faqsDesc: "الأسئلة التي تُطرح كثيرًا.",
    privacy: "الخصوصية",
    privacyDesc: "إدارة إعدادات الخصوصية الخاصة بك.",
    security: "الأمان",
    securityDesc: "إدارة خيارات الأمان الخاصة بك.",
    pastSpending: "الإنفاق السابق",
    pastSpendingDesc: "عرض دخلك ونفقاتك السابقة واقتراحاتك.",
  },
  fr: {
    goals: "Objectifs",
    goalsDesc: "Créez vos objectifs personnels pour rester motivé.",
    currency: "Changement de devise",
    currencyDesc: "Passez d'une devise à une autre.",
    language: "Langue",
    languageDesc: "Changer la langue de l'application.",
    notifications: "Notifications",
    notificationsDesc: "Gérer les rappels et alertes.",
    faqs: "FAQs",
    faqsDesc: "Questions fréquemment posées.",
    privacy: "Confidentialité",
    privacyDesc: "Gérer vos paramètres de confidentialité.",
    security: "Sécurité",
    securityDesc: "Gérer vos options de sécurité.",
    pastSpending: "Dépenses passées",
    pastSpendingDesc: "Consultez vos revenus, dépenses et suggestions passées.",
  },
  es: {
    goals: "Metas",
    goalsDesc: "Crea tus metas personales para mantenerte motivado.",
    currency: "Cambio de moneda",
    currencyDesc: "Cambia entre diferentes monedas.",
    language: "Idioma",
    languageDesc: "Cambia el idioma de la aplicación.",
    notifications: "Notificaciones",
    notificationsDesc: "Gestiona recordatorios y alertas.",
    faqs: "Preguntas frecuentes",
    faqsDesc: "Preguntas frecuentes.",
    privacy: "Privacidad",
    privacyDesc: "Gestiona tus configuraciones de privacidad.",
    security: "Seguridad",
    securityDesc: "Gestiona tus opciones de seguridad.",
    pastSpending: "Gastos pasados",
    pastSpendingDesc: "Ver tus ingresos, gastos y sugerencias pasadas.",
  },
};

const MoreScreen = ({ navigation }) => {
  const { language } = useContext(LanguageContext);
  const { accessibilityMode } = useAccessibility(); // ✅ check accessibility
  const t = translations[language] || translations.en;

  const generalFeatures = [
    {
      key: "language",
      icon: "translate",
      title: t.language,
      description: t.languageDesc,
      screen: "LanguageChangeScreen",
    },
    {
      key: "currency_change",
      icon: "currency-usd",
      title: t.currency,
      description: t.currencyDesc,
      screen: "CurrencyChangeScreen",
    },
  ];

  const otherSettings = [
    {
      key: "past_spending",
      icon: "chart-pie",
      title: t.pastSpending,
      description: t.pastSpendingDesc,
      screen: "PastSpendingSuggestionScreen",
    },
  ];

  const privacySecuritySettings = [
    {
      key: "faqs",
      icon: "help-circle-outline",
      title: t.faqs,
      description: t.faqsDesc,
      screen: "FAQScreen",
    },
  ];

  const moreFeatures = [
    {
      key: "goals",
      icon: "bullseye-arrow",
      title: t.goals,
      description: t.goalsDesc,
      screen: "GoalScreen",
    },
  ];

  const handlePress = (screen) => {
    if (screen) navigation.navigate(screen);
  };

  // ✅ Speak wrapper supports multilingual text
  const SpeakWrapper = ({ title, description, onPress, children }) => {
    const textToSpeak = description ? `${title}. ${description}` : title;
    if (accessibilityMode) {
      return (
        <SpeakOnPress textToSpeak={textToSpeak} onPress={onPress}>
          {children}
        </SpeakOnPress>
      );
    } else {
      return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>;
    }
  };

  const renderFeature = ({ item }) => (
    <SpeakWrapper
      title={item.title}
      description={item.description} // ✅ pass description for speech
      onPress={() => handlePress(item.screen)}
    >
      <FeatureItem
        icon={item.icon}
        title={item.title}
        description={item.description}
      />
    </SpeakWrapper>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headingContainer}>
        <Text style={styles.headingText}>Explore More Features</Text>
      </View>

      <Text style={styles.sectionTitle}>General</Text>
      <FlatList
        data={generalFeatures}
        keyExtractor={(item) => item.key}
        renderItem={renderFeature}
        scrollEnabled={false}
      />

      <Text style={styles.sectionTitle}>Other Settings</Text>
      <FlatList
        data={otherSettings}
        keyExtractor={(item) => item.key}
        renderItem={renderFeature}
        scrollEnabled={false}
      />

      <Text style={styles.sectionTitle}>Privacy & Security</Text>
      <FlatList
        data={privacySecuritySettings}
        keyExtractor={(item) => item.key}
        renderItem={renderFeature}
        scrollEnabled={false}
      />

      <Text style={styles.sectionTitle}>More Features</Text>
      <FlatList
        data={moreFeatures}
        keyExtractor={(item) => item.key}
        renderItem={renderFeature}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const FeatureItem = ({ icon, title, description }) => (
  <View style={styles.itemContainer}>
    <Icon name={icon} size={24} color="#222" style={styles.itemIcon} />
    <View style={{ flex: 1 }}>
      <Text style={styles.itemTitle}>{title}</Text>
      {description ? (
        <Text style={styles.itemDescription}>{description}</Text>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headingContainer: {
    margin: 16,
    marginTop: 30,
    padding: 16,
    borderWidth: 3,
    borderColor: "#2a7ded",
    borderRadius: 10,
    alignItems: "center",
  },
  headingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  sectionTitle: {
    color: "#999",
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  itemContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  itemIcon: { marginRight: 16 },
  itemTitle: { fontSize: 16, fontWeight: "600", color: "#111" },
  itemDescription: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
});

export default MoreScreen;
