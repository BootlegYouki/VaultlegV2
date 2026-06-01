import React, { useState } from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiText } from './tui-text';

interface TuiButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'accent' | 'destructive' | 'outline';
  disabled?: boolean;
}

export const TuiButton: React.FC<TuiButtonProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
  disabled = false,
}) => {
  const { colors, isDark } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  // Background and border colors based on variant
  const getColors = () => {
    if (disabled) {
      return {
        bg: isDark ? '#27272A' : '#E4E4E7',
        border: isDark ? '#3F3F46' : '#A1A1AA',
        text: isDark ? '#71717A' : '#71717A',
        shadow: 'transparent',
      };
    }

    switch (variant) {
      case 'accent':
        return {
          bg: colors.primary,
          border: isDark ? colors.primary : '#000000',
          text: colors.primaryForeground,
          shadow: isDark ? '#FFFFFF' : '#000000',
        };
      case 'destructive':
        return {
          bg: colors.destructive,
          border: isDark ? colors.destructive : '#000000',
          text: '#FFFFFF',
          shadow: isDark ? '#FFFFFF' : '#000000',
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: colors.primary,
          text: colors.primary,
          shadow: colors.primary + '30',
        };
      default:
        return {
          bg: isDark ? '#1C1C1E' : '#FFFFFF',
          border: isDark ? colors.primary : '#000000',
          text: colors.foreground,
          shadow: isDark ? colors.primary + '50' : '#000000',
        };
    }
  };

  const buttonColors = getColors();
  const shadowOffset = 4;

  return (
    <View style={[styles.container, { paddingBottom: shadowOffset, paddingRight: shadowOffset }, style]}>
      {/* Shadow layer (does not move) */}
      {!disabled && !isPressed && (
        <View
          style={[
            styles.shadow,
            {
              backgroundColor: buttonColors.shadow,
              top: shadowOffset,
              left: shadowOffset,
            },
          ]}
        />
      )}

      {/* Main button layer (shifts down/right on press) */}
      <Pressable
        disabled={disabled}
        onPressIn={() => !disabled && setIsPressed(true)}
        onPressOut={() => !disabled && setIsPressed(false)}
        onPress={onPress}
        style={[
          styles.button,
          {
            backgroundColor: buttonColors.bg,
            borderColor: buttonColors.border,
            transform: isPressed ? [{ translateX: shadowOffset }, { translateY: shadowOffset }] : [],
          },
        ]}
      >
        <TuiText
          weight="bold"
          style={{
            color: buttonColors.text,
            textAlign: 'center',
          }}
        >
          {children}
        </TuiText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 6,
  },
  shadow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  button: {
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
