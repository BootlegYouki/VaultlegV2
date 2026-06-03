import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Landmark, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { TuiText } from '../components/tui-text';
import { TuiButton } from '../components/tui-button';
import { Debt } from '../types';

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
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({ pressed }) => [
        styles.debtRow,
        {
          borderColor: isEditing ? colors.primary : (isSelected ? colors.primary : (isDark ? colors.primary + '40' : colors.primary + '30')),
          opacity: pressed ? 0.7 : 1,
          backgroundColor: isEditing ? colors.primary + '15' : (isSelected ? colors.primary + '10' : (isDark ? '#1C1C1E' : '#FFFFFF')),
        },
      ]}
    >
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
        <TuiText size="sm" variant="muted">
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
        <TuiContainer label="Debts Summary" badge="Totals">
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 36 + insets.bottom }]}
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
        <TuiContainer label="I Owe" badge={`${payables.length} accounts`}>
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
        <TuiContainer label="Owes Me" badge={`${receivables.length} accounts`}>
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
  },
  debtRow: {
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
  rowLeft: {
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
