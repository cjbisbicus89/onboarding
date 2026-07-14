import React, { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { makeToastStyles } from './toast.component.styles';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
}

const TOAST_DEFAULT_DURATION_MS = 4000;
const TOAST_ANIMATION_DURATION_MS = 300;

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = TOAST_DEFAULT_DURATION_MS,
  onDismiss,
}) => {
  const opacity = useState(new Animated.Value(0))[0];
  const styles = StyleSheet.create(makeToastStyles());
  const animatedStyle = useMemo(() => ({ opacity }), [opacity]);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: TOAST_ANIMATION_DURATION_MS,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: TOAST_ANIMATION_DURATION_MS,
        useNativeDriver: true,
      }).start(onDismiss);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, opacity, onDismiss]);

  return (
    <Animated.View style={[styles.container, styles[type], animatedStyle]}>
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

