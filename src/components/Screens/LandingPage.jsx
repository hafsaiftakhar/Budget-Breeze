import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';



const LandingPage = ({ navigation }) => {
  
  return (
    <View style={styles.container}>
      {/* Main content inside a white container */}
      <View style={styles.content}>
        <Text style={styles.appName}>Budget Breeze</Text>
        <Text style={styles.tagline}>Manage your finances with ease!</Text>
        <Text style={styles.description}>
          Track your spending, set budgets, and stay on top of your finances effortlessly.
        </Text>

        {/* Call to Action Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Background color for the whole screen
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  content: {
    backgroundColor: '#ffffff', // White background for the content area
    width: '90%',
    height: '60%', // Adjusted content height
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  appName: {
    fontSize: 36,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4CAF50', // Green button color
    padding: 15,
    borderRadius: 10,
    width: '80%',
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LandingPage;
