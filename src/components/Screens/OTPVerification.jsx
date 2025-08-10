import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const OTPVerification= ({ route, navigation }) => {
  const { email, from } = route.params; // get email and from flag
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputs.current[index + 1].focus();
    if (!text && index > 0) inputs.current[index - 1].focus();
  };

  const handleOTPVerification = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP.');
      return;
    }

    try {
      const response = await fetch('http://192.168.100.8:3033/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (data.message === 'OTP verified successfully') {
        if (from === 'signup') {
          navigation.navigate('Login'); // Go to login after signup
        } else if (from === 'forgot') {
          navigation.navigate('NewPassword', { email, otp: otpCode }); // Go to reset password
        }
      } else {
        Alert.alert('Error', data.message || 'OTP verification failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred, please try again later.');
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('http://192.168.100.8:3033/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'OTP has been resent to your email.');
      } else {
        Alert.alert('Error', data.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while resending OTP.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>
        We’ve sent a 6-digit OTP to {email}
      </Text>

      <View style={styles.otpBoxContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => (inputs.current[index] = el)}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(text) => handleChange(text, index)}
            value={digit}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleOTPVerification}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>

      <Text style={styles.resendText}>
        Didn't receive the code?{' '}
        <TouchableOpacity onPress={handleResendOTP}>
          <Text style={styles.resendLink}>Resend</Text>
        </TouchableOpacity>
      </Text>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3E3A59',
    marginBottom: 10,
  },
  subtitle: {
    color: '#6E6893',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 14,
    paddingHorizontal: 10,
  },
  otpBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 30,
  },
  otpBox: {
    width: 45,
    height: 55,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D6D3F0',
    borderRadius: 10,
    fontSize: 20,
    textAlign: 'center',
    elevation: 2,
    color: '#000',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 16,
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendText: {
    marginTop: 25,
    color: '#6E6893',
    fontSize: 14,
    flexDirection: 'row',
  },
  resendLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default OTPVerification; 