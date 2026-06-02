import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, TextInput, RefreshControl } from 'react-native';
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
import { Transaction, CATEGORIES, Debt } from '../types';
import { logger } from '../utils/logger';
import { getCategoryIcon } from '../utils/category-icon';

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
}



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
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Aggregate Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const totalOwe = debts
    .filter((d) => d.type === 'payable')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalReceivable = debts
    .filter((d) => d.type === 'receivable')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalLimit = totalIncome > statsLimit ? totalIncome : statsLimit;

  const segments: { color: string; value: number }[] = [];

  const remaining = totalLimit - totalExpense;
  if (remaining > 0) {
    segments.push({
      color: colors.primary,
      value: remaining,
    });
  }

  segments.push({
    color: isDark ? '#3F3F46' : '#D4D4D8',
    value: totalExpense,
  });

  return (
    <View style={[styles.mainWrapper, { backgroundColor: colors.background }]}>
      
      {/* 01: FIXED TOP SECTION (HEADER & BALANCES CARD) */}
      <View style={[styles.fixedTopSection, { backgroundColor: colors.background, borderColor: colors.border }]}>
        {/* Net Balance Card */}
        <TuiContainer label="Balances">
          <TuiText size="3xl" weight="bold" style={{ color: balance >= 0 ? colors.primary : colors.destructive, marginVertical: 4 }}>
            ₱{balance.toFixed(2)}
          </TuiText>
          <TuiText size="sm" variant="muted" style={{ marginTop: 2 }}>
            Income: +₱{totalIncome.toFixed(2)} | Expenses: -₱{totalExpense.toFixed(2)}
          </TuiText>
        </TuiContainer>
      </View>

      {/* 02: SCROLLABLE BODY SECTION */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContentContainer, { paddingBottom: 80 + insets.bottom }]}
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
        
        {/* Overall Budget Card */}
        <Pressable onPress={onNavigateToStats}>
          <TuiContainer 
            label="Overall Budget" 
          >
            <TuiSegmentedMeter
              segments={segments}
              totalLimit={totalLimit}
              totalSpent={totalExpense}
              label={totalLimit > 0
                ? `₱${(totalLimit - totalExpense).toFixed(2)} left of ₱${totalLimit.toFixed(2)}`
                : `₱${(totalLimit - totalExpense).toFixed(2)} left`
              }
            />
          </TuiContainer>
        </Pressable>

        {/* My Debts (Divided Column TuiContainer) */}
        <TuiContainer label="My Debts">
          <View style={styles.debtsGrid}>
            <View style={[styles.debtCol, { borderRightWidth: 1, borderColor: colors.border }]}>
              <View style={styles.titleRow}>
                <ArrowDownCircle size={12} color={colors.destructive} style={styles.titleIcon} />
                <TuiText size="xs" variant="muted" weight="bold">I OWE</TuiText>
              </View>
              <TuiText size="lg" weight="bold" style={{ color: colors.destructive, marginTop: 4 }}>
                ₱{totalOwe.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </TuiText>
            </View>

            <View style={[styles.debtCol, { paddingLeft: 12 }]}>
              <View style={styles.titleRow}>
                <ArrowUpCircle size={12} color={colors.primary} style={styles.titleIcon} />
                <TuiText size="xs" variant="muted" weight="bold">OWES ME</TuiText>
              </View>
              <TuiText size="lg" weight="bold" style={{ color: colors.primary, marginTop: 4 }}>
                ₱{totalReceivable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </TuiText>
            </View>
          </View>
        </TuiContainer>

        {/* Recent Transactions Container */}
        <TuiContainer label="Recent Transactions">
          {transactions.length === 0 ? (
            <TuiText size="xs" variant="muted" style={styles.emptyState}>
              No transactions recorded yet.
            </TuiText>
          ) : (
            <View style={styles.logsList}>
              {transactions.slice(0, 4).map((t) => (
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
                  {/* Visual Category Icon */}
                  <View
                    style={[
                      styles.rowIconContainer,
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
    paddingTop: 4,
    paddingBottom: 60, // Clear floating bottom nav safely
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
