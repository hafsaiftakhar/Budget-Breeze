import React, { useContext } from 'react';
import { Text, Pressable } from 'react-native';
import * as Speech from 'expo-speech';
import { AccessibilityContext } from './AccessibilityContext';
import {Speakable} from './Speakable';

const SpeakableText = ({ children, style }) => {
  const { accessibilityOn } = useContext(AccessibilityContext);

  const speak = () => {
    if (accessibilityOn && typeof children === 'string') {
      Speech.speak(children, { language: 'en' });
    }
  };

  return (
    <Pressable onPress={speak}>
      <Text style={style}>{children}</Text>
    </Pressable>
  );
};

export default SpeakableText;
