import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  TextInput, Button, StyleSheet,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { Circle, Svg } from 'react-native-svg';
import { LanguageContext } from './LanguageContext'; // adjust path accordingly
import { CurrencyContext } from './CurrencyContext'; // Adjust path if needed
import AsyncStorage from '@react-native-async-storage/async-storage';



const FILTERS = ['Daily', 'Weekly', 'Monthly'];
// Currency symbols map


const translations = {
  en: {
    budgetOverview: "Budget Overview",
    spent: "Spent",
    left: "Left",
    overBudget: "Over Budget",
    total: "Total",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    noBudgetData: "No budget data",
    categories: "Categories",
    addNewCategory: "+ Add New Category",
    addNewCategoryTitle: "Add New Category",
    addBudgetFor: "Add Budget for",
    categoryName: "Category Name",
    enterAmount: "Enter budget amount",
    save: "Save",
    cancel: "Cancel",
    showMore: "Show More",
    hide: "Hide",
    filter: "Filter",
    budget: "Budget",
    selectOrEnterCategory: "Select or enter category",
    enterValidAmount: "Enter valid budget amount",
    budgetSaved: "Budget saved!",
    errorSavingBudget: "Error saving budget",
    categoryDeleted: "Category deleted for today",
    failedDeleteCategory: "Failed to delete category",
    Beauty: "Beauty",
    Clothing: "Clothing",
    Education: "Education",
    Electronics: "Electronics",
    Entertainment: "Entertainment",
    Food: "Food",
    Health: "Health",
    Home: "Home",
    Insurance: "Insurance",
    Shopping: "Shopping",
    Social: "Social",
    Sport: "Sport",
    Tax: "Tax",
    "Mobile Phone": "Mobile Phone",
    Transportation: "Transportation",

  },
  ur: {
    budgetOverview: "بجٹ کا جائزہ",
    spent: "خرچ",
    left: "باقی",
    overBudget: "زیادہ خرچ",
    total: "کل",
    daily: "روزانہ",
    weekly: "ہفتہ وار",
    monthly: "ماہانہ",
    noBudgetData: "کوئی بجٹ ڈیٹا نہیں",
    categories: "زمرے",
    addNewCategory: "+ نیا زمرہ شامل کریں",
    addNewCategoryTitle: "نیا زمرہ شامل کریں",
    addBudgetFor: "بجٹ شامل کریں",
    categoryName: "زمرے کا نام",
    enterAmount: "بجٹ رقم درج کریں",
    save: "محفوظ کریں",
    cancel: "منسوخ کریں",
    showMore: "مزید دکھائیں",
    hide: "چھپائیں",
    filter: "فلٹر",
    budget: "بجٹ",
    selectOrEnterCategory: "زمرہ منتخب کریں یا درج کریں",
    enterValidAmount: "صحیح بجٹ رقم درج کریں",
    budgetSaved: "بجٹ محفوظ ہوگیا!",
    errorSavingBudget: "بجٹ محفوظ کرنے میں خرابی",
    categoryDeleted: "آج کے لیے زمرہ حذف کردیا گیا",
    failedDeleteCategory: "زمرہ حذف کرنے میں ناکامی",
    Beauty: "خوبصورتی",
    Clothing: "کپڑے",
    Education: "تعلیم",
    Electronics: "الیکٹرانکس",
    Entertainment: "تفریح",
    Food: "خوراک",
    Health: "صحت",
    Home: "گھر",
    Insurance: "انشورنس",
    Shopping: "خریداری",
    Social: "سماجی",
    Sport: "کھیل",
    Tax: "ٹیکس",
    "Mobile Phone": "موبائل فون",
    Transportation: "ٹرانسپورٹیشن",
  },
  ar: {
    budgetOverview: "نظرة عامة على الميزانية",
    spent: "المصروف",
    left: "المتبقي",
    overBudget: "تجاوز الميزانية",
    total: "الإجمالي",
    daily: "يوميًا",
    weekly: "أسبوعيًا",
    monthly: "شهريًا",
    noBudgetData: "لا توجد بيانات للميزانية",
    categories: "الفئات",
    addNewCategory: "+ إضافة فئة جديدة",
    addNewCategoryTitle: "إضافة فئة جديدة",
    addBudgetFor: "أضف ميزانية لـ",
    categoryName: "اسم الفئة",
    enterAmount: "أدخل مبلغ الميزانية",
    save: "حفظ",
    cancel: "إلغاء",
    showMore: "عرض المزيد",
    hide: "إخفاء",
    filter: "تصفية",
    budget: "الميزانية",
    selectOrEnterCategory: "اختر أو أدخل فئة",
    enterValidAmount: "أدخل مبلغ ميزانية صالح",
    budgetSaved: "تم حفظ الميزانية!",
    errorSavingBudget: "خطأ في حفظ الميزانية",
    categoryDeleted: "تم حذف الفئة لليوم",
    failedDeleteCategory: "فشل في حذف الفئة",
    Beauty: "الجمال",
    Clothing: "الملابس",
    Education: "التعليم",
    Electronics: "الإلكترونيات",
    Entertainment: "الترفيه",
    Food: "الطعام",
    Health: "الصحة",
    Home: "المنزل",
    Insurance: "التأمين",
    Shopping: "التسوق",
    Social: "اجتماعي",
    Sport: "الرياضة",
    Tax: "الضرائب",
    "Mobile Phone": "الهاتف المحمول",
    Transportation: "النقل",
  },
  fr: {
    budgetOverview: "Aperçu du budget",
    spent: "Dépensé",
    left: "Restant",
    overBudget: "Dépassement du budget",
    total: "Total",
    daily: "Quotidien",
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
    noBudgetData: "Pas de données budgétaires",
    categories: "Catégories",
    addNewCategory: "+ Ajouter une nouvelle catégorie",
    addNewCategoryTitle: "Ajouter une nouvelle catégorie",
    addBudgetFor: "Ajouter un budget pour",
    categoryName: "Nom de la catégorie",
    enterAmount: "Entrez le montant du budget",
    save: "Enregistrer",
    cancel: "Annuler",
    showMore: "Afficher plus",
    hide: "Cacher",
    filter: "Filtrer",
    budget: "Budget",
    selectOrEnterCategory: "Sélectionnez ou entrez une catégorie",
    enterValidAmount: "Entrez un montant de budget valide",
    budgetSaved: "Budget enregistré !",
    errorSavingBudget: "Erreur lors de l'enregistrement du budget",
    categoryDeleted: "Catégorie supprimée pour aujourd'hui",
    failedDeleteCategory: "Échec de la suppression de la catégorie",
    Beauty: "Beauté",
    Clothing: "Vêtements",
    Education: "Éducation",
    Electronics: "Électronique",
    Entertainment: "Divertissement",
    Food: "Nourriture",
    Health: "Santé",
    Home: "Maison",
    Insurance: "Assurance",
    Shopping: "Shopping",
    Social: "Social",
    Sport: "Sport",
    Tax: "Impôt",
    "Mobile Phone": "Téléphone portable",
    Transportation: "Transport",
  },
  es: {
    budgetOverview: "Resumen del presupuesto",
    spent: "Gastado",
    left: "Restante",
    overBudget: "Sobre el presupuesto",
    total: "Total",
    daily: "Diario",
    weekly: "Semanal",
    monthly: "Mensual",
    noBudgetData: "No hay datos de presupuesto",
    categories: "Categorías",
    addNewCategory: "+ Agregar nueva categoría",
    addNewCategoryTitle: "Agregar nueva categoría",
    addBudgetFor: "Agregar presupuesto para",
    categoryName: "Nombre de la categoría",
    enterAmount: "Ingrese el monto del presupuesto",
    save: "Guardar",
    cancel: "Cancelar",
    showMore: "Mostrar más",
    hide: "Ocultar",
    filter: "Filtro",
    budget: "Presupuesto",
    selectOrEnterCategory: "Seleccione o ingrese una categoría",
    enterValidAmount: "Ingrese un monto de presupuesto válido",
    budgetSaved: "¡Presupuesto guardado!",
    errorSavingBudget: "Error al guardar el presupuesto",
    categoryDeleted: "Categoría eliminada para hoy",
    failedDeleteCategory: "Error al eliminar la categoría",
    Beauty: "Belleza",
    Clothing: "Ropa",
    Education: "Educación",
    Electronics: "Electrónica",
    Entertainment: "Entretenimiento",
    Food: "Comida",
    Health: "Salud",
    Home: "Hogar",
    Insurance: "Seguro",
    Shopping: "Compras",
    Social: "Social",
    Sport: "Deporte",
    Tax: "Impuesto",
    "Mobile Phone": "Teléfono móvil",
    Transportation: "Transporte",
  },
};




