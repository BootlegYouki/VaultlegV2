import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { LayoutGrid, FileText, Landmark, Plus, TrendingUp } from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiText } from './tui-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ScreenType = 'dashboard' | 'expenses' | 'add-transaction' | 'stats' | 'debts' | 'settings';

interface TuiTabBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onLongPressAdd?: () => void;
}

export const TuiTabBar: React.FC<TuiTabBarProps> = ({
  currentScreen,
  onNavigate,
  onLongPressAdd,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [buttonWidths, setButtonWidths] = React.useState<Record<string, number>>({});
  const [legendWidths, setLegendWidths] = React.useState<Record<string, number>>({});

  const borderAccent = colors.primary;

  const menuItems: { screen: ScreenType; label: string; Icon: React.ComponentType<any> }[] = [
    { screen: 'dashboard', label: 'Home', Icon: LayoutGrid },
    { screen: 'expenses', label: 'Logs', Icon: FileText },
    { screen: 'stats', label: 'Stats', Icon: TrendingUp },
    { screen: 'debts', label: 'Debts', Icon: Landmark },
  ];

  const isPlusActive = currentScreen === 'add-transaction';

  return (
    <View style={[styles.shadowWrapper, { bottom: insets.bottom }]}>
      <View style={styles.navRow}>

        {/* 4 MENU TABS */}
        {menuItems.map((item, idx) => {
          const isActive = currentScreen === item.screen;
          const bWidth = buttonWidths[item.screen] || 70;
          const lWidth = legendWidths[item.screen] || 32;
          const topSegmentWidth = Math.max(0, (bWidth - lWidth) / 2);

          return (
            <Pressable
              key={item.screen}
              onPress={() => onNavigate(item.screen)}
              onLayout={(e) => {
                const width = e.nativeEvent.layout.width;
                setButtonWidths(prev => ({ ...prev, [item.screen]: width }));
              }}
              style={[
                styles.tabSquare,
                {
                  backgroundColor: isActive ? (isDark ? '#27272A' : '#E4E4E7') : colors.card,
                  marginRight: idx === menuItems.length - 1 ? 48 : 8, // 14px gap before '+' button, 4px between menu tabs
                },
              ]}
            >
              {/* Dynamic Segmented Borders */}
              <View style={[styles.borderLeft, { backgroundColor: borderAccent }]} />
              <View style={[styles.borderRight, { backgroundColor: borderAccent }]} />
              <View style={[styles.borderBottom, { backgroundColor: borderAccent }]} />
              <View style={[styles.borderTopLeft, { backgroundColor: borderAccent, width: topSegmentWidth }]} />
              <View style={[styles.borderTopRight, { backgroundColor: borderAccent, width: topSegmentWidth }]} />

              {/* Brutalist legend resting on top border */}
              <View
                onLayout={(e) => {
                  const width = e.nativeEvent.layout.width;
                  setLegendWidths(prev => ({ ...prev, [item.screen]: width }));
                }}
                style={[
                  styles.legendWrapper,
                  {
                    backgroundColor: 'transparent',
                    paddingHorizontal: 2,
                  }
                ]}
              >
                <TuiText
                  weight="bold"
                  style={[
                    styles.legendText,
                    { color: isActive ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {item.label}
                </TuiText>
              </View>

              <View style={styles.tabContent} pointerEvents="none">
                <item.Icon
                  size={18}
                  color={isActive ? colors.primary : colors.mutedForeground}
                />
              </View>
            </Pressable>
          );
        })}

        {/* STANDALONE PLUS LOG BUTTON */}
        <Pressable
          onPress={() => onNavigate('add-transaction')}
          onLongPress={onLongPressAdd}
          delayLongPress={350}
          onLayout={(e) => {
            const width = e.nativeEvent.layout.width;
            setButtonWidths(prev => ({ ...prev, ['add-transaction']: width }));
          }}
          style={[
            styles.plusBtnSquare,
            {
              backgroundColor: isPlusActive ? (isDark ? '#27272A' : '#E4E4E7') : colors.card,
            },
          ]}
        >
          {/* Dynamic Segmented Borders */}
          <View style={[styles.borderLeft, { backgroundColor: borderAccent }]} />
          <View style={[styles.borderRight, { backgroundColor: borderAccent }]} />
          <View style={[styles.borderBottom, { backgroundColor: borderAccent }]} />
          <View
            style={[
              styles.borderTopLeft,
              {
                backgroundColor: borderAccent,
                width: Math.max(0, ((buttonWidths['add-transaction'] || 52) - (legendWidths['add-transaction'] || 24)) / 2)
              }
            ]}
          />
          <View
            style={[
              styles.borderTopRight,
              {
                backgroundColor: borderAccent,
                width: Math.max(0, ((buttonWidths['add-transaction'] || 52) - (legendWidths['add-transaction'] || 24)) / 2)
              }
            ]}
          />

          {/* Brutalist legend resting on top border */}
          <View
            onLayout={(e) => {
              const width = e.nativeEvent.layout.width;
              setLegendWidths(prev => ({ ...prev, ['add-transaction']: width }));
            }}
            style={[
              styles.legendWrapper,
              {
                backgroundColor: 'transparent',
                paddingHorizontal: 2,
              }
            ]}
          >
            <TuiText
              weight="bold"
              style={[
                styles.legendText,
                { color: isPlusActive ? colors.primary : colors.mutedForeground },
              ]}
            >
              Add
            </TuiText>
          </View>

          <View style={styles.tabContent} pointerEvents="none">
            <Plus
              size={18}
              color={isPlusActive ? colors.primary : colors.mutedForeground}
            />
          </View>
        </Pressable>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    position: 'absolute',
    bottom: 15,
    left: 20, // Comfortable breathing room
    right: 20, // Comfortable breathing room
    zIndex: 99,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 10, // Margin to protect top overlapping legends
  },
  tabSquare: {
    flex: 1, // Uniform responsive width sharing
    height: 52, // Balanced vertical square height
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  plusBtnSquare: {
    height: 52,
    width: 52, // Fixed width matching height exactly to be a perfect square
    alignItems: 'center',
    justifyContent: 'center',
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
    right: 0,
    top: 0,
    height: 1.5,
    zIndex: 5,
  },
  legendWrapper: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    paddingHorizontal: 2,
    zIndex: 10,
  },
  legendText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
