import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Trash2, Tag, ArrowUp, ArrowDown, Plus } from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { TuiText } from '../components/tui-text';
import { TuiButton } from '../components/tui-button';
import { Transaction } from '../types';
import { getCategoryIcon } from '../utils/category-icon';

interface ExpensesProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onDeleteTransactions?: (ids: string[]) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onLogTransaction: (initialType?: 'income' | 'expense') => void;
  refreshing: boolean;
  onRefresh: () => void;
  selectedIds?: string[];
  isSelectionMode?: boolean;
  onToggleSelect?: (id: string) => void;
  onLongPressSelect?: (id: string) => void;
  editingTransactionId?: string;
  highlightedTransactionId?: string;
}

type FilterType = 'all' | 'income' | 'expense';

interface TransactionRowProps {
  t: Transaction;
  isSelected: boolean;
  isEditing?: boolean;
  isSelectionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  colors: any;
  isDark: boolean;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  t,
  isSelected,
  isEditing = false,
  isSelectionMode,
  onPress,
  onLongPress,
  colors,
  isDark,
}) => {
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
      {isSelectionMode && (
        <View
          style={{
            width: 18,
            height: 18,
            borderWidth: 1.5,
            borderColor: isSelected ? colors.primary : (isDark ? '#3F3F46' : '#A1A1AA'),
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}
        >
          {isSelected && (
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: colors.primary,
              }}
            />
          )}
        </View>
      )}

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
          {t.date} | {t.category.toUpperCase()}
        </TuiText>
      </View>

      <View style={styles.logRight}>
        <TuiText
          weight="bold"
          style={{
            color: t.type === 'income' ? colors.primary : colors.destructive,
          }}
        >
          {t.type === 'income' ? '+' : '-'}₱{t.amount.toFixed(2)}
        </TuiText>
      </View>
    </Pressable>
  );
};

export const Expenses: React.FC<ExpensesProps> = ({
  transactions,
  onDeleteTransaction,
  onDeleteTransactions,
  onEditTransaction,
  onLogTransaction,
  refreshing,
  onRefresh,
  selectedIds = [],
  isSelectionMode = false,
  onToggleSelect,
  onLongPressSelect,
  editingTransactionId,
  highlightedTransactionId,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter((t) => {
    const matchesType =
      filter === 'all' ? true : t.type === filter;
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handlePressRow = (t: Transaction) => {
    if (isSelectionMode) {
      onToggleSelect?.(t.id);
    } else {
      onEditTransaction?.(t);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* 01: CONTROLS (SEARCH & TYPE SEGMENT CONTROLS) */}
      <View style={[styles.controlsHeader, { borderBottomWidth: 1.5, borderColor: colors.border }]}>
        {/* Brutalist Search Bar */}
        <View
          style={[
            styles.searchWrapper,
            {
              borderColor: colors.primary,
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            },
          ]}
        >
          <Search size={14} color={colors.mutedForeground} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search description/category..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>

        {/* Filter Segments Row */}
        <View style={styles.segmentsRow}>
          <View style={styles.segmentCol}>
            <TuiButton
              onPress={() => setFilter('all')}
              variant={filter === 'all' ? 'accent' : 'outline'}
              style={styles.segmentBtn}
            >
              All
            </TuiButton>
          </View>
          <View style={styles.segmentCol}>
            <TuiButton
              onPress={() => setFilter('income')}
              variant={filter === 'income' ? 'accent' : 'outline'}
              style={styles.segmentBtn}
            >
              Inflow
            </TuiButton>
          </View>
          <View style={styles.segmentCol}>
            <TuiButton
              onPress={() => setFilter('expense')}
              variant={filter === 'expense' ? 'accent' : 'outline'}
              style={styles.segmentBtn}
            >
              Outflow
            </TuiButton>
          </View>
        </View>
      </View>

      {/* 02: SCROLLABLE LOGS */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + insets.bottom }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={isDark ? '#1C1C1E' : '#FFFFFF'}
          />
        }
      >
        <TuiContainer
          label="Logs List"
        >
          <TuiButton
            onPress={() => {
              onLogTransaction(filter === 'all' ? undefined : filter);
            }}
            variant="accent"
            style={styles.addTransactionBtn}
          >
            {filter === 'income' ? 'LOG INCOME' : filter === 'expense' ? 'LOG EXPENSE' : 'LOG TRANSACTION'}
          </TuiButton>
          {filteredTransactions.length === 0 ? (
            <TuiText size="xs" variant="muted" style={styles.emptyState}>
              No matching transaction logs found.
            </TuiText>
          ) : (
            <View style={styles.logsList}>
              {filteredTransactions.map((t) => {
                const isSelected = selectedIds.includes(t.id);
                const isEditing = editingTransactionId === t.id;
                const isHighlighted = highlightedTransactionId === t.id;
                return (
                  <TransactionRow
                    key={t.id}
                    t={t}
                    isSelected={isSelected}
                    isEditing={isEditing || isHighlighted}
                    isSelectionMode={isSelectionMode}
                    onPress={() => handlePressRow(t)}
                    onLongPress={() => onLongPressSelect?.(t.id)}
                    colors={colors}
                    isDark={isDark}
                  />
                );
              })}
            </View>
          )}
        </TuiContainer>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlsHeader: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  segmentsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  segmentCol: {
    flex: 1,
    paddingHorizontal: 4,
  },
  segmentBtn: {
    marginVertical: 0,
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 60, // Clear bottom navbar overlays
  },
  emptyState: {
    textAlign: 'center',
    paddingVertical: 30,
    letterSpacing: 0.5,
  },
  logsList: {
    marginTop: 2,
  },
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
  deleteBtn: {
    padding: 6,
  },
  addTransactionBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    marginVertical: 4,
    marginBottom: 12,
  },
  selectionBar: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 12,
  },
  selectionBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtonCompact: {
    marginVertical: 0,
    paddingVertical: 0,
    paddingHorizontal: 12,
    height: 38,
    justifyContent: 'center',
    width: 'auto',
  },
});
