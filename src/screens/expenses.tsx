import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, RefreshControl } from 'react-native';
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
  onEditTransaction?: (tx: Transaction) => void;
  onLogTransaction: (initialType?: 'income' | 'expense') => void;
  refreshing: boolean;
  onRefresh: () => void;
}

type FilterType = 'all' | 'income' | 'expense';

export const Expenses: React.FC<ExpensesProps> = ({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  onLogTransaction,
  refreshing,
  onRefresh,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Apply filters and search query
  const filteredTransactions = transactions.filter((t) => {
    const matchesType =
      filter === 'all' ? true : t.type === filter;
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

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
              {filteredTransactions.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => onEditTransaction?.(t)}
                  style={({ pressed }) => [
                    styles.logRow,
                    {
                      borderColor: isDark ? '#27272A' : '#E4E4E7',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  {/* Category Indicator Icon */}
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
              ))}
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
});
