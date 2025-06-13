import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // initial opacity 0

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, // fully visible
      duration: 2000, // 2 seconds
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace('LandingPage');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../../assets/logo1.jpg')}
        style={[styles.logo, { opacity: fadeAnim }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,  // size increased from 200 to 300
    height: 300, // size increased from 200 to 300
    resizeMode: 'contain',
  },
});


export default SplashScreen;
