import React, { useState } from 'react';
import { View, Pressable, Animated, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Landmark } from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiText } from './tui-text';
import { logger } from '../utils/logger';

interface FabMenuProps {
  fabAnimExpense: Animated.Value;
  fabAnimIncome: Animated.Value;
  fabAnimDebt: Animated.Value;
  bottomOffset: number;
  onOpenExpense: () => void;
  onOpenIncome: () => void;
  onOpenDebt: () => void;
}

interface FabItemProps {
  label: string;
  icon: React.ReactNode;
  animVal: Animated.Value;
  hasMarginBottom?: boolean;
  onPress: () => void;
}

const FabItem: React.FC<FabItemProps> = ({ label, icon, animVal, hasMarginBottom = true, onPress }) => {
  const { colors, isDark } = useTheme();
  const borderAccent = colors.primary;
  const [legendWidth, setLegendWidth] = useState(0);

  return (
    <Animated.View
      style={{
        opacity: animVal,
        transform: [
          { scale: animVal },
          {
            translateY: animVal.interpolate({
              inputRange: [0, 1],
              outputRange: [24, 0],
            }),
          },
        ],
      }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.fabKey,
          {
            backgroundColor: pressed ? (isDark ? '#27272A' : '#E4E4E7') : colors.card,
            marginBottom: hasMarginBottom ? 14 : 0,
          },
        ]}
      >
        {/* Dynamic Segmented Borders */}
        <View style={[styles.fabBorderLeft, { backgroundColor: borderAccent }]} />
        <View style={[styles.fabBorderRight, { backgroundColor: borderAccent }]} />
        <View style={[styles.fabBorderBottom, { backgroundColor: borderAccent }]} />
        <View
          style={[
            styles.fabBorderTopLeft,
            { backgroundColor: borderAccent, width: Math.max(0, (52 - legendWidth) / 2) },
          ]}
        />
        <View
          style={[
            styles.fabBorderTopRight,
            { backgroundColor: borderAccent, width: Math.max(0, (52 - legendWidth) / 2) },
          ]}
        />

        {/* Centered Legend resting on top border */}
        <View
          onLayout={(e) => setLegendWidth(e.nativeEvent.layout.width)}
          style={[styles.fabLegendWrapper, { backgroundColor: 'transparent' }]}
        >
          <TuiText weight="bold" style={[styles.fabLegendText, { color: colors.primary }]}>
            {label}
          </TuiText>
        </View>

        <View style={styles.fabContent} pointerEvents="none">
          {icon}
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const FabMenu: React.FC<FabMenuProps> = ({
  fabAnimExpense,
  fabAnimIncome,
  fabAnimDebt,
  bottomOffset,
  onOpenExpense,
  onOpenIncome,
  onOpenDebt,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.fabMenuContainer, { bottom: bottomOffset }]}>
      <FabItem
        label="Debt"
        icon={<Landmark size={18} color={colors.primary} />}
        animVal={fabAnimDebt}
        onPress={() => {
          onOpenDebt();
          logger.log('NAVIGATOR', 'FAB_OPEN_ADD_DEBT_DRAWER');
        }}
      />
      <FabItem
        label="Inc"
        icon={<TrendingUp size={18} color={colors.primary} />}
        animVal={fabAnimIncome}
        onPress={() => {
          onOpenIncome();
          logger.log('NAVIGATOR', 'FAB_OPEN_ADD_INCOME_DRAWER');
        }}
      />
      <FabItem
        label="Exp"
        icon={<TrendingDown size={18} color={colors.primary} />}
        animVal={fabAnimExpense}
        hasMarginBottom={false}
        onPress={() => {
          onOpenExpense();
          logger.log('NAVIGATOR', 'FAB_OPEN_ADD_EXPENSE_DRAWER');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fabMenuContainer: {
    position: 'absolute',
    right: 20,
    width: 52,
    zIndex: 9999,
  },
  fabKey: {
    height: 52,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 14,
  },
  fabBorderLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  fabBorderRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  fabBorderBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1.5,
    zIndex: 5,
  },
  fabBorderTopLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 1.5,
    zIndex: 5,
  },
  fabBorderTopRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: 1.5,
    zIndex: 5,
  },
  fabLegendWrapper: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    paddingHorizontal: 2,
    zIndex: 10,
  },
  fabLegendText: {
    fontSize: 14,
    letterSpacing: 0.2,
    fontFamily: 'JetBrainsMono_700Bold',
  },
  fabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
