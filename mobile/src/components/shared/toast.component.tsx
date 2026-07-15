import React, { useEffect, useMemo, useRef, useState } from 'react';
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
const TOAST_SLIDE_OFFSET = 30;

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = TOAST_DEFAULT_DURATION_MS,
  onDismiss,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(TOAST_SLIDE_OFFSET)).current;
  const styles = StyleSheet.create(makeToastStyles());
  const animatedStyle = useMemo(
    () => ({ opacity, transform: [{ translateY }] }),
    [opacity, translateY]
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: TOAST_ANIMATION_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: TOAST_ANIMATION_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: TOAST_ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: TOAST_SLIDE_OFFSET,
          duration: TOAST_ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start(onDismiss);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, opacity, translateY, onDismiss]);

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

