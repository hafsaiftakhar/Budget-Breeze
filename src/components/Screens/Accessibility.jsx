import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useAccessibility } from './AccessibilityContext';

const Accessability = () => {
  const { accessibilityMode, setAccessibilityMode } = useAccessibility();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accessibility Settings</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Enable Text-to-Speech</Text>
        <Switch
          value={accessibilityMode}
          onValueChange={() => setAccessibilityMode(prev => !prev)}
        />
      </View>

      <Text style={styles.status}>
        Accessibility Mode is {accessibilityMode ? 'On' : 'Off'}
      </Text>
    </View>
  );
};

export default Accessability;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
  },
  status: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
});
