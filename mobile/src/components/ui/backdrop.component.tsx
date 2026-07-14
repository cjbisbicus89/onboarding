import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { AnimationConfig, useResponsiveDimensions } from '../../infrastructure/theme';
import { makeBackdropStyles } from './backdrop.component.styles';

interface BackdropProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Backdrop: React.FC<BackdropProps> = ({
  visible,
  onClose,
  children,
}) => {
  const { height } = useResponsiveDimensions();
  const translateY = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const styles = useMemo(() => StyleSheet.create(makeBackdropStyles(height)), [height]);
  const overlayAnimatedStyle = useMemo(
    () => ({ opacity: overlayOpacity }),
    [overlayOpacity],
  );
  const backdropAnimatedStyle = useMemo(
    () => ({ transform: [{ translateY }] }),
    [translateY],
  );

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: AnimationConfig.BackdropDurationMs,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: AnimationConfig.BackdropOverlayOpacity,
          duration: AnimationConfig.BackdropDurationMs,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: AnimationConfig.BackdropDurationMs,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: AnimationConfig.BackdropDurationMs,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, overlayOpacity, height]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
        onPanResponderMove: (_, gestureState) => {
          translateY.setValue(gestureState.dy);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > height * AnimationConfig.DragCloseThreshold) {
            onClose();
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [height, onClose, translateY],
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[styles.overlay, StyleSheet.absoluteFill, overlayAnimatedStyle]}
          onStartShouldSetResponder={() => true}
          onResponderRelease={onClose}
        />
        <Animated.View
          style={[styles.backdrop, backdropAnimatedStyle]}
          {...panResponder.panHandlers}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

