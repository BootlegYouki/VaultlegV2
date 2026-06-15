import React, { useRef } from 'react';
import { Animated } from 'react-native';
import { TuiDrawer } from '../tui-drawer';
import { Transaction } from '../../types';
import { TransactionForm, TransactionFormRef } from './transaction-form';
import { logger } from '../../utils/logger';

interface LogExpenseDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  onOpenIncomeDrawerWithData: (amount: string, description: string) => void;
  progressAnim: Animated.Value;
  initialAmount?: string;
  initialName?: string;
}

export const LogExpenseDrawer: React.FC<LogExpenseDrawerProps> = ({
  visible,
  onClose,
  onSave,
  onOpenIncomeDrawerWithData,
  progressAnim,
  initialAmount = '',
  initialName = '',
}) => {
  const formRef = useRef<TransactionFormRef>(null);

  const handleClose = () => {
    onClose();
    formRef.current?.reset();
  };

  const handleSwipeUp = () => {
    if (!formRef.current) return;
    const { amount, description } = formRef.current.getValues();

    onClose();
    setTimeout(() => {
      formRef.current?.reset();
      onOpenIncomeDrawerWithData(amount, description);
    }, 250);
    logger.log('NAVIGATOR', 'SWIPE_UP_DRAWER_EXPENSE_TO_INCOME');
  };

  return (
    <TuiDrawer
      visible={visible}
      onClose={handleClose}
      title="Log Expense"
      progressAnim={progressAnim}
      onSwipeUp={handleSwipeUp}
    >
      <TransactionForm
        ref={formRef}
        type="expense"
        onClose={handleClose}
        onSave={(data) => {
          onSave(data);
          handleClose();
        }}
        initialAmount={initialAmount}
        initialName={initialName}
      />
    </TuiDrawer>
  );
};
