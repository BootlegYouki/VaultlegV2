import React, { useRef } from 'react';
import { Animated } from 'react-native';
import { TuiDrawer } from '../tui-drawer';
import { Transaction } from '../../types';
import { TransactionForm, TransactionFormRef } from './transaction-form';
import { logger } from '../../utils/logger';

interface LogIncomeDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  onOpenExpenseDrawerWithData: (amount: string, description: string) => void;
  progressAnim: Animated.Value;
  initialAmount?: string;
  initialName?: string;
}

export const LogIncomeDrawer: React.FC<LogIncomeDrawerProps> = ({
  visible,
  onClose,
  onSave,
  onOpenExpenseDrawerWithData,
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
      onOpenExpenseDrawerWithData(amount, description);
    }, 250);
    logger.log('NAVIGATOR', 'SWIPE_UP_DRAWER_INCOME_TO_EXPENSE');
  };

  return (
    <TuiDrawer
      visible={visible}
      onClose={handleClose}
      title="Log Income"
      progressAnim={progressAnim}
      onSwipeUp={handleSwipeUp}
    >
      <TransactionForm
        ref={formRef}
        type="income"
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
