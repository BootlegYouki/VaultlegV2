import React from 'react';
import { View, StyleSheet, Pressable, Dimensions, ScrollView, Animated, FlatList } from 'react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { TuiText } from '../components/tui-text';
import { TuiSegmentedMeter } from '../components/tui-chart';
import { TuiScrollView } from '../components/tui-scrollview';
import { Transaction, CATEGORIES, INCOME_CATEGORIES, getCategoryLabel } from '../types';
import { getCategoryIcon } from '../utils/category-icon';
import { parseDateString, getTodayDateString, isSameMonthYear, isBeforeOrSameMonthYear, getRelativeMonth } from '../utils/date';

const formatMonthYearHeader = (dateStr: string): string => {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    const mIdx = parseInt(parts[0], 10) - 1;
    const year = parts[2];
    if (mIdx >= 0 && mIdx < 12) {
      return `${monthNames[mIdx]} ${year}`;
    }
  }
  return 'UNKNOWN MONTH';
};

const { width: screenWidth } = Dimensions.get('window');
const containerWidth = screenWidth - 32;
const itemWidth = containerWidth - 80;
const gap = 12;






interface StatsProps {
  transactions: Transaction[];
  categoryLimits?: Record<string, number>;
  onUpdateCategoryLimit?: (category: string, limit: number) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onTransactionPress?: (tx: Transaction) => void;
  autoOpenDrawer?: boolean;
  onResetAutoOpenDrawer?: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  animateMeter?: boolean;
}

