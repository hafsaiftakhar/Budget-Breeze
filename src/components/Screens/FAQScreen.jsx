import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const faqsData = [
  {
    id: "1",
    question: "How do I set a new financial goal?",
    answer:
      "Go to the Goals section, tap on 'Add Goal', enter your target amount and deadline, then save to track your progress.",
  },
  {
    id: "2",
    question: "How can I change the app's currency?",
    answer:
      "Navigate to Currency Change in the More Settings menu and select your preferred currency to update all amounts accordingly.",
  },
  {
    id: "3",
    question: "What information does the Dashboard show?",
    answer:
      "The Dashboard provides a summary of your total income, expenses, remaining budget, and visual graphs of your spending habits.",
  },
  {
    id: "4",
    question: "How do I add or edit transactions?",
    answer:
      "Use the Transactions screen to add, edit, or delete expenses and income entries with categories and dates.",
  },
  {
    id: "5",
    question: "How do I change my account password?",
    answer:
      "Go to Change Password in your profile settings, enter your current password, then set and confirm your new password.",
  },
  {
    id: "6",
    question: "How can I enable accessibility features?",
    answer:
      "In Accessibility settings, you can enable voice assistance, large text, and high contrast modes to make the app easier to use.",
  },
  {
    id: "7",
    question: "Can I switch app language?",
    answer:
      "Yes, visit the Language settings in the General section to select your preferred app language.",
  },
  {
    id: "8",
    question: "How do notifications work in the app?",
    answer:
      "Enable notifications in the Notification Settings to receive reminders and alerts about your budgets and goals.",
  },
  {
    id: "9",
    question: "Is my data saved locally or online?",
    answer:
      "Your data is saved locally on your device to ensure privacy and offline access.",
  },
  {
    id: "10",
    question: "How do I contact support if I face issues?",
    answer:
      "Use the 'Send Us Message' button below this FAQ to reach our support team for help.",
  },
];

const FAQItem = ({ item, expanded, onToggle }) => (
  <View>
    <TouchableOpacity style={styles.questionRow} onPress={onToggle}>
      <Text style={styles.questionText}>{item.question}</Text>
      <Icon name={expanded ? "minus" : "plus"} size={24} color="#2a7ded" />
    </TouchableOpacity>
    {expanded && <Text style={styles.answerText}>{item.answer}</Text>}
    <View style={styles.divider} />
  </View>
);

const FAQScreen = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") {
      Alert.alert("Error", "Please enter your message before sending.");
      return;
    }

    try {
      const response = await fetch("http://192.168.100.8:3033/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Thank you!", "Your message has been sent.");
        setMessage("");
        setModalVisible(false);
      } else {
        Alert.alert("Error", data.error || "Failed to send message.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        <Text style={styles.heading}>Frequently Asked Questions</Text>

        <Text style={styles.description}>
          With Budgy, we expect your day's start with better and happier experiences than yesterday. We got you covered for your concerns and issues.
        </Text>

        <FlatList
          data={faqsData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FAQItem
              item={item}
              expanded={expandedId === item.id}
              onToggle={() => toggleExpand(item.id)}
            />
          )}
          scrollEnabled={false}
        />

        <View style={styles.bottomSection}>
          <Text style={styles.helpText}>Still Stuck? Help us identify your problem</Text>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.messageButtonText}>Send Us Message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for sending message */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Send Us a Message</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Write your message here..."
              multiline={true}
              value={message}
              onChangeText={setMessage}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#2a7ded" }]}
                onPress={handleSendMessage}
              >
                <Text style={styles.modalButtonText}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#aaa" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginTop: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
    lineHeight: 20,
  },
  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  questionText: {
    fontSize: 16,
    flex: 1,
    paddingRight: 8,
    color: "#111",
  },
  answerText: {
    fontSize: 14,
    color: "#555",
    paddingVertical: 10,
    paddingLeft: 8,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
  },
  bottomSection: {
    marginTop: 30,
    alignItems: "center",
  },
  helpText: {
    fontSize: 13,
    color: "#999",
    marginBottom: 8,
  },
  messageButton: {
    backgroundColor: "#2a7ded",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  messageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    height: 100,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default FAQScreen;
