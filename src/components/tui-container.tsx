import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiText } from './tui-text';

interface TuiContainerProps {
  children: React.ReactNode;
  label: string;
  badge?: string;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  accentBorder?: boolean;
}

export const TuiContainer: React.FC<TuiContainerProps> = ({
  children,
  label,
  badge,
  style,
  contentStyle,
  accentBorder = false,
}) => {
  const { colors, isDark } = useTheme();

  // Brutalist double-line border style, or clean solid border
  const borderColor = accentBorder ? colors.primary : (isDark ? colors.primary + '40' : '#000000');
  const backgroundColor = colors.card;

  return (
    <View
      style={[
        styles.outerContainer,
        {
          borderColor,
          backgroundColor,
        },
        style,
      ]}
    >
      {/* Legend Container */}
      <View
        style={[
          styles.legendWrapper,
          {
            backgroundColor: colors.background, // Match screen background to cover the line
          },
        ]}
      >
        <TuiText weight="bold" size="sm" style={{ color: colors.primary }}>
          [{label}]
        </TuiText>
        {badge && (
          <View
            style={[
              styles.badgeContainer,
              {
                borderColor: colors.primary,
                backgroundColor: isDark ? colors.primary + '15' : colors.primary + '10',
              },
            ]}
          >
            <TuiText size="xs" weight="bold" style={{ color: colors.primary }}>
              {badge}
            </TuiText>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderWidth: 2,
    marginTop: 14,
    marginBottom: 8,
    padding: 12,
    paddingTop: 16,
    width: '100%',
    position: 'relative',
  },
  legendWrapper: {
    position: 'absolute',
    top: -11,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 10,
  },
  badgeContainer: {
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
  },
  content: {
    width: '100%',
  },
});
