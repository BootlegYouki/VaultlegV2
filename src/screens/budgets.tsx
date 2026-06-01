import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PiggyBank, Trash2, Plus } from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { TuiText } from '../components/tui-text';
import { TuiButton } from '../components/tui-button';
import { TuiProgressMeter, TuiSegmentedMeter, TuiBarChart, ChartItem } from '../components/tui-chart';
import { TuiDrawer } from '../components/tui-drawer';
import { Transaction, CATEGORIES } from '../types';
import { logger } from '../utils/logger';
import { getCategoryIcon } from './dashboard';

interface BudgetsProps {
  transactions: Transaction[];
  categoryBudgets: Record<string, number>;
  onUpdateCategoryBudget: (category: string, limit: number) => void;
  autoOpenDrawer?: boolean;
  onResetAutoOpenDrawer?: () => void;
}

// Vibrant TUI-style color palette for budget bars
const BUDGET_COLORS = [
  '#00E5FF', // electric cyan
  '#69FF47', // neon green
  '#FF6B6B', // coral red
  '#FFD93D', // golden yellow
  '#C77DFF', // violet
  '#FF9F1C', // amber orange
  '#2EC4B6', // teal
  '#FF4D6D', // hot pink
  '#A8FF78', // lime
  '#4D96FF', // electric blue
];

// Category budget card with TuiContainer-style segmented border + legend label
interface CategoryBudgetCardProps {
  cat: { id: string; label: string };
  limit: number;
  spent: number;
  progress: number;
  borderAccent: string;
  barColor: string;
}

const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({
  cat, limit, spent, progress, borderAccent, barColor,
}) => {
  const [legendWidth, setLegendWidth] = React.useState(0);
  const borderTopRightLeft = 12 + legendWidth; // 12px stub + measured label width (includes padding)

  return (
    <View style={styles.categoryItem}>
      {/* Segmented borders */}
      <View style={[styles.catBorderLeft, { backgroundColor: borderAccent }]} />
      <View style={[styles.catBorderRight, { backgroundColor: borderAccent }]} />
      <View style={[styles.catBorderBottom, { backgroundColor: borderAccent }]} />
      <View style={[styles.catBorderTopLeft, { backgroundColor: borderAccent }]} />
      <View style={[styles.catBorderTopRight, { backgroundColor: borderAccent, left: borderTopRightLeft }]} />

      {/* Legend label + badge on top border */}
      <View
        onLayout={(e) => setLegendWidth(e.nativeEvent.layout.width)}
        style={styles.catLegendWrapper}
      >
        <TuiText weight="bold" size="sm" style={{ color: barColor }}>
          {cat.label.toUpperCase()}
        </TuiText>
        <View style={[styles.catLegendBadge, { borderColor: barColor }]}>
          <TuiText size="xs" weight="bold" style={{ color: barColor }}>
            ₱{limit.toFixed(0)}
          </TuiText>
        </View>
      </View>

      {/* Card body */}
      <View style={styles.categoryItemBody}>
        <TuiProgressMeter
          progress={progress}
          totalBlocks={30}
          color={barColor}
          label={`Spent: ₱${spent.toFixed(2)} of ₱${limit.toFixed(2)}`}
        />
      </View>
    </View>
  );
};

