import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import { PieChart } from 'react-native-chart-kit';
import axios from 'axios';
import { useAccessibility } from './AccessibilityContext';  // apne path ke mutabiq

const screenWidth = Dimensions.get("window").width;

const PastSpendingSuggestion = () => {
  const { accessibilityMode } = useAccessibility();  // accessibility context
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ... baki code same rahega

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://192.168.100.8:3033/transactions');
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        setTransactions(data);
        calculateTotals(data);
      } else {
        setTransactions([]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setIsLoading(false);
    }
  };

  const calculateTotals = (txs) => {
    let totalIncome = 0;
    let totalExpense = 0;

    txs.forEach(tx => {
      const amt = parseFloat(tx.amount);
      if (!isNaN(amt)) {
        if (tx.type && tx.type.toLowerCase() === 'income') totalIncome += amt;
        else if (tx.type && tx.type.toLowerCase() === 'expense') totalExpense += amt;
      }
    });

    setIncome(totalIncome);
    setExpense(totalExpense);
    setBalance(totalIncome - totalExpense);

    generateSuggestion(totalExpense, totalIncome);
  };

  const generateSuggestion = (spent, incomeBudget) => {
    const remaining = incomeBudget - spent;
    let text = `Your income was ${incomeBudget} PKR, expenses were ${spent} PKR, and remaining budget is ${remaining} PKR.`;

    if (remaining < 0) {
      text += ` You are over budget by ${Math.abs(remaining)} PKR. Try reducing your expenses.`;
    } else if (remaining === 0) {
      text += " You've perfectly used your budget. Great job!";
    } else {
      text += " Keep it up!";
    }

    setSuggestion(text);
    if (accessibilityMode) {
      Speech.speak(text);
    }
  };

  if (isLoading) {
    return <Text>Loading transactions...</Text>;
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Past Spending Suggestion</Text>
        <Text style={styles.suggestion}>No transaction data available.</Text>
      </View>
    );
  }

  const totalBudget = income + expense;
  const incomePercentage = totalBudget ? ((income / totalBudget) * 100).toFixed(1) : 0;
  const expensePercentage = totalBudget ? ((expense / totalBudget) * 100).toFixed(1) : 0;
  const remainingBudget = income - expense;
  const remainingPercentage = totalBudget ? ((remainingBudget / totalBudget) * 100).toFixed(1) : 0;

  const chartData = [
    {
      name: `Income (${incomePercentage}%)`,
      amount: income,
      color: "#33FF57",
      legendFontColor: "#000",
      legendFontSize: 15
    },
    {
      name: `Expenses (${expensePercentage}%)`,
      amount: expense,
      color: "#FF5733",
      legendFontColor: "#000",
      legendFontSize: 15
    },
    {
      name: `Remaining (${remainingPercentage}%)`,
      amount: remainingBudget,
      color: "#3399FF",
      legendFontColor: "#000",
      legendFontSize: 15
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Past Spending Suggestion</Text>

      <PieChart
        data={chartData}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            marginVertical: 10
          }
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="35"
      />

      <Text style={styles.suggestion}>{suggestion}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (accessibilityMode) {
            Speech.speak(suggestion);
          }
        }}
      >
        <Text style={styles.buttonText}>Read Suggestion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // aapka styles unchanged hain
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  suggestion: {
    fontSize: 16,
    color: "#333",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    marginTop: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default PastSpendingSuggestion;
