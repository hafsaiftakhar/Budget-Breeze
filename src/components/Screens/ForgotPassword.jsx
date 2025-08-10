import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Please enter a valid email');
      return;
    }

    try {
      const response = await fetch('http://192.168.100.8:3033/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.message === 'OTP sent to your email') {
        Alert.alert('Check your email for the OTP');
        navigation.navigate('OTPVerification', { email, from: 'forgot' });

      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred, please try again.');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 10 }}
      />
      <Button title="Send OTP" onPress={handleForgotPassword} />
    </View>
  );
};

export default ForgotPassword; 