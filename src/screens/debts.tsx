import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Landmark, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { TuiText } from '../components/tui-text';
import { TuiButton } from '../components/tui-button';
import { Debt } from '../types';

const getDueLabel = (dueDateStr: string, colors: any) => {
  if (!dueDateStr) return { text: '', color: colors.mutedForeground };
  
  // Parse MM-DD-YYYY
  const parts = dueDateStr.split('-');
  if (parts.length !== 3) return { text: '', color: colors.mutedForeground };
  
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  const dueDate = new Date(year, month, day);
  
  // Normalize today and due date to midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return { text: 'due now', color: '#FFD93D' };
  } else if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return { 
      text: `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} overdue`, 
      color: colors.destructive 
    };
  } else {
    return { 
      text: `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`, 
      color: colors.mutedForeground 
    };
  }
};

interface DebtRowProps {
  debt: Debt;
  isSelected: boolean;
  isEditing?: boolean;
  isSelectionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  colors: any;
  isDark: boolean;
  type: 'payable' | 'receivable';
}

const DebtRow: React.FC<DebtRowProps> = ({
  debt,
  isSelected,
  isEditing = false,
  isSelectionMode,
  onPress,
  onLongPress,
  colors,
  isDark,
  type,
}) => {
  const [legendWidth, setLegendWidth] = useState(0);
  const dueInfo = getDueLabel(debt.dueDate, colors);
  
  const borderAccent = isEditing 
    ? colors.primary 
    : (isSelected ? colors.primary : (isDark ? colors.primary + '40' : colors.primary + '30'));
  const rowBgColor = isEditing 
    ? colors.primary + '15' 
    : (isSelected ? colors.primary + '10' : (isDark ? '#1C1C1E' : '#FFFFFF'));

  const borderTopRightLeft = 12 + legendWidth;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={[
        styles.debtRow,
        {
          backgroundColor: rowBgColor,
        },
      ]}
    >
      {/* Segmented borders */}
      <View style={[styles.borderLeft, { backgroundColor: borderAccent }]} />
      <View style={[styles.borderRight, { backgroundColor: borderAccent }]} />
      <View style={[styles.borderBottom, { backgroundColor: borderAccent }]} />
      <View style={[styles.borderTopLeft, { backgroundColor: borderAccent }]} />
      <View style={[styles.borderTopRight, { backgroundColor: borderAccent, left: borderTopRightLeft }]} />

      {/* Legend label + badge on top border */}
      <View
        onLayout={(e) => setLegendWidth(e.nativeEvent.layout.width)}
        style={styles.legendWrapper}
      >
        {dueInfo.text ? (
          <TuiText size="sm" weight="bold" style={{ color: dueInfo.color }}>
            {dueInfo.text.toUpperCase()}
          </TuiText>
        ) : null}
      </View>

      {/* Row Body Content */}
      <View style={styles.debtRowBody}>
        {isSelectionMode && (
          <View
            style={{
              width: 18,
              height: 18,
              borderWidth: 1.5,
              borderColor: isSelected ? colors.primary : (isDark ? '#3F3F46' : '#A1A1AA'),
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
          >
            {isSelected && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: colors.primary,
                }}
              />
            )}
          </View>
        )}

        <View
          style={[
            styles.iconBox,
            {
              borderColor: isDark ? '#3F3F46' : '#000000',
              backgroundColor: isDark ? '#27272A' : '#FFFFFF',
            },
          ]}
        >
          {type === 'payable' ? (
            <ArrowDownCircle size={14} color={colors.destructive} />
          ) : (
            <ArrowUpCircle size={14} color={colors.primary} />
          )}
        </View>

        <View style={styles.rowLeft}>
          <TuiText weight="bold" size="md">
            {debt.name}
          </TuiText>
          <TuiText size="sm" variant="muted" style={{ marginTop: 2 }}>
            Due: {debt.dueDate}
          </TuiText>
        </View>
        
        <View style={styles.rowRight}>
          <TuiText
            weight="bold"
            style={{
              color: type === 'payable' ? colors.destructive : colors.primary,
            }}
          >
            {type === 'payable' ? '-' : '+'}₱{debt.amount.toFixed(2)}
          </TuiText>
        </View>
      </View>
    </Pressable>
  );
};

interface DebtsProps {
  debts: Debt[];
  onAddDebtPress: () => void;
  onDeleteDebt: (id: string) => void;
  onDeleteDebts?: (ids: string[]) => void;
  onEditDebt?: (debt: Debt) => void;
  refreshing: boolean;
  onRefresh: () => void;
  selectedIds?: string[];
  isSelectionMode?: boolean;
  onToggleSelect?: (id: string) => void;
  onLongPressSelect?: (id: string) => void;
  editingDebtId?: string;
}

