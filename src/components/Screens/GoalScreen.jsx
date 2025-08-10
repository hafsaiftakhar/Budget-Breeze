import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Button,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import * as Speech from "expo-speech";
import { LanguageContext } from "./LanguageContext"; 
import { CurrencyContext } from "./CurrencyContext"; // ✅ imported
import { useAccessibility } from './AccessibilityContext';  // accessibility context ka path check karo



const API_URL = "http://192.168.100.8:3033/api";

// Translation strings
const translations = {
  en: {
    myGoals: "My Financial Goals",
    totalBalance: "Total Balance",
    target: "Target",
    saved: "Saved",
    deadline: "Deadline",
    goalAchieved: "🎉 Goal Achieved!",
    edit: "Edit",
    delete: "Delete",
    addToProgress: "➕ Add to Progress",
    createNewGoal: "+ Create New Goal",
    addEditGoal: "Add/Edit Goal",
    goalName: "Goal Name",
    targetAmount: "Target Amount",
    currentProgress: "Current Progress",
    deadlinePlaceholder: "Deadline (e.g., 2025-12-31)",
    save: "Save",
    cancel: "Cancel",
    addToProgressTitle: "Add to Progress",
    enterAmount: "Enter amount to add",
    add: "Add",
    pleaseFillAllFields: "Please fill in all fields",
    invalidAmount: "Invalid amount. Enter a valid amount.",
    insufficientBalance: "Insufficient Balance. Not enough balance.",
    goalUpdated: "Goal updated successfully.",
    newGoalAdded: "New goal added successfully.",
    goalDeleted: "Goal deleted.",
    editGoalButtonPressed: "Edit goal button pressed.",
    deleteGoalButtonPressed: "Delete goal button pressed.",
    addProgressButtonPressed: "Add progress button pressed.",
    createGoalButtonPressed: "Create new goal button pressed.",
    cancelled: "Cancelled adding or editing goal.",
    cancelledProgress: "Cancelled adding progress.",
    progressAdded: "Progress added to goal.",
    congratulationsGoalAchieved: "Congratulations! Goal achieved.",
  },
  ur: {
    myGoals: "میرے مالی اہداف",
    totalBalance: "کل بیلنس",
    target: "ہدف",
    saved: "محفوظ کیا گیا",
    deadline: "آخری تاریخ",
    goalAchieved: "🎉 ہدف حاصل کر لیا!",
    edit: "ترمیم کریں",
    delete: "حذف کریں",
    addToProgress: "➕ ترقی میں اضافہ کریں",
    createNewGoal: "+ نیا ہدف بنائیں",
    addEditGoal: "ہدف شامل/ترمیم کریں",
    goalName: "ہدف کا نام",
    targetAmount: "ہدف کی رقم",
    currentProgress: "موجودہ پیش رفت",
    deadlinePlaceholder: "آخری تاریخ (مثلاً، 2025-12-31)",
    save: "محفوظ کریں",
    cancel: "منسوخ کریں",
    addToProgressTitle: "پیش رفت میں اضافہ کریں",
    enterAmount: "شامل کرنے کی رقم درج کریں",
    add: "شامل کریں",
    pleaseFillAllFields: "براہ کرم تمام فیلڈز بھریں",
    invalidAmount: "غلط رقم۔ درست رقم درج کریں۔",
    insufficientBalance: "بیلنس ناکافی ہے۔ کافی بیلنس نہیں ہے۔",
    goalUpdated: "ہدف کامیابی سے اپ ڈیٹ ہو گیا۔",
    newGoalAdded: "نیا ہدف کامیابی سے شامل ہو گیا۔",
    goalDeleted: "ہدف حذف کر دیا گیا۔",
    editGoalButtonPressed: "ہدف ترمیم کے بٹن پر کلک کیا گیا۔",
    deleteGoalButtonPressed: "ہدف حذف کرنے کے بٹن پر کلک کیا گیا۔",
    addProgressButtonPressed: "پیش رفت میں اضافہ کے بٹن پر کلک کیا گیا۔",
    createGoalButtonPressed: "نیا ہدف بنانے کے بٹن پر کلک کیا گیا۔",
    cancelled: "ہدف شامل یا ترمیم کرنا منسوخ کر دیا گیا۔",
    cancelledProgress: "پیش رفت شامل کرنا منسوخ کر دیا گیا۔",
    progressAdded: "ہدف میں پیش رفت شامل کی گئی۔",
    congratulationsGoalAchieved: "مبارک ہو! ہدف حاصل ہو گیا۔",
  },
  ar: {
    myGoals: "أهدافي المالية",
    totalBalance: "الرصيد الكلي",
    target: "الهدف",
    saved: "المحفوظ",
    deadline: "الموعد النهائي",
    goalAchieved: "🎉 تم تحقيق الهدف!",
    edit: "تعديل",
    delete: "حذف",
    addToProgress: "➕ إضافة إلى التقدم",
    createNewGoal: "+ إنشاء هدف جديد",
    addEditGoal: "إضافة/تعديل هدف",
    goalName: "اسم الهدف",
    targetAmount: "المبلغ المستهدف",
    currentProgress: "التقدم الحالي",
    deadlinePlaceholder: "الموعد النهائي (مثال: 2025-12-31)",
    save: "حفظ",
    cancel: "إلغاء",
    addToProgressTitle: "إضافة إلى التقدم",
    enterAmount: "أدخل المبلغ المراد إضافته",
    add: "إضافة",
    pleaseFillAllFields: "يرجى ملء جميع الحقول",
    invalidAmount: "مبلغ غير صالح. يرجى إدخال مبلغ صحيح.",
    insufficientBalance: "الرصيد غير كافٍ. الرصيد غير كافٍ.",
    goalUpdated: "تم تحديث الهدف بنجاح.",
    newGoalAdded: "تم إضافة هدف جديد بنجاح.",
    goalDeleted: "تم حذف الهدف.",
    editGoalButtonPressed: "تم الضغط على زر تعديل الهدف.",
    deleteGoalButtonPressed: "تم الضغط على زر حذف الهدف.",
    addProgressButtonPressed: "تم الضغط على زر إضافة التقدم.",
    createGoalButtonPressed: "تم الضغط على زر إنشاء هدف جديد.",
    cancelled: "تم إلغاء إضافة أو تعديل الهدف.",
    cancelledProgress: "تم إلغاء إضافة التقدم.",
    progressAdded: "تم إضافة التقدم إلى الهدف.",
    congratulationsGoalAchieved: "تهانينا! تم تحقيق الهدف.",
  },
  fr: {
    myGoals: "Mes objectifs financiers",
    totalBalance: "Solde total",
    target: "Objectif",
    saved: "Économisé",
    deadline: "Date limite",
    goalAchieved: "🎉 Objectif atteint !",
    edit: "Modifier",
    delete: "Supprimer",
    addToProgress: "➕ Ajouter à la progression",
    createNewGoal: "+ Créer un nouvel objectif",
    addEditGoal: "Ajouter/Modifier un objectif",
    goalName: "Nom de l'objectif",
    targetAmount: "Montant cible",
    currentProgress: "Progression actuelle",
    deadlinePlaceholder: "Date limite (ex. : 2025-12-31)",
    save: "Enregistrer",
    cancel: "Annuler",
    addToProgressTitle: "Ajouter à la progression",
    enterAmount: "Entrez le montant à ajouter",
    add: "Ajouter",
    pleaseFillAllFields: "Veuillez remplir tous les champs",
    invalidAmount: "Montant invalide. Entrez un montant valide.",
    insufficientBalance: "Solde insuffisant. Solde insuffisant.",
    goalUpdated: "Objectif mis à jour avec succès.",
    newGoalAdded: "Nouvel objectif ajouté avec succès.",
    goalDeleted: "Objectif supprimé.",
    editGoalButtonPressed: "Bouton de modification d'objectif pressé.",
    deleteGoalButtonPressed: "Bouton de suppression d'objectif pressé.",
    addProgressButtonPressed: "Bouton d'ajout de progression pressé.",
    createGoalButtonPressed: "Bouton de création de nouvel objectif pressé.",
    cancelled: "Ajout ou modification de l'objectif annulé.",
    cancelledProgress: "Ajout de la progression annulé.",
    progressAdded: "Progression ajoutée à l'objectif.",
    congratulationsGoalAchieved: "Félicitations ! Objectif atteint.",
  },
  es: {
    myGoals: "Mis metas financieras",
    totalBalance: "Balance total",
    target: "Objetivo",
    saved: "Guardado",
    deadline: "Fecha límite",
    goalAchieved: "🎉 ¡Meta alcanzada!",
    edit: "Editar",
    delete: "Eliminar",
    addToProgress: "➕ Agregar al progreso",
    createNewGoal: "+ Crear nueva meta",
    addEditGoal: "Agregar/Editar meta",
    goalName: "Nombre de la meta",
    targetAmount: "Monto objetivo",
    currentProgress: "Progreso actual",
    deadlinePlaceholder: "Fecha límite (ej.: 2025-12-31)",
    save: "Guardar",
    cancel: "Cancelar",
    addToProgressTitle: "Agregar al progreso",
    enterAmount: "Ingrese el monto a agregar",
    add: "Agregar",
    pleaseFillAllFields: "Por favor complete todos los campos",
    invalidAmount: "Monto inválido. Ingrese un monto válido.",
    insufficientBalance: "Saldo insuficiente. Saldo insuficiente.",
    goalUpdated: "Meta actualizada con éxito.",
    newGoalAdded: "Nueva meta agregada con éxito.",
    goalDeleted: "Meta eliminada.",
    editGoalButtonPressed: "Botón de editar meta presionado.",
    deleteGoalButtonPressed: "Botón de eliminar meta presionado.",
    addProgressButtonPressed: "Botón de agregar progreso presionado.",
    createGoalButtonPressed: "Botón de crear nueva meta presionado.",
    cancelled: "Cancelado agregar o editar meta.",
    cancelledProgress: "Cancelado agregar progreso.",
    progressAdded: "Progreso agregado a la meta.",
    congratulationsGoalAchieved: "¡Felicidades! Meta alcanzada.",
  },
};




const GoalScreen = () => {
  const { language } = useContext(LanguageContext);
  const { currency } = useContext(CurrencyContext);
    const { accessibilityMode, setAccessibilityMode } = useAccessibility();
  

  const t = translations[language] || translations.en;

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

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API_URL}/goals`);
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error("Error fetching goals:", err);
    }
  };

  const fetchTotalBalance = async () => {
    try {
      const response = await fetch("http://192.168.100.8:3033/transactions");
      const transactions = await response.json();
      if (!Array.isArray(transactions)) return;

      let totalIncome = 0;
      let totalExpense = 0;

      const currentMonth = new Date().toISOString().slice(0, 7);
      const filteredTransactions = transactions.filter((item) =>
        item.date.startsWith(currentMonth)
      );

      filteredTransactions.forEach((item) => {
        const amount = parseFloat(item.amount) || 0;
        if (item.type?.toLowerCase() === "income") totalIncome += amount;
        else if (item.type?.toLowerCase() === "expense") totalExpense += amount;
      });

      setTotalBalance(totalIncome - totalExpense);
    } catch (error) {
      console.error("Failed to fetch total balance:", error);
      setTotalBalance(0);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchTotalBalance();
  }, []);

  const speak = (text) => {
    Speech.speak(text, {
      language: language === "ur" ? "ur-PK" : "en-US",
      pitch: 1,
      rate: 1,
    });
  };

  const resetForm = () => {
    setGoalName("");
    setTargetAmount("");
    setCurrentProgress("");
    setDeadline("");
    setModalVisible(false);
    setEditingGoal(null);
  };

  const addGoal = async () => {
    if (!goalName || !targetAmount || !currentProgress || !deadline) {
      Alert.alert(t.pleaseFillAllFields);
      return;
    }

    const target = parseFloat(targetAmount);
    const current = parseFloat(currentProgress);
    const achieved = current >= target;

    const goalData = {
      name: goalName,
      targetAmount: target,
      currentProgress: current,
      deadline,
      achieved,
    };

    try {
      let res;
      if (editingGoal) {
        res = await fetch(`${API_URL}/goals/${editingGoal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goalData),
        });
      } else {
        res = await fetch(`${API_URL}/goals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goalData),
        });
      }

      const savedGoal = await res.json();
      if (editingGoal) {
        setGoals(goals.map((g) => (g.id === savedGoal.id ? savedGoal : g)));
        speak(t.goalUpdated);
      } else {
        setGoals([...goals, savedGoal]);
        speak(t.newGoalAdded);
      }

      resetForm();
      fetchTotalBalance();
    } catch (err) {
      console.error("Error saving goal:", err);
      Toast.show({
        type: "error",
        text1: t.goalUpdated,
        text2: "Failed to save goal.",
      });
    }
  };

  const editGoal = (goal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentProgress(goal.currentProgress.toString());
    setDeadline(goal.deadline);
    setModalVisible(true);
    speak(t.editGoalButtonPressed);
  };

  const deleteGoal = async (goalId) => {
    try {
      await fetch(`${API_URL}/goals/${goalId}`, { method: "DELETE" });
      setGoals(goals.filter((g) => g.id !== goalId));
      speak(t.goalDeleted);
    } catch (err) {
      console.error("Error deleting goal:", err);
      Toast.show({ type: "error", text1: "Failed to delete goal." });
    }
  };

  const updateGoalProgress = async (goalId, amountToAdd) => {
    const parsedAmount = parseFloat(amountToAdd);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Toast.show({ type: "error", text1: t.invalidAmount });
      return;
    }

    if (parsedAmount > totalBalance) {
      Toast.show({ type: "error", text1: t.insufficientBalance });
      return;
    }

    const goal = goals.find((g) => g.id === goalId);
    if (!goal) {
      Toast.show({ type: "error", text1: "Goal not found" });
      return;
    }

    const newProgress = goal.currentProgress + parsedAmount;
    const achieved = newProgress >= goal.targetAmount;

    const updatedGoalData = {
      ...goal,
      currentProgress: newProgress,
      achieved,
    };

    try {
      const res = await fetch(`${API_URL}/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedGoalData),
      });

      if (!res.ok) throw new Error("Failed to update goal");

      const updatedGoal = await res.json();

      setGoals(goals.map((g) => (g.id === goalId ? updatedGoal : g)));
      setAddProgressModalVisible(false);
      setProgressAmount("");
      speak(achieved ? t.congratulationsGoalAchieved : t.progressAdded);
      fetchTotalBalance();
    } catch (err) {
      console.error("Error updating goal progress:", err);
      Toast.show({ type: "error", text1: "Failed to update goal progress." });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t.myGoals}</Text>
      <Text style={styles.balance}>
        {t.totalBalance}: {currency.symbol}{(totalBalance * currency.rate).toFixed(2)}
      </Text>

      <FlatList
        data={goals}
        renderItem={({ item }) => (
          <View style={styles.goalCard}>
            <Text style={styles.goalName}>{item.name}</Text>
            <Text>
              {t.target}: {currency.symbol}{(item.targetAmount * currency.rate).toFixed(2)}
            </Text>
            <Text>
              {t.saved}: {currency.symbol}{(item.currentProgress * currency.rate).toFixed(2)}
            </Text>
            <Text>
  {t.deadline}: {item.deadline ? item.deadline.toString() : ''}
</Text>

            {item.achieved && (
              <Text style={styles.achievedText}>{t.goalAchieved}</Text>
            )}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editGoal(item)}
              >
                <Text style={styles.buttonText}>{t.edit}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteGoal(item.id)}
              >
                <Text style={styles.buttonText}>{t.delete}</Text>
              </TouchableOpacity>
            </View>
            {!item.achieved && (
              <TouchableOpacity
                style={styles.addProgressButton}
                onPress={() => {
                  setSelectedGoalId(item.id);
                  setAddProgressModalVisible(true);
                  speak(t.addProgressButtonPressed);
                }}
              >
                <Text style={styles.buttonText}>{t.addToProgress}</Text>
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
          speak(t.createGoalButtonPressed);
        }}
      >
        <Text style={styles.addGoalButtonText}>{t.createNewGoal}</Text>
      </TouchableOpacity>

      {/* Add/Edit Goal Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{t.addEditGoal}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.goalName}
            value={goalName}
            onChangeText={setGoalName}
          />
          <TextInput
            style={styles.input}
            placeholder={`${t.targetAmount} (${currency.symbol})`}
            value={targetAmount}
            keyboardType="numeric"
            onChangeText={setTargetAmount}
          />
          <TextInput
            style={styles.input}
            placeholder={`${t.currentProgress} (${currency.symbol})`}
            value={currentProgress}
            keyboardType="numeric"
            onChangeText={setCurrentProgress}
          />
          <TextInput
            style={styles.input}
            placeholder={t.deadlinePlaceholder}
            value={deadline}
            onChangeText={setDeadline}
          />
          <View style={styles.modalButtonRow}>
            <Button title={t.save} onPress={addGoal} />
            <Button
              title={t.cancel}
              onPress={() => {
                setModalVisible(false);
                resetForm();
                speak(t.cancelled);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Add Progress Modal */}
      <Modal visible={addProgressModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{t.addToProgressTitle}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.enterAmount}
            value={progressAmount}
            keyboardType="numeric"
            onChangeText={setProgressAmount}
          />
          <View style={styles.modalButtonRow}>
            <Button
              title={t.add}
              onPress={() => {
                if (!selectedGoalId) return;
                updateGoalProgress(selectedGoalId, progressAmount);
              }}
            />
            <Button
              title={t.cancel}
              onPress={() => {
                setAddProgressModalVisible(false);
                setProgressAmount("");
                speak(t.cancelledProgress);
              }}
            />
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10, alignSelf: "center" },
  balance: { fontSize: 18, marginBottom: 20, alignSelf: "center" },
  goalCard: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  goalName: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  achievedText: { color: "green", fontWeight: "bold", marginTop: 6 },
buttonRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 10,
  alignItems: "center",
},
editButton: {
  backgroundColor: "#4caf50",
  paddingVertical: 8, // slightly increased
  paddingHorizontal: 16, // slightly increased
  borderRadius: 5,
  alignItems: "center",
},

deleteButton: {
  backgroundColor: "#f44336",
  paddingVertical: 8, // slightly increased
  paddingHorizontal: 16, // slightly increased
  borderRadius: 5,
  alignItems: "center",
},



  addProgressButton: {
    marginTop: 10,
    backgroundColor: "#2196f3",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  addGoalButton: {
    backgroundColor: "#ff9800",
    padding: 12,
    borderRadius: 25,
    position: "absolute",
    bottom: 30,
    right: 30,
  },
  addGoalButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 15, alignSelf: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export default GoalScreen;
  