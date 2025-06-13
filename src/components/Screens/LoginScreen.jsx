import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


import axios from 'axios';


const LoginScreen = ({ route, navigation,setIsLoggedIn }) => {
   
  const [showPassword, setShowPassword] = useState(false);
  const ValidationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email field is required'),
    password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')  // Updated length to 8
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[@$!%*?&#]/, 'Password must contain at least one special character')
    .required('Password field is required'),
  });

  const handleLogin = async (values) => {
  try {
    
    const response = await axios.post('http://192.168.100.8:3033/api/auth/login', {
      email: values.email,
      password: values.password,
    });

    if (response.status === 200) {
      const { first_name, last_name } = response.data;

      // ✅ Save user data
      await AsyncStorage.setItem('first_name', first_name);
      await AsyncStorage.setItem('last_name', last_name);
      await AsyncStorage.setItem('email', values.email);
      console.log("Email saved in AsyncStorage:", values.email);
      await AsyncStorage.setItem('password', values.password);

      console.log("✅ User logged in successfully!");

      setIsLoggedIn(true);
      Alert.alert('Login Successful', response.data.message);
      navigation.navigate('DrawerNavigator'); // ✅ Redirect user
    }
  } catch (error) {

    Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
  }
};

 
  return (
   

    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Login</Text>

        <Formik
  initialValues={{ email: '', password: '' }}
  validationSchema={ValidationSchema}
  onSubmit={handleLogin}
>
  {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
    <View style={{ width: '100%' }}>
      {/* Form Fields */}
      <View style={styles.form}>
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
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={24}
              color="grey"
            />
          </TouchableOpacity>
        </View>
        {touched.password && errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        {/* Forgot Password Link */}
        <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  )}
</Formik>


        {/* Signup Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
               </TouchableOpacity>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    height: 50,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    outlineWidth: 0,
    borderWidth: 0,
  },
  iconLeft: {
    marginRight: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  signupContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default LoginScreen;