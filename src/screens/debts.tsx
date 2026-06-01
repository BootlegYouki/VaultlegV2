import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Landmark, ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { TuiText } from '../components/tui-text';

export const Debts: React.FC = () => {
  const { colors, isDark } = useTheme();

  // High fidelity visual mock portfolios
  const payables = [
    { id: '1', name: 'Emergency Loan (Bank)', amount: 10000.00, dueDate: '2026-06-15' },
    { id: '2', name: 'Friend Alex (Lunch)', amount: 2500.00, dueDate: '2026-06-10' },
  ];

  const receivables = [
    { id: '1', name: 'Colleague Maria (Freelance)', amount: 5000.00, dueDate: '2026-06-20' },
    { id: '2', name: 'Room Rent Deposit', amount: 3200.00, dueDate: '2026-07-01' },
  ];

  const totalOwe = payables.reduce((sum, d) => sum + d.amount, 0);
  const totalReceivable = receivables.reduce((sum, d) => sum + d.amount, 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      
      {/* 01: OVERVIEW CARD */}
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
      </TuiContainer>

      {/* 02: PAYABLES LIST FOLDER */}
      <TuiContainer label="I Owe (Payable)" badge={`${payables.length} accounts`}>
        <View style={styles.debtsList}>
          {payables.map((debt, idx) => (
            <View
              key={debt.id}
              style={[
                styles.debtRow,
                {
                  borderColor: isDark ? '#27272A' : '#E4E4E7',
                  borderBottomWidth: idx === payables.length - 1 ? 0 : 1,
                },
              ]}
            >
              <View style={styles.rowLeft}>
                <TuiText weight="bold" size="sm">
                  {debt.name}
                </TuiText>
                <TuiText size="xs" variant="muted">
                  Due: {debt.dueDate}
                </TuiText>
              </View>
              <TuiText weight="bold" style={{ color: colors.destructive }}>
                -₱{debt.amount.toFixed(2)}
              </TuiText>
            </View>
          ))}
        </View>
      </TuiContainer>

      {/* 03: RECEIVABLES LIST FOLDER */}
      <TuiContainer label="Owes Me (Receivable)" badge={`${receivables.length} accounts`}>
        <View style={styles.debtsList}>
          {receivables.map((debt, idx) => (
            <View
              key={debt.id}
              style={[
                styles.debtRow,
                {
                  borderColor: isDark ? '#27272A' : '#E4E4E7',
                  borderBottomWidth: idx === receivables.length - 1 ? 0 : 1,
                },
              ]}
            >
              <View style={styles.rowLeft}>
                <TuiText weight="bold" size="sm">
                  {debt.name}
                </TuiText>
                <TuiText size="xs" variant="muted">
                  Due: {debt.dueDate}
                </TuiText>
              </View>
              <TuiText weight="bold" style={{ color: colors.primary }}>
                +₱{debt.amount.toFixed(2)}
              </TuiText>
            </View>
          ))}
        </View>
      </TuiContainer>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 60, // Clear bottom tab bar
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLeft: {
    flex: 1.3,
  },
});