const initialCategories = [
  { icon: "brush", name: "Beauty", color: "#C2185B" },
  { icon: "shirt", name: "Clothing", color: "#1976D2" },
  { icon: "school", name: "Education", color: "#000000" },
  { icon: "laptop", name: "Electronics", color: "#455A64" },
  { icon: "film", name: "Entertainment", color: "#D32F2F" },
  { icon: "fast-food", name: "Food", color: "#FF8F00" },
  { icon: "medkit", name: "Health", color: "#388E3C" },
  { icon: "home", name: "Home", color: "#5D4037" },
  { icon: "shield-checkmark", name: "Insurance", color: "#1976D2" },
  { icon: "bag-handle", name: "Shopping", color: "#F57C00" },
  { icon: "chatbubbles", name: "Social", color: "#0288D1" },
  { icon: "trophy", name: "Sport", color: "#FFC107" },
  { icon: "cash", name: "Tax", color: "#388E3C" },
  { icon: "phone-portrait", name: "Mobile Phone", color: "#0097A7" },
  { icon: "car", name: "Transportation", color: "#616161" },
];
function CircularProgress({ progress, color, size = 120, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={size} height={size}>
      <Circle
        stroke="#eee"
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      <Circle
        stroke={color}
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation="-90"
        origin={{ x: size / 2, y: size / 2 }}
      />
      <Text
        style={{
          position: 'absolute',
          alignSelf: 'center',
          top: size / 2 - 10,
          fontSize: 20,
          fontWeight: 'bold',
          color,
        }}
      >
        {Math.round(progress)}%
      </Text>
    </Svg>
  );
}

function BudgetRing({ totalSpent, totalBudget, t, currency }) {
  const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;
  const ringColor = isOverBudget ? '#E53935' : '#009688';

  const currencySymbol = currency && currency.symbol ? currency.symbol : '';


  return (
    <View style={styles.headerRing}>
      <Text style={styles.heading}>{t.budgetOverview}</Text>
      <CircularProgress progress={progress} color={ringColor} />
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: ringColor }]} />
          <Text style={styles.legendText}>
            {t.spent}: {currencySymbol}{totalSpent.toFixed(2)}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.colorBox,
              { backgroundColor: isOverBudget ? '#E53935' : '#81D4FA' },
            ]}
          />
          <Text style={styles.legendText}>
            {isOverBudget
              ? `${t.overBudget}: ${currencySymbol}${Math.abs(remaining).toFixed(2)}`
              : `${t.left}: ${currencySymbol}${remaining.toFixed(2)}`
            }
          </Text>

        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: '#1E88E5' }]} />
          <Text style={styles.legendText}>
            {t.total}: {currencySymbol}{totalBudget.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}



export default function BudgetScreen({ userId }) {
  const { language } = useContext(LanguageContext);
  const t = translations[language] || translations.en;

  const [budgetData, setBudgetData] = useState([]);
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryModal, setNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Daily');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const { currency } = useContext(CurrencyContext); // 👈 currency context

  const totalBudgetRaw = budgetData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalSpentRaw = budgetData.reduce((sum, item) => sum + Number(item.spent || 0), 0);

  // Converted totals
  const totalBudget = totalBudgetRaw * currency.rate;
  const totalSpent = totalSpentRaw * currency.rate;

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchBudget();
        fetchCategoriesFromBackend();
      } else {
        console.log("User ID missing. Cannot fetch budget.");
      }
    }, [selectedFilter, userId])
  );




  const fetchBudget = async () => {
    try {
      // 1️⃣ AsyncStorage se userId le aao
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log('User ID missing. Cannot fetch budget.');
        return;
      }

      // 2️⃣ Base URL banaye userId ke sath
      let url = `http://192.168.100.8:3033/api/budgets/data?filter=${selectedFilter.toLowerCase()}&userId=${userId}`;

      // 3️⃣ Filters handle karo
      if (selectedFilter === 'Weekly') {
        const startOfWeek = moment().startOf('isoWeek');
        const endOfWeek = moment().endOf('isoWeek');
        const endOfMonth = moment().endOf('month');
        const adjustedEndOfWeek = endOfWeek.isAfter(endOfMonth) ? endOfMonth : endOfWeek;
        url += `&startDate=${startOfWeek.format('YYYY-MM-DD')}&endDate=${adjustedEndOfWeek.format('YYYY-MM-DD')}`;
      }

      if (selectedFilter === 'Daily') {
        const today = moment().format('YYYY-MM-DD');
        url += `&date=${today}`;
      }

      if (selectedFilter === 'Monthly') {
        const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
        const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
        url += `&startDate=${startOfMonth}&endDate=${endOfMonth}`;
      }

      // 4️⃣ Expenses URL bhi userId ke sath
      const spentUrl = `http://192.168.18.254:3033/api/budgets/expense-per-category?filter=${selectedFilter.toLowerCase()}&userId=${userId}`;

      // 5️⃣ Parallel fetch
      const [budgetRes, spentRes] = await Promise.all([
        axios.get(url),
        axios.get(spentUrl)
      ]);

      const budgetArray = budgetRes.data.budgets || [];
      const spentMap = {};
      (spentRes.data.spentPerCategory || []).forEach(item => {
        spentMap[item.category] = item.spent;
      });

      const merged = budgetArray.map(item => ({
        ...item,
        spent: spentMap[item.category] || 0
      }));

      setBudgetData(merged);
    } catch (err) {
      console.log('Error fetching budget or spent data:', err);
    }
  };



  const fetchCategoriesFromBackend = async () => {
    try {
      const res = await axios.get('http://192.168.18.254:3033/api/budgets/categories'); // <-- Corrected URL

      if (res.data.categories && res.data.categories.length > 0) {
        const updatedCategories = res.data.categories.map(catName => {
          const found = initialCategories.find(
            c => c.name.toLowerCase() === catName.toLowerCase()
          );
          return found
            ? { ...found }
            : { icon: 'folder', name: catName, budget: 0, spent: 0, color: '#777' };
        });
        setCategories(updatedCategories);
      } else {
        setCategories(initialCategories);
      }
    } catch (err) {
      console.log('Error fetching categories:', err);
      setCategories(initialCategories);
    }
  };


  const handleSaveBudget = async () => {
    const category = newCategoryModal ? newCategoryName.trim() : (selectedCategory?.name || selectedCategory);
    if (!category) return alert(t.selectOrEnterCategory);
    if (!budgetAmount || isNaN(budgetAmount) || Number(budgetAmount) <= 0) {
      return alert(t.enterValidAmount);
    }

    try {
      await axios.post('http://192.168.18.254:3033/api/budgets/save-budget', {
        category,
        amount: Number(budgetAmount) / currency.rate,
      });
      alert(t.budgetSaved);
      setBudgetAmount('');
      setSelectedCategory(null);
      setNewCategoryName('');
      setModalVisible(false);
      setNewCategoryModal(false);
      fetchBudget();
      fetchCategoriesFromBackend();
    } catch (err) {
      alert(t.errorSavingBudget);
      console.error('Save budget error:', err.response?.data || err.message);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    try {
      await axios.delete('http://192.168.18.254:3033/api/budgets/delete-category', {
        data: { category: categoryName }
      });

      alert(t.categoryDeleted);
      fetchBudget();
      fetchCategoriesFromBackend();
    } catch (error) {
      alert(t.failedDeleteCategory);
      console.log('Delete error:', error);
    }
  };

  const getBudgetTitle = () => {
    const now = moment();
    if (selectedFilter === 'Daily') return now.format('D MMMM YYYY');
    if (selectedFilter === 'Weekly') {
      const startOfWeek = moment().startOf('isoWeek');
      const endOfWeek = moment().endOf('isoWeek');
      const endOfMonth = moment().endOf('month');
      const adjustedEndOfWeek = endOfWeek.isAfter(endOfMonth) ? endOfMonth : endOfWeek;
      const startFormat = startOfWeek.format('D MMM');
      const endFormat = adjustedEndOfWeek.format('D MMM YYYY');
      return `${startFormat} - ${endFormat}`;
    }
    if (selectedFilter === 'Monthly') return now.format('MMMM YYYY');
  };

  const renderRightActions = (item) => (
    <TouchableOpacity
      onPress={() => handleDeleteCategory(item.category)}
      style={styles.budgetDeleteBtn}
    >
      <Ionicons name="trash" size={24} color="#D32F2F" />
    </TouchableOpacity>
  );

  const renderBudgetItem = ({ item }) => {
    const isExpanded = expandedCategory === item.category;

    const itemAmount = Number(item.amount) * currency.rate;
    const itemSpent = Number(item.spent || 0) * currency.rate;
    const remaining = itemAmount - itemSpent;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <View style={styles.budgetCard}>
          <View style={styles.budgetCardLeft}>
            <Text style={styles.budgetCategory}>{t[item.category] || item.category}</Text>

            <Text style={styles.budgetAmount}>
              {t.budget}: {currency.symbol}{itemAmount.toFixed(2)}
            </Text>

            {isExpanded && (
              <View style={styles.expandedSection}>
                <Text style={styles.budgetSpent}>
                  {t.spent}: {currency.symbol}{itemSpent.toFixed(2)}
                </Text>
                {remaining >= 0 ? (
                  <Text style={styles.detailText}>
                    {t.left}: {currency.symbol}{remaining.toFixed(2)}
                  </Text>
                ) : (
                  <Text style={[styles.detailText, { color: '#D32F2F' }]}>
                    {t.overBudget}: {currency.symbol}{Math.abs(remaining).toFixed(2)}
                  </Text>
                )}
                <Text style={styles.detailText}>
                  {t.filter}: {t[selectedFilter.toLowerCase()]}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setExpandedCategory(isExpanded ? null : item.category)}
              style={styles.expandBtn}
            >
              <Text style={styles.expandBtnText}>{isExpanded ? t.hide : t.showMore}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Swipeable>
    );
  };
  const renderCategoryCard = ({ item }) => (
    <View style={styles.categoryCard}>
      <TouchableOpacity
        onPress={() => {
          console.log("Selected Category:", item);
          setSelectedCategory(item);
          setBudgetAmount('');
          setModalVisible(true);
          setNewCategoryModal(false);
        }}
        style={[
          styles.categoryButton,
          selectedCategory?.name === item.name && styles.categoryButtonSelected,
        ]}
      >
        <Ionicons name={item.icon} size={24} color={item.color} />
        <Text style={styles.categoryName}>{t[item.name] || item.name}</Text>

      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <BudgetRing totalSpent={totalSpent} totalBudget={totalBudget} t={t} currency={currency} />


      <View style={styles.line} />

      <View style={styles.tabsRow}>
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[styles.tab, selectedFilter === filter && styles.tabActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedFilter === filter && styles.tabTextActive]}>
              {t[filter.toLowerCase()]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.todayBudgetTitle}>
        {t[selectedFilter.toLowerCase()]} {t.budget} ({getBudgetTitle()})
      </Text>

      {budgetData.length > 0 ? (
        <FlatList
          data={budgetData}
          keyExtractor={(item) => item.category}
          renderItem={renderBudgetItem}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.todayBudgetAmount}>{t.noBudgetData}</Text>
      )}

      <Text style={styles.categoriesTitle}>{t.categories}</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.name}
        renderItem={renderCategoryCard}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        onPress={() => {
          setNewCategoryModal(true);
          setModalVisible(true);
          setSelectedCategory(null);
          setBudgetAmount('');
          setNewCategoryName('');
        }}
        style={styles.addNewCategoryButton}
      >
        <Text style={styles.addNewCategoryButtonText}>{t.addNewCategory}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {newCategoryModal
                ? t.addNewCategoryTitle
                : `${t.addBudgetFor} ${selectedCategory?.name || ''}`
              }
            </Text>

            {newCategoryModal ? (
              <TextInput
                placeholder={t.categoryName}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                style={styles.input}
                autoFocus
              />
            ) : (
              <Text style={{ marginBottom: 10, fontSize: 16 }}>
                {selectedCategory?.name || ''}
              </Text>
            )}

            <TextInput
              placeholder={t.enterAmount}
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <Button title={t.save} onPress={handleSaveBudget} />
              <View style={{ width: 16 }} />
              <Button
                title={t.cancel}
                color="#999"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 10, paddingBottom: 10 },
  headerRing: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  legendContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: '80%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
  line: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 10,
    opacity: 0.3,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '#007bff',
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  tabTextActive: {
    color: '#fff',
  },
  todayBudgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  todayBudgetAmount: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: '#666',
  },
  budgetCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  budgetCardLeft: {
    flex: 1,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  budgetAmount: {
    fontSize: 14,
    marginTop: 4,
  },
  expandedSection: {
    marginTop: 8,
  },
  budgetSpent: {
    fontSize: 14,
  },
  detailText: {
    fontSize: 13,
    marginTop: 2,
  },
  expandBtn: {
    marginTop: 6,
  },
  expandBtnText: {
    fontSize: 14,
    color: '#007bff',
  },
  budgetDeleteBtn: {
    backgroundColor: '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    borderRadius: 10,
    marginVertical: 6,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  categoryCard: {
    marginVertical: 4,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  categoryButtonSelected: {
    backgroundColor: '#cce5ff',
  },
  categoryName: {
    marginLeft: 10,
    fontSize: 16,
  },
  addNewCategoryButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addNewCategoryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});