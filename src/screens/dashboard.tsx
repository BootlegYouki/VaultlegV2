import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, TextInput } from 'react-native';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Moon,
  Sun,
  Trash2,
  PiggyBank,
  Settings,
  Utensils,
  Zap,
  Film,
  Car,
  Laptop,
  Heart,
  HelpCircle,
  Briefcase,
  Code,
  PlusCircle,
} from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { TuiText } from '../components/tui-text';
import { TuiButton } from '../components/tui-button';
import { TuiProgressMeter, TuiBarChart, ChartItem } from '../components/tui-chart';
import { Transaction, CATEGORIES } from '../types';
import { logger } from '../utils/logger';

interface DashboardProps {
  transactions: Transaction[];
  budgetLimit: number;
  onNavigateToAdd: () => void;
  onUpdateBudget: (newLimit: number) => void;
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
    case 'other_income': return <PlusCircle size={size} color={color} />;
    default: return <HelpCircle size={size} color={color} />;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  budgetLimit,
  onNavigateToAdd,
  onUpdateBudget,
  onDeleteTransaction,
}) => {
  const { colors, isDark, setThemeMode } = useTheme();
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budgetLimit.toString());

  // Aggregate Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Budget progress percentage
  const budgetProgress = budgetLimit > 0 ? totalExpense / budgetLimit : 0;

  // Spending by category calculations
  const categorySpending = CATEGORIES.map((cat) => {
    const amount = transactions
      .filter((t) => t.type === 'expense' && t.category === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      id: cat.id,
      label: cat.label,
      value: amount,
    };
  });

  const maxSpending = Math.max(...categorySpending.map((c) => c.value), 0);

  const chartData: ChartItem[] = categorySpending
    .filter((c) => c.value > 0)
    .map((c) => ({
      label: c.label,
      value: c.value,
      total: maxSpending || 1,
      formattedValue: `$${c.value.toFixed(2)}`,
    }));

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget(val);
      setEditingBudget(false);
      logger.log('System', `CONFIGURED_BUDGET_TO_$${val.toFixed(2)}`);
    }
  };

  const handleToggleMode = () => {
    const nextMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
    logger.log('Theme', `SWAPPED_TO_${nextMode.toUpperCase()}_MODE`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* 01: MY BALANCES */}
      <TuiContainer label="Balances" badge="Live">
        <View style={styles.balanceGrid}>
          <View style={[styles.balanceItem, { borderRightWidth: 1, borderColor: colors.border }]}>
            <View style={styles.titleRow}>
              <Wallet size={12} color={colors.mutedForeground} style={styles.titleIcon} />
              <TuiText size="xs" variant="muted" weight="bold">TOTAL BALANCE</TuiText>
            </View>
            <TuiText size="2xl" weight="bold" style={{ color: balance >= 0 ? colors.primary : colors.destructive }}>
              ${balance.toFixed(2)}
            </TuiText>
          </View>
          
          <View style={styles.balanceSubGrid}>
            <View style={[styles.subBalanceItem, { borderBottomWidth: 1, borderColor: colors.border }]}>
              <View style={styles.titleRow}>
                <TrendingUp size={10} color={colors.primary} style={styles.titleIcon} />
                <TuiText size="xs" variant="muted" weight="bold">INCOME</TuiText>
              </View>
              <TuiText size="sm" weight="bold" style={{ color: colors.primary }}>
                +${totalIncome.toFixed(2)}
              </TuiText>
            </View>
            <View style={styles.subBalanceItem}>
              <View style={styles.titleRow}>
                <TrendingDown size={10} color={colors.destructive} style={styles.titleIcon} />
                <TuiText size="xs" variant="muted" weight="bold">EXPENSES</TuiText>
              </View>
              <TuiText size="sm" weight="bold" style={{ color: colors.destructive }}>
                -${totalExpense.toFixed(2)}
              </TuiText>
            </View>
          </View>
        </View>
      </TuiContainer>

      {/* 02: MONTHLY BUDGET */}
      <TuiContainer label="Monthly Budget">
        <View style={styles.budgetHeader}>
          <PiggyBank size={14} color={colors.primary} style={styles.titleIcon} />
          <TuiText size="sm" weight="bold" style={{ flex: 1 }}>
            Budget Limits
          </TuiText>
        </View>
        
        <TuiProgressMeter
          progress={budgetProgress}
          label={`Spent so far: $${totalExpense.toFixed(2)} of $${budgetLimit.toFixed(2)}`}
        />
        
        {editingBudget ? (
          <View style={styles.budgetEditRow}>
            <TextInput
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
              placeholder="Enter limit"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.budgetInput,
                {
                  color: colors.foreground,
                  borderColor: colors.primary,
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                },
              ]}
            />
            <TuiButton onPress={handleSaveBudget} style={styles.saveBudgetBtn} variant="accent">
              Save
            </TuiButton>
            <TuiButton onPress={() => setEditingBudget(false)} style={styles.cancelBudgetBtn}>
              Cancel
            </TuiButton>
          </View>
        ) : (
          <TuiButton
            onPress={() => {
              setBudgetInput(budgetLimit.toString());
              setEditingBudget(true);
            }}
            variant="outline"
          >
            <View style={styles.inlineButtonContent}>
              <Settings size={12} color={colors.primary} style={styles.inlineIcon} />
              <TuiText size="xs" weight="bold" style={{ color: colors.primary }}>
                Change Budget Limit
              </TuiText>
            </View>
          </TuiButton>
        )}
      </TuiContainer>

      {/* 03: EXPENSES BY CATEGORY */}
      <TuiContainer label="Expenses by Category" badge="Analytics">
        {chartData.length === 0 ? (
          <TuiText size="xs" variant="muted" style={styles.emptyState}>
            No expenses recorded yet.
          </TuiText>
        ) : (
          <TuiBarChart data={chartData} />
        )}
      </TuiContainer>

      {/* 04: QUICK ACTIONS */}
      <TuiContainer label="Actions">
        <TuiButton onPress={onNavigateToAdd} variant="accent" style={styles.logBtn}>
          <View style={styles.inlineButtonContent}>
            <Plus size={14} color={colors.primaryForeground} style={styles.inlineIcon} />
            <TuiText size="sm" weight="bold" style={{ color: colors.primaryForeground }}>
              Add Transaction
            </TuiText>
          </View>
        </TuiButton>

        <TuiButton onPress={handleToggleMode} variant="outline">
          <View style={styles.inlineButtonContent}>
            {isDark ? (
              <Sun size={14} color={colors.primary} style={styles.inlineIcon} />
            ) : (
              <Moon size={14} color={colors.primary} style={styles.inlineIcon} />
            )}
            <TuiText size="xs" weight="bold" style={{ color: colors.primary }}>
              Switch to {isDark ? 'Light' : 'Dark'} Mode
            </TuiText>
          </View>
        </TuiButton>
      </TuiContainer>

      {/* 05: RECENT TRANSACTIONS */}
      <TuiContainer label="Recent Transactions" badge="Latest">
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
                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 230, // Clear active terminal overlays
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 4,
  },
  inlineButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineIcon: {
    marginRight: 6,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  balanceGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  balanceItem: {
    flex: 1.1,
    justifyContent: 'center',
    paddingRight: 12,
  },
  balanceSubGrid: {
    flex: 0.9,
    paddingLeft: 12,
  },
  subBalanceItem: {
    paddingVertical: 3,
  },
  budgetEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  budgetInput: {
    flex: 1,
    height: 38,
    borderWidth: 2,
    paddingHorizontal: 10,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 13,
  },
  saveBudgetBtn: {
    marginLeft: 8,
    marginVertical: 0,
  },
  cancelBudgetBtn: {
    marginLeft: 4,
    marginVertical: 0,
  },
  emptyState: {
    textAlign: 'center',
    paddingVertical: 20,
    letterSpacing: 0.5,
  },
  logBtn: {
    marginVertical: 8,
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
