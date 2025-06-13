import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';
import { PieChart, LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import { groupBy } from 'lodash';

const screenWidth = Dimensions.get("window").width;

const PastSpendingSuggestion = () => {
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [selectedRange, setSelectedRange] = useState("Daily");

  useEffect(() => {
    fetchTransactions();
  }, [selectedRange]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://192.168.100.8:3033/api/transactions');
      const data = response.data;

      const now = new Date();
      const filtered = data.filter(tx => {
        const txDate = new Date(tx.date);
        if (tx.validity !== selectedRange) return false;

        if (selectedRange === "Daily") {
          return txDate.toDateString() === now.toDateString();
        } else if (selectedRange === "Weekly") {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return txDate >= startOfWeek && txDate <= endOfWeek;
        } else if (selectedRange === "Monthly") {
          return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        }

        return false;
      });

      setTransactions(filtered);
      calculateTotals(filtered);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setIsLoading(false);
    }
  };

  const calculateTotals = (txs) => {
    let totalIncome = 0, totalExpense = 0;
    const catTotals = {};

    txs.forEach(tx => {
      const amt = parseFloat(tx.amount);
      if (tx.transaction_type === "Income") {
        totalIncome += amt;
      } else if (tx.transaction_type === "Expense") {
        totalExpense += amt;
        catTotals[tx.category] = (catTotals[tx.category] || 0) + amt;
      }
    });

    setIncome(totalIncome);
    setExpense(totalExpense);
    setBalance(totalIncome - totalExpense);
    setCategoryTotals(catTotals);

    generateSuggestion(totalExpense, totalIncome);
  };

  const generateSuggestion = (spent, earned) => {
    const remaining = earned - spent;
    let message = "";

    if (remaining < 0) {
      message = `You are over budget by PKR ${Math.abs(remaining)}. Consider reducing expenses.`;
    } else if (remaining === 0) {
      message = "You’ve used your entire budget.";
    } else {
      message = `Great! You still have PKR ${remaining} remaining.`;
    }

    setSuggestion(message);
    Speech.speak(message);
  };

  const buildLineChartData = () => {
    if (!transactions.length) {
      // Return empty but valid structure if no transactions
      return {
        labels: [],
        datasets: [],
        legend: [],
      };
    }

    const grouped = groupBy(transactions, tx => new Date(tx.date).toISOString().split("T")[0]);
    const categories = [...new Set(transactions.map(tx => tx.category))];
    const dates = Object.keys(grouped).sort();

    const datasets = categories.map((cat, idx) => {
      const color = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"][idx % 6];
      return {
        data: dates.map(date =>
          (grouped[date] || []).filter(tx => tx.category === cat && tx.transaction_type === "Expense")
            .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
        ),
        color: () => color,
        strokeWidth: 2,
      };
    });

    return {
      labels: dates,
      datasets,
      legend: categories,
    };
  };

  const lineChartData = buildLineChartData();

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#555"
    }
  };

  if (isLoading) return <Text style={styles.loading}>Loading data...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Spending Suggestions</Text>

      <View style={styles.filterRow}>
        {["Daily", "Weekly", "Monthly"].map(range => (
          <TouchableOpacity
            key={range}
            onPress={() => setSelectedRange(range)}
            style={[
              styles.filterButton,
              selectedRange === range && styles.activeFilterButton
            ]}
          >
            <Text style={[
              styles.filterText,
              selectedRange === range && styles.activeFilterText
            ]}>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Line Chart */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Category-wise Expense Trends</Text>
        <ScrollView horizontal>
          {lineChartData.datasets.length > 0 && lineChartData.labels.length > 0 ? (
            <LineChart
              data={lineChartData}
              width={Math.max(screenWidth, lineChartData.labels.length * 60)}
              height={260}
              chartConfig={chartConfig}
              bezier
              style={{ marginRight: 10, borderRadius: 12 }}
            />
          ) : (
            <Text style={{ padding: 20, color: "#666" }}>No expense data available for the selected range.</Text>
          )}
        </ScrollView>
      </View>

      {/* Pie Summary */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text>Income: {income} PKR</Text>
        <Text>Expenses: {expense} PKR</Text>
        <Text>Remaining: {balance} PKR</Text>
      </View>

      {/* Category Totals */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Total by Category</Text>
        {Object.entries(categoryTotals).length > 0 ? (
          Object.entries(categoryTotals).map(([cat, amt]) => (
            <Text key={cat} style={styles.milestone}>{cat}: {amt} PKR</Text>
          ))
        ) : (
          <Text>No expenses categorized yet.</Text>
        )}
      </View>

      {/* Suggestion Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Suggestion</Text>
        <Text style={styles.suggestion}>{suggestion}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => Speech.speak(suggestion)}>
          <Text style={styles.btnText}>🔊 Speak</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  card: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 15,
    padding: 20,
    backgroundColor: "#f9f9f9",
    marginVertical: 10,
    elevation: 3,
    shadowColor: "blue",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 9,
  },
  filterRow: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
borderColor: "#999",
marginHorizontal: 5,
},
activeFilterButton: {
backgroundColor: "#007AFF",
borderColor: "#007AFF",
},
filterText: { fontSize: 14, color: "#555" },
activeFilterText: { color: "#fff" },
milestone: { marginVertical: 3, fontWeight: "bold" },
suggestion: { fontSize: 16, marginVertical: 10 },
btn: {
backgroundColor: "#007AFF",
paddingVertical: 10,
borderRadius: 8,
alignItems: "center",
},
btnText: { color: "#fff", fontWeight: "bold" },
loading: { flex: 1, textAlign: "center", marginTop: 40, fontSize: 18 },
});

export default PastSpendingSuggestion;