import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Modal, Pressable, KeyboardAvoidingView, Platform, Animated, PanResponder } from 'react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiText } from './tui-text';

interface TuiDrawerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const TuiDrawer: React.FC<TuiDrawerProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const [cardHeight, setCardHeight] = useState(300);
  const [legendWidth, setLegendWidth] = useState(0);

  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const borderTopLeftWidth = Math.max(0, (cardWidth - legendWidth) / 2);
  const borderTopRightLeft = Math.max(0, (cardWidth + legendWidth) / 2);

  // Track gestures for swipe-down to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Intercept downwards drags
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = cardHeight * 0.4;
        if (gestureState.dy > threshold || gestureState.vy > 0.4) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  // Sync animations with visible state changes
  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      slideAnim.setValue(400);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible]);

  const borderAccent = isDark ? colors.primary : '#000000';

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Dimmed backdrop view fading in/out independently */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: 'rgba(0, 0, 0, 0.65)', opacity: fadeAnim }
          ]}
        />
        {/* Tap backdrop to close */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.drawerKeyboardAvoidingView}
        >
          <Animated.View
            onLayout={(e) => {
              setCardWidth(e.nativeEvent.layout.width);
              setCardHeight(e.nativeEvent.layout.height);
            }}
            style={[
              styles.drawerContent,
              {
                backgroundColor: colors.card,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {/* Custom Segmented Borders to support transparent legend background */}
            <View style={[styles.borderLeft, { backgroundColor: borderAccent }]} />
            <View style={[styles.borderRight, { backgroundColor: borderAccent }]} />
            <View style={[styles.borderBottom, { backgroundColor: borderAccent }]} />
            <View style={[styles.borderTopLeft, { backgroundColor: borderAccent, width: borderTopLeftWidth }]} />
            <View 
              style={[
                styles.borderTopRight, 
                { 
                  backgroundColor: borderAccent, 
                  left: borderTopRightLeft,
                }
              ]} 
            />

            {/* Legend title resting on top border acting as the grab handle */}
            <View
              {...panResponder.panHandlers}
              onLayout={(e) => setLegendWidth(e.nativeEvent.layout.width)}
              style={styles.legendWrapper}
            >
              <TuiText weight="bold" size="md" style={{ color: colors.primary }}>
                {title.toUpperCase()}
              </TuiText>
            </View>

            {/* Grab/Drag Zone (No handle pill) */}
            <View {...panResponder.panHandlers} style={styles.dragZone} />

            {/* Form/Children Content */}
            <View style={styles.content}>
              {children}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawerKeyboardAvoidingView: {
    width: '100%',
  },
  drawerContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    position: 'relative',
  },
  borderLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  borderRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  borderBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1.5,
    zIndex: 5,
  },
  borderTopLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 1.5,
    zIndex: 5,
  },
  borderTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 1.5,
    zIndex: 5,
  },
  legendWrapper: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 100,
  },
  dragZone: {
    width: '100%',
    height: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 90,
  },
  content: {
    width: '100%',
    marginTop: 20,
  },
});
