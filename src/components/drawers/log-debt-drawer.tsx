import React, { useRef } from 'react';
import { Animated } from 'react-native';
import { TuiDrawer } from '../tui-drawer';
import { Debt } from '../../types';
import { DebtForm, DebtFormRef } from './debt-form';
import { logger } from '../../utils/logger';

interface LogDebtDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (debt: Omit<Debt, 'id'>) => void;
  onOpenTransactionDrawerWithData: (amount: string, description: string) => void;
  progressAnim: Animated.Value;
  initialAmount?: string;
  initialName?: string;
}

export const LogDebtDrawer: React.FC<LogDebtDrawerProps> = ({
  visible,
  onClose,
  onSave,
  onOpenTransactionDrawerWithData,
  progressAnim,
  initialAmount = '',
  initialName = '',
}) => {
  const formRef = useRef<DebtFormRef>(null);

  const handleClose = () => {
    onClose();
    formRef.current?.reset();
  };

  const handleSwipeUp = () => {
    if (!formRef.current) return;
    const { amount, name } = formRef.current.getValues();

    onClose();
    setTimeout(() => {
      formRef.current?.reset();
      onOpenTransactionDrawerWithData(amount, name);
    }, 250);
    logger.log('NAVIGATOR', 'SWIPE_UP_DRAWER_DEBT_TO_EXPENSE');
  };

  return (
    <TuiDrawer
      visible={visible}
      onClose={handleClose}
      title="Add Debt"
      progressAnim={progressAnim}
      onSwipeUp={handleSwipeUp}
    >
      <DebtForm
        ref={formRef}
        initialAmount={initialAmount}
        initialName={initialName}
        onClose={handleClose}
        onSave={(data) => {
          onSave(data);
          handleClose();
        }}
      />
    </TuiDrawer>
  );
};
