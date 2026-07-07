import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable, TextInput, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TrendingUp,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { TuiText } from '../components/tui-text';
import { TuiButton } from '../components/tui-button';
import { TuiSegmentedMeter } from '../components/tui-chart';
import { Transaction, CATEGORIES, INCOME_CATEGORIES, Debt } from '../types';
import { logger } from '../utils/logger';
import { getCategoryIcon } from '../utils/category-icon';
import { TuiTransactionRow } from '../components/tui-transaction-row';
import { useBalanceAnimation } from '../hooks/use-balance-animation';
import { getTodayDateString, isSameMonthYear } from '../utils/date';


// Re-export for backwards compatibility
export { getCategoryIcon };

// Shared palette — must match stats.tsx order
const STATS_COLORS = [
  '#00E5FF', '#69FF47', '#FF6B6B', '#FFD93D', '#C77DFF',
  '#FF9F1C', '#2EC4B6', '#FF4D6D', '#A8FF78', '#4D96FF',
];

interface DashboardProps {
  transactions: Transaction[];
  statsLimit: number;
  categoryLimits: Record<string, number>;
  debts: Debt[];
  onNavigateToAdd: () => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onNavigateToStats?: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  editingTransactionId?: string;
  onRecentTransactionPress?: (tx: Transaction) => void;
  startAnimation?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Balance totals with hide/reveal toggle
// ─────────────────────────────────────────────────────────────────────────────
interface DashboardBalancesCardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  animatedBalance: number;
  hideBalances: boolean;
  onToggleHide: () => void;
}

const DashboardBalancesCard: React.FC<DashboardBalancesCardProps> = ({
  balance,
  totalIncome,
  totalExpense,
  animatedBalance,
  hideBalances,
  onToggleHide,
}) => {
  const { colors, isDark } = useTheme();

  const formatAmount = (val: number) => val.toFixed(2);
  const formatCurrency = (val: number) =>
    `${val < 0 ? '-' : ''}₱${Math.abs(val).toFixed(2)}`;

  return (
    <TuiContainer label="Balances">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {hideBalances ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
            <TuiText
              size="3xl"
              weight="bold"
              style={{ color: balance >= 0 ? colors.primary : colors.destructive }}
            >
              {balance < 0 ? '-' : ''}₱
            </TuiText>
            <View
              style={{
                width: 90,
                height: 24,
                backgroundColor: balance >= 0 ? colors.primary : colors.destructive,
                opacity: 0.7,
                marginLeft: 6,
                borderRadius: 1,
              }}
            />
          </View>
        ) : (
          <TuiText
            size="3xl"
            weight="bold"
            style={{
              color: balance >= 0 ? colors.primary : colors.destructive,
              marginVertical: 4,
            }}
          >
            {formatCurrency(animatedBalance)}
          </TuiText>
        )}

        <Pressable onPress={onToggleHide} style={{ padding: 6 }}>
          <View
            style={{
              width: 26,
              height: 26,
              borderWidth: 1.5,
              borderColor: hideBalances ? colors.primary : (isDark ? '#3F3F46' : '#A1A1AA'),
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hideBalances && (
              <View style={{ width: 12, height: 12, backgroundColor: colors.primary }} />
            )}
          </View>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 2 }}>
        <TuiText size="sm" variant="muted">Income: +₱</TuiText>
        {hideBalances ? (
          <View
            style={{
              width: 40,
              height: 11,
              backgroundColor: colors.mutedForeground,
              opacity: 0.6,
              marginHorizontal: 4,
              borderRadius: 1,
            }}
          />
        ) : (
          <TuiText size="sm" variant="muted">{formatAmount(totalIncome)}</TuiText>
        )}
        <TuiText size="sm" variant="muted">{" | Expenses: -₱"}</TuiText>
        {hideBalances ? (
          <View
            style={{
              width: 40,
              height: 11,
              backgroundColor: colors.mutedForeground,
              opacity: 0.6,
              marginHorizontal: 4,
              borderRadius: 1,
            }}
          />
        ) : (
          <TuiText size="sm" variant="muted">{formatAmount(totalExpense)}</TuiText>
        )}
      </View>
    </TuiContainer>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Overall Budget bar chart
// ─────────────────────────────────────────────────────────────────────────────
interface DashboardBudgetCardProps {
  segments: { color: string; value: number }[];
  totalLimit: number;
  totalExpense: number;
  hideBalances: boolean;
  startAnimation: boolean;
  onPress?: () => void;
}

const DashboardBudgetCard: React.FC<DashboardBudgetCardProps> = ({
  segments,
  totalLimit,
  totalExpense,
  hideBalances,
  startAnimation,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress}>
      <TuiContainer label="Overall Budget">
        <TuiSegmentedMeter
          segments={segments}
          totalLimit={totalLimit}
          totalSpent={totalExpense}
          label={hideBalances ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TuiText size="sm" weight="bold">₱</TuiText>
              <View
                style={{
                  width: 40,
                  height: 12,
                  backgroundColor: colors.foreground,
                  opacity: 0.7,
                  marginHorizontal: 4,
                  borderRadius: 1,
                }}
              />
              <TuiText size="sm" weight="bold">left</TuiText>
            </View>
          ) : (
            `₱${(totalLimit - totalExpense).toFixed(2)} left`
          )}
          startAnimation={startAnimation}
          animateMode="once"
          animationDirection="grow"
        />
      </TuiContainer>
    </Pressable>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: I Owe / Owes Me grid
// ─────────────────────────────────────────────────────────────────────────────
interface DashboardDebtsCardProps {
  totalOwe: number;
  totalReceivable: number;
}