export const Debts: React.FC<DebtsProps> = ({
  debts,
  onAddDebtPress,
  onDeleteDebt,
  onDeleteDebts,
  onEditDebt,
  refreshing,
  onRefresh,
  selectedIds = [],
  isSelectionMode = false,
  onToggleSelect,
  onLongPressSelect,
  editingDebtId,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const payables = debts.filter((d) => d.type === 'payable');
  const receivables = debts.filter((d) => d.type === 'receivable');

  const totalOwe = payables.reduce((sum, d) => sum + d.amount, 0);
  const totalReceivable = receivables.reduce((sum, d) => sum + d.amount, 0);

  const handlePressRow = (debt: Debt) => {
    if (isSelectionMode) {
      onToggleSelect?.(debt.id);
    } else {
      onEditDebt?.(debt);
    }
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: colors.background }]}>
      
      {/* 01: FIXED TOP SECTION (DEBTS SUMMARY) */}
      <View style={[styles.fixedTopSection, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <TuiContainer label="Debts Summary">
          <View style={styles.debtsSummaryGrid}>
            <View style={[styles.summaryCol, { borderRightWidth: 1, borderColor: colors.border }]}>
              <View style={styles.titleRow}>
                <ArrowDownCircle size={12} color={colors.destructive} style={styles.titleIcon} />
                <TuiText size="xs" variant="muted" weight="bold">I OWE</TuiText>
              </View>
              <TuiText size="lg" weight="bold" style={{ color: colors.destructive, marginTop: 4 }}>
                ₱{totalOwe.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </TuiText>
            </View>

            <View style={[styles.summaryCol, { paddingLeft: 12 }]}>
              <View style={styles.titleRow}>
                <ArrowUpCircle size={12} color={colors.primary} style={styles.titleIcon} />
                <TuiText size="xs" variant="muted" weight="bold">OWES ME</TuiText>
              </View>
              <TuiText size="lg" weight="bold" style={{ color: colors.primary, marginTop: 4 }}>
                ₱{totalReceivable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </TuiText>
            </View>
          </View>

          <TuiButton
            onPress={onAddDebtPress}
            variant="accent"
            style={{ marginTop: 12, height: 44, justifyContent: 'center', paddingVertical: 0 }}
          >
            Add New Debt
          </TuiButton>
        </TuiContainer>
      </View>

      {/* 02: SCROLLABLE BODY SECTION */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 65 + insets.bottom }]}
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

        {/* 02: PAYABLES LIST FOLDER */}
        <TuiContainer label="I Owe" badge={`${payables.length} ${payables.length === 1 ? 'account' : 'accounts'}`}>
          <View style={styles.debtsList}>
            {payables.length === 0 ? (
              <TuiText size="xs" variant="muted" style={styles.emptyState}>
                No entries recorded yet.
              </TuiText>
            ) : (
              payables.map((debt) => {
                const isSelected = selectedIds.includes(debt.id);
                const isEditing = editingDebtId === debt.id;
                return (
                  <DebtRow
                    key={debt.id}
                    debt={debt}
                    isSelected={isSelected}
                    isEditing={isEditing}
                    isSelectionMode={isSelectionMode}
                    onPress={() => handlePressRow(debt)}
                    onLongPress={() => onLongPressSelect?.(debt.id)}
                    colors={colors}
                    isDark={isDark}
                    type="payable"
                  />
                );
              })
            )}
          </View>
        </TuiContainer>

        {/* 03: RECEIVABLES LIST FOLDER */}
        <TuiContainer label="Owes Me" badge={`${receivables.length} ${receivables.length === 1 ? 'account' : 'accounts'}`}>
          <View style={styles.debtsList}>
            {receivables.length === 0 ? (
              <TuiText size="xs" variant="muted" style={styles.emptyState}>
                No entries recorded yet.
              </TuiText>
            ) : (
              receivables.map((debt) => {
                const isSelected = selectedIds.includes(debt.id);
                const isEditing = editingDebtId === debt.id;
                return (
                  <DebtRow
                    key={debt.id}
                    debt={debt}
                    isSelected={isSelected}
                    isEditing={isEditing}
                    isSelectionMode={isSelectionMode}
                    onPress={() => handlePressRow(debt)}
                    onLongPress={() => onLongPressSelect?.(debt.id)}
                    colors={colors}
                    isDark={isDark}
                    type="receivable"
                  />
                );
              })
            )}
          </View>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 60,
  },
  debtsSummaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 4,
  },
  debtsList: {
    marginTop: 2,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 16,
  },
  debtRow: {
    position: 'relative',
    paddingTop: 8,
  },
  borderLeft: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  borderRight: {
    position: 'absolute',
    right: 0, top: 0, bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  borderBottom: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 1.5,
    zIndex: 5,
  },
  borderTopLeft: {
    position: 'absolute',
    left: 0, top: 0,
    width: 12,
    height: 1.5,
    zIndex: 5,
  },
  borderTopRight: {
    position: 'absolute',
    top: 0, right: 0,
    height: 1.5,
    zIndex: 5,
  },
  legendWrapper: {
    position: 'absolute',
    top: -9,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 10,
  },
  legendBadge: {
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
  },
  debtRowBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    paddingTop: 4,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rowLeft: {
    flex: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  deletePressable: {
    padding: 6,
  },
  emptyState: {
    textAlign: 'center',
    paddingVertical: 20,
    letterSpacing: 0.5,
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
