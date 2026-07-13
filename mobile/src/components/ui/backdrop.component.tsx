import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { COLORS, BORDER_RADIUS } from '../../infrastructure/theme';

const { height } = Dimensions.get('window');

const BACKDROP_ANIMATION_DURATION_MS = 300;
const BACKDROP_OVERLAY_OPACITY = 0.5;
const BACKDROP_DISMISS_THRESHOLD = 0.3;
const BACKDROP_HEIGHT_RATIO = 0.7;
const BACKDROP_BORDER_RADIUS = 20;

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
  const translateY = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: BACKDROP_ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: BACKDROP_OVERLAY_OPACITY,
          duration: BACKDROP_ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: BACKDROP_ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: BACKDROP_ANIMATION_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, overlayOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: (_, gestureState) => {
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > height * BACKDROP_DISMISS_THRESHOLD) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[styles.overlay, StyleSheet.absoluteFill, { opacity: overlayOpacity }]}
          onStartShouldSetResponder={() => true}
          onResponderRelease={onClose}
        />
        <Animated.View
          style={[styles.backdrop, { transform: [{ translateY }] }]}
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

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: COLORS.black,
  },
  backdrop: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * BACKDROP_HEIGHT_RATIO,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BACKDROP_BORDER_RADIUS,
    borderTopRightRadius: BACKDROP_BORDER_RADIUS,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
