import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, Animated, Keyboard, Platform } from 'react-native';
import { Calendar, ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/theme-provider';
import { TuiInput } from '../tui-input';
import { TuiText } from '../tui-text';
import { TuiButton } from '../tui-button';
import { TuiCalendar } from '../tui-calendar';
import { TuiRetroBorders } from '../tui-retro-borders';
import { Debt } from '../../types';
import { useKeyboardVisible } from '../../hooks/use-keyboard-visible';
import { getTodayDateString } from '../../utils/date';
import { formStyles as styles } from './form-styles';

export interface DebtFormRef {
  getValues: () => { name: string; amount: string; type: 'payable' | 'receivable'; dueDate: string };
  reset: () => void;
}

interface DebtFormProps {
  debt?: Debt | null;
  initialAmount?: string;
  initialName?: string;
  onClose: () => void;
  onSave: (data: {
    name: string;
    amount: number;
    type: 'payable' | 'receivable';
    dueDate: string;
  }) => void;
  onDelete?: (id: string) => void;
}

export const DebtForm = React.forwardRef<DebtFormRef, DebtFormProps>(({
  debt,
  initialAmount = '',
  initialName = '',
  onClose,
  onSave,
  onDelete,
}, ref) => {
  const { colors, isDark } = useTheme();

  // Form states
  const [debtName, setDebtName] = useState(debt ? debt.name : initialName);
  const [debtAmount, setDebtAmount] = useState(debt ? debt.amount.toString() : initialAmount);
  const [debtType, setDebtType] = useState<'payable' | 'receivable'>(debt ? debt.type : 'payable');
  const [debtDueDate, setDebtDueDate] = useState(debt ? debt.dueDate : getTodayDateString());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Dynamic layout states
  const [typeLegendWidth, setTypeLegendWidth] = useState(0);
  const [dateLegendWidth, setDateLegendWidth] = useState(0);
  const [debtTypeBtnWidths, setDebtTypeBtnWidths] = useState<Record<string, number>>({});
  const [debtTypeLabelWidths, setDebtTypeLabelWidths] = useState<Record<string, number>>({});

  // Use reusable keyboard hook
  const isKeyboardVisible = useKeyboardVisible();

  // Date picker animation
  const datePickerAnim = useRef(new Animated.Value(0)).current;

  // Form sync if props change
  useEffect(() => {
    if (debt) {
      setDebtName(debt.name);
      setDebtAmount(debt.amount.toString());
      setDebtType(debt.type);
      setDebtDueDate(debt.dueDate);
      setShowDatePicker(false);
    } else {
      setDebtName(initialName);
      setDebtAmount(initialAmount);
      setDebtType('payable');
      setDebtDueDate(getTodayDateString());
      setShowDatePicker(false);
    }
  }, [debt, initialName, initialAmount]);

  useEffect(() => {
    Animated.timing(datePickerAnim, {
      toValue: showDatePicker ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [showDatePicker]);

  React.useImperativeHandle(ref, () => ({
    getValues: () => ({ name: debtName, amount: debtAmount, type: debtType, dueDate: debtDueDate }),
    reset: () => {
      setDebtName('');
      setDebtAmount('');
      setDebtType('payable');
      setDebtDueDate(getTodayDateString());
      setShowDatePicker(false);
    }
  }));

  const handleSave = () => {
    const parsedAmt = parseFloat(debtAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) return;

    const finalName = debtName.trim() || (debtType === 'payable' ? 'Payable' : 'Receivable');

    onSave({
      name: finalName,
      amount: parsedAmt,
      type: debtType,
      dueDate: debtDueDate,
    });
  };

  const handleDelete = () => {
    if (debt && onDelete) {
      onDelete(debt.id);
    }
  };

  // Interpolations
  const upperHeight = datePickerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [450, 0],
  });
  const upperOpacity = datePickerAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0, 0],
  });
  const calendarHeight = datePickerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });
  const calendarOpacity = datePickerAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 1, 1],
  });

  const logBorderColor = isDark ? colors.primary + '40' : '#000000';
  const isEditMode = !!debt;

  return (
    <View style={styles.formContainer}>
      {/* Name and Amount Inputs */}
      <Animated.View
        style={{
          maxHeight: upperHeight,
          opacity: upperOpacity,
          overflow: 'hidden',
        }}
      >
        <TuiInput
          label="Debt Name / Person"
          value={debtName}
          onChangeText={setDebtName}
          placeholder="e.g. Bank Loan, Friend Alex"
        />

        {/* Amount Input */}
        <TuiInput
          label="Amount (₱)"
          value={debtAmount}
          onChangeText={setDebtAmount}
          keyboardType="default"
          placeholder="0.00"
          containerStyle={{ height: 68 }}
          style={{ fontSize: 32, fontFamily: 'JetBrainsMono_700Bold', height: 48 }}
        />

        {/* Debt Type Selector */}
        <View
          style={[
            styles.logCategoryContainer,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            }
          ]}
        >
          <TuiRetroBorders borderColor={logBorderColor} legendWidth={typeLegendWidth} />

          {/* Legend Label */}
          <View
            onLayout={(e) => setTypeLegendWidth(e.nativeEvent.layout.width)}
            style={styles.logLegendWrapper}
          >
            <TuiText
              weight="bold"
              size="sm"
              style={{
                color: colors.mutedForeground,
                letterSpacing: 0.5,
              }}
            >
              Debt Type
            </TuiText>
          </View>

          {/* Options Grid */}
          <View style={styles.logCategoryGrid}>
            {[
              { id: 'payable', label: 'I Owe' },
              { id: 'receivable', label: 'Owes Me' },
            ].map((option) => {
              const isSelected = debtType === option.id;
              const bWidth = debtTypeBtnWidths[option.id] || 100;
              const lWidth = debtTypeLabelWidths[option.id] || 28;
              const topSegmentWidth = Math.max(0, (bWidth - lWidth) / 2);
              const btnBorderColor = isSelected ? colors.primary : logBorderColor;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    Keyboard.dismiss();
                    setDebtType(option.id as 'payable' | 'receivable');
                  }}
                  onLayout={(e) => {
                    const w = e.nativeEvent.layout.width;
                    setDebtTypeBtnWidths(prev => ({ ...prev, [option.id]: w }));
                  }}
                  style={[
                    styles.logCategoryGridBtn,
                    {
                      backgroundColor: isSelected ? (isDark ? '#27272A' : '#E4E4E7') : colors.card,
                      width: '48%',
                    }
                  ]}
                >
                  {/* Dynamic Segmented Borders */}
                  <View style={[styles.catBtnBorderLeft, { backgroundColor: btnBorderColor }]} />
                  <View style={[styles.catBtnBorderRight, { backgroundColor: btnBorderColor }]} />
                  <View style={[styles.catBtnBorderBottom, { backgroundColor: btnBorderColor }]} />
                  <View style={[styles.catBtnBorderTopLeft, { backgroundColor: btnBorderColor, width: topSegmentWidth }]} />
                  <View style={[styles.catBtnBorderTopRight, { backgroundColor: btnBorderColor, width: topSegmentWidth }]} />

                  {/* Legend Label resting on top border */}
                  <View
                    onLayout={(e) => {
                      const w = e.nativeEvent.layout.width;
                      setDebtTypeLabelWidths(prev => ({ ...prev, [option.id]: w }));
                    }}
                    style={styles.catBtnLegendWrapper}
                  >
                    <TuiText
                      weight="bold"
                      style={{
                        color: isSelected ? colors.primary : colors.mutedForeground,
                        fontSize: 13.5,
                        letterSpacing: 0.1,
                      }}
                    >
                      {option.label}
                    </TuiText>
                  </View>

                  <View style={styles.catBtnContent} pointerEvents="none">
                    {option.id === 'payable' ? (
                      <ArrowDownCircle size={20} color={isSelected ? colors.destructive : colors.mutedForeground} />
                    ) : (
                      <ArrowUpCircle size={20} color={isSelected ? colors.primary : colors.mutedForeground} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>

      {/* Due Date Selector */}
      <View style={{ marginVertical: 10, width: '100%', position: 'relative', zIndex: 100 }}>
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            setShowDatePicker(prev => !prev);
          }}
          style={({ pressed }) => [
            styles.logDateSelectorRow,
            {
              backgroundColor: pressed ? colors.primary + '15' : (isDark ? '#18181B' : '#FFFFFF'),
              height: 56,
              marginBottom: 0,
            }
          ]}
        >
          <TuiRetroBorders
            borderColor={showDatePicker ? colors.primary : logBorderColor}
            legendWidth={dateLegendWidth}
          />

          {/* Legend Label */}
          <View
            onLayout={(e) => setDateLegendWidth(e.nativeEvent.layout.width)}
            style={styles.logLegendWrapper}
          >
            <TuiText
              weight="bold"
              size="sm"
              style={{
                color: showDatePicker ? colors.primary : colors.mutedForeground,
                letterSpacing: 0.5,
              }}
            >
              Due Date
            </TuiText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <TuiText size="sm" style={{ color: colors.foreground }}>
              {debtDueDate || 'Select Due Date'}
            </TuiText>
            <Calendar size={16} color={colors.primary} />
          </View>
        </Pressable>

        <Animated.View
          style={{
            maxHeight: calendarHeight,
            opacity: calendarOpacity,
            overflow: 'hidden',
            marginTop: datePickerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 12],
            }),
          }}
        >
          <TuiCalendar
            value={debtDueDate}
            onChange={(selectedDate) => {
              setDebtDueDate(selectedDate);
              setShowDatePicker(false);
            }}
          />
        </Animated.View>
      </View>

      {/* Drawer Actions */}
      <View style={styles.logDrawerActions}>
        {isEditMode ? (
          <>
            <TuiButton
              onPress={handleDelete}
              variant="destructive"
              style={{ flex: 1, marginRight: 8, height: 44, justifyContent: 'center', paddingVertical: 0 }}
            >
              Delete
            </TuiButton>
            <TuiButton
              disabled={isNaN(parseFloat(debtAmount)) || parseFloat(debtAmount) <= 0}
              onPress={handleSave}
              variant="accent"
              style={{ flex: 1, height: 44, justifyContent: 'center', paddingVertical: 0 }}
            >
              Save Changes
            </TuiButton>
          </>
        ) : (
          <>
            <TuiButton
              onPress={onClose}
              variant="outline"
              style={{ flex: 1, marginRight: 8, height: 44, justifyContent: 'center', paddingVertical: 0 }}
            >
              Cancel
            </TuiButton>
            <TuiButton
              disabled={isNaN(parseFloat(debtAmount)) || parseFloat(debtAmount) <= 0}
              onPress={handleSave}
              variant="accent"
              style={{ flex: 1, height: 44, justifyContent: 'center', paddingVertical: 0 }}
            >
              Save Debt
            </TuiButton>
          </>
        )}
      </View>

      {isKeyboardVisible && <View style={{ height: Platform.OS === 'ios' ? 50 : 70 }} />}
    </View>
  );
});

DebtForm.displayName = 'DebtForm';
