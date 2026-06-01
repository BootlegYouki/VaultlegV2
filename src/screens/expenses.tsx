import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Trash2, Tag, ArrowUp, ArrowDown } from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { TuiText } from '../components/tui-text';
import { TuiButton } from '../components/tui-button';
import { Transaction } from '../types';
import { getCategoryIcon } from './dashboard';

interface ExpensesProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

type FilterType = 'all' | 'income' | 'expense';

export const Expenses: React.FC<ExpensesProps> = ({
  transactions,
  onDeleteTransaction,
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
              [ALL]
            </TuiButton>
          </View>
          <View style={styles.segmentCol}>
            <TuiButton
              onPress={() => setFilter('income')}
              variant={filter === 'income' ? 'accent' : 'outline'}
              style={styles.segmentBtn}
            >
              [INFLOW]
            </TuiButton>
          </View>
          <View style={styles.segmentCol}>
            <TuiButton
              onPress={() => setFilter('expense')}
              variant={filter === 'expense' ? 'accent' : 'outline'}
              style={styles.segmentBtn}
            >
              [OUTFLOW]
            </TuiButton>
          </View>
        </View>
      </View>

      {/* 02: SCROLLABLE LEDGER */}
      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + insets.bottom }]}>
        <TuiContainer label="Ledger List" badge={`${filteredTransactions.length} logs`}>
          {filteredTransactions.length === 0 ? (
            <TuiText size="xs" variant="muted" style={styles.emptyState}>
              No matching transaction logs found.
            </TuiText>
          ) : (
            <View style={styles.logsList}>
              {filteredTransactions.map((t) => (
                <View
                  key={t.id}
                  style={[
                    styles.logRow,
                    {
                      borderColor: isDark ? '#27272A' : '#E4E4E7',
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
                    <TuiText weight="bold" size="sm">
                      {t.description}
                    </TuiText>
                    <TuiText size="xs" variant="muted">
                      {t.date} | {t.category.toUpperCase()}
                    </TuiText>
                  </View>

                  <View style={styles.logRight}>
                    <TuiText
                      weight="bold"
                      style={{
                        color: t.type === 'income' ? colors.primary : colors.destructive,
                        marginRight: 12,
                      }}
                    >
                      {t.type === 'income' ? '+' : '-'}₱{t.amount.toFixed(2)}
                    </TuiText>
                    
                    {/* Delete Action button */}
                    <Pressable
                      onPress={() => onDeleteTransaction(t.id)}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={13} color={colors.destructive} />
                    </Pressable>
                  </View>
                </View>
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
    paddingHorizontal: 12,
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
    paddingHorizontal: 12,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
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
    flex: 1.2,
  },
  logRight: {
    flex: 0.8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
});
