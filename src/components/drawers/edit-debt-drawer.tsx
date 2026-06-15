import React from 'react';
import { Animated } from 'react-native';
import { TuiDrawer } from '../tui-drawer';
import { Debt } from '../../types';
import { DebtForm } from './debt-form';

interface EditDebtDrawerProps {
  debt: Debt | null;
  onClose: () => void;
  onSave: (updatedDebt: Debt) => void;
  onDelete: (id: string) => void;
  progressAnim: Animated.Value;
}

export const EditDebtDrawer: React.FC<EditDebtDrawerProps> = ({
  debt,
  onClose,
  onSave,
  onDelete,
  progressAnim,
}) => {
  return (
    <TuiDrawer
      visible={debt !== null}
      onClose={onClose}
      title="Edit Debt"
      progressAnim={progressAnim}
    >
      <DebtForm
        debt={debt}
        onClose={onClose}
        onSave={(data) => {
          if (!debt) return;
          onSave({
            ...debt,
            name: data.name,
            amount: data.amount,
            type: data.type,
            dueDate: data.dueDate,
          });
          onClose();
        }}
        onDelete={onDelete}
      />
    </TuiDrawer>
  );
};
