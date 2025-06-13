import React, { useState, useCallback } from 'react';
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

const FILTERS = ['Daily', 'Weekly', 'Monthly'];

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

function CircularProgress({ size = 120, strokeWidth = 16, progress = 0, color = '#009688' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <Svg width={size} height={size}>
      <Circle
        stroke="#81D4FA"
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
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

function BudgetRing({ totalSpent, totalBudget }) {
  const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;
  const ringColor = isOverBudget ? '#E53935' : '#009688';

  return (
    <View style={{ alignItems: 'center', margin: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Budget Overview</Text>
      <CircularProgress progress={progress} color={ringColor} />
      <View style={{ marginTop: 20 }}>
        <Text style={{ color: ringColor }}>Spent: ${totalSpent}</Text>
        <Text style={{ color: isOverBudget ? '#E53935' : '#81D4FA' }}>
          {isOverBudget ? `Over Budget: $${Math.abs(remaining)}` : `Left: $${remaining}`}
        </Text>
        <Text style={{ color: '#1E88E5' }}>Total: ${totalBudget}</Text>
      </View>
    </View>
  );
}

export default function BudgetScreen() {
  const [budgetData, setBudgetData] = useState([]);
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryModal, setNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Daily');

  const totalBudget = budgetData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalSpent = budgetData.reduce((sum, item) => sum + Number(item.spent || 0), 0);

  useFocusEffect(
    useCallback(() => {
      fetchBudget();
      fetchCategoriesFromBackend();
    }, [selectedFilter])
  );

  const fetchBudget = async () => {
    try {
      let url = `http://192.168.100.236:5000/budget/api/data?filter=${selectedFilter.toLowerCase()}`;

      if (selectedFilter === 'Weekly') {
        const start = moment().startOf('isoWeek').format('YYYY-MM-DD');
        const end = moment().endOf('isoWeek').format('YYYY-MM-DD');
        const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
        url += `&startDate=${start}&endDate=${end > endOfMonth ? endOfMonth : end}`;
      }

      if (selectedFilter === 'Daily') {
        const today = moment().format('YYYY-MM-DD');
        url += `&date=${today}`;
      }

      if (selectedFilter === 'Monthly') {
        const start = moment().startOf('month').format('YYYY-MM-DD');
        const end = moment().endOf('month').format('YYYY-MM-DD');
        url += `&startDate=${start}&endDate=${end}`;
      }

      const [budgetRes, spentRes] = await Promise.all([
        axios.get(url),
        axios.get(`http://192.168.100.236:5000/budget/api/expense-per-category?filter=${selectedFilter.toLowerCase()}`)
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
      console.log('Error fetching data:', err);
    }
  };

  const fetchCategoriesFromBackend = async () => {
    try {
      const res = await axios.get('http://192.168.100.8:3033/budget/api/categories');
      if (res.data.categories?.length) {
        const updated = res.data.categories.map(cat => {
          const match = initialCategories.find(c => c.name.toLowerCase() === cat.toLowerCase());
          return match ? { ...match } : { icon: 'folder', name: cat, color: '#777' };
        });
        setCategories(updated);
      } else {
        setCategories(initialCategories);
      }
    } catch (err) {
      console.log('Category fetch failed:', err);
      setCategories(initialCategories);
    }
  };

  const handleSaveBudget = async () => {
    const category = newCategoryModal ? newCategoryName.trim() : selectedCategory?.name || selectedCategory;
    if (!category || !budgetAmount || isNaN(budgetAmount) || Number(budgetAmount) <= 0) {
      return alert('Please enter valid data');
    }

    try {
      await axios.post('http://192.168.100.8:3033/budget/api/save-budget', {
        category,
        amount: Number(budgetAmount),
      });
      alert('Saved!');
      setBudgetAmount('');
      setSelectedCategory(null);
      setNewCategoryName('');
      setModalVisible(false);
      setNewCategoryModal(false);
      fetchBudget();
    } catch (err) {
      alert('Save error');
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    try {
      await axios.delete('http://192.168.100.8:3033/budget/api/delete-category', {
        data: { category: categoryName }
      });
      alert('Deleted!');
      fetchBudget();
    } catch (err) {
      console.log('Delete failed:', err);
    }
  };

  const renderRightActions = (item) => (
    <TouchableOpacity
      style={{ backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', width: 80 }}
      onPress={() => handleDeleteCategory(item.category)}
    >
      <Text style={{ color: 'white', padding: 10 }}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <BudgetRing totalSpent={totalSpent} totalBudget={totalBudget} />
      {/* You can add FlatList here to show categories */}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 10,
       paddingBottom: 10 },
  headerRing: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10, // thoda gap ring se
    color: '#000000', // black color

  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spentTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  spentAmount: {
    fontSize: 16,
    marginTop: 4,
  },
  budgetText: {
    fontSize: 12,
    color: '#555',
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
 
  tabsRow: {
    flexDirection: 'row',          // horizontal line ke liye row direction
    justifyContent: 'space-around', // ya space-between, tabs ke beech spacing ke liye
    alignItems: 'center',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',     // horizontal line dikhane ke liye
  },
  tab: { paddingVertical: 8, paddingHorizontal: 14 },
  tabActive: { backgroundColor: '#007bff' },
  tabText: { fontSize: 14, color: '#555' },
  tabTextActive: { color: '#fff' },
  todayBudgetTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  todayBudgetAmount: { fontSize: 16, marginBottom: 12 },
  budgetCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
  },
  budgetCardLeft: { flex: 1 },
  budgetCategory: { fontWeight: '600', fontSize: 16 },
  budgetAmount: { fontSize: 14, marginTop: 4 ,color:'#007bff'},
  budgetSpent: { fontSize: 14,color:'#8B0000' },
  expandedSection: { marginTop: 8 },
  detailText: { fontSize: 14 },
  expandBtn: { marginTop: 6 },
  expandBtnText: { fontSize: 14, color: '#28A745 '},
  budgetDeleteBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    backgroundColor: '#eee',
  },
  categoriesTitle: { fontSize: 18, fontWeight: '600', marginVertical: 10 },
  categoryCard: { marginBottom: 10 },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  categoryButtonSelected: { backgroundColor: '#d0e8ff' },
  categoryName: { marginLeft: 10, fontSize: 16 },
  addNewCategoryButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 10,
    alignItems: 'center',
  },
  addNewCategoryButtonText: { color: 'white', fontWeight: '600' },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center'
  },
  modalContainer: {
    width: '85%', backgroundColor: '#fff',
    padding: 20, borderRadius: 10
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc',
    borderRadius: 8, padding: 10,
    marginBottom: 10
  },
});