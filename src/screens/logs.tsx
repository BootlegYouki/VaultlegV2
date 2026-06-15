import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, Animated } from 'react-native';
import { Search, Trash2, Tag, ArrowUp, ArrowDown, Plus, X } from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { TuiText } from '../components/tui-text';
import { TuiButton } from '../components/tui-button';
import { TuiCalendar } from '../components/tui-calendar';
import { TuiSegmentedMeter } from '../components/tui-chart';
import { TuiScrollView } from '../components/tui-scrollview';
import { TuiMiniCheckbox } from '../components/tui-mini-checkbox';
import { Transaction, CATEGORIES, INCOME_CATEGORIES } from '../types';
import { getCategoryIcon } from '../utils/category-icon';
import { TuiTransactionRow } from '../components/tui-transaction-row';
import { parseDateString } from '../utils/date';

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

const compareDates = (d1Str: string, d2Str: string): number => {
  const t1 = parseDateString(d1Str).getTime();
  const t2 = parseDateString(d2Str).getTime();
  return t1 - t2;
};

const isTxInDateRange = (txDate: string, startDate: string | null, endDate: string | null): boolean => {
  if (!startDate && !endDate) return true;
  const txTime = parseDateString(txDate).getTime();
  if (startDate) {
    const startTime = parseDateString(startDate).getTime();
    if (txTime < startTime) return false;
  }
  if (endDate) {
    const endTime = parseDateString(endDate).getTime();
    if (txTime > endTime) return false;
  }
  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Search bar + filter buttons + date picker
// ─────────────────────────────────────────────────────────────────────────────
interface LogsControlsHeaderProps {
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  startDate: string | null;
  endDate: string | null;
  activePicker: 'range' | null;
  onTogglePicker: () => void;
  onRangeChange: (start: string | null, end: string | null) => void;
  onClearDates: () => void;
  datePickerMaxHeight: Animated.AnimatedInterpolation<string | number>;
  datePickerOpacity: Animated.AnimatedInterpolation<string | number>;
  datePickerMarginTop: Animated.AnimatedInterpolation<string | number>;
  datePickerMarginBottom: Animated.AnimatedInterpolation<string | number>;
  balanceMeter?: React.ReactNode;
}

const LogsControlsHeader: React.FC<LogsControlsHeaderProps> = ({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  startDate,
  endDate,
  activePicker,
  onTogglePicker,
  onRangeChange,
  onClearDates,
  datePickerMaxHeight,
  datePickerOpacity,
  datePickerMarginTop,
  datePickerMarginBottom,
  balanceMeter,
}) => {
  const { colors, isDark } = useTheme();

  return (
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
          onChangeText={onSearchChange}
          placeholder="Search description/category..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
        />
      </View>

      {/* Filter Segments Row */}
      <View style={styles.segmentsRow}>
        <View style={styles.segmentCol}>
          <TuiButton
            onPress={() => onFilterChange('all')}
            variant={filter === 'all' ? 'accent' : 'outline'}
            style={styles.segmentBtn}
          >
            All
          </TuiButton>
        </View>
        <View style={styles.segmentCol}>
          <TuiButton
            onPress={() => onFilterChange('income')}
            variant={filter === 'income' ? 'accent' : 'outline'}
            style={styles.segmentBtn}
          >
            Inflow
          </TuiButton>
        </View>
        <View style={styles.segmentCol}>
          <TuiButton
            onPress={() => onFilterChange('expense')}
            variant={filter === 'expense' ? 'accent' : 'outline'}
            style={styles.segmentBtn}
          >
            Outflow
          </TuiButton>
        </View>
      </View>

      {/* Date Range Picker */}
      <Animated.View
        style={[
          styles.datePickerContainer,
          {
            maxHeight: datePickerMaxHeight,
            opacity: datePickerOpacity,
            marginTop: datePickerMarginTop,
            marginBottom: datePickerMarginBottom,
            overflow: 'hidden',
          },
        ]}
      >
        <View style={styles.datePickerRow}>
          <TuiButton
            onPress={onTogglePicker}
            variant={startDate || endDate ? 'accent' : 'outline'}
            style={styles.dateTuiBtn}
          >
            {startDate && endDate
              ? `${startDate} to ${endDate}`
              : startDate
              ? `${startDate} to ...`
              : 'Select Date Range'}
          </TuiButton>
        </View>

        {(startDate || endDate) && (
          <TuiButton
            onPress={onClearDates}
            variant="destructive"
            style={{ marginTop: 8, marginBottom: 0, height: 44, width: '100%', justifyContent: 'center', paddingVertical: 0 }}
          >
            Clear Filter
          </TuiButton>
        )}

        {activePicker && (
          <View style={{ marginTop: 10 }}>
            <TuiCalendar
              isRangeMode={true}
              startDate={startDate}
              endDate={endDate}
              onRangeChange={(start, end) => {
                onRangeChange(start, end);
              }}
            />
          </View>
        )}
      </Animated.View>

      {balanceMeter}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Range balance segmented meter
// ─────────────────────────────────────────────────────────────────────────────
interface LogsBalanceMeterProps {
  income: number;
  expense: number;
  balance: number;
  limit: number;
  segments: { color: string; value: number }[];
  progressMeterMarginTop: Animated.AnimatedInterpolation<string | number>;
}

const LogsBalanceMeter: React.FC<LogsBalanceMeterProps> = ({
  income,
  expense,
  balance,
  limit,
  segments,
  progressMeterMarginTop,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View
      style={[
        styles.rangeBalanceContainer,
        {
          borderColor: balance >= 0 ? colors.primary : colors.destructive,
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          marginTop: progressMeterMarginTop,
        }
      ]}
    >
      <TuiSegmentedMeter
        segments={segments}
        totalLimit={limit}
        totalSpent={expense}
        style={{ marginVertical: 0 }}
        label={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TuiText size="xs" variant="muted" style={{ marginRight: 12 }}>
              Inflow: ₱{income.toFixed(0)}
            </TuiText>
            <TuiText size="xs" variant="muted">
              Outflow: ₱{expense.toFixed(0)}
            </TuiText>
          </View>
        }
        rightLabel={
          <TuiText
            weight="bold"
            size="sm"
            style={{
              color: balance >= 0 ? colors.primary : colors.destructive,
            }}
          >
            {balance >= 0 ? '+' : '-'}₱{Math.abs(balance).toFixed(2)}
          </TuiText>
        }
        animateMode="none"
        animationDirection="grow"
      />
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Scrollable logs list
// ─────────────────────────────────────────────────────────────────────────────
interface LogsListProps {
  filteredTransactions: Transaction[];
  selectedIds: string[];
  isSelectionMode: boolean;
  editingTransactionId?: string;
  highlightedTransactionId?: string;
  refreshing: boolean;
  onRefresh: () => void;
  onScroll: (event: any) => void;
  onPressRow: (t: Transaction) => void;
  onLongPress: (id: string) => void;
}

const LogsList: React.FC<LogsListProps> = ({
  filteredTransactions,
  selectedIds,
  isSelectionMode,
  editingTransactionId,
  highlightedTransactionId,
  refreshing,
  onRefresh,
  onScroll,
  onPressRow,
  onLongPress,
}) => (
  <TuiScrollView
    style={styles.scrollView}
    contentContainerStyle={styles.scrollContent}
    onScroll={onScroll}
    scrollEventThrottle={16}
    refreshing={refreshing}
    onRefresh={onRefresh}
  >
    <TuiContainer label="Logs List">
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
              <TuiTransactionRow
                key={t.id}
                t={t}
                isSelected={isSelected}
                isEditing={isEditing || isHighlighted}
                isSelectionMode={isSelectionMode}
                onPress={() => onPressRow(t)}
                onLongPress={() => onLongPress(t.id)}
              />
            );
          })}
        </View>
      )}
    </TuiContainer>
  </TuiScrollView>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main screen component
