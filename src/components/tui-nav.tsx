import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LayoutGrid, PlusSquare } from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiText } from './tui-text';

export type ScreenType = 'dashboard' | 'add-transaction';

interface TuiTabBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const TuiTabBar: React.FC<TuiTabBarProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const { colors, isDark } = useTheme();

  const getColors = (isActive: boolean, pressed: boolean) => {
    // Monochromatic highlights
    if (isActive) {
      return {
        bg: colors.primary,
        text: colors.primaryForeground,
        icon: colors.primaryForeground,
      };
    }
    return {
      bg: pressed ? colors.primary + '15' : 'transparent',
      text: colors.mutedForeground,
      icon: colors.mutedForeground,
    };
  };

  const borderAccent = isDark ? colors.primary : '#000000';

  return (
    <View style={styles.shadowWrapper}>
      <View
        style={[
          styles.container,
          {
            borderColor: borderAccent,
            backgroundColor: colors.card,
          },
        ]}
      >
        {/* HOME TAB */}
        <Pressable
          onPress={() => onNavigate('dashboard')}
          style={({ pressed }) => [
            styles.tab,
            {
              backgroundColor: getColors(currentScreen === 'dashboard', pressed).bg,
            },
          ]}
        >
          {({ pressed }) => {
            const activeColors = getColors(currentScreen === 'dashboard', pressed);
            return (
              <View style={styles.tabContent}>
                <LayoutGrid size={18} color={activeColors.icon} style={styles.tabIcon} />
                <TuiText
                  weight="bold"
                  size="sm"
                  style={{ color: activeColors.text }}
                >
                  Home
                </TuiText>
              </View>
            );
          }}
        </Pressable>

        {/* Vertical Separator */}
        <View style={[styles.separator, { backgroundColor: borderAccent }]} />

        {/* ADD TRANSACTION TAB */}
        <Pressable
          onPress={() => onNavigate('add-transaction')}
          style={({ pressed }) => [
            styles.tab,
            {
              backgroundColor: getColors(currentScreen === 'add-transaction', pressed).bg,
            },
          ]}
        >
          {({ pressed }) => {
            const activeColors = getColors(currentScreen === 'add-transaction', pressed);
            return (
              <View style={styles.tabContent}>
                <PlusSquare size={18} color={activeColors.icon} style={styles.tabIcon} />
                <TuiText
                  weight="bold"
                  size="sm"
                  style={{ color: activeColors.text }}
                >
                  Add Expense
                </TuiText>
              </View>
            );
          }}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 99,
  },
  container: {
    flexDirection: 'row',
    borderWidth: 2.5,
    height: 58,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginRight: 6,
  },
  separator: {
    width: 2.5,
    height: '100%',
  },
});
