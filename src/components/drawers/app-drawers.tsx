import React from 'react';
import { Animated } from 'react-native';
import { Transaction, Debt } from '../../types';
import { LogExpenseDrawer } from './log-expense-drawer';
import { LogIncomeDrawer } from './log-income-drawer';
import { LogDebtDrawer } from './log-debt-drawer';
import { EditTransactionDrawer } from './edit-transaction-drawer';
import { EditDebtDrawer } from './edit-debt-drawer';

export interface AppDrawersProps {
  // Expense drawer
  addExpenseDrawerOpen: boolean;
  onCloseExpenseDrawer: () => void;
  onOpenIncomeDrawerWithData: (amount: string, description: string) => void;

  // Income drawer
  addIncomeDrawerOpen: boolean;
  onCloseIncomeDrawer: () => void;
  onOpenExpenseDrawerWithData: (amount: string, description: string) => void;

  // Debt drawer
  addDebtDrawerOpen: boolean;
  onCloseDebtDrawer: () => void;
  onOpenTransactionDrawerWithData: (amount: string, description: string) => void;

  // Shared seed values
  seedLogAmount: string;
  seedLogDescription: string;
  seedDebtAmount: string;
  seedDebtName: string;

  // Edit transaction drawer
  editingTransaction: Transaction | null;
  onCloseEditTransaction: () => void;
  onSaveEditTransaction: (tx: Transaction) => void;
  onDeleteEditTransaction: (id: string) => void;

  // Edit debt drawer
  editingDebt: Debt | null;
  onCloseEditDebt: () => void;
  onSaveEditDebt: (debt: Debt) => void;
  onDeleteEditDebt: (id: string) => void;

  // Shared CRUD save handlers
  onSaveTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onSaveDebt: (debt: Omit<Debt, 'id'>) => void;

  // Deck transition animation
  progressAnim: Animated.Value;
}

export const AppDrawers: React.FC<AppDrawersProps> = ({
  addExpenseDrawerOpen,
  onCloseExpenseDrawer,
  onOpenIncomeDrawerWithData,
  addIncomeDrawerOpen,
  onCloseIncomeDrawer,
  onOpenExpenseDrawerWithData,
  addDebtDrawerOpen,
  onCloseDebtDrawer,
  onOpenTransactionDrawerWithData,
  seedLogAmount,
  seedLogDescription,
  seedDebtAmount,
  seedDebtName,
  editingTransaction,
  onCloseEditTransaction,
  onSaveEditTransaction,
  onDeleteEditTransaction,
  editingDebt,
  onCloseEditDebt,
  onSaveEditDebt,
  onDeleteEditDebt,
  onSaveTransaction,
  onSaveDebt,
  progressAnim,
}) => (
  <>
    <LogExpenseDrawer
      visible={addExpenseDrawerOpen}
      onClose={onCloseExpenseDrawer}
      onSave={onSaveTransaction}
      onOpenIncomeDrawerWithData={onOpenIncomeDrawerWithData}
      progressAnim={progressAnim}
      initialAmount={seedLogAmount}
      initialName={seedLogDescription}
    />

    <LogIncomeDrawer
      visible={addIncomeDrawerOpen}
      onClose={onCloseIncomeDrawer}
      onSave={onSaveTransaction}
      onOpenExpenseDrawerWithData={onOpenExpenseDrawerWithData}
      progressAnim={progressAnim}
      initialAmount={seedLogAmount}
      initialName={seedLogDescription}
    />

    <LogDebtDrawer
      visible={addDebtDrawerOpen}
      onClose={onCloseDebtDrawer}
      onSave={onSaveDebt}
      onOpenTransactionDrawerWithData={onOpenTransactionDrawerWithData}
      progressAnim={progressAnim}
      initialAmount={seedDebtAmount}
      initialName={seedDebtName}
    />

    <EditTransactionDrawer
      transaction={editingTransaction}
      onClose={onCloseEditTransaction}
      onSave={onSaveEditTransaction}
      onDelete={onDeleteEditTransaction}
      progressAnim={progressAnim}
    />

    <EditDebtDrawer
      debt={editingDebt}
      onClose={onCloseEditDebt}
      onSave={onSaveEditDebt}
      onDelete={onDeleteEditDebt}
      progressAnim={progressAnim}
    />
  </>
);