// ─────────────────────────────────────────────────────────────────────────────
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
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<'range' | null>(null);

  const isCollapsed = React.useRef(false);
  const searchBarHeightAnim = React.useRef(new Animated.Value(1)).current;

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;

    if (currentOffset > 5) {
      if (!isCollapsed.current) {
        isCollapsed.current = true;
        setActivePicker(null);
        Animated.timing(searchBarHeightAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: false,
        }).start();
      }
    } else if (currentOffset <= 5) {
      if (isCollapsed.current) {
        isCollapsed.current = false;
        Animated.timing(searchBarHeightAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const datePickerMaxHeight = searchBarHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 600],
  });

  const datePickerOpacity = searchBarHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const datePickerMarginTop = searchBarHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  const datePickerMarginBottom = searchBarHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  const progressMeterMarginTop = searchBarHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  const rangeBalanceInfo = React.useMemo(() => {
    let rangeIncome = 0;
    let rangeExpense = 0;

    transactions.forEach((t) => {
      const matchesDate = isTxInDateRange(t.date, startDate, endDate);
      if (matchesDate) {
        if (t.type === 'income') {
          rangeIncome += t.amount;
        } else if (t.type === 'expense') {
          rangeExpense += t.amount;
        }
      }
    });

    return {
      income: rangeIncome,
      expense: rangeExpense,
      balance: rangeIncome - rangeExpense,
    };
  }, [transactions, startDate, endDate]);

  const rangeLimit = React.useMemo(() => {
    const { income, expense } = rangeBalanceInfo;
    return income > expense ? income : expense;
  }, [rangeBalanceInfo]);

  const rangeSegments = React.useMemo(() => {
    const { income, expense } = rangeBalanceInfo;
    const limit = income > expense ? income : expense;
    const segmentsList = [];
    const remaining = limit - expense;
    if (remaining > 0) {
      segmentsList.push({ color: colors.primary, value: remaining });
    }
    segmentsList.push({ color: isDark ? '#27272A' : '#E4E4E7', value: expense });
    return segmentsList;
  }, [rangeBalanceInfo, colors.primary, isDark]);

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filter === 'all' ? true : t.type === filter;
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = isTxInDateRange(t.date, startDate, endDate);
    return matchesType && matchesSearch && matchesDate;
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
      <LogsControlsHeader
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        startDate={startDate}
        endDate={endDate}
        activePicker={activePicker}
        onTogglePicker={() => setActivePicker(activePicker ? null : 'range')}
        onRangeChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
          if (start && end) setActivePicker(null);
        }}
        onClearDates={() => {
          setStartDate(null);
          setEndDate(null);
          setActivePicker(null);
        }}
        datePickerMaxHeight={datePickerMaxHeight}
        datePickerOpacity={datePickerOpacity}
        datePickerMarginTop={datePickerMarginTop}
        datePickerMarginBottom={datePickerMarginBottom}
        balanceMeter={
          !activePicker ? (
            <LogsBalanceMeter
              income={rangeBalanceInfo.income}
              expense={rangeBalanceInfo.expense}
              balance={rangeBalanceInfo.balance}
              limit={rangeLimit}
              segments={rangeSegments}
              progressMeterMarginTop={progressMeterMarginTop}
            />
          ) : undefined
        }
      />

      <LogsList
        filteredTransactions={filteredTransactions}
        selectedIds={selectedIds}
        isSelectionMode={isSelectionMode}
        editingTransactionId={editingTransactionId}
        highlightedTransactionId={highlightedTransactionId}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onScroll={handleScroll}
        onPressRow={handlePressRow}
        onLongPress={(id) => onLongPressSelect?.(id)}
      />
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
    gap: 8,
  },
  segmentCol: {
    flex: 1,
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
  datePickerContainer: {
    marginTop: 10,
    marginBottom: 4,
    width: '100%',
  },
  datePickerLabel: {
    letterSpacing: 0.5,
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dateTuiBtn: {
    flex: 1,
    width: 'auto',
    height: 44,
    marginVertical: 0,
    paddingVertical: 0,
  },
  rangeBalanceContainer: {
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 0,
    width: '100%',
  },
  inlineCalendarWrapper: {
    marginTop: 10,
    borderWidth: 1.5,
    padding: 8,
  },
  calendarTitle: {
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
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
