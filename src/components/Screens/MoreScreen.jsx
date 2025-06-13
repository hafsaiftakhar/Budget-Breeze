import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MoreScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Goal')}
      >
        <Text style={styles.buttonText}>Goal</Text>
      </TouchableOpacity>
      {/* You can add more items here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontSize: 18 },
});

export default MoreScreen;