const DashboardDebtsCard: React.FC<DashboardDebtsCardProps> = ({ totalOwe, totalReceivable }) => {
  const { colors } = useTheme();

  const formatLocalized = (val: number) =>
    `₱${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <TuiContainer label="My Debts">
      <View style={styles.debtsGrid}>
        <View style={[styles.debtCol, { borderRightWidth: 1, borderColor: colors.border }]}>
          <View style={styles.titleRow}>
            <ArrowDownCircle size={12} color={colors.destructive} style={styles.titleIcon} />
            <TuiText size="xs" variant="muted" weight="bold">I OWE</TuiText>
          </View>
          <TuiText size="lg" weight="bold" style={{ color: colors.destructive, marginTop: 4 }}>
            {formatLocalized(totalOwe)}
          </TuiText>
        </View>

        <View style={[styles.debtCol, { paddingLeft: 12 }]}>
          <View style={styles.titleRow}>
            <ArrowUpCircle size={12} color={colors.primary} style={styles.titleIcon} />
            <TuiText size="xs" variant="muted" weight="bold">OWES ME</TuiText>
          </View>
          <TuiText size="lg" weight="bold" style={{ color: colors.primary, marginTop: 4 }}>
            {formatLocalized(totalReceivable)}
          </TuiText>
        </View>
      </View>
    </TuiContainer>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Recent 5 transactions list
// ─────────────────────────────────────────────────────────────────────────────
interface DashboardRecentTransactionsCardProps {
  transactions: Transaction[];
  editingTransactionId?: string;
  onRecentTransactionPress?: (tx: Transaction) => void;
}

const DashboardRecentTransactionsCard: React.FC<DashboardRecentTransactionsCardProps> = ({
  transactions,
  editingTransactionId,
  onRecentTransactionPress,
}) => {
  const { colors, isDark } = useTheme();
  const recentTxs = transactions.slice(0, 5);
  const emptySlotsCount = Math.max(0, 5 - transactions.length);

  return (
    <TuiContainer label="Recent Transactions">
      <View style={styles.logsList}>
        {recentTxs.map((t) => (
          <TuiTransactionRow
            key={t.id}
            t={t}
            isEditing={editingTransactionId === t.id}
            onPress={() => onRecentTransactionPress?.(t)}
          />
        ))}
        {Array.from({ length: emptySlotsCount }).map((_, index) => (
          <View
            key={`empty-${index}`}
            style={[
              styles.logRow,
              {
                borderColor: isDark ? colors.primary + '40' : colors.primary + '30',
                borderStyle: 'dashed',
                opacity: 0.25,
                backgroundColor: 'transparent',
                height: 52,
              },
            ]}
          />
        ))}
      </View>
    </TuiContainer>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard component
// ─────────────────────────────────────────────────────────────────────────────
export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  statsLimit,
  categoryLimits,
  debts,
  onNavigateToAdd,
  onDeleteTransaction,
  onEditTransaction,
  onNavigateToStats,
  refreshing,
  onRefresh,
  editingTransactionId,
  onRecentTransactionPress,
  startAnimation = false,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [hideBalances, setHideBalances] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        gestureState.dy < -40 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.5,
      onPanResponderRelease: () => onNavigateToAdd(),
    })
  ).current;

  useEffect(() => {
    AsyncStorage.getItem('tui_hide_balances')
      .then((val) => {
        if (val !== null) setHideBalances(val === 'true');
      })
      .catch((e) => logger.log('SYSTEM_ERROR', `LOAD_HIDE_BALANCES_FAILED: ${e.message}`));
  }, []);

  const handleToggleHide = () => {
    const newVal = !hideBalances;
    setHideBalances(newVal);
    AsyncStorage.setItem('tui_hide_balances', newVal ? 'true' : 'false').catch((e) =>
      logger.log('SYSTEM_ERROR', `SAVE_HIDE_BALANCES_FAILED: ${e.message}`)
    );
  };

  // Aggregate calculations
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;
  const animatedBalance = useBalanceAnimation(balance, startAnimation);

  const totalOwe = debts.filter((d) => d.type === 'payable').reduce((sum, d) => sum + d.amount, 0);
  const totalReceivable = debts.filter((d) => d.type === 'receivable').reduce((sum, d) => sum + d.amount, 0);

  const todayStr = getTodayDateString();
  const thisMonthExpense = transactions
    .filter((t) => t.type === 'expense' && isSameMonthYear(t.date, todayStr))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalLimit = balance > 0 ? balance + thisMonthExpense : thisMonthExpense;
  const segments: { color: string; value: number }[] = [];
  if (balance > 0) segments.push({ color: colors.primary, value: balance });
  segments.push({ color: isDark ? '#27272A' : '#E4E4E7', value: thisMonthExpense });

  return (
    <View
      {...panResponder.panHandlers}
      style={[styles.mainWrapper, { backgroundColor: colors.background }]}
    >
      {/* 01: FIXED TOP SECTION */}
      <View style={[styles.fixedTopSection, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <DashboardBalancesCard
          balance={balance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          animatedBalance={animatedBalance}
          hideBalances={hideBalances}
          onToggleHide={handleToggleHide}
        />
      </View>

      {/* 02: STATIC BODY SECTION */}
      <View style={[styles.scrollContentContainer, { flex: 1, paddingBottom: 72 + insets.bottom }]}>
        <DashboardBudgetCard
          segments={segments}
          totalLimit={totalLimit}
          totalExpense={thisMonthExpense}
          hideBalances={hideBalances}
          startAnimation={startAnimation}
          onPress={onNavigateToStats}
        />

        <DashboardDebtsCard totalOwe={totalOwe} totalReceivable={totalReceivable} />

        <DashboardRecentTransactionsCard
          transactions={transactions}
          editingTransactionId={editingTransactionId}
          onRecentTransactionPress={onRecentTransactionPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  fixedTopSection: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 8,
    paddingTop: 0,
    paddingBottom: 60,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statsEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  changeStatsBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    marginVertical: 4,
  },
  statsInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
  },
  saveStatsBtn: {
    marginLeft: 8,
    marginVertical: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  cancelStatsBtn: {
    marginLeft: 4,
    marginVertical: 0,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  debtsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  debtCol: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    textAlign: 'center',
    paddingVertical: 20,
    letterSpacing: 0.5,
  },
  logsList: {
    marginTop: 4,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  rowIconContainer: {
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
  deletePressable: {
    padding: 6,
  },
});
