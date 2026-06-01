import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, TextInput } from 'react-native';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Trash2,
  Utensils,
  Zap,
  Film,
  Car,
  Laptop,
  Heart,
  HelpCircle,
  Briefcase,
  Code,
  Landmark,
  Check,
} from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { TuiText } from '../components/tui-text';
import { TuiButton } from '../components/tui-button';
import { TuiSegmentedMeter } from '../components/tui-chart';
import { Transaction, CATEGORIES } from '../types';
import { logger } from '../utils/logger';

// Shared palette — must match budgets.tsx order
const BUDGET_COLORS = [
  '#00E5FF', '#69FF47', '#FF6B6B', '#FFD93D', '#C77DFF',
  '#FF9F1C', '#2EC4B6', '#FF4D6D', '#A8FF78', '#4D96FF',
];

interface DashboardProps {
  transactions: Transaction[];
  budgetLimit: number;
  categoryBudgets: Record<string, number>;
  onNavigateToAdd: () => void;
  onDeleteTransaction: (id: string) => void;
}

// Icon Helper for Categories
export const getCategoryIcon = (categoryId: string, size = 16, color = '#FFFFFF') => {
  switch (categoryId) {
    case 'food': return <Utensils size={size} color={color} />;
    case 'utilities': return <Zap size={size} color={color} />;
    case 'entertainment': return <Film size={size} color={color} />;
    case 'transport': return <Car size={size} color={color} />;
    case 'tech': return <Laptop size={size} color={color} />;
    case 'health': return <Heart size={size} color={color} />;
    case 'salary': return <Briefcase size={size} color={color} />;
    case 'freelance': return <Code size={size} color={color} />;
    case 'investments': return <TrendingUp size={size} color={color} />;
    default: return <HelpCircle size={size} color={color} />;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  budgetLimit,
  categoryBudgets,
  onNavigateToAdd,
  onDeleteTransaction,
}) => {
  const { colors, isDark } = useTheme();

  // Aggregate Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <View style={[styles.mainWrapper, { backgroundColor: colors.background }]}>
      
      {/* 01: FIXED TOP SECTION (HEADER & BALANCES CARD) */}
      <View style={[styles.fixedTopSection, { backgroundColor: colors.background, borderColor: colors.border }]}>
        {/* Net Balance Card */}
        <TuiContainer label="Balances">
          <TuiText size="3xl" weight="bold" style={{ color: balance >= 0 ? colors.primary : colors.destructive, marginVertical: 4 }}>
            ₱{balance.toFixed(2)}
          </TuiText>
          <TuiText size="xs" variant="muted" style={{ marginTop: 2 }}>
            Income: +₱{totalIncome.toFixed(2)}  |  Expenses: -₱{totalExpense.toFixed(2)}
          </TuiText>
        </TuiContainer>
      </View>

      {/* 02: SCROLLABLE BODY SECTION */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
        
        {/* Overall Budget Card */}
        <TuiContainer label="Overall Budget" badge={budgetLimit > 0 ? `₱${budgetLimit.toFixed(0)}` : undefined}>
          {budgetLimit > 0 ? (
            <TuiSegmentedMeter
              segments={CATEGORIES.filter(cat => categoryBudgets[cat.id] > 0).map((cat, index) => ({
                color: BUDGET_COLORS[(index + 1) % BUDGET_COLORS.length],
                value: categoryBudgets[cat.id] || 0,
              }))}
              totalLimit={budgetLimit}
              totalSpent={totalExpense}
              label={`Spent: ₱${totalExpense.toFixed(2)} of ₱${budgetLimit.toFixed(2)}`}
            />
          ) : (
            <TuiText size="xs" variant="muted" style={styles.emptyState}>
              No active category budgets configured.
            </TuiText>
          )}
        </TuiContainer>

        {/* My Debts (Divided Column TuiContainer) */}
        <TuiContainer label="My Debts">
          <View style={styles.debtsGrid}>
            <View style={[styles.debtCol, { borderRightWidth: 1, borderColor: colors.border }]}>
              <View style={styles.titleRow}>
                <Landmark size={12} color={colors.destructive} style={styles.titleIcon} />
                <TuiText size="xs" variant="muted" weight="bold">I OWE</TuiText>
              </View>
              <TuiText size="lg" weight="bold" style={{ color: colors.destructive, marginTop: 4 }}>
                ₱12,500.00
              </TuiText>
            </View>

            <View style={[styles.debtCol, { paddingLeft: 12 }]}>
              <View style={styles.titleRow}>
                <Landmark size={12} color={colors.primary} style={styles.titleIcon} />
                <TuiText size="xs" variant="muted" weight="bold">OWES ME</TuiText>
              </View>
              <TuiText size="lg" weight="bold" style={{ color: colors.primary, marginTop: 4 }}>
                ₱8,200.00
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
              {transactions.slice(0, 5).map((t) => (
                <View
                  key={t.id}
                  style={[
                    styles.logRow,
                    {
                      borderColor: isDark ? '#27272A' : '#E4E4E7',
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
                        marginRight: 10,
                      }}
                    >
                      {t.type === 'income' ? '+' : '-'}₱{t.amount.toFixed(2)}
                    </TuiText>
                    
                    {/* Delete button (Trash icon) */}
                    <Pressable
                      onPress={() => onDeleteTransaction(t.id)}
                      style={styles.deletePressable}
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
  mainWrapper: {
    flex: 1,
  },
  fixedTopSection: {
    paddingHorizontal: 12,
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
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 60, // Clear floating bottom nav safely
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  budgetEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  changeBudgetBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    marginVertical: 4,
  },
  budgetInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
  },
  saveBudgetBtn: {
    marginLeft: 8,
    marginVertical: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  cancelBudgetBtn: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
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
    flex: 1.2,
  },
  logRight: {
    flex: 0.8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deletePressable: {
    padding: 6,
  },
});
