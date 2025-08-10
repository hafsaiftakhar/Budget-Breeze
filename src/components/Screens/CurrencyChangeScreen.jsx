import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { CurrencyContext } from "./CurrencyContext"; // correct path check karen

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar", rate: 0.0036 }, // Example: 1 PKR = 0.0036 USD
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.0033 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.0028 },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", rate: 1 }, // base rate
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 0.56 },
];

const CurrencyChangeScreen = () => {
  const { currency, changeCurrency } = useContext(CurrencyContext);

  const renderItem = ({ item }) => {
    const isSelected = item.code === currency.code;
    return (
      <TouchableOpacity
        style={[styles.itemContainer, isSelected && styles.selectedItem]}
        onPress={() =>
          changeCurrency({
            code: item.code,
            symbol: item.symbol,
            rate: item.rate, // ✅ rate included
          })
        }
      >
        <Text style={styles.currencySymbol}>{item.symbol}</Text>
        <Text style={styles.currencyName}>
          {item.name} ({item.code})
        </Text>
        {isSelected && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Currency</Text>
      <FlatList
        data={currencies}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        extraData={currency.code}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  itemContainer: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  selectedItem: {
    backgroundColor: "#d0e8ff",
  },
  currencySymbol: {
    fontSize: 22,
    width: 40,
    textAlign: "center",
  },
  currencyName: {
    flex: 1,
    fontSize: 16,
    color: "#222",
  },
  checkMark: {
    fontSize: 18,
    color: "#007bff",
    fontWeight: "bold",
  },
});

export default CurrencyChangeScreen;