export const Budgets: React.FC<BudgetsProps> = ({
  transactions,
  categoryBudgets,
  onUpdateCategoryBudget,
  autoOpenDrawer = false,
  onResetAutoOpenDrawer,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');

  const budgetLimit = Object.values(categoryBudgets).reduce((sum, val) => sum + val, 0);

  // Aggregate calculations
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetProgress = budgetLimit > 0 ? totalExpense / budgetLimit : 0;

  // Category breakdown calculations for active budgets list
  const activeBudgetCategories = CATEGORIES.filter(cat => categoryBudgets[cat.id] > 0);

  // Category breakdown calculations for the analytics chart
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
      formattedValue: `₱${c.value.toFixed(2)}`,
    }));

  const handleOpenDrawer = () => {
    setSelectedCategory(CATEGORIES[0].id);
    setAmountInput('');
    setModalVisible(true);
  };

  const handleCloseDrawer = () => {
    setModalVisible(false);
  };

  // Auto-open drawer when triggered by flag
  useEffect(() => {
    if (autoOpenDrawer) {
      handleOpenDrawer();
      onResetAutoOpenDrawer?.();
    }
  }, [autoOpenDrawer]);

  const borderAccent = isDark ? colors.primary : '#000000';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + insets.bottom }]}>

        {/* 01: PROGRESS & CONFIG CONTAINER */}
        <TuiContainer label="Overall Budget" badge={budgetLimit > 0 ? `₱${budgetLimit.toFixed(0)}` : undefined}>

          <TuiSegmentedMeter
            segments={activeBudgetCategories.map((cat, index) => ({
              color: BUDGET_COLORS[(index + 1) % BUDGET_COLORS.length],
              value: categoryBudgets[cat.id] || 0,
            }))}
            totalLimit={budgetLimit}
            totalSpent={totalExpense}
            label={budgetLimit > 0
              ? `Spent: ₱${totalExpense.toFixed(2)} of ₱${budgetLimit.toFixed(2)}`
              : 'No active category budgets configured.'
            }
          />

          <TuiButton
            onPress={handleOpenDrawer}
            variant="outline"
            style={styles.changeBudgetBtn}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Plus size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <TuiText weight="bold" size="sm" style={{ color: colors.primary }}>
                ADD BUDGET
              </TuiText>
            </View>
          </TuiButton>
        </TuiContainer>

        {/* 02: CATEGORY BUDGETS CONTAINER */}
        <TuiContainer label="Category Budgets" badge={activeBudgetCategories.length > 0 ? `${activeBudgetCategories.length} ACTIVE` : undefined}>
          {activeBudgetCategories.length === 0 ? (
            <TuiText size="xs" variant="muted" style={styles.emptyState}>
              No active category budgets configured.
            </TuiText>
          ) : (
            <View style={styles.categoryBudgetsList}>
              {activeBudgetCategories.map((cat, index) => {
                const limit = categoryBudgets[cat.id] || 0;
                const spent = transactions
                  .filter((t) => t.type === 'expense' && t.category === cat.id)
                  .reduce((sum, t) => sum + t.amount, 0);
                const progress = limit > 0 ? spent / limit : 0;
                const barColor = BUDGET_COLORS[(index + 1) % BUDGET_COLORS.length];

                return (
                  <CategoryBudgetCard
                    key={cat.id}
                    cat={cat}
                    limit={limit}
                    spent={spent}
                    progress={progress}
                    borderAccent={borderAccent}
                    barColor={barColor}
                  />
                );
              })}
            </View>
          )}
        </TuiContainer>

        {/* 03: CATEGORY SPENDING ANALYSIS CARD */}
        <TuiContainer label="Expenses by Category" badge="Analytics">
          {chartData.length === 0 ? (
            <TuiText size="xs" variant="muted" style={styles.emptyState}>
              No category transactions recorded yet.
            </TuiText>
          ) : (
            <TuiBarChart data={chartData} />
          )}
        </TuiContainer>

      </ScrollView>

      {/* BOTTOM DRAWER MODAL SHEET */}
      <TuiDrawer
        visible={modalVisible}
        onClose={handleCloseDrawer}
        title="Add Budget"
      >
        {/* Category Scroll Selection */}
        <TuiText size="xs" variant="muted" weight="bold" style={{ marginBottom: 8, letterSpacing: 0.5 }}>
          [ CATEGORY ]
        </TuiText>
        <View style={styles.categoryScrollContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.categorySelectBtn,
                    {
                      borderColor: borderAccent,
                      backgroundColor: isSelected ? (isDark ? '#27272A' : '#E4E4E7') : colors.card,
                    }
                  ]}
                >
                  <View style={{ marginRight: 6 }}>
                    {getCategoryIcon(cat.id, 12, isSelected ? colors.primary : colors.mutedForeground)}
                  </View>
                  <TuiText
                    size="xs"
                    weight={isSelected ? 'bold' : 'regular'}
                    style={{ color: isSelected ? colors.primary : colors.foreground }}
                  >
                    {cat.label}
                  </TuiText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Limit input */}
        <TuiText size="xs" variant="muted" weight="bold" style={{ marginBottom: 8, marginTop: 16, letterSpacing: 0.5 }}>
          [ BUDGET AMOUNT (₱) ]
        </TuiText>
        <TextInput
          value={amountInput}
          onChangeText={setAmountInput}
          keyboardType="numeric"
          placeholder="Enter amount (e.g. 500)"
          placeholderTextColor={colors.mutedForeground}
          autoFocus={false}
          style={[
            styles.amountInput,
            {
              color: colors.foreground,
              borderColor: borderAccent,
              backgroundColor: isDark ? '#18181B' : '#FFFFFF',
            }
          ]}
        />

        {/* Action row buttons */}
        <View style={styles.drawerActions}>
          <TuiButton
            onPress={handleCloseDrawer}
            variant="outline"
            style={{ ...styles.drawerActionBtn, flex: 1, marginRight: 8 }}
          >
            Cancel
          </TuiButton>
          <TuiButton
            onPress={() => {
              const amt = parseFloat(amountInput);
              if (!isNaN(amt) && amt > 0 && selectedCategory) {
                onUpdateCategoryBudget(selectedCategory, amt);
                handleCloseDrawer();
                logger.log('System', `CONFIGURED_CATEGORY_${selectedCategory.toUpperCase()}_BUDGET_TO_₱${amt.toFixed(2)}`);
              }
            }}
            variant="accent"
            style={{ ...styles.drawerActionBtn, flex: 1 }}
          >
            Save Budget
          </TuiButton>
        </View>
      </TuiDrawer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 80, // Safe padding to clear persistent nav
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerIcon: {
    marginRight: 4,
  },
  changeBudgetBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    marginVertical: 4,
  },
  emptyState: {
    textAlign: 'center',
    paddingVertical: 20,
    letterSpacing: 0.5,
  },
  categoryBudgetsList: {
    marginTop: 4,
  },
  categoryItem: {
    marginBottom: 12,
    position: 'relative',
    paddingTop: 8,
  },
  catBorderLeft: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  catBorderRight: {
    position: 'absolute',
    right: 0, top: 0, bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  catBorderBottom: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 1.5,
    zIndex: 5,
  },
  catBorderTopLeft: {
    position: 'absolute',
    left: 0, top: 0,
    width: 12,
    height: 1.5,
    zIndex: 5,
  },
  catBorderTopRight: {
    position: 'absolute',
    top: 0, right: 0,
    height: 1.5,
    zIndex: 5,
  },
  catLegendWrapper: {
    position: 'absolute',
    top: -9,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 10,
  },
  catLegendBadge: {
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
  },
  categoryItemBody: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 4,
  },
  categoryItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  categoryIconContainer: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  deleteBtn: {
    padding: 6,
  },
  categoryScrollContainer: {
    height: 38,
    marginBottom: 8,
  },
  categoryScrollContent: {
    paddingRight: 16,
    gap: 8,
  },
  categorySelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1.5,
  },
  amountInput: {
    height: 44,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    marginBottom: 20,
  },
  drawerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerActionBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
  },
});
