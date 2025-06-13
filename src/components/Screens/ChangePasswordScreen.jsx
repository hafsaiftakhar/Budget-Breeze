import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpeakOnPress from './SpeakOnPress'; // Import SpeakOnPress
import * as Speech from 'expo-speech'; // Import Speech

const ChangePasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [storedPassword, setStoredPassword] = useState(null);

  const navigation = useNavigation();
  
  useEffect(() => {
    const fetchStoredPassword = async () => {
      try {
        const savedPassword = await AsyncStorage.getItem('password');
        if (savedPassword) {
          setStoredPassword(savedPassword);
        }
      } catch (error) {
        console.error('Error fetching stored password:', error);
      }
    };

    fetchStoredPassword();
}, []); 

  const handleChangePassword = async () => {
    const email = await AsyncStorage.getItem('email');

    if (!storedPassword) {
      Alert.alert('Error', 'No password found. Please log in again.');
     Speech.speak('No password found. Please log in again.');  
      return;
    }

    if (storedPassword !== currentPassword) {
      Alert.alert('Error', 'Current password is incorrect.');
    Speech.speak('Current password is incorrect.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      Speech.speak('New passwords do not match.');
      
      return;
    }

    try {
      const response = await fetch('http://192.168.100.8:3033/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, oldPassword: currentPassword, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.removeItem('password');
         Alert.alert('Success', 'Password changed successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
        ]);
       Speech.speak('Password changed successfully.');
     } else {
        Alert.alert('Error', data.message || 'Failed to update password.');
       Speech.speak(data.message || 'Failed to update password.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
     Speech.speak('Something went wrong. Please try again.');
      
    }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      {/* Current Password */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Current Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showCurrentPassword}
          value={currentPassword}
          onChangeText={(text) => {
            setCurrentPassword(text);
            Speech.speak(text); // Speak the current input
          }}
          onFocus={() => Speech.speak("Current password")}
        />
        <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
          <Ionicons name={showCurrentPassword ? 'eye' : 'eye-off'} size={22} color="gray" />
        </TouchableOpacity>
      </View>

      {/* New Password */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showNewPassword}
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            Speech.speak(text); // Speak the current input
          }}
          onFocus={() => Speech.speak("New password")}
        />
        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
          <Ionicons name={showNewPassword ? 'eye' : 'eye-off'} size={22} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Confirm New Password */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="#aaa"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
           onChangeText={(text) => {
            setConfirmPassword(text);
            Speech.speak(text); // Speak the current input
          }}
          onFocus={() =>Speech.speak("Confirm new password")}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={22} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Use SpeakOnPress here for button */}
      <SpeakOnPress textToSpeak="Tap to change your password">
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </SpeakOnPress>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  input: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;
