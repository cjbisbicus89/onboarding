import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
}

const TOAST_DEFAULT_DURATION_MS = 4000;

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = TOAST_DEFAULT_DURATION_MS,
  onDismiss,
}) => {
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(onDismiss);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, opacity, onDismiss]);

  return (
    <Animated.View style={[styles.container, styles[type], { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

export const useToast = () => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const show = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  const hide = () => {
    setToast(null);
  };

  return { toast, show, hide };
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
