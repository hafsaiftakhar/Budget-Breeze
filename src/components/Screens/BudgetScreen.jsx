import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  TextInput, Button, StyleSheet,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { Circle, Svg } from 'react-native-svg';
const FILTERS = ['Daily', 'Weekly', 'Monthly'];


const initialCategories = [ /* same as before */ 
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
      {/* Background circle for remaining */}
      <Circle
        stroke="#81D4FA"  // soft pastel yellow
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      {/* Foreground circle for spent or over budget */}
      <Circle
        stroke={color}  // teal or coral red
        fill="none"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation="-90"
        origin={'${size / 2}, ${size / 2}'}
      />
    </Svg>
  );
}

function BudgetRing({ totalSpent, totalBudget }) {
  const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  const ringColor = isOverBudget ? '#E53935' : '#009688'; // coral red if over budget, teal if not

  return (
    <View style={styles.headerRing}>

     {/* Heading */}
     <Text style={styles.heading}>Budget Overview</Text>
      <CircularProgress progress={progress} color={ringColor} />

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: ringColor }]} />
          <Text style={styles.legendText}>Spent:{totalSpent}</Text>
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
    ? `Over Budget: $${Math.abs(remaining)}`
    : `left: ${remaining}`}
</Text>

        </View>

        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: '#1E88E5' }]} />
          <Text style={styles.legendText}>Total:{totalBudget}</Text>
        </View>
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
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  
  
  const totalBudget = budgetData.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalSpent = budgetData.reduce((sum, item) => sum + Number(item.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const progress = totalBudget === 0 ? 0 : (totalSpent / totalBudget) * 100;

  useFocusEffect(
    useCallback(() => {
      fetchBudget();
      fetchCategoriesFromBackend();
    }, [selectedFilter])
  );

  const fetchBudget = async () => {
    try {
      let url = `http://192.168.100.8:3033/budget/api/data?filter=${selectedFilter.toLowerCase()}`;


      if (selectedFilter === 'Weekly') {
        const startOfWeek = moment().startOf('isoWeek');
        const endOfWeek = moment().endOf('isoWeek');
        const endOfMonth = moment().endOf('month');
        const adjustedEndOfWeek = endOfWeek.isAfter(endOfMonth) ? endOfMonth : endOfWeek;
       url += '&startDate=' + startOfWeek.format('YYYY-MM-DD') + "&endDate=" + adjustedEndOfWeek.format('YYYY-MM-DD')
      };

      if (selectedFilter === 'Daily') {
        const today = moment().format('YYYY-MM-DD');
       url += `&date=${today}`;

      }

      if (selectedFilter === 'Monthly') {
        const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
        const endOfMonth = moment().endOf('month').format('YYYY-MM-DD');
       url += `&startDate=${startOfMonth}&endDate=${endOfMonth}`;

      }

      const [budgetRes, spentRes] = await Promise.all([
        axios.get(url),
        axios.get('http://192.168.100.8:3033/budget/api/expense-per-category?filter=${selectedFilter.toLowerCase()}')
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
      const res = await axios.get('http://192.168.100.8:3033/budget/api/categories');
      if (res.data.categories && res.data.categories.length > 0) {
        const updatedCategories = res.data.categories.map(catName => {
          const found = initialCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
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
    const category = newCategoryModal ? newCategoryName.trim() : selectedCategory?.name || selectedCategory;
    if (!category) return alert('Select or enter category');
    if (!budgetAmount || isNaN(budgetAmount) || Number(budgetAmount) <= 0) {
      return alert('Enter valid budget amount');
    }

    try {
      await axios.post('http://192.168.100.8:3033/budget/api/save-budget', {
        category,
        amount: Number(budgetAmount),
      });
      alert('Budget saved!');
      setBudgetAmount('');
      setSelectedCategory(null);
      setNewCategoryName('');
      setModalVisible(false);
      setNewCategoryModal(false);
      fetchBudget();
      fetchCategoriesFromBackend();
    } catch (err) {
      alert('Error saving budget');
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    try {
      await axios.delete('http://192.168.100.8:3033/budget/api/delete-category', {
        data: { category: categoryName }
      });
      alert('Category deleted for today');
      fetchBudget();
      fetchCategoriesFromBackend();
    } catch (error) {
      alert('Failed to delete category');
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
    return `${startFormat} - ${endFormat}`;  // <-- backticks here!
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

 {/* const renderFilterTabs = () => (
    <View style={styles.tabsRow}>
      {FILTERS.map(filter => (
        <TouchableOpacity
          key={filter}
          style={[styles.tab, selectedFilter === filter && styles.tabActive]}
          onPress={() => setSelectedFilter(filter)}
        >
          <Text style={[styles.tabText, selectedFilter === filter && styles.tabTextActive]}>{filter}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );  */}

  const renderBudgetItem = ({ item }) => {
    const isExpanded = expandedCategory === item.category;
    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <View style={styles.budgetCard}>
          <View style={styles.budgetCardLeft}>
            <Text style={styles.budgetCategory}>{item.category}</Text>
            <Text style={styles.budgetAmount}>Budget:{Number(item.amount)}</Text>
           {/* <Text style={styles.budgetSpent}>Spent:{Number(item.spent || 0)}</Text>  */}

            {isExpanded && (
              <View style={styles.expandedSection}>
              <Text style={styles.budgetSpent}>Spent:{Number(item.spent || 0)}</Text>
                {item.amount - item.spent >= 0 ? (
                  <Text style={styles.detailText}>Remaining:{(item.amount - item.spent)}</Text>
                ) : (
                  <Text style={[styles.detailText, { color: '#D32F2F' }]}>
                    Over Budget:{Math.abs(item.amount - item.spent)}
                  </Text>
                )}
                <Text style={styles.detailText}>Filter: {selectedFilter}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setExpandedCategory(isExpanded ? null : item.category)}
              style={styles.expandBtn}
            >
              <Text style={styles.expandBtnText}>{isExpanded ? 'Hide' : 'Show More'}</Text>
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
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    </View>
  );
 
  return (
    <View style={styles.container}>
    <BudgetRing totalSpent={totalSpent} totalBudget={totalBudget} />

    <View style={styles.line} />

    {/* Tabs */}
    <View style={styles.tabsRow}>
      {FILTERS.map(filter => (
        <TouchableOpacity
          key={filter}
          onPress={() => setSelectedFilter(filter)}
          style={[styles.tab, selectedFilter === filter && styles.tabActive]}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, selectedFilter === filter && styles.tabTextActive]}>
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

  
      <Text style={styles.todayBudgetTitle}>
        {selectedFilter} Budget ({getBudgetTitle()})
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
        <Text style={styles.todayBudgetAmount}>No budget data</Text>
      )}

      <Text style={styles.categoriesTitle}>Categories</Text>

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
        <Text style={styles.addNewCategoryButtonText}>+ Add New Category</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
           
  {newCategoryModal ? 'Add New Category' : `Add Budget for ${selectedCategory?.name}`}
</Text>


            {newCategoryModal ? (
              <TextInput
                placeholder="Category Name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                style={styles.input}
              />
            ) : (
              <Text style={{ marginBottom: 10 }}>{selectedCategory?.name}</Text>
            )}

            <TextInput
              placeholder="Enter budget amount"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              keyboardType="numeric"
              style={styles.input}
            />

            <Button title="Save" onPress={handleSaveBudget} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#999" />
          </View>
        </View>
      </Modal>
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