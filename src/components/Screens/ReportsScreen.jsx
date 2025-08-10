import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { LanguageContext } from "./LanguageContext";
import { CurrencyContext } from "./CurrencyContext";
import { useAccessibility } from "./AccessibilityContext";
import SpeakOnPress from "./SpeakOnPress";

const translations = {
  en: {
    selectDate: "📅 Select Date",
    monthlyBudget: "📊 Monthly Budget",
    weeklyBudget: "📆 Weekly Budget",
    dailyBudget: "📅 Daily Budget",
    remaining: "Remaining",
    income: "Income",
    expenses: "Expenses",
    downloadPDF: "📄 Download PDF",
    noData: "No data available to generate report.",
  },
  ur: {
    selectDate: "📅 تاریخ منتخب کریں",
    monthlyBudget: "📊 ماہانہ بجٹ",
    weeklyBudget: "📆 ہفتہ وار بجٹ",
    dailyBudget: "📅 روزانہ بجٹ",
    remaining: "باقی",
    income: "آمدنی",
    expenses: "اخراجات",
    downloadPDF: "📄 پی ڈی ایف ڈاؤن لوڈ کریں",
    noData: "رپورٹ بنانے کے لئے کوئی ڈیٹا دستیاب نہیں ہے۔",
  },
  ar: {
    selectDate: "📅 اختر تاريخ",
    monthlyBudget: "📊 الميزانية الشهرية",
    weeklyBudget: "📆 الميزانية الأسبوعية",
    dailyBudget: "📅 الميزانية اليومية",
    remaining: "المتبقي",
    income: "الدخل",
    expenses: "المصروفات",
    downloadPDF: "📄 تحميل PDF",
    noData: "لا توجد بيانات متاحة لإنشاء التقرير.",
  },
  fr: {
    selectDate: "📅 Sélectionner la date",
    monthlyBudget: "📊 Budget Mensuel",
    weeklyBudget: "📆 Budget Hebdomadaire",
    dailyBudget: "📅 Budget Quotidien",
    remaining: "Restant",
    income: "Revenu",
    expenses: "Dépenses",
    downloadPDF: "📄 Télécharger PDF",
    noData: "Aucune donnée disponible pour générer le rapport.",
  },
  es: {
    selectDate: "📅 Seleccionar fecha",
    monthlyBudget: "📊 Presupuesto Mensual",
    weeklyBudget: "📆 Presupuesto Semanal",
    dailyBudget: "📅 Presupuesto Diario",
    remaining: "Restante",
    income: "Ingresos",
    expenses: "Gastos",
    downloadPDF: "📄 Descargar PDF",
    noData: "No hay datos disponibles para generar el informe.",
  },
};


const ReportsScreen = () => {
  const { language } = useContext(LanguageContext);
  const { currency } = useContext(CurrencyContext);
  const t = translations[language] || translations.en;
   const { accessibilityMode } = useAccessibility();

  const [budgetData, setBudgetData] = useState({ monthly: [], weekly: [], daily: [] });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    fetchBudgetData(selectedDate);
  }, [selectedDate]);

  const fetchBudgetData = async (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    try {
      const monthResponse = await axios.get(`http://192.168.100.8:3033/api/reports/monthly?month=${month}&year=${year}`);
      const weekResponse = await axios.get(`http://192.168.100.8:3033/api/reports/weekly?start_date=${startOfWeek.toISOString().split('T')[0]}&end_date=${endOfWeek.toISOString().split('T')[0]}`);
      const dayResponse = await axios.get(`http://192.168.100.8:3033/api/reports/custom?start_date=${year}-${month}-${day}&end_date=${year}-${month}-${day}`);

      setBudgetData({
        monthly: monthResponse.data.report || [],
        weekly: weekResponse.data.report || [],
        daily: dayResponse.data.report || [],
      });
    } catch (error) {
      console.error("Error fetching budget data:", error.response?.data || error.message);
    }
  };

  const generatePDF = async (title, data) => {
    if (!data || data.length === 0) {
      alert(t.noData);
      return;
    }

    const symbol = currency.symbol || "₨";

    const tableRows = data.map(item => `
      <tr>
        <td>${item.category || "Unknown"}</td>
        <td>${item.type === "income" ? symbol + (item.amount * currency.rate).toFixed(2) : symbol + "0"}</td>
        <td>${item.type === "expense" ? symbol + (item.amount * currency.rate).toFixed(2) : symbol + "0"}</td>
        <td>${item.date ? item.date.split('T')[0] : "Unknown"}</td>
      </tr>
    `).join("");

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <table>
            <tr>
              <th>Category</th>
              <th>${t.income} (${symbol})</th>
              <th>${t.expenses} (${symbol})</th>
              <th>Date</th>
            </tr>
            ${tableRows}
          </table>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert("Sharing not available on this device.");
      }
    } catch (error) {
      console.error("PDF Generation Error:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
     <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
  <SpeakOnPress text={t.selectDate}>
    <Text style={styles.dateText}>{t.selectDate}</Text>
  </SpeakOnPress>
</TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      <BudgetCard title={t.monthlyBudget} data={budgetData.monthly} onDownload={() => generatePDF(t.monthlyBudget, budgetData.monthly)} currency={currency} t={t} />
      <BudgetCard title={t.weeklyBudget} data={budgetData.weekly} onDownload={() => generatePDF(t.weeklyBudget, budgetData.weekly)} currency={currency} t={t} />
      <BudgetCard title={t.dailyBudget} data={budgetData.daily} onDownload={() => generatePDF(t.dailyBudget, budgetData.daily)} currency={currency} t={t} />
    </ScrollView>
  );
};

