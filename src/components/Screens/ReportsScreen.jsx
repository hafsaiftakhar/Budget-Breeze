import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const ReportsScreen = () => {
  const [budgetData, setBudgetData] = useState({ monthly: [], weekly: [], daily: [] });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    fetchBudgetData(selectedDate);
  }, [selectedDate]);

  const fetchBudgetData = async (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(day - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    try {
     const monthResponse = await axios.get(`http://192.168.100.8:3033/api/reports/monthly?month=${month}&year=${year}`);

      const weekResponse = await axios.get(`http://192.168.100.8:3033/api/reports/weekly?start_date=${startOfWeek.toISOString().split('T')[0]}&end_date=${endOfWeek.toISOString().split('T')[0]}`);
      const dayResponse = await axios.get(`http://192.168.100.8:3033/api/reports/custom?start_date=${year}-${month}-${day}&end_date=${year}-${month}-${day}`);
      
      console.log("Monthly Data:", monthResponse.data);
      console.log("Weekly Data:", weekResponse.data);
      console.log("Daily Data:", dayResponse.data);
      
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
      alert("No data available to generate report.");
      return;
    }

    let tableRows = data
      .map(
        (item) => `
        <tr>
          <td>${item.category || "Unknown"}</td>
          <td>${item.transaction_type === "Income" ? item.total_amount : "0"}</td>
          <td>${item.transaction_type === "Expense" ? item.total_amount : "0"}</td>
          <td>${item.date ? item.date.split('T')[0] : "Unknown"}</td>
        </tr>
      `
      )
      .join("");

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
              <th>Income</th>
              <th>Expenses</th>
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
        <Text style={styles.dateText}>📅 Select Date</Text>
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
      <BudgetCard title="📊 Monthly Budget" data={budgetData.monthly} onDownload={() => generatePDF("Monthly Report", budgetData.monthly)} />
      <BudgetCard title="📆 Weekly Budget" data={budgetData.weekly} onDownload={() => generatePDF("Weekly Report", budgetData.weekly)} />
      <BudgetCard title="📅 Daily Budget" data={budgetData.daily} onDownload={() => generatePDF("Daily Report", budgetData.daily)} />
    </ScrollView>
  );
};

const BudgetCard = ({ title, data, onDownload }) => {
  const totalIncome = data.filter((item) => item.transaction_type === "Income").reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
  const totalExpenses = data.filter((item) => item.transaction_type === "Expense").reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
  const remaining = (totalIncome - totalExpenses).toFixed(2);
  const borderColor = totalExpenses > totalIncome ? "red" : "green";

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.circle, { borderColor }]} >
        <Text style={styles.circleText}>{totalIncome}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Remaining:</Text>
        <Text style={styles.value}>{remaining}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Income:</Text>
        <Text style={styles.value}>{totalIncome}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Expenses:</Text>
        <Text style={styles.value}>{totalExpenses}</Text>
      </View>
      <TouchableOpacity style={styles.downloadButton} onPress={onDownload}>
        <Text style={styles.downloadText}>📄 Download PDF</Text>
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
