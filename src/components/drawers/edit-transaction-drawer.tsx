import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';
import { TuiDrawer } from '../tui-drawer';
import { Transaction } from '../../types';
import { TransactionForm } from './transaction-form';

interface EditTransactionDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (updatedTx: Transaction) => void;
  onDelete: (id: string) => void;
  progressAnim: Animated.Value;
}

export const EditTransactionDrawer: React.FC<EditTransactionDrawerProps> = ({
  transaction,
  onClose,
  onSave,
  onDelete,
  progressAnim,
}) => {
  const [lastType, setLastType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    if (transaction) {
      setLastType(transaction.type);
    }
  }, [transaction]);

  const currentType = transaction ? transaction.type : lastType;
  const drawerTitle = currentType === 'income' ? 'Edit Income' : 'Edit Expense';

  return (
    <TuiDrawer
      visible={transaction !== null}
      onClose={onClose}
      title={drawerTitle}
      progressAnim={progressAnim}
    >
      <TransactionForm
        transaction={transaction}
        onClose={onClose}
        onSave={(data) => {
          if (!transaction) return;
          onSave({
            ...transaction,
            amount: data.amount,
            description: data.description,
            category: data.category,
            date: data.date,
            type: data.type,
          });
        }}
        onDelete={onDelete}
      />
    </TuiDrawer>
  );
};
