import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiText } from './tui-text';
import { TuiMiniCheckbox } from './tui-mini-checkbox';
import { Transaction, getCategoryLabel } from '../types';
import { getCategoryIcon } from '../utils/category-icon';

interface TuiTransactionRowProps {
  t: Transaction;
  isSelected?: boolean;
  isEditing?: boolean;
  isSelectionMode?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

export const TuiTransactionRow: React.FC<TuiTransactionRowProps> = ({
  t,
  isSelected = false,
  isEditing = false,
  isSelectionMode = false,
  onPress,
  onLongPress,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [
        styles.logRow,
        {
          borderColor: isEditing ? colors.primary : (isSelected ? colors.primary : (isDark ? colors.primary + '40' : colors.primary + '30')),
          opacity: pressed ? 0.7 : 1,
          backgroundColor: isEditing ? colors.primary + '15' : (isSelected ? colors.primary + '10' : (isDark ? '#1C1C1E' : '#FFFFFF')),
        },
      ]}
    >
      {isSelectionMode && <TuiMiniCheckbox checked={isSelected} />}

      <View
        style={[
          styles.iconBox,
          {
            borderColor: isDark ? '#3F3F46' : '#000000',
            backgroundColor: isDark ? '#27272A' : '#FFFFFF',
          },
        ]}
      >
        {getCategoryIcon(t.category, 14, isDark ? '#FAFAFA' : '#000000')}
      </View>

      <View style={styles.logLeft}>
        <TuiText weight="bold" size="md">
          {t.description}
        </TuiText>
        <TuiText size="sm" variant="muted">
          {t.date} | {getCategoryLabel(t.category)}
        </TuiText>
      </View>

      <View style={styles.logRight}>
        <TuiText
          weight="bold"
          style={{
            color: t.type === 'income' ? colors.primary : colors.destructive,
            fontSize: 16,
          }}
        >
          {t.type === 'income' ? '+' : '-'}₱{t.amount.toFixed(2)}
        </TuiText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logLeft: {
    flex: 1,
  },
  logRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
