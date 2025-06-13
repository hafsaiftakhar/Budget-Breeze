import React, { useEffect, useState, useCallback } from 'react';
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

import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const CATEGORY_COLORS = [
  '#f39c12', '#e74c3c', '#8e44ad', '#2ecc71', '#3498db',
  '#1abc9c', '#d35400', '#c0392b', '#9b59b6', '#27ae60'
];

const DashboardScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { recentExpense } = route.params || {};

  const [selectedFilter, setSelectedFilter] = useState('Daily');
  const [transactions, setTransactions] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [categoryColorMap, setCategoryColorMap] = useState({});
  const [budgetTotal, setBudgetTotal] = useState(0);

  useEffect(() => {
    if (recentExpense) {
      console.log('New expense:', recentExpense.category, recentExpense.amount);
    }
  }, [recentExpense]);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
      fetchBudget();
    }, [selectedFilter])
  );

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://192.168.100.8:3033/transactions');
      setTransactions(res.data);
      assignColors(res.data);
    } catch (err) {
      console.error('Transaction fetch error:', err);
    }
  };

  const fetchBudget = async () => {
    try {
      const today = moment().format('YYYY-MM-DD');
      const res = await axios.get(`http://192.168.100.8:3033/budget/api/data?filter=${selectedFilter.toLowerCase()}&date=${today}`);

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
    return transactions.filter((txn) => {
      const date = moment(txn.date);
      if (selectedFilter === 'Daily') return date.isSame(now, 'day');
      if (selectedFilter === 'Weekly') return date.isSame(now, 'week');
      if (selectedFilter === 'Monthly') return date.isSame(now, 'month');
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
    if (selectedFilter === 'Daily') return now.format('MMM D, YYYY');
   if (selectedFilter === 'Weekly') {
  return `${now.clone().startOf('week').format('MMM D')} - ${now.clone().endOf('week').format('MMM D')}`;
}

    if (selectedFilter === 'Monthly') return now.format('MMMM YYYY');
    return '';
  };

  const handleEdit = (transaction) => {
    navigation.navigate('Transaction', { ...transaction });
  };

  const handleDelete = (transaction) => {
   Alert.alert('Delete', `Delete transaction for ${transaction.category}?`, [

      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
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
      Toast.show('Warning: Your expenses exceed your income!', {
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
  }, [expense, income]);
  
  const pieChartData = getExpenseBreakdown();

 const getLabel = (baseLabel) => {
  if (baseLabel === 'Total Balance') return baseLabel;
  return `${selectedFilter} ${baseLabel}`;  // backticks use kiye
};


  return (
    <Provider>
      <ScrollView style={styles.container}>
        {/* Summary Cards */}
        <View style={styles.cardContainer}>
          {[
            { label: 'Total Balance', value: balance },
            { label: 'Income', value: income },
            { label: 'Expense', value: expense },
            { label: 'Budget', value: budgetTotal },
          ].map((item, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.label}>{getLabel(item.label)}</Text>
              <Text style={styles.value}>${item.value.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {['Daily', 'Weekly', 'Monthly'].map((filter) => (
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
            <Text style={styles.cardTitle}>Expense Breakdown</Text>
            <Text style={{ fontWeight: '600', color: '#007bff' }}>{getCurrentDateLabel()}</Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                  <Ionicons name="ellipsis-vertical" size={20} color="black" />
                </TouchableOpacity>
              }>
              <Menu.Item title="Export" onPress={() => {}} />
              <Menu.Item title="Settings" onPress={() => {}} />
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
                color: (opacity = 1) => 'rgba(0, 0, 0, ${opacity})',
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="80"
              hasLegend={false}
            />
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>No expense data</Text>
          )}
        </View>

        {/* View Details */}
        {pieChartData.length > 0 && (
          <>
            <View style={styles.viewDetailsContainer}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Feather name="arrow-down" size={18} color="#007bff" />
            </View>

            <View style={styles.detailsLineContainer}>
              {Object.entries(getGroupedTransactions()).map(([category, txnList], index) => (
                <View key={index}>
                  {txnList.map((txn) => (
                    <View key={txn.id} style={styles.detailLineItem}>
                      <Feather name="arrow-right" size={16} color="#007bff" style={{ marginRight: 8 }} />
                      <View style={[styles.detailColorBoxSmall, { backgroundColor: txn.color }]} />
                      <Text style={styles.detailCategoryLine}>{txn.category}</Text>
                      <Text style={styles.detailAmountLine}>${parseFloat(txn.amount).toFixed(2)}</Text>
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