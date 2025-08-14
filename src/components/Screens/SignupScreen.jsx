import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SignupScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const ValidationSchema = Yup.object().shape({
    firstName: Yup.string()
      .matches(/^[A-Za-z]+$/, 'First Name must contain only letters')
      .required('First Name is required'),
    lastName: Yup.string()
      .matches(/^[A-Za-z]+$/, 'Last Name must contain only letters')
      .required('Last Name is required'),
    email: Yup.string()
      .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/, 'Email must end with .com')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters long')
      .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[@$!%*?&#]/, 'Password must contain at least one special character')
      .required('Password field is required'),
  });

  const handleSignup = async (values) => {
    try {
      const response = await axios.post('http://192.168.100.8:3033/api/auth/signup', {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        password: values.password,
      });

      if (response.status === 201) {
        // Signup success, save JWT token if returned
        const { userId, token } = response.data;

        if (token) {
          await AsyncStorage.setItem('user_id', String(userId));
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('isLoggedIn', 'true');
          await AsyncStorage.setItem('first_name', values.firstName);
          await AsyncStorage.setItem('last_name', values.lastName);
          await AsyncStorage.setItem('email', values.email);

          Alert.alert('Success', 'Account created & logged in successfully!');
          navigation.navigate('DrawerNavigator'); // Navigate to main screen
        } else {
          // If JWT not returned, navigate to OTP screen
          Alert.alert('Success', 'Account created! Please verify OTP.');
          navigation.navigate('VerifyOTP', { email: values.email, from: 'signup' });
        }
      } else {
        Alert.alert('Error', 'Something went wrong');
      }
    } catch (error) {
      console.error('Signup Error', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to Signup');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Sign Up</Text>

        <Formik
          initialValues={{ firstName: '', lastName: '', email: '', password: '' }}
          validationSchema={ValidationSchema}
          onSubmit={handleSignup}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              {/* First Name Field */}
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="grey" style={styles.iconLeft} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="First Name"
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  value={values.firstName}
                />
              </View>
              {touched.firstName && errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}

              {/* Last Name Field */}
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="grey" style={styles.iconLeft} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Last Name"
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  value={values.lastName}
                />
              </View>
              {touched.lastName && errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}

              {/* Email Field */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="grey" style={styles.iconLeft} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter Email"
                  keyboardType="email-address"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                />
              </View>
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="grey" style={styles.iconLeft} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter Password"
                  secureTextEntry={!showPassword}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeIcon}
                >
                  <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="grey" />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              {/* Sign Up Button */}
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        {/* Already have an account? Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  card: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardHeader: { fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 20, paddingHorizontal: 10, height: 50 },
  input: { flex: 1, paddingVertical: 10, fontSize: 16, borderWidth: 0 },
  iconLeft: { marginRight: 10 },
  eyeIcon: { position: 'absolute', right: 10, top: 12 },
  button: { backgroundColor: '#4CAF50', paddingVertical: 12, alignItems: 'center', borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18 },
  errorText: { color: 'red', fontSize: 12 },
  loginContainer: { marginTop: 15, alignItems: 'center' },
  loginText: { fontSize: 14 },
  loginLink: { color: '#4CAF50', fontWeight: 'bold' },
});

export default SignupScreen;
