import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { ProgressBar } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import SpeakOnPress from "./SpeakOnPress";


const API_URL = "http://192.168.100.8:3033/api/spending-insights-monthly/compare-monthly-spending";
const screenWidth = Dimensions.get("window").width;

const SpendingInsightsMonthly = () => {
  const [thisMonthExpense, setThisMonthExpense] = useState(0);
  const [lastMonthExpense, setLastMonthExpense] = useState(0);
  const [comparison, setComparison] = useState("");

  useEffect(() => {
    fetchMonthlySpending();
  }, []);

  const fetchMonthlySpending = async () => {
    try {
      console.log("🔄 Fetching monthly spending data...");
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch monthly spending");

      const data = await response.json();
      console.log("Fetched Monthly Transactions:", data);
      processSpendingData(data);
    } catch (error) {
      console.error("Error fetching monthly spending:", error.message);
    }
  };

  const processSpendingData = (data) => {
    let thisMonthTotal = parseFloat(data.currentMonthExpense) || 0;
    let lastMonthTotal = parseFloat(data.lastMonthExpense) || 0;

    setThisMonthExpense(thisMonthTotal);
    setLastMonthExpense(lastMonthTotal);
    compareMonthlyBudget(thisMonthTotal, lastMonthTotal);
  };

  const compareMonthlyBudget = (thisMonth, lastMonth) => {
    if (thisMonth < lastMonth) {
      setComparison(" Great job! You spent less this month than last month. Keep it up! ");
    } else if (thisMonth > lastMonth) {
      setComparison(" Your spending increased this month. Consider adjusting your budget! ");
    } else {
      setComparison(" Same spending! You spent exactly as much as last month. Try to cut back next time! ");
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
            { name: "This Month", amount: thisMonthExpense, color: "#FF6384", legendFontColor: "#333", legendFontSize: 13 },
            { name: "Last Month", amount: lastMonthExpense, color: "#36A2EB", legendFontColor: "#333", legendFontSize: 13 },
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
<SpeakOnPress textToSpeak={`This   Month  Expense is ${thisMonthExpense.toFixed(2)} rupees`}>
      <View style={styles.card}>
        <Ionicons name="calendar" size={28} color="#007bff" />
        <Text style={styles.text}>This Month's Expense: {thisMonthExpense.toFixed(2)} PKR</Text>
        <ProgressBar progress={getProgress(thisMonthExpense, thisMonthExpense + lastMonthExpense)} color="#FF6384" style={styles.progress} />
      </View>
      </SpeakOnPress>
<SpeakOnPress textToSpeak={`Last  Month  Expense is ${lastMonthExpense.toFixed(2)} rupees`}>
      <View style={styles.card}>
        <Ionicons name="time" size={28} color="#36A2EB" />
        <Text style={styles.text}>Last Month's Expense: {lastMonthExpense.toFixed(2)} PKR</Text>
        <ProgressBar progress={getProgress(lastMonthExpense, thisMonthExpense + lastMonthExpense)} color="#36A2EB" style={styles.progress} />
      </View>
      </SpeakOnPress>

     <SpeakOnPress textToSpeak={comparison}>
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

export default SpendingInsightsMonthly;
