import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { ProgressBar } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import SpeakOnPress from "./SpeakOnPress";

const API_URL = "http://192.168.100.8:3033/api/spending-insights-weekly/compare-weekly-spending";
const screenWidth = Dimensions.get("window").width;

const SpendingInsightsWeekly = () => {
  const [thisWeekExpense, setThisWeekExpense] = useState(0);
  const [lastWeekExpense, setLastWeekExpense] = useState(0);
  const [comparison, setComparison] = useState("");

  useEffect(() => {
    fetchWeeklySpending();
  }, []);

  const fetchWeeklySpending = async () => {
    try {
      console.log("🔄 Fetching weekly spending data...");
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch weekly spending");

      const data = await response.json();
      console.log("Fetched Weekly Transactions:", data);
      processSpendingData(data);
    } catch (error) {
      console.error("Error fetching weekly spending:", error.message);
    }
  };

  const processSpendingData = (data) => {
    let thisWeekTotal = parseFloat(data.currentWeekExpense) || 0;
    let lastWeekTotal = parseFloat(data.lastWeekExpense) || 0;

    setThisWeekExpense(thisWeekTotal);
    setLastWeekExpense(lastWeekTotal);
    compareWeeklyBudget(thisWeekTotal, lastWeekTotal);
  };

  const compareWeeklyBudget = (thisWeek, lastWeek) => {
    if (thisWeek < lastWeek) {
      setComparison(" Well done! You spent less this week than last week. Keep saving! ");
    } else if (thisWeek > lastWeek) {
      setComparison(" Heads up! Your spending increased this week. Try budgeting better next week! ");
    } else {
      setComparison(" Consistent spending! You spent the same as last week. Aim to cut down next time! ✨");
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
            { name: "This Week", amount: thisWeekExpense, color: "#FF6384", legendFontColor: "#333", legendFontSize: 13 },
            { name: "Last Week", amount: lastWeekExpense, color: "#36A2EB", legendFontColor: "#333", legendFontSize: 13 },
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
<SpeakOnPress textToSpeak={`This Week  Expense is ${thisWeekExpense.toFixed(2)} rupees`}>
     <View style={styles.card}>
        <Ionicons name="calendar" size={28} color="#007bff" />
        <Text style={styles.text}>This Week's Expense: {thisWeekExpense.toFixed(2)} PKR</Text>
        <ProgressBar progress={getProgress(thisWeekExpense, thisWeekExpense + lastWeekExpense)} color="#FF6384" style={styles.progress} />
      </View>
      </SpeakOnPress>

<SpeakOnPress textToSpeak={`Last  Week  Expense is ${lastWeekExpense.toFixed(2)} rupees`}>
      <View style={styles.card}>
        <Ionicons name="time" size={28} color="#36A2EB" />
        <Text style={styles.text}>Last Week's Expense: {lastWeekExpense.toFixed(2)} PKR</Text>
        <ProgressBar progress={getProgress(lastWeekExpense, thisWeekExpense + lastWeekExpense)} color="#36A2EB" style={styles.progress} />
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

export default SpendingInsightsWeekly;
