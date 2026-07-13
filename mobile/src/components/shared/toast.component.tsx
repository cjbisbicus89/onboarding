import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info' }) => {
  return (
    <View style={[styles.container, styles[type]]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  info: { backgroundColor: '#2196F3' },
  success: { backgroundColor: '#4CAF50' },
  warning: { backgroundColor: '#FF9800' },
  error: { backgroundColor: '#F44336' },
});