const BudgetCard = ({ title, data, onDownload, currency, t }) => {
  const totalIncome = data
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + parseFloat(item.amount), 0) * (currency.rate || 1);

  const totalExpenses = data
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + parseFloat(item.amount), 0) * (currency.rate || 1);

  const remaining = (totalIncome - totalExpenses).toFixed(2);
  const borderColor = totalExpenses > totalIncome ? "red" : "green";

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.circle, { borderColor }]}>
        <Text style={styles.circleText}>
          {currency.symbol}{totalIncome.toFixed(2)}
        </Text>
      </View>
      <View style={styles.row}>
  <SpeakOnPress text={`${t.remaining}: ${currency.symbol}${remaining}`}>
    <Text style={styles.label}>{t.remaining}:</Text>
  </SpeakOnPress>
  <SpeakOnPress text={`${currency.symbol}${remaining}`}>
    <Text style={styles.value}>{currency.symbol}{remaining}</Text>
  </SpeakOnPress>
</View>

<View style={styles.row}>
  <SpeakOnPress text={`${t.income}: ${currency.symbol}${totalIncome.toFixed(2)}`}>
    <Text style={styles.label}>{t.income}:</Text>
  </SpeakOnPress>
  <SpeakOnPress text={`${currency.symbol}${totalIncome.toFixed(2)}`}>
    <Text style={styles.value}>{currency.symbol}{totalIncome.toFixed(2)}</Text>
  </SpeakOnPress>
</View>

<View style={styles.row}>
  <SpeakOnPress text={`${t.expenses}: ${currency.symbol}${totalExpenses.toFixed(2)}`}>
    <Text style={styles.label}>{t.expenses}:</Text>
  </SpeakOnPress>
  <SpeakOnPress text={`${currency.symbol}${totalExpenses.toFixed(2)}`}>
    <Text style={styles.value}>{currency.symbol}{totalExpenses.toFixed(2)}</Text>
  </SpeakOnPress>
</View>

<SpeakOnPress text={title}>
  <Text style={styles.title}>{title}</Text>
</SpeakOnPress>

      <TouchableOpacity style={styles.downloadButton} onPress={onDownload}>
  <SpeakOnPress text={t.downloadPDF}>
    <Text style={styles.downloadText}>{t.downloadPDF}</Text>
  </SpeakOnPress>
</TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  dateButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, alignItems: "center", marginBottom: 10 },
  dateText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: "#ddd" },
  title: { fontSize: 18, fontWeight: "bold", color: "blue", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  label: { color: "black", fontSize: 14 },
  value: { color: "blue", fontSize: 14 },
  circle: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, alignItems: "center", justifyContent: "center", alignSelf: "center", marginVertical: 10 },
  circleText: { color: "black", fontSize: 18 },
  downloadButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, marginTop: 10, alignItems: "center" },
  downloadText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});

export default ReportsScreen;
   