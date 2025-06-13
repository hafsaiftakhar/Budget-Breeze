import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SpeakOnPress from './SpeakOnPress'; // Ensure this is implemented correctly
import * as Speech from 'expo-speech';

const LogoutScreen = ({ navigation, setIsLoggedIn  }) => {
  const handleLogout = async () => {
    try {
      const email = await AsyncStorage.getItem('email');
      if (!email) {
        return handleAlert('Logout Failed', 'No user email found in storage.');
      }

      const response = await axios.post('http://192.168.100.8:3033/api/auth/logout', { email });

      if (response.status === 200) {
        await AsyncStorage.clear();
        handleAlert('Success', 'Logged out successfully', () => {
          setIsLoggedIn(false); // 👈 update state
          
        });
      }
    } catch (error) {
      handleAlert(
        'Logout Error',
        error.response?.data?.message || 'Something went wrong during logout.'
      );
    }
  };

  const handleAlert = (title, message, onPressCallback = null) => {
    Speech.speak(message);
    Alert.alert(title, message, [
      {
        text: 'OK',
        onPress: onPressCallback,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SpeakOnPress textToSpeak="Are you sure you want to logout?">
        <Text style={styles.text}>Are you sure you want to logout?</Text>
      </SpeakOnPress>

      <SpeakOnPress textToSpeak="Press here to logout" onPress={handleLogout}>
        <View style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </View>
      </SpeakOnPress>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LogoutScreen;