// Vibrant TUI-style color palette for stats bars (dark mode)
const STATS_COLORS = [
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

// Darker equivalents for light mode legibility
const STATS_COLORS_LIGHT = [
  '#007A99', // deep cyan
  '#2A8500', // forest green
  '#CC2222', // crimson
  '#AA7700', // dark amber
  '#7200B8', // deep violet
  '#CC5500', // burnt orange
  '#1A7A6E', // dark teal
  '#BB1044', // deep rose
  '#3D8C00', // olive green
  '#1155CC', // cobalt blue
];

interface CategoryLimitCardProps {
  cat: { id: string; label: string; lastDate?: string; count: number; avg: number };
  spent: number;
  progress: number;
  borderAccent: string;
  barColor: string;
  isDark: boolean;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryLimitCard: React.FC<CategoryLimitCardProps> = ({
  cat, spent, progress, borderAccent, barColor, isDark, isSelected, onPress,
}) => {
  const [legendWidth, setLegendWidth] = React.useState(0);
  const borderTopRightLeft = 12 + legendWidth;
  const percentageStr = `${Math.round(progress * 100)}%`;

  return (
    <Pressable onPress={onPress} style={styles.categoryItem}>
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
          <TuiText size="sm" weight="bold" style={{ color: barColor }}>
            {percentageStr}
          </TuiText>
        </View>
      </View>

      {/* Card body */}
      <View style={styles.categoryItemBody}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Brutalist category icon box */}
          <View
            style={[
              styles.categoryIconContainer,
              {
                borderColor: isDark ? '#3F3F46' : '#000000',
                backgroundColor: isDark ? '#27272A' : '#FFFFFF',
              },
            ]}
          >
            {getCategoryIcon(cat.id, 14, isDark ? '#FAFAFA' : '#000000')}
          </View>
          
          {/* Stats details stack */}
          <View style={{ flex: 1, paddingLeft: 4 }}>
            <TuiText size="sm" weight="bold" style={{ letterSpacing: 0.5 }}>
              {cat.lastDate ? `LAST SPENT: ${cat.lastDate}` : 'NO LOGS RECORDED'}
            </TuiText>
            <TuiText size="sm" variant="muted" style={{ letterSpacing: 0.5, marginTop: 2 }}>
              LOGS: {cat.count} | AVG: ₱{cat.avg.toFixed(2)}
            </TuiText>
          </View>

          {/* Spent amount */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TuiText weight="bold" size="md" style={{ color: barColor }}>
              ₱{spent.toFixed(2)}
            </TuiText>
            {isSelected && (
              <View 
                style={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: 3, 
                  backgroundColor: barColor, 
                  marginLeft: 8 
                }} 
              />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export const Stats: React.FC<StatsProps> = ({
  transactions,
  categoryLimits,
  onUpdateCategoryLimit,
  onEditTransaction,
  onTransactionPress,
  autoOpenDrawer,
  onResetAutoOpenDrawer,
  refreshing,
  onRefresh,
  animateMeter = false,
}) => {
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [targetMonth, setTargetMonth] = React.useState<string>(() => getTodayDateString());
  const [selectorVisible, setSelectorVisible] = React.useState(true);
  const selectorOpacity = React.useRef(new Animated.Value(1)).current;

  // Generate months list based on actual transactions + current month
  const monthsList = React.useMemo(() => {
    const monthsSet = new Set<string>();
    
    // Always include current month
    const todayStr = getTodayDateString();
    const todayParts = todayStr.split('-');
    if (todayParts.length === 3) {
      monthsSet.add(`${todayParts[0]}-01-${todayParts[2]}`);
    }

    // Add all months that have transactions
    transactions.forEach(t => {
      if (t.date) {
        const parts = t.date.split('-');
        if (parts.length === 3) {
          monthsSet.add(`${parts[0]}-01-${parts[2]}`);
        }
      }
    });

    // Sort chronologically
    return Array.from(monthsSet).sort((a, b) => {
      const partsA = a.split('-');
      const partsB = b.split('-');
      const dateA = new Date(parseInt(partsA[2], 10), parseInt(partsA[0], 10) - 1, 1);
      const dateB = new Date(parseInt(partsB[2], 10), parseInt(partsB[0], 10) - 1, 1);
      return dateA.getTime() - dateB.getTime();
    });
  }, [transactions]);

  const initialIndex = React.useMemo(() => {
    const idx = monthsList.findIndex(m => isSameMonthYear(m, getTodayDateString()));
    return idx !== -1 ? idx : Math.max(0, monthsList.length - 1);
  }, [monthsList]);



  const hasInitializedRef = React.useRef(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      hasInitializedRef.current = true;
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (event: any) => {
    if (!hasInitializedRef.current) return;
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (itemWidth + gap));
    if (index >= 0 && index < monthsList.length) {
      const selected = monthsList[index];
      if (!isSameMonthYear(selected, targetMonth)) {
        setTargetMonth(selected);
      }
    }
  };

  const handleMainScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y > 20 && selectorVisible) {
      setSelectorVisible(false);
      Animated.timing(selectorOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    } else if (y <= 5 && !selectorVisible) {
      setSelectorVisible(true);
      Animated.timing(selectorOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  };




  // Aggregate calculations
  const totalIncomeUpToTarget = transactions
    .filter((t) => t.type === 'income' && isBeforeOrSameMonthYear(t.date, targetMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenseUpToTarget = transactions
    .filter((t) => t.type === 'expense' && isBeforeOrSameMonthYear(t.date, targetMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const balanceAtTargetEnd = totalIncomeUpToTarget - totalExpenseUpToTarget;

  const targetExpense = transactions
    .filter((t) => t.type === 'expense' && isSameMonthYear(t.date, targetMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown calculations
  const categorySpending = CATEGORIES.map((cat) => {
    const categoryTxs = transactions.filter((t) => t.type === 'expense' && t.category === cat.id && isSameMonthYear(t.date, targetMonth));
    const amount = categoryTxs.reduce((sum, t) => sum + t.amount, 0);
    const count = categoryTxs.length;
    const avg = count > 0 ? amount / count : 0;
    
    let lastDate = '';
    if (categoryTxs.length > 0) {
      const sorted = [...categoryTxs].sort((a, b) => parseDateString(b.date).getTime() - parseDateString(a.date).getTime());
      lastDate = sorted[0].date;
    }

    return {
      id: cat.id,
      label: cat.label,
      value: amount,
      count,
      avg,
      lastDate,
    };
  });


  const sortedSpending = [...categorySpending]
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const borderAccent = isDark ? colors.primary + '40' : '#000000';

  const totalLimit = balanceAtTargetEnd > 0 ? balanceAtTargetEnd + targetExpense : targetExpense;

  const segments: { color: string; value: number }[] = [];
  const unspent = balanceAtTargetEnd;
  if (balanceAtTargetEnd > 0 && unspent > 0) {
    segments.push({
      color: colors.primary,
      value: unspent,
    });
  }

  sortedSpending.forEach((c, index) => {
    segments.push({
      color: (isDark ? STATS_COLORS : STATS_COLORS_LIGHT)[index % STATS_COLORS.length],
      value: c.value,
    });
  });

  const getColor = (index: number) =>
    (isDark ? STATS_COLORS : STATS_COLORS_LIGHT)[index % STATS_COLORS.length];

  const selectedCatObj = CATEGORIES.find(c => c.id === selectedCategory);
  const selectedIndex = sortedSpending.findIndex(c => c.id === selectedCategory);
  const selectedColor = selectedIndex !== -1 ? getColor(selectedIndex) : colors.primary;

  // Map each category id to its assigned vibrant color
  const categoryColorMap: Record<string, string> = {};
  sortedSpending.forEach((c, index) => {
    categoryColorMap[c.id] = getColor(index);
  });

  return (
    <View style={[styles.mainWrapper, { backgroundColor: colors.background }]}>
      
      {/* 01: FIXED TOP SECTION (INCOME ALLOCATION) */}
      <View style={[styles.fixedTopSection, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TuiContainer 
          label="Income Allocation" 
          badge={balanceAtTargetEnd > 0 ? `₱${balanceAtTargetEnd.toFixed(0)} Left` : undefined}
          accentBorder={animateMeter}
        >
          <TuiSegmentedMeter
            key={targetMonth}
            segments={segments}
            totalLimit={totalLimit}
            totalSpent={targetExpense}
            label={totalLimit > 0
              ? `₱${targetExpense.toFixed(2)}`
              : `₱${targetExpense.toFixed(2)} spent (No funds recorded)`
            }
            animateMode="always"
            animationDirection="deplete"
          />
        </TuiContainer>
      </View>

      {/* 02: SCROLLABLE BODY SECTION */}
      <TuiScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onScroll={handleMainScroll}
        scrollEventThrottle={16}
      >

        {/* 02: SPENT ALLOCATION CONTAINER */}
        <TuiContainer label="Spent Allocation" badge={sortedSpending.length > 0 ? `${sortedSpending.length} ${sortedSpending.length === 1 ? 'Category' : 'Categories'}` : undefined}>
          {sortedSpending.length === 0 ? (
            <TuiText size="xs" variant="muted" style={styles.emptyState}>
              No category transactions recorded yet.
            </TuiText>
          ) : (
            <View style={styles.categoryLimitsList}>
              {sortedSpending.map((c, index) => {
                const spent = c.value;
                const progress = totalLimit > 0 ? spent / totalLimit : 0;
                const barColor = getColor(index);
                const isSelected = selectedCategory === c.id;

                return (
                  <CategoryLimitCard
                    key={c.id}
                    cat={c}
                    spent={spent}
                    progress={progress}
                    borderAccent={isSelected ? barColor : borderAccent}
                    barColor={barColor}
                    isDark={isDark}
                    isSelected={isSelected}
                    onPress={() => setSelectedCategory(isSelected ? null : c.id)}
                  />
                );
              })}
            </View>
          )}
        </TuiContainer>

        {/* 03: TRANSACTION LOG CARD */}
        <TuiContainer 
          label={selectedCatObj ? `${selectedCatObj.label} Transactions` : "All Transactions"} 
          badge={selectedCategory ? selectedCatObj?.label.toUpperCase() : "Expenses"}
        >
          {(() => {
            const displayTxs = transactions
              .filter((t) => t.type === 'expense' && (selectedCategory ? t.category === selectedCategory : true) && isSameMonthYear(t.date, targetMonth))
              .sort((a, b) => parseDateString(b.date).getTime() - parseDateString(a.date).getTime());

            if (displayTxs.length === 0) {
              return (
                <TuiText size="xs" variant="muted" style={styles.emptyState}>
                  No expense transactions recorded yet.
                </TuiText>
              );
            }

            return (
              <View style={{ marginTop: 4 }}>
                {displayTxs.map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => onTransactionPress?.(t)}
                    style={({ pressed }) => [
                      styles.detailRow,
                      {
                        borderColor: isDark ? colors.primary + '40' : colors.primary + '30',
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    {/* Category Icon Box */}
                    <View
                      style={[
                        styles.detailIconBox,
                        {
                          borderColor: isDark ? '#3F3F46' : '#000000',
                          backgroundColor: isDark ? '#27272A' : '#FFFFFF',
                        },
                      ]}
                    >
                      {getCategoryIcon(t.category, 14, isDark ? '#FAFAFA' : '#000000')}
                    </View>

                    <View style={styles.detailLeft}>
                      <TuiText weight="bold" size="md">
                        {t.description || 'LOGGED TRANSACTION'}
                      </TuiText>
                      <TuiText size="sm" variant="muted">
                        {`${t.date} | ${getCategoryLabel(t.category)}`}
                      </TuiText>
                    </View>

                    <View style={styles.detailRight}>
                      <TuiText
                        weight="bold"
                        style={{
                          color: categoryColorMap[t.category] ?? colors.destructive,
                        }}
                      >
                        -₱{t.amount.toFixed(2)}
                      </TuiText>
                    </View>
                  </Pressable>
                ))}
              </View>
            );
          })()}
        </TuiContainer>

      </TuiScrollView>

      {/* FLOATING MONTH SELECTOR */}
      <Animated.View 
        style={[
          styles.floatingMonthSelectorWrapper,
          {
            opacity: selectorOpacity,
            transform: [
              {
                translateY: selectorOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          }
        ]}
        pointerEvents={selectorVisible ? 'auto' : 'none'}
      >
        <FlatList
          horizontal
          style={{ width: '100%', height: '100%' }}
          data={monthsList}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={itemWidth + gap}
          snapToAlignment="start"
          disableIntervalMomentum={true}
          contentContainerStyle={{
            paddingHorizontal: (containerWidth - itemWidth) / 2,
            alignItems: 'center',
          }}
          initialScrollIndex={initialIndex}
          initialNumToRender={monthsList.length}
          windowSize={5}
          getItemLayout={(_, index) => (
            { length: itemWidth + gap, offset: (itemWidth + gap) * index, index }
          )}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          renderItem={({ item: m, index: idx }) => {
            const isSelected = isSameMonthYear(m, targetMonth);
            return (
              <View
                style={[
                  styles.carouselItem,
                  {
                    width: itemWidth,
                    marginRight: idx === monthsList.length - 1 ? 0 : gap,
                    backgroundColor: isDark ? '#18181B' : '#FFFFFF',
                    borderColor: isSelected ? colors.primary : (isDark ? colors.primary + '40' : colors.primary + '30'),
                    borderWidth: isSelected ? 2 : 1.5,
                  }
                ]}
              >
                <TuiText 
                  size={isSelected ? "lg" : "md"} 
                  weight="bold" 
                  style={{ color: colors.primary }}
                >
                  {formatMonthYearHeader(m)}
                </TuiText>
              </View>
            );
          }}
        />
      </Animated.View>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 170, // Safe padding to clear persistent nav + floating month selector
  },
  emptyState: {
    textAlign: 'center',
    paddingVertical: 20,
    letterSpacing: 0.5,
  },
  categoryLimitsList: {
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 4,
    gap: 16,
  },
  categoryItem: {
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
  categoryIconContainer: {
    width: 28,
    height: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  detailIconBox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  detailLeft: {
    flex: 1,
  },
  detailRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  floatingMonthSelectorWrapper: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    height: 52,
    overflow: 'hidden',
  },
  carouselRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  carouselItem: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
});

