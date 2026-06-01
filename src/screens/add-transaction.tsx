import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Calendar,
} from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { TuiText } from '../components/tui-text';
import { TuiInput } from '../components/tui-input';
import { TuiButton } from '../components/tui-button';
import { Transaction, CATEGORIES, INCOME_CATEGORIES } from '../types';
import { logger } from '../utils/logger';
import { getCategoryIcon } from './dashboard';

interface AddTransactionProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onNavigateBack: () => void;
}

export const AddTransaction: React.FC<AddTransactionProps> = ({
  onAddTransaction,
  onNavigateBack,
}) => {
  const { colors, isDark } = useTheme();

  // Form states
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(type === 'expense' ? CATEGORIES[0].id : INCOME_CATEGORIES[0].id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset category when shifting between expense and income
  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    setCategory(newType === 'expense' ? CATEGORIES[0].id : INCOME_CATEGORIES[0].id);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);
    
    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Must be a positive number';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      newErrors.date = 'Must be in YYYY-MM-DD format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const parsedAmount = parseFloat(amount);
      onAddTransaction({
        amount: parsedAmount,
        type,
        category,
        description: description.trim(),
        date,
      });
      logger.log(
        'Operation',
        `LOGGED_${type.toUpperCase()}: ₱${parsedAmount.toFixed(2)} [${category.toUpperCase()}] "${description.trim()}"`
      );
      onNavigateBack();
    } else {
      logger.log('Warning', 'Validation failed on transaction inputs.');
    }
  };

  const activeCategories = type === 'expense' ? CATEGORIES : INCOME_CATEGORIES;
  const borderColor = isDark ? colors.primary + '40' : '#000000';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* 01: TRANSACTION TYPE TOGGLE */}
      <TuiContainer label="Transaction Type">
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => handleTypeChange('expense')}
            style={[
              styles.toggleButton,
              {
                borderColor: type === 'expense' ? colors.destructive : colors.border,
                backgroundColor: type === 'expense' ? colors.destructive + '15' : 'transparent',
              },
            ]}
          >
            <View style={styles.inlineButtonContent}>
              <TrendingDown size={14} color={type === 'expense' ? colors.destructive : colors.mutedForeground} style={styles.inlineIcon} />
              <TuiText
                weight="bold"
                size="sm"
                style={{ color: type === 'expense' ? colors.destructive : colors.mutedForeground }}
              >
                Expense
              </TuiText>
            </View>
          </Pressable>

          <View style={[styles.toggleDivider, { backgroundColor: borderColor }]} />

          <Pressable
            onPress={() => handleTypeChange('income')}
            style={[
              styles.toggleButton,
              {
                borderColor: type === 'income' ? colors.primary : colors.border,
                backgroundColor: type === 'income' ? colors.primary + '15' : 'transparent',
              },
            ]}
          >
            <View style={styles.inlineButtonContent}>
              <TrendingUp size={14} color={type === 'income' ? colors.primary : colors.mutedForeground} style={styles.inlineIcon} />
              <TuiText
                weight="bold"
                size="sm"
                style={{ color: type === 'income' ? colors.primary : colors.mutedForeground }}
              >
                Income
              </TuiText>
            </View>
          </Pressable>
        </View>
      </TuiContainer>

      {/* 02: TRANSACTION DETAILS FORM */}
      <TuiContainer label="Transaction Details">
        <View style={styles.inputLabelHeader}>
          <DollarSign size={11} color={colors.primary} style={styles.inputLabelIcon} />
          <TuiText size="xs" weight="bold" variant="muted">AMOUNT (₱)</TuiText>
        </View>
        <TuiInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0.00"
          error={errors.amount}
        />

        <View style={[styles.inputLabelHeader, { marginTop: 8 }]}>
          <FileText size={11} color={colors.primary} style={styles.inputLabelIcon} />
          <TuiText size="xs" weight="bold" variant="muted">DESCRIPTION</TuiText>
        </View>
        <TuiInput
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Rent, Groceries, Salary"
          error={errors.description}
        />

        <View style={[styles.inputLabelHeader, { marginTop: 8 }]}>
          <Calendar size={11} color={colors.primary} style={styles.inputLabelIcon} />
          <TuiText size="xs" weight="bold" variant="muted">DATE (YYYY-MM-DD)</TuiText>
        </View>
        <TuiInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          error={errors.date}
        />
      </TuiContainer>

      {/* 03: CLASSIFICATION GRID */}
      <TuiContainer label="Category">
        <TuiText size="xs" weight="bold" style={styles.gridHeader} variant="muted">
          Select category:
        </TuiText>

        <View style={styles.gridContainer}>
          {activeCategories.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[
                  styles.gridItem,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary + '15' : 'transparent',
                  },
                ]}
              >
                {/* Visual Category Icon inside the Grid selection block! */}
                <View style={styles.gridIconBox}>
                  {getCategoryIcon(cat.id, 16, isSelected ? colors.primary : (isDark ? '#FAFAFA' : '#000000'))}
                </View>
                <TuiText
                  size="xs"
                  weight="bold"
                  style={{
                    color: isSelected ? colors.primary : colors.foreground,
                    textAlign: 'center',
                    marginTop: 4,
                  }}
                >
                  {cat.label}
                </TuiText>
              </Pressable>
            );
          })}
        </View>
      </TuiContainer>

      {/* 04: EXECUTE MATRIX */}
      <TuiContainer label="Actions">
        <TuiButton onPress={handleSubmit} variant="accent" style={styles.submitBtn}>
          Save Transaction
        </TuiButton>

        <TuiButton onPress={onNavigateBack} variant="outline">
          Cancel
        </TuiButton>
      </TuiContainer>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 230, // Clear active terminal overlays
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  toggleButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  toggleDivider: {
    width: 2,
    height: '100%',
  },
  inlineButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineIcon: {
    marginRight: 6,
  },
  inputLabelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  inputLabelIcon: {
    marginRight: 4,
  },
  gridHeader: {
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridItem: {
    width: '48%',
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconBox: {
    marginBottom: 2,
  },
  submitBtn: {
    marginVertical: 8,
  },
});
