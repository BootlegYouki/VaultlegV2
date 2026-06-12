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

// Re-export for backwards compatibility
export { getCategoryIcon };

// Shared palette — must match stats.tsx order
const STATS_COLORS = [
  '#00E5FF', '#69FF47', '#FF6B6B', '#FFD93D', '#C77DFF',
  '#FF9F1C', '#2EC4B6', '#FF4D6D', '#A8FF78', '#4D96FF',
];

let hasAnimatedBalance = false;

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
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Swipe up: vertical delta is negative and exceeds threshold, and vertical speed/delta is dominant
        return gestureState.dy < -40 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.5;
      },
      onPanResponderRelease: (evt, gestureState) => {
        onNavigateToAdd();
      },
    })
  ).current;

  useEffect(() => {
    AsyncStorage.getItem('tui_hide_balances')
      .then((val) => {
        if (val !== null) {
          setHideBalances(val === 'true');
        }
      })
      .catch((e) => {
        logger.log('SYSTEM_ERROR', `LOAD_HIDE_BALANCES_FAILED: ${e.message}`);
      });
  }, []);

  const handleToggleHide = () => {
    const newVal = !hideBalances;
    setHideBalances(newVal);
    AsyncStorage.setItem('tui_hide_balances', newVal ? 'true' : 'false').catch((e) => {
      logger.log('SYSTEM_ERROR', `SAVE_HIDE_BALANCES_FAILED: ${e.message}`);
    });
  };

  const formatAmount = (val: number) => {
    return val.toFixed(2);
  };

  const formatCurrency = (val: number) => {
    return `${val < 0 ? '-' : ''}₱${Math.abs(val).toFixed(2)}`;
  };

  const formatLocalized = (val: number) => {
    return `₱${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };



  // Aggregate Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const [animatedBalance, setAnimatedBalance] = useState(hasAnimatedBalance ? balance : 0);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (!hasAnimatedBalance) {
      if (!startAnimation) return;
      hasAnimatedBalance = true;
    } else {
      if (isFirstRenderRef.current) {
        isFirstRenderRef.current = false;
        setAnimatedBalance(balance);
        return;
      }
    }

    let startTime: number | null = null;
    const startValue = animatedBalance;
    const duration = 800; // 800ms count-up duration

    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const currentValue = startValue + (balance - startValue) * easedProgress;

      setAnimatedBalance(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [balance, startAnimation]);

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
    color: isDark ? '#27272A' : '#E4E4E7',
    value: totalExpense,
  });

  return (
    <View 
      {...panResponder.panHandlers}
      style={[styles.mainWrapper, { backgroundColor: colors.background }]}
    >
      
      {/* 01: FIXED TOP SECTION (HEADER & BALANCES CARD) */}
      <View style={[styles.fixedTopSection, { backgroundColor: colors.background }]}>
        <TuiContainer label="Balances">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {hideBalances ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                <TuiText
                  size="3xl"
                  weight="bold"
                  style={{
                    color: balance >= 0 ? colors.primary : colors.destructive,
                  }}
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
            
            <Pressable
              onPress={handleToggleHide}
              style={{ padding: 6 }}
            >
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
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: colors.primary,
                    }}
                  />
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
      </View>

      {/* 02: STATIC BODY SECTION */}
      <View
        style={[styles.scrollContentContainer, { flex: 1, paddingBottom: 72 + insets.bottom }]}
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

        {/* My Debts (Divided Column TuiContainer) */}
        <TuiContainer label="My Debts">
          <View style={styles.debtsGrid}>
            <View style={[styles.debtCol, { borderRightWidth: 1, borderColor: colors.border }]}>
              <View style={styles.titleRow}>
                <ArrowDownCircle size={12} color={colors.destructive} style={styles.titleIcon} />
                <TuiText size="xs" variant="muted" weight="bold">I OWE</TuiText>
              </View>
              <TuiText
                size="lg"
                weight="bold"
                style={{
                  color: colors.destructive,
                  marginTop: 4,
                }}
              >
                {formatLocalized(totalOwe)}
              </TuiText>
            </View>

            <View style={[styles.debtCol, { paddingLeft: 12 }]}>
              <View style={styles.titleRow}>
                <ArrowUpCircle size={12} color={colors.primary} style={styles.titleIcon} />
                <TuiText size="xs" variant="muted" weight="bold">OWES ME</TuiText>
              </View>
              <TuiText
                size="lg"
                weight="bold"
                style={{
                  color: colors.primary,
                  marginTop: 4,
                }}
              >
                {formatLocalized(totalReceivable)}
              </TuiText>
            </View>
          </View>
        </TuiContainer>

        {/* Recent Transactions Container */}
        <TuiContainer label="Recent Transactions">
          {(() => {
            const recentTxs = transactions.slice(0, 5);
            const emptySlotsCount = Math.max(0, 5 - transactions.length);
            return (
              <View style={styles.logsList}>
                {recentTxs.map((t) => {
                  const isEditing = editingTransactionId === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => onRecentTransactionPress?.(t)}
                      style={({ pressed }) => [
                        styles.logRow,
                        {
                          borderColor: isEditing ? colors.primary : (isDark ? colors.primary + '40' : colors.primary + '30'),
                          opacity: pressed ? 0.7 : 1,
                          backgroundColor: isEditing ? colors.primary + '15' : 'transparent',
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
                          {(() => {
                            const catObj = CATEGORIES.find(c => c.id === t.category) || INCOME_CATEGORIES.find(c => c.id === t.category);
                            const catLabel = catObj ? catObj.label : t.category.charAt(0).toUpperCase() + t.category.slice(1);
                            return `${t.date} | ${catLabel}`;
                          })()}
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
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                        </TuiText>
                      </View>
                    </Pressable>
                  );
                })}

                {Array.from({ length: emptySlotsCount }).map((_, index) => {
                  return (
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
                  );
                })}
              </View>
            );
          })()}
        </TuiContainer>

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
    paddingTop: 4,
    paddingBottom: 0,
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
