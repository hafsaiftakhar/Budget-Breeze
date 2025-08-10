import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { ProgressBar } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import SpeakOnPress from "./SpeakOnPress";


const API_URL = "http://192.168.100.8:3033/api/compare-daily-spending";
const screenWidth = Dimensions.get("window").width; 

const SpendingInsights = () => {
  const [todayExpense, setTodayExpense] = useState(0);
  const [yesterdayExpense, setYesterdayExpense] = useState(0);
  const [comparison, setComparison] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      console.log("🔄 Fetching data from API...");
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      
      const data = await response.json();
      console.log("Fetched Transactions:", data);
      processTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error.message);
    }
  };

  const processTransactions = (data) => {
    let todayExpenseTotal = parseFloat(data.todayExpense) || 0;
    let yesterdayExpenseTotal = parseFloat(data.yesterdayExpense) || 0;

    setTodayExpense(todayExpenseTotal);
    setYesterdayExpense(yesterdayExpenseTotal);
    compareBudget(todayExpenseTotal, yesterdayExpenseTotal);
  };

 const compareBudget = (today, yesterday) => {
  if (today < yesterday) {
    setComparison(" Great job! You spent less today than yesterday. Keep it up! ");
  } else if (today > yesterday) {
    setComparison(" Heads up! Your spending increased today. Try cutting back tomorrow! ");
  } else {
    setComparison(" Steady spending! You spent the same as yesterday. Aim to save more! ");
  }
};

  const getProgress = (value, total) => {
    return total > 0 ? value / total : 0;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.pieChartContainer}>
        <PieChart
          data={[
            { name: "TDYSpend", amount: todayExpense, color: "#FF6384", legendFontColor: "#333", legendFontSize: 13 },
            { name: "YDYSpend", amount: yesterdayExpense, color: "#36A2EB", legendFontColor: "#333", legendFontSize: 13 },
          ]}
          width={screenWidth * 0.9} 
          height={200}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#f8f9fa",
            backgroundGradientTo: "#f8f9fa",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"amount"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
        />
      </View>

   
 <SpeakOnPress textToSpeak={`Today's Expense is ${todayExpense.toFixed(2)} rupees`}>
  <View style={styles.card}>
    <Ionicons name="wallet" size={28} color="#007bff" />
    <Text style={styles.text}>Today's Expense: {todayExpense.toFixed(2)} PKR</Text>
    <ProgressBar progress={getProgress(todayExpense, todayExpense + yesterdayExpense)} color="#FF6384" style={styles.progress} />
  </View>
</SpeakOnPress>

<SpeakOnPress textToSpeak={`Yesterday's Expense was ${yesterdayExpense.toFixed(2)} rupees`}>
  <View style={styles.card}>
    <Ionicons name="cash" size={28} color="#36A2EB" />
    <Text style={styles.text}>Yesterday's Expense: {yesterdayExpense.toFixed(2)} PKR</Text>
    <ProgressBar progress={getProgress(yesterdayExpense, todayExpense + yesterdayExpense)} color="#36A2EB" style={styles.progress} />
  </View>
</SpeakOnPress>
     <SpeakOnPress SpeakOnPress textToSpeak={comparison}>
  <Text style={styles.comparison}>{comparison}</Text>
</SpeakOnPress>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  pieChartContainer: { alignItems: "center", marginBottom: 20 },
  card: { backgroundColor: "#ffffff", borderRadius: 15, padding: 20, marginBottom: 15, alignItems: "center", elevation: 5, width: "90%", alignSelf: "center" },
  text: { fontSize: 18, color: "#333", marginBottom: 10, fontWeight: "500", textAlign: "center" },
  progress: { width: "100%", height: 10, borderRadius: 5, marginTop: 5 },
  comparison: { fontSize: 18, fontWeight: "bold", color: "#007bff", textAlign: "center", marginTop: 20 },
});

export default SpendingInsights;
