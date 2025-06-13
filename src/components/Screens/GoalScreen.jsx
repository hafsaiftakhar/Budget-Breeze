import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Button,
} from "react-native";
import Toast from "react-native-toast-message";
import * as Speech from "expo-speech";

const API_URL = "http://192.168.100.8:3033/api";

const GoalScreen = () => {
  const [goals, setGoals] = useState([]);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentProgress, setCurrentProgress] = useState("");
  const [deadline, setDeadline] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [totalBalance, setTotalBalance] = useState(0);
  const [addProgressModalVisible, setAddProgressModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [progressAmount, setProgressAmount] = useState("");

  // Fetch total balance from transactions
  const fetchTotalBalance = async () => {
    try {
      const response = await fetch(`${API_URL}/transactions`);
      const transactions = await response.json();

      if (!Array.isArray(transactions)) return;

      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach((item) => {
        const amount = parseFloat(item.amount) || 0;
        if (item.transaction_type === "Income") {
          totalIncome += amount;
        } else if (item.transaction_type === "Expense") {
          totalExpense += amount;
        }
      });

      const balance = totalIncome - totalExpense;
      setTotalBalance(balance);
    } catch (error) {
      console.error("Failed to fetch total balance:", error);
      setTotalBalance(0);
    }
  };

  // Fetch all goals from API
  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API_URL}/goals`);
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error("Error fetching goals:", err);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchTotalBalance();
  }, []);

  // Reset form and modal state
  const resetForm = () => {
    setGoalName("");
    setTargetAmount("");
    setCurrentProgress("");
    setDeadline("");
    setModalVisible(false);
    setEditingGoal(null);
  };

  // Text to speech helper
  const speak = (text) => {
    Speech.speak(text, {
      language: "en",
      pitch: 1,
      rate: 1,
    });
  };

  // Add or update goal
  const addGoal = async () => {
    if (!goalName || !targetAmount || !currentProgress || !deadline) {
      alert("Please fill in all fields");
      return;
    }

    const goalData = {
      name: goalName,
      targetAmount: parseFloat(targetAmount),
      currentProgress: parseFloat(currentProgress),
      deadline,
      achieved: parseFloat(currentProgress) >= parseFloat(targetAmount),
    };

    try {
      let res;
      if (editingGoal) {
        // Update existing goal
        res = await fetch(`${API_URL}/goals/${editingGoal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goalData),
        });
      } else {
        // Add new goal
        res = await fetch(`${API_URL}/goals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goalData),
        });
      }

      const savedGoal = await res.json();

      if (editingGoal) {
        setGoals(goals.map((g) => (g.id === savedGoal.id ? savedGoal : g)));
        speak("Goal updated successfully.");
      } else {
        setGoals([...goals, savedGoal]);
        speak("New goal added successfully.");
      }

      resetForm();
      fetchTotalBalance(); // Refresh balance after goal change
    } catch (err) {
      console.error("Error saving goal:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save goal.",
      });
    }
  };

  // Prepare editing modal with selected goal data
  const editGoal = (goal) => {
    setGoalName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentProgress(goal.currentProgress.toString());
    setDeadline(goal.deadline);
    setEditingGoal(goal);
    setModalVisible(true);
    speak("Editing goal.");
  };

  // Delete a goal by id
  const deleteGoal = async (goalId) => {
    try {
      await fetch(`${API_URL}/goals/${goalId}`, {
        method: "DELETE",
      });

      setGoals(goals.filter((goal) => goal.id !== goalId));
      speak("Goal deleted.");
      fetchTotalBalance(); // Refresh balance after deletion
    } catch (err) {
      console.error("Error deleting goal:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete goal.",
      });
    }
  };

  // Update progress on a goal
  const updateGoalProgress = async (goalId, amountToAdd) => {
    const parsedAmount = parseFloat(amountToAdd);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid amount",
        text2: "Enter a valid amount.",
      });
      return;
    }

    if (parsedAmount > totalBalance) {
      Toast.show({
        type: "error",
        text1: "Insufficient Balance",
        text2: "Not enough balance.",
      });
      return;
    }

    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newProgress = goal.currentProgress + parsedAmount;
    const achieved = newProgress >= goal.targetAmount;

    try {
      const res = await fetch(`${API_URL}/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentProgress: newProgress, achieved }),
      });

      const updatedGoal = await res.json();

      setGoals(goals.map((g) => (g.id === goalId ? updatedGoal : g)));
      setTotalBalance(totalBalance - parsedAmount);
      setAddProgressModalVisible(false);
      setProgressAmount("");

      speak(achieved ? "Congratulations! Goal achieved." : "Progress added to goal.");
    } catch (err) {
      console.error("Error updating goal progress:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update goal progress.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Financial Goals</Text>
      <Text style={styles.balance}>Total Balance: ${totalBalance.toFixed(2)}</Text>

      <FlatList
        data={goals}
        renderItem={({ item }) => (
          <View style={styles.goalCard}>
            <Text style={styles.goalName}>{item.name}</Text>
            <Text>Target: ${item.targetAmount.toFixed(2)}</Text>
            <Text>Saved: ${item.currentProgress.toFixed(2)}</Text>
            <Text>Deadline: {item.deadline}</Text>

            {item.achieved && (
              <Text style={styles.achievedText}>🎉 Goal Achieved!</Text>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  editGoal(item);
                  speak("Edit goal button pressed.");
                }}
              >
                <Text style={styles.buttonText}> Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  deleteGoal(item.id);
                  speak("Delete goal button pressed.");
                }}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>

            {!item.achieved && (
              <TouchableOpacity
                style={styles.addProgressButton}
                onPress={() => {
                  setSelectedGoalId(item.id);
                  setAddProgressModalVisible(true);
                  speak("Add progress button pressed.");
                }}
              >
                <Text style={styles.buttonText}>➕ Add to Progress</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />

      <TouchableOpacity
        style={styles.addGoalButton}
        onPress={() => {
          setModalVisible(true);
          speak("Create new goal button pressed.");
        }}
      >
        <Text style={styles.addGoalButtonText}>+ Create New Goal</Text>
      </TouchableOpacity>

      {/* Add/Edit Goal Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add/Edit Goal</Text>

          <TextInput
            style={styles.input}
            placeholder="Goal Name"
            value={goalName}
            onChangeText={setGoalName}
          />
          <TextInput
            style={styles.input}
            placeholder="Target Amount"
            keyboardType="numeric"
            value={targetAmount}
            onChangeText={setTargetAmount}
          />
          <TextInput
            style={styles.input}
            placeholder="Current Progress"
            keyboardType="numeric"
            value={currentProgress}
            onChangeText={setCurrentProgress}
          />
          <TextInput
            style={styles.input}
            placeholder="Deadline (e.g., 2025-12-31)"
            value={deadline}
            onChangeText={setDeadline}
          />

          <View style={styles.modalButtons}>
            <Button title="Save" onPress={addGoal} />
            <Button
              title="Cancel"
              onPress={() => {
                resetForm();
                speak("Cancelled adding or editing goal.");
              }}
              color="red"
            />
          </View>
        </View>
      </Modal>

      {/* Add Progress Modal */}
      <Modal visible={addProgressModalVisible} animationType="slide" transparent>
        <View style={styles.progressModalContainer}>
                    <View style={styles.progressModal}>
            <Text style={styles.modalTitle}>Add to Progress</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter amount to add"
              keyboardType="numeric"
              value={progressAmount}
              onChangeText={setProgressAmount}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Add"
                onPress={() =>
                  updateGoalProgress(selectedGoalId, progressAmount)
                }
              />
              <Button
                title="Cancel"
                color="red"
                onPress={() => {
                  setAddProgressModalVisible(false);
                  setProgressAmount("");
                  speak("Cancelled adding progress.");
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#eaf7f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  balance: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  goalCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  achievedText: {
    color: "green",
    fontWeight: "bold",
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 5,
  },
  addProgressButton: {
    backgroundColor: "#2196F3",
    marginTop: 10,
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  addGoalButton: {
    backgroundColor: "#008080",
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  addGoalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonText: {
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  progressModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  progressModal: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
});

export default GoalScreen;
