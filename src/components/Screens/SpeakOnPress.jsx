import React from 'react';
import { TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { useNavigation } from '@react-navigation/native';
import { AccessibilityContext } from './AccessibilityContext'; 


const SpeakOnPress = ({ children, textToSpeak, navigateTo, onPress }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (textToSpeak) {
      Speech.speak(textToSpeak);
    }

    if (navigateTo) {
      navigation.navigate(navigateTo);
    }

    if (onPress) {
      onPress(); // ✅ agar koi custom onPress function diya gaya ho toh
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
};

export default SpeakOnPress;  