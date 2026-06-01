import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme-provider';

interface TuiTextProps extends TextProps {
  weight?: 'regular' | 'bold';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  variant?: 'default' | 'muted' | 'accent' | 'destructive' | 'inverse';
}

export const TuiText: React.FC<TuiTextProps> = ({
  children,
  style,
  weight = 'regular',
  size = 'md',
  variant = 'default',
  ...props
}) => {
  const { colors } = useTheme();

  const getFontFamily = () => {
    return weight === 'bold' ? 'JetBrainsMono_700Bold' : 'JetBrainsMono_400Regular';
  };

  const getFontSize = () => {
    switch (size) {
      case 'xs': return 10;
      case 'sm': return 12;
      case 'md': return 14;
      case 'lg': return 16;
      case 'xl': return 18;
      case '2xl': return 22;
      case '3xl': return 28;
      default: return 14;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'muted': return colors.mutedForeground;
      case 'accent': return colors.primary;
      case 'destructive': return colors.destructive;
      case 'inverse': return colors.primaryForeground;
      default: return colors.foreground;
    }
  };

  return (
    <Text
      style={[
        {
          fontFamily: getFontFamily(),
          fontSize: getFontSize(),
          color: getTextColor(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
