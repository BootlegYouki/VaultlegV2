import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, Animated, Keyboard, Platform } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { useTheme } from '../../theme/theme-provider';
import { TuiInput } from '../tui-input';
import { TuiText } from '../tui-text';
import { TuiButton } from '../tui-button';
import { TuiCalendar } from '../tui-calendar';
import { TuiRetroBorders } from '../tui-retro-borders';
import { Transaction, CATEGORIES, INCOME_CATEGORIES } from '../../types';
import { getCategoryIcon } from '../../utils/category-icon';
import { getTodayDateString } from '../../utils/date';
import { useKeyboardVisible } from '../../hooks/use-keyboard-visible';
import { formStyles as styles } from './form-styles';

export interface TransactionFormRef {
  getValues: () => { amount: string; description: string; category: string; date: string };
  reset: () => void;
}

interface TransactionFormProps {
  transaction?: Transaction | null;
  type?: 'expense' | 'income';
  onClose?: () => void;
  onSave: (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
    type: 'expense' | 'income';
  }) => void;
  onDelete?: (id: string) => void;
  initialAmount?: string;
  initialName?: string;
}

export const TransactionForm = React.forwardRef<TransactionFormRef, TransactionFormProps>(({
  transaction,
  type: initialType = 'expense',
  onClose,
  onSave,
  onDelete,
  initialAmount = '',
  initialName = '',
}, ref) => {
  const { colors, isDark } = useTheme();

  // Form states
  const [amount, setAmount] = useState(initialAmount);
  const [description, setDescription] = useState(initialName);
  const [type, setType] = useState<'expense' | 'income'>(initialType);
  const [category, setCategory] = useState(initialType === 'expense' ? CATEGORIES[0].id : INCOME_CATEGORIES[0].id);
  const [date, setDate] = useState(getTodayDateString());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Dynamic layout states
  const [dateLegendWidth, setDateLegendWidth] = useState(0);
  const [categoryLegendWidth, setCategoryLegendWidth] = useState(0);
  const [catBtnWidths, setCatBtnWidths] = useState<Record<string, number>>({});
  const [catLabelWidths, setCatLabelWidths] = useState<Record<string, number>>({});

  // Keyboard listener state
  const isKeyboardVisible = useKeyboardVisible();

  // Date picker animation
  const datePickerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(datePickerAnim, {
      toValue: showDatePicker ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [showDatePicker]);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setCategory(transaction.category);
      setDate(transaction.date);
      setType(transaction.type);
      setShowDatePicker(false);
    } else {
      setAmount(initialAmount);
      setDescription(initialName);
      setCategory(initialType === 'expense' ? CATEGORIES[0].id : INCOME_CATEGORIES[0].id);
      setDate(getTodayDateString());
      setType(initialType);
      setShowDatePicker(false);
    }
  }, [transaction, initialType, initialAmount, initialName]);



  React.useImperativeHandle(ref, () => ({
    getValues: () => ({ amount, description, category, date }),
    reset: () => {
      setAmount('');
      setDescription('');
      setCategory(type === 'expense' ? CATEGORIES[0].id : INCOME_CATEGORIES[0].id);
      setDate(getTodayDateString());
      setShowDatePicker(false);
    }
  }));

  const handleSave = () => {
    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) return;

    const categoriesList = type === 'expense' ? CATEGORIES : INCOME_CATEGORIES;
    const finalDescription = description.trim() ||
      categoriesList.find(c => c.id === category)?.label ||
      (type === 'expense' ? 'Expense' : 'Income');

    onSave({
      amount: parsedAmt,
      type,
      category,
      description: finalDescription,
      date,
    });
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

  const categoriesList = type === 'expense' ? CATEGORIES : INCOME_CATEGORIES;
  const isEditMode = !!transaction;

  return (
    <View style={styles.formContainer}>
      {/* 01: AMOUNT INPUT */}
      <Animated.View
        style={{
          maxHeight: upperHeight,
          opacity: upperOpacity,
          overflow: 'hidden',
        }}
      >
        <TuiInput
          label="Amount (₱)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="default"
          placeholder="0.00"
          containerStyle={{ height: 68 }}
          style={{ fontSize: 32, fontFamily: 'JetBrainsMono_700Bold', height: 48 }}
        />

        {/* 02: DESCRIPTION INPUT */}
        <TuiInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder={type === 'expense' ? 'Enter description (e.g. Food, Grocery)' : 'Enter description (e.g. Salary, Dividend)'}
        />

        {/* 03: CATEGORY CONTAINER */}
        <View
          style={[
            styles.logCategoryContainer,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            }
          ]}
        >
          <TuiRetroBorders borderColor={isDark ? colors.primary + '40' : '#000000'} legendWidth={categoryLegendWidth} />

          {/* Legend Label */}
          <View
            onLayout={(e) => setCategoryLegendWidth(e.nativeEvent.layout.width)}
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
              Category
            </TuiText>
          </View>

          {/* Grid */}
          <View style={styles.logCategoryGrid}>
            {categoriesList.map((cat) => {
              const isSelected = category === cat.id;
              const bWidth = catBtnWidths[cat.id] || 100;
              const lWidth = catLabelWidths[cat.id] || 28;
              const topSegmentWidth = Math.max(0, (bWidth - lWidth) / 2);
              const catBorderColor = isSelected
                ? colors.primary
                : (isDark ? colors.primary + '40' : '#000000');

              return (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    Keyboard.dismiss();
                    setCategory(cat.id);
                  }}
                  onLayout={(e) => {
                    const width = e.nativeEvent.layout.width;
                    setCatBtnWidths(prev => ({ ...prev, [cat.id]: width }));
                  }}
                  style={[
                    styles.logCategoryGridBtn,
                    {
                      backgroundColor: isSelected ? (isDark ? '#27272A' : '#E4E4E7') : colors.card,
                      width: type === 'income' ? '23%' : '30%',
                    }
                  ]}
                >
                  {/* Dynamic Segmented Borders */}
                  <View style={[styles.catBtnBorderLeft, { backgroundColor: catBorderColor }]} />
                  <View style={[styles.catBtnBorderRight, { backgroundColor: catBorderColor }]} />
                  <View style={[styles.catBtnBorderBottom, { backgroundColor: catBorderColor }]} />
                  <View style={[styles.catBtnBorderTopLeft, { backgroundColor: catBorderColor, width: topSegmentWidth }]} />
                  <View style={[styles.catBtnBorderTopRight, { backgroundColor: catBorderColor, width: topSegmentWidth }]} />

                  {/* Legend Label */}
                  <View
                    onLayout={(e) => {
                      const width = e.nativeEvent.layout.width;
                      setCatLabelWidths(prev => ({ ...prev, [cat.id]: width }));
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
                      {cat.label}
                    </TuiText>
                  </View>

                  <View style={styles.catBtnContent} pointerEvents="none">
                    {getCategoryIcon(cat.id, 20, isSelected ? colors.primary : colors.mutedForeground)}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>

      {/* 04: RETRO BRUTALIST CALENDAR DATE PICKER */}
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
              marginBottom: 0,
            }
          ]}
        >
          <TuiRetroBorders
            borderColor={showDatePicker ? colors.primary : (isDark ? colors.primary + '40' : '#000000')}
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
              Date
            </TuiText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <TuiText size="sm" style={{ color: colors.foreground }}>
              {date || 'Select Date'}
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
            value={date}
            onChange={(selectedDate) => {
              setDate(selectedDate);
              setShowDatePicker(false);
            }}
          />
        </Animated.View>
      </View>

      {/* 05: DRAWER ACTIONS */}
      <View style={styles.logDrawerActions}>
        {isEditMode ? (
          <>
            <TuiButton
              onPress={() => onDelete?.(transaction!.id)}
              variant="destructive"
              style={{ flex: 1, marginRight: 8, height: 44, justifyContent: 'center', paddingVertical: 0 }}
            >
              Delete
            </TuiButton>
            <TuiButton
              disabled={isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
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
              disabled={isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
              onPress={handleSave}
              variant="accent"
              style={{ flex: 1, height: 44, justifyContent: 'center', paddingVertical: 0 }}
            >
              Save Log
            </TuiButton>
          </>
        )}
      </View>

      {isKeyboardVisible && <View style={{ height: Platform.OS === 'ios' ? 50 : 70 }} />}
    </View>
  );
});

TransactionForm.displayName = 'TransactionForm';
