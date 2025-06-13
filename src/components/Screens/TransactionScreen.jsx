import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const initialCategories = {
 income: [
  { icon: 'cash-outline', label: 'Salary' },
  { icon: 'card-outline', label: 'Freelance' },
  { icon: 'wallet-outline', label: 'Bonus' },
  { icon: 'business-outline', label: 'Business' },
  { icon: 'trending-up-outline', label: 'Interest' },
  { icon: 'home-outline', label: 'Rental Income' },
  { icon: 'stats-chart-outline', label: 'Dividends' },
  { icon: 'save-outline', label: 'Savings' },
  { icon: 'cash-outline', label: 'Loan' },
  { icon: 'people-outline', label: 'Pension' },
  { icon: 'medkit-outline', label: 'Insurance Claim' },
  { icon: 'ellipsis-horizontal-outline', label: 'Other' },
],


 expense: [
  { icon: 'fast-food-outline', label: 'Food' },
  { icon: 'home-outline', label: 'Home' },
  { icon: 'heart-outline', label: 'Health' },
  { icon: 'school-outline', label: 'Education' },
  { icon: 'cart-outline', label: 'Shopping' },
  { icon: 'bag-check-outline', label: 'Grocery' },         // added Grocery
  { icon: 'people-outline', label: 'Friends Outing' },     // added Friends Outing
  { icon: 'airplane-outline', label: 'Travel' },
  { icon: 'tv-outline', label: 'Entertainment' },
  { icon: 'water-outline', label: 'Utilities' },
  { icon: 'color-palette-outline', label: 'Beauty' },
  { icon: 'phone-portrait-outline', label: 'Mobile Phone' },
  { icon: 'cash-outline', label: 'Tax' },
  { icon: 'laptop-outline', label: 'Electronics' },
  { icon: 'ellipsis-horizontal-outline', label: 'Other' },
]

}


export default function TransactionScreen() {
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState(initialCategories);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const saveTransaction = async () => {
    if (!amount || !selectedCategory) {
      alert('Please enter amount and select a category');
      return;
    }

    try {
      const response = await fetch('http://192.168.100.8:3033/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          category: selectedCategory,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Transaction saved! ID: ${data.id}`);

        setAmount('');
        setSelectedCategory(null);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to save transaction: ' + error.message);
    }
  };

  const addNewCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat = { icon: 'add-circle-outline', label: newCategoryName.trim() };
    setCategories(prev => ({ ...prev, [type]: [...prev[type], newCat] }));
    setSelectedCategory(newCategoryName.trim());
    setNewCategoryName('');
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.heading}>Transaction Type</Text>
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
              <Text style={styles.toggleText}>{option.charAt(0).toUpperCase() + option.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.heading}>Enter Amount</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="Enter Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.heading}>Select Category</Text>
        <View style={styles.categoriesWrapper}>
          {categories[type].map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.categoryItem, selectedCategory === cat.label && styles.selectedCategory]}
              onPress={() => setSelectedCategory(cat.label)}
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
            <Text style={styles.categoryItemText}>New</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button fixed at bottom */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={saveTransaction}>
          <Text style={styles.saveButtonText}>Save Transaction</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Category name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#007bff' }]}
                onPress={addNewCategory}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#aaa' }]}
                onPress={() => {
                  setNewCategoryName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
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
  amountInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginBottom: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  categoriesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap:0,
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
    backgroundColor: '#cce5ff',
    borderColor: '#007bff',
  },
  categoryItemText: {
    fontSize: 10,
    marginTop: 4,
    color: 'black',
    textAlign: 'center',
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});