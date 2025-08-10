import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import { PieChart } from 'react-native-chart-kit';
import { Menu, Provider } from 'react-native-paper';
import { Ionicons, Feather } from '@expo/vector-icons';
import Toast from 'react-native-root-toast';
import { useAccessibility } from './AccessibilityContext';  // accessibility context ka path check karo


import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';

import { CurrencyContext } from './CurrencyContext'; 
import { LanguageContext } from './LanguageContext'; 

const screenWidth = Dimensions.get('window').width;
const CATEGORY_COLORS = ['#f39c12', '#e74c3c', '#8e44ad', '#2ecc71', '#3498db', '#1abc9c', '#d35400', '#c0392b', '#9b59b6', '#27ae60'];

// (Translations and categoryTranslations objects remain same as your original)
// Translations for UI texts
const translations = {
  en: {
    totalBalance: 'Total Balance',
    income: 'Income',
    expense: 'Expense',
    budget: 'Budget',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    expenseBreakdown: 'Expense Breakdown',
    export: 'Export',
    settings: 'Settings',
    viewDetails: 'View Details',
    noExpenseData: 'No expense data',
    warningExpensesExceedIncome: 'Warning: Your expenses exceed your income!',
  },
  ur: {
    totalBalance: 'کل بیلنس',
    income: 'آمدنی',
    expense: 'اخراجات',
    budget: 'بجٹ',
    daily: 'روزانہ',
    weekly: 'ہفتہ وار',
    monthly: 'ماہانہ',
    expenseBreakdown: 'اخراجات کی تفصیل',
    export: 'برآمد کریں',
    settings: 'ترتیبات',
    viewDetails: 'تفصیلات دیکھیں',
    noExpenseData: 'کوئی اخراجات کا ڈیٹا نہیں',
    warningExpensesExceedIncome: 'خبردار: آپ کے اخراجات آمدنی سے زیادہ ہیں!',
  },
  ar: {
    totalBalance: 'الرصيد الكلي',
    income: 'الدخل',
    expense: 'المصروف',
    budget: 'الميزانية',
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    expenseBreakdown: 'تفصيل المصروفات',
    export: 'تصدير',
    settings: 'الإعدادات',
    viewDetails: 'عرض التفاصيل',
    noExpenseData: 'لا توجد بيانات للمصروفات',
    warningExpensesExceedIncome: 'تحذير: مصروفاتك تتجاوز دخلك!',
  },
  fr: {
    totalBalance: 'Solde total',
    income: 'Revenu',
    expense: 'Dépense',
    budget: 'Budget',
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
    expenseBreakdown: 'Répartition des dépenses',
    export: 'Exporter',
    settings: 'Paramètres',
    viewDetails: 'Voir les détails',
    noExpenseData: "Pas de données de dépenses",
    warningExpensesExceedIncome: 'Attention : Vos dépenses dépassent vos revenus !',
  },
  es: {
    totalBalance: 'Saldo total',
    income: 'Ingresos',
    expense: 'Gastos',
    budget: 'Presupuesto',
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual',
    expenseBreakdown: 'Desglose de gastos',
    export: 'Exportar',
    settings: 'Configuración',
    viewDetails: 'Ver detalles',
    noExpenseData: 'No hay datos de gastos',
    warningExpensesExceedIncome: '¡Advertencia: tus gastos superan tus ingresos!',
  },
};

// Category translations - add categories as needed
const categoryTranslations = {
  en: {
    Food: 'Food',
    Transport: 'Transport',
    Shopping: 'Shopping',
    Grocery: 'Grocery',
    FriendsOuting: 'Friends Outing',
    Travel: 'Travel',
    Entertainment: 'Entertainment',
    Utilities: 'Utilities',
    Beauty: 'Beauty',
    MobilePhone: 'Mobile Phone',
    Tax: 'Tax',
    Electronics: 'Electronics',
    Salary: 'Salary',
    Freelance: 'Freelance',
    Bonus: 'Bonus',
    Business: 'Business',
    Interest: 'Interest',
    RentalIncome: 'Rental Income',
    Dividends: 'Dividends',
    Savings: 'Savings',
    Loan: 'Loan',
    Pension: 'Pension',
    InsuranceClaim: 'Insurance Claim',
    Other: 'Other',
  },
  ur: {
    Food: 'خوراک',
    Transport: 'ٹرانسپورٹ',
    Shopping: 'خریداری',
    Grocery: 'کریانہ',
    FriendsOuting: 'دوستی کی محفل',
    Travel: 'سفر',
    Entertainment: 'تفریح',
    Utilities: 'یوٹیلیٹیز',
    Beauty: 'خوبصورتی',
    MobilePhone: 'موبائل فون',
    Tax: 'ٹیکس',
    Electronics: 'الیکٹرانکس',
    Salary: 'تنخواہ',
    Freelance: 'فری لانس',
    Bonus: 'بونس',
    Business: 'کاروبار',
    Interest: 'سود',
    RentalIncome: 'کرایہ آمدنی',
    Dividends: 'منافع',
    Savings: 'بچت',
    Loan: 'قرض',
    Pension: 'پنشن',
    InsuranceClaim: 'انشورنس کلیم',
    Other: 'دیگر',
  },
  ar: {
    Food: 'طعام',
    Transport: 'النقل',
    Shopping: 'التسوق',
    Grocery: 'البقالة',
    FriendsOuting: 'الخروج مع الأصدقاء',
    Travel: 'السفر',
    Entertainment: 'الترفيه',
    Utilities: 'المرافق',
    Beauty: 'الجمال',
    MobilePhone: 'الهاتف المحمول',
    Tax: 'الضرائب',
    Electronics: 'الإلكترونيات',
    Salary: 'الراتب',
    Freelance: 'عمل حر',
    Bonus: 'مكافأة',
    Business: 'الأعمال',
    Interest: 'الفائدة',
    RentalIncome: 'دخل الإيجار',
    Dividends: 'الأرباح',
    Savings: 'الادخار',
    Loan: 'قرض',
    Pension: 'المعاش',
    InsuranceClaim: 'مطالبة التأمين',
    Other: 'أخرى',
  },
  fr: {
    Food: 'Nourriture',
    Transport: 'Transport',
    Shopping: 'Shopping',
    Grocery: 'Épicerie',
    FriendsOuting: 'Sortie entre amis',
    Travel: 'Voyage',
    Entertainment: 'Divertissement',
    Utilities: 'Services publics',
    Beauty: 'Beauté',
    MobilePhone: 'Téléphone portable',
    Tax: 'Taxe',
    Electronics: 'Électronique',
    Salary: 'Salaire',
    Freelance: 'Freelance',
    Bonus: 'Prime',
    Business: 'Affaires',
    Interest: 'Intérêt',
    RentalIncome: 'Revenu locatif',
    Dividends: 'Dividendes',
    Savings: 'Économies',
    Loan: 'Prêt',
    Pension: 'Pension',
    InsuranceClaim: "Réclamation d'assurance",
    Other: 'Autre',
  },
  es: {
    Food: 'Comida',
    Transport: 'Transporte',
    Shopping: 'Compras',
    Grocery: 'Supermercado',
    FriendsOuting: 'Salida con amigos',
    Travel: 'Viaje',
    Entertainment: 'Entretenimiento',
    Utilities: 'Servicios',
    Beauty: 'Belleza',
    MobilePhone: 'Teléfono móvil',
    Tax: 'Impuesto',
    Electronics: 'Electrónica',
    Salary: 'Salario',
    Freelance: 'Freelance',
    Bonus: 'Bono',
    Business: 'Negocio',
    Interest: 'Interés',
    RentalIncome: 'Ingreso por alquiler',
    Dividends: 'Dividendos',
    Savings: 'Ahorros',
    Loan: 'Préstamo',
    Pension: 'Pensión',
    InsuranceClaim: 'Reclamo de seguro',
    Other: 'Otro',
  },
};
const DashboardScreen = () => {
  const { currency } = useContext(CurrencyContext);
  const { accessibilityMode, setAccessibilityMode } = useAccessibility();
  const { language } = useContext(LanguageContext);
  const t = translations[language] || translations.en;

  const route = useRoute();
  const navigation = useNavigation();

  const { recentExpense } = route.params || {};

  const [selectedFilter, setSelectedFilter] = useState(t.daily);
  const [transactions, setTransactions] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [categoryColorMap, setCategoryColorMap] = useState({});
  const [budgetTotal, setBudgetTotal] = useState(0);

  // Re-fetch translations on language or filter change
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
      fetchBudget();
    }, [selectedFilter, language])
  );




  // Map localized filter back to English keys for logic
  const filterKeyMap = {
    [translations.en.daily]: 'Daily',
    [translations.en.weekly]: 'Weekly',
    [translations.en.monthly]: 'Monthly',
    [translations.ur.daily]: 'Daily',
    [translations.ur.weekly]: 'Weekly',
    [translations.ur.monthly]: 'Monthly',
    [translations.ar.daily]: 'Daily',
    [translations.ar.weekly]: 'Weekly',
    [translations.ar.monthly]: 'Monthly',
    [translations.fr.daily]: 'Daily',
    [translations.fr.weekly]: 'Weekly',
    [translations.fr.monthly]: 'Monthly',
    [translations.es.daily]: 'Daily',
    [translations.es.weekly]: 'Weekly',
    [translations.es.monthly]: 'Monthly',
  };

const fetchTransactions = async () => {
  try {
    const res = await axios.get('http://192.168.100.8:3033/transactions');
    setTransactions(res.data);
    assignColors(res.data);
  } catch (err) {
    console.error('Online fetch error:', err);
  }
};



const fetchBudget = async () => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const filterEnglish = filterKeyMap[selectedFilter] || 'Daily';
    const res = await axios.get(`http://192.168.100.8:3033/api/budgets/data?filter=${filterEnglish.toLowerCase()}&date=${today}`);
    const total = (res.data.budgets || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    setBudgetTotal(total);
  } catch (err) {
    console.error('Budget fetch error:', err);
  }
};


  const assignColors = (txns) => {
    const uniqueCategories = Array.from(new Set(txns.map(t => t.category)));
    const colorMap = {};
    uniqueCategories.forEach((cat, idx) => {
      colorMap[cat] = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
    });
    setCategoryColorMap(colorMap);
  };

  const getFilteredTransactions = () => {
    const now = moment();
    const filterEnglish = filterKeyMap[selectedFilter] || 'Daily';
    return transactions.filter((txn) => {
      const date = moment(txn.date);
      if (filterEnglish === 'Daily') return date.isSame(now, 'day');
      if (filterEnglish === 'Weekly') {
        const startOfWeek = moment().startOf('isoWeek');
        const endOfWeek = moment().endOf('isoWeek');
        const endOfMonth = moment().endOf('month');
        const adjustedEndOfWeek = endOfWeek.isAfter(endOfMonth) ? endOfMonth : endOfWeek;
        return date.isBetween(startOfWeek, adjustedEndOfWeek, 'day', '[]');
      }
      if (filterEnglish === 'Monthly') return date.isSame(now, 'month');
      return true;
    });
  };

  const getTotal = (type) => {
    return getFilteredTransactions()
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  };

  const getExpenseBreakdown = () => {
    const expenses = getFilteredTransactions().filter(t => t.type === 'expense');
    const grouped = {};

    expenses.forEach((item) => {
      const amount = parseFloat(item.amount) || 0;
      if (!grouped[item.category]) {
        grouped[item.category] = { amount: 0, color: categoryColorMap[item.category] || '#ccc' };
      }
      grouped[item.category].amount += amount;
    });

    return Object.entries(grouped).map(([name, { amount, color }]) => ({
      name,
      amount,
      color,
      population: amount,
      legendFontColor: '#333',
      legendFontSize: 12,
    }));
  };

const getGroupedTransactions = () => {
  const expenses = getFilteredTransactions().filter((t) => t.type === 'expense');
  const grouped = {};
  expenses.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push({ ...item, color: categoryColorMap[item.category] || '#ccc' });
  });
  return grouped;
  

};



  const getCurrentDateLabel = () => {
    const now = moment();
    const filterEnglish = filterKeyMap[selectedFilter] || 'Daily';
    if (filterEnglish === 'Daily') return now.format('MMM D, YYYY');
    if (filterEnglish === 'Weekly') {
      const startOfWeek = moment().startOf('isoWeek');
      const endOfWeek = moment().endOf('isoWeek');
      const endOfMonth = moment().endOf('month');
      const adjustedEndOfWeek = endOfWeek.isAfter(endOfMonth) ? endOfMonth : endOfWeek;
      const startFormat = startOfWeek.format('D MMM');
      const endFormat = adjustedEndOfWeek.format('D MMM YYYY');
      return `${startFormat} - ${endFormat}`;
    }
    if (filterEnglish === 'Monthly') return now.format('MMMM YYYY');
    return '';
  };

  const handleEdit = (transaction) => {
    navigation.navigate('Transaction', { ...transaction });
  };

  const handleDelete = (transaction) => {
    Alert.alert(t.expenseBreakdown, `Delete transaction for ${categoryTranslations[language]?.[transaction.category] || transaction.category}?`, [
      { text: t.settings, style: 'cancel' },
      {
        text: t.expenseBreakdown,
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`http://192.168.100.8:3033/transactions/${transaction.id}`);
            fetchTransactions();
          } catch (err) {
            console.error('Delete error:', err);
          }
        },
      },
    ]);
  };

  const income = getTotal('income');
  const expense = getTotal('expense');
  const balance = income - expense;

  useEffect(() => {
    if (expense > income) {
      Toast.show(t.warningExpensesExceedIncome, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: '#dc3545',
        textColor: '#fff',
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    }
  }, [expense, income, t.warningExpensesExceedIncome]);

  const pieChartData = getExpenseBreakdown();

  const getLabel = (baseLabel) => {
    if (baseLabel === t.totalBalance) return baseLabel;
    return `${selectedFilter} ${baseLabel}`;
  };

  return (
    <Provider>
      <ScrollView style={styles.container}>
        {/* Summary Cards */}
        <View style={styles.cardContainer}>
          {[
            { label: t.totalBalance, value: balance * currency.rate },
            { label: t.income, value: income * currency.rate },
            { label: t.expense, value: expense * currency.rate },
            { label: t.budget, value: budgetTotal * currency.rate },
          ].map((item, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.label}>{getLabel(item.label)}</Text>
              <Text style={styles.value}>
                {currency.symbol}{item.value.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {[t.daily, t.weekly, t.monthly].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[styles.filterTab, selectedFilter === filter && styles.activeTab]}>
              <Text style={selectedFilter === filter ? styles.activeText : styles.inactiveText}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pie Chart */}
        <View style={styles.expenseCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t.expenseBreakdown}</Text>
            <Text style={{ fontWeight: '600', color: '#007bff' }}>{getCurrentDateLabel()}</Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                  <Ionicons name="ellipsis-vertical" size={20} color="black" />
                </TouchableOpacity>
              }>
              <Menu.Item title={t.export} onPress={() => {}} />
              <Menu.Item title={t.settings} onPress={() => {}} />
            </Menu>
          </View>

          {pieChartData.length > 0 ? (
            <PieChart
              data={pieChartData}
              width={screenWidth - 30}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="80"
              hasLegend={false}
            />
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>{t.noExpenseData}</Text>
          )}
        </View>

        {/* View Details */}
        {pieChartData.length > 0 && (
          <>
            <View style={styles.viewDetailsContainer}>
              <Text style={styles.viewDetailsText}>{t.viewDetails}</Text>
              <Feather name="arrow-down" size={18} color="#007bff" />
            </View>

            <View style={styles.detailsLineContainer}>
              {Object.entries(getGroupedTransactions()).map(([category, txnList], index) => (
                <View key={index}>
                  {txnList.map((txn) => (
                    <View key={txn.id} style={styles.detailLineItem}>
                      <Feather name="arrow-right" size={16} color="#007bff" style={{ marginRight: 8 }} />
                      <View style={[styles.detailColorBoxSmall, { backgroundColor: txn.color }]} />
                      <Text style={styles.detailCategoryLine}>
                        {categoryTranslations[language]?.[txn.category] || txn.category}
                      </Text>

                      <Text style={styles.detailAmountLine}>
                        {currency.symbol}{parseFloat(txn.amount).toFixed(2)}
                      </Text>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ffc107' }]} onPress={() => handleEdit(txn)}>
                        <Feather name="edit-3" size={16} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#dc3545' }]} onPress={() => handleDelete(txn)}>
                        <Feather name="trash" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Provider>
  );
};






const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', padding: 15 },
  cardContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  label: { fontSize: 14, color: '#555' },
  value: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  filterTabs: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: '#e0e0e0',
  },
  activeTab: { backgroundColor: '#007bff' },
  activeText: { color: '#fff', fontWeight: '600' },
  inactiveText: { color: '#555', fontWeight: '600' },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#222' },
  viewDetailsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 10 },
  viewDetailsText: { color: '#007bff', fontWeight: '600', marginRight: 5 },
  detailsLineContainer: { paddingHorizontal: 10, marginTop: 15 },
  detailLineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  detailColorBoxSmall: { width: 15, height: 15, marginRight: 8, borderRadius: 3 },
  detailCategoryLine: { flex: 1, fontSize: 14, color: '#444' },
  detailAmountLine: { fontSize: 14, fontWeight: '600', color: '#444' },
  actionButton: { padding: 6, borderRadius: 6, marginLeft: 6 },
});

export default DashboardScreen;