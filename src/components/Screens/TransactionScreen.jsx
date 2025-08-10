import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { LanguageContext } from "./LanguageContext";
import { CurrencyContext } from './CurrencyContext'; 
import { useAccessibility } from './AccessibilityContext';  // accessibility context ka path check karo
import * as Speech from 'expo-speech';






const translations = {
  en: {
    transactionType: "Transaction Type",
    income: "Income",
    expense: "Expense",
    enterAmount: "Enter Amount",
    selectCategory: "Select Category",
    saveTransaction: "Save Transaction",
    updateTransaction: "Update Transaction",
    newCategory: "New",
    pleaseFill: "Please enter amount and select a category",
    addNewCategoryTitle: "Add New Category",
    addButton: "Add",
    cancelButton: "Cancel",
    salary: "Salary",
    freelance: "Freelance",
    bonus: "Bonus",
    business: "Business",
    interest: "Interest",
    rentalIncome: "Rental Income",
    dividends: "Dividends",
    savings: "Savings",
    loan: "Loan",
    pension: "Pension",
    insuranceClaim: "Insurance Claim",
    other: "Other",
    food: "Food",
    home: "Home",
    health: "Health",
    education: "Education",
    shopping: "Shopping",
    grocery: "Grocery",
    friendsOuting: "Friends Outing",
    travel: "Travel",
    entertainment: "Entertainment",
    utilities: "Utilities",
    beauty: "Beauty",
    mobilePhone: "Mobile Phone",
    tax: "Tax",
    electronics: "Electronics",
  },
  ur: {
    transactionType: "ٹرانزیکشن کی قسم",
    income: "آمدنی",
    expense: "اخراجات",
    enterAmount: "رقم درج کریں",
    selectCategory: "زمرہ منتخب کریں",
    saveTransaction: "ٹرانزیکشن محفوظ کریں",
    updateTransaction: "ٹرانزیکشن اپ ڈیٹ کریں",
    newCategory: "نیا",
    pleaseFill: "براہ کرم رقم درج کریں اور زمرہ منتخب کریں",
    addNewCategoryTitle: "نیا زمرہ شامل کریں",
    addButton: "شامل کریں",
    cancelButton: "منسوخ کریں",
    salary: "تنخواہ",
    freelance: "فری لانس",
    bonus: "بونس",
    business: "کاروبار",
    interest: "سود",
    rentalIncome: "کرایہ آمدنی",
    dividends: "منافع",
    savings: "بچت",
    loan: "قرض",
    pension: "پنشن",
    insuranceClaim: "انشورنس کلیم",
    other: "دیگر",
    food: "خوراک",
    home: "گھر",
    health: "صحت",
    education: "تعلیم",
    shopping: "خریداری",
    grocery: "کریانہ",
    friendsOuting: "دوستی کی محفل",
    travel: "سفر",
    entertainment: "تفریح",
    utilities: "یوٹیلیٹیز",
    beauty: "خوبصورتی",
    mobilePhone: "موبائل فون",
    tax: "ٹیکس",
    electronics: "الیکٹرانکس",
  },
  ar: {
    transactionType: "نوع المعاملة",
    income: "الدخل",
    expense: "المصروفات",
    enterAmount: "أدخل المبلغ",
    selectCategory: "اختر الفئة",
    saveTransaction: "حفظ المعاملة",
    updateTransaction: "تحديث المعاملة",
    newCategory: "جديد",
    pleaseFill: "يرجى إدخال المبلغ واختيار الفئة",
    addNewCategoryTitle: "إضافة فئة جديدة",
    addButton: "إضافة",
    cancelButton: "إلغاء",
    salary: "الراتب",
    freelance: "عمل حر",
    bonus: "مكافأة",
    business: "الأعمال",
    interest: "الفائدة",
    rentalIncome: "دخل الإيجار",
    dividends: "الأرباح الموزعة",
    savings: "المدخرات",
    loan: "قرض",
    pension: "معاش",
    insuranceClaim: "مطالبة التأمين",
    other: "أخرى",
    food: "طعام",
    home: "منزل",
    health: "صحة",
    education: "تعليم",
    shopping: "تسوق",
    grocery: "بقالة",
    friendsOuting: "نزهة مع الأصدقاء",
    travel: "سفر",
    entertainment: "ترفيه",
    utilities: "مرافق",
    beauty: "جمال",
    mobilePhone: "هاتف محمول",
    tax: "ضريبة",
    electronics: "إلكترونيات",
  },
  fr: {
    transactionType: "Type de transaction",
    income: "Revenu",
    expense: "Dépense",
    enterAmount: "Entrer le montant",
    selectCategory: "Sélectionner une catégorie",
    saveTransaction: "Enregistrer la transaction",
    updateTransaction: "Mettre à jour la transaction",
    newCategory: "Nouveau",
    pleaseFill: "Veuillez entrer un montant et sélectionner une catégorie",
    addNewCategoryTitle: "Ajouter une nouvelle catégorie",
    addButton: "Ajouter",
    cancelButton: "Annuler",
    salary: "Salaire",
    freelance: "Freelance",
    bonus: "Prime",
    business: "Affaires",
    interest: "Intérêt",
    rentalIncome: "Revenu locatif",
    dividends: "Dividendes",
    savings: "Économies",
    loan: "Prêt",
    pension: "Pension",
    insuranceClaim: "Réclamation d'assurance",
    other: "Autre",
    food: "Nourriture",
    home: "Maison",
    health: "Santé",
    education: "Éducation",
    shopping: "Shopping",
    grocery: "Épicerie",
    friendsOuting: "Sortie entre amis",
    travel: "Voyage",
    entertainment: "Divertissement",
    utilities: "Services publics",
    beauty: "Beauté",
    mobilePhone: "Téléphone portable",
    tax: "Impôt",
    electronics: "Électronique",
  },
  es: {
    transactionType: "Tipo de transacción",
    income: "Ingresos",
    expense: "Gastos",
    enterAmount: "Ingresar cantidad",
    selectCategory: "Seleccionar categoría",
    saveTransaction: "Guardar transacción",
    updateTransaction: "Actualizar transacción",
    newCategory: "Nuevo",
    pleaseFill: "Por favor ingrese la cantidad y seleccione una categoría",
    addNewCategoryTitle: "Agregar nueva categoría",
    addButton: "Agregar",
    cancelButton: "Cancelar",
    salary: "Salario",
    freelance: "Freelance",
    bonus: "Bono",
    business: "Negocio",
    interest: "Interés",
    rentalIncome: "Ingresos por alquiler",
    dividends: "Dividendos",
    savings: "Ahorros",
    loan: "Préstamo",
    pension: "Pensión",
    insuranceClaim: "Reclamo de seguro",
    other: "Otro",
    food: "Comida",
    home: "Hogar",
    health: "Salud",
    education: "Educación",
    shopping: "Compras",
    grocery: "Abarrotes",
    friendsOuting: "Salida con amigos",
    travel: "Viajar",
    entertainment: "Entretenimiento",
    utilities: "Servicios públicos",
    beauty: "Belleza",
    mobilePhone: "Teléfono móvil",
    tax: "Impuesto",
    electronics: "Electrónica",
  }
};

const initialCategories = {
  income: [
    { icon: 'cash-outline', key: 'salary' },
    { icon: 'card-outline', key: 'freelance' },
    { icon: 'wallet-outline', key: 'bonus' },
    { icon: 'business-outline', key: 'business' },
    { icon: 'trending-up-outline', key: 'interest' },
    { icon: 'home-outline', key: 'rentalIncome' },
    { icon: 'stats-chart-outline', key: 'dividends' },
    { icon: 'save-outline', key: 'savings' },
    { icon: 'cash-outline', key: 'loan' },
    { icon: 'people-outline', key: 'pension' },
    { icon: 'medkit-outline', key: 'insuranceClaim' },
    { icon: 'ellipsis-horizontal-outline', key: 'other' },
  ],
  expense: [
    { icon: 'fast-food-outline', key: 'food' },
    { icon: 'home-outline', key: 'home' },
    { icon: 'heart-outline', key: 'health' },
    { icon: 'school-outline', key: 'education' },
    { icon: 'cart-outline', key: 'shopping' },
    { icon: 'bag-check-outline', key: 'grocery' },
    { icon: 'people-outline', key: 'friendsOuting' },
    { icon: 'airplane-outline', key: 'travel' },
    { icon: 'tv-outline', key: 'entertainment' },
    { icon: 'water-outline', key: 'utilities' },
    { icon: 'color-palette-outline', key: 'beauty' },
    { icon: 'phone-portrait-outline', key: 'mobilePhone' },
    { icon: 'cash-outline', key: 'tax' },
    { icon: 'laptop-outline', key: 'electronics' },
    { icon: 'ellipsis-horizontal-outline', key: 'other' },
  ],
};

export default function TransactionScreen() {
  const { language } = useContext(LanguageContext);
  const { currency } = useContext(CurrencyContext);
   const { accessibilityMode } = useAccessibility();
  const t = translations[language] || translations.en;

  const route = useRoute();
  const editTransaction = route.params;

  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categories, setCategories] = useState({ income: [], expense: [] });


  // Update categories when language changes
  useEffect(() => {
    const translatedCategories = {
      income: initialCategories.income.map(cat => ({
        icon: cat.icon,
        key: cat.key,
        label: t[cat.key] || cat.key,
      })),
      expense: initialCategories.expense.map(cat => ({
        icon: cat.icon,
        key: cat.key,
        label: t[cat.key] || cat.key,
      })),
    };
    setCategories(translatedCategories);
  }, [language]);

  // Prefill fields on edit
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type || 'income');
      setAmount(String(editTransaction.amount));
      setSelectedCategory(editTransaction.category);
    }
  }, [editTransaction]);



const saveTransaction = async () => {
  if (!amount || !selectedCategory) {
    alert(t.pleaseFill);
    return;
  }

  const transactionData = {
    type,
    amount: parseFloat(amount),
    category: selectedCategory,
  };

  try {
    const baseUrl = 'http://192.168.100.8:3033/transactions';
    let url = baseUrl;
    const method = editTransaction && editTransaction.id ? 'PUT' : 'POST';

    if (editTransaction && editTransaction.id) {
      url = `${baseUrl}/${editTransaction.id}`;
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`✅ Transaction ${editTransaction ? t.updateTransaction : t.saveTransaction} successfully!`);

      if (accessibilityMode) {
        Speech.speak(
          `Transaction ${editTransaction ? t.updateTransaction : t.saveTransaction} successfully!`,
          { language }
        );
      }

      setAmount('');
      setSelectedCategory(null);

    } else {
      alert('❌ ' + (data.error || 'Something went wrong'));
    }
  } catch (error) {
    console.error(error);
    alert('❌ Error: ' + error.message);
  }
};

  const addNewCategory = () => {
    if (!newCategoryName.trim()) return;

    // Generate a simple key from the new category name
    const newKey = newCategoryName.trim().toLowerCase().replace(/\s+/g, '');

    const newCat = {
      icon: 'add-circle-outline',
      key: newKey,
      label: newCategoryName.trim(),
    };

    setCategories(prev => ({
      ...prev,
      [type]: [...prev[type], newCat],
    }));
    setSelectedCategory(newKey);
    setNewCategoryName('');
    setModalVisible(false);
  };

  const currencySymbol = currency.symbol || '₨';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.heading}>{t.transactionType}</Text>

        <View style={styles.toggleContainer}>
          {['income', 'expense'].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.toggleButton, type === option && styles.toggleSelected]}
              onPress={() => {
                setType(option);
                setSelectedCategory(null);
              }}
            >
              <Text style={styles.toggleText}>{t[option]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.amountInputWrapper}>
          <TextInput
            style={styles.amountInputWithCurrency}
            placeholder={t.enterAmount}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={styles.currencySymbol}>{currencySymbol}</Text>
        </View>

        <Text style={styles.heading}>{t.selectCategory}</Text>

        <View style={styles.categoriesWrapper}>
          {categories[type].map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.categoryItem, selectedCategory === cat.key && styles.selectedCategory]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Ionicons name={cat.icon} size={24} color="black" />
              <Text style={styles.categoryItemText}>{cat.label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="black" />
            <Text style={styles.categoryItemText}>{t.newCategory}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={saveTransaction}>
          <Text style={styles.saveButtonText}>
            {editTransaction ? t.updateTransaction : t.saveTransaction}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.addNewCategoryTitle}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t.newCategory}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#007bff' }]}
                onPress={addNewCategory}
              >
                <Text style={styles.modalButtonText}>{t.addButton}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#aaa' }]}
                onPress={() => {
                  setNewCategoryName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>{t.cancelButton}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'black',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  toggleSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  toggleText: {
    color: 'black',
    fontWeight: 'bold',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  amountInputWithCurrency: {
    flex: 1,
    height: 50,
    fontSize: 18,
    paddingHorizontal: 10,
    color: 'black',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    color: 'black',
  },
  categoriesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    width: 70,
    height: 70,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: '#007bff',
  },
  categoryItemText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
    color: 'black',
  },
  saveButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#007bff',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 12,
    color: 'black',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});   