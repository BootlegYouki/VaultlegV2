import { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export interface FabMenuState {
  logMenuOpen: boolean;
  setLogMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shouldRenderFab: boolean;
  fabAnimExpense: Animated.Value;
  fabAnimIncome: Animated.Value;
  fabAnimDebt: Animated.Value;
}

/**
 * Manages FAB menu open/close state and stagger animations for the three
 * quick-add buttons (Expense, Income, Debt).
 */
export function useFabMenu(): FabMenuState {
  const [logMenuOpen, setLogMenuOpen] = useState(false);
  const [shouldRenderFab, setShouldRenderFab] = useState(false);

  const fabAnimExpense = useRef(new Animated.Value(0)).current;
  const fabAnimIncome = useRef(new Animated.Value(0)).current;
  const fabAnimDebt = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (logMenuOpen) {
      setShouldRenderFab(true);
      Animated.stagger(80, [
        Animated.spring(fabAnimExpense, { toValue: 1, friction: 13, tension: 180, useNativeDriver: true }),
        Animated.spring(fabAnimIncome, { toValue: 1, friction: 13, tension: 180, useNativeDriver: true }),
        Animated.spring(fabAnimDebt, { toValue: 1, friction: 13, tension: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fabAnimExpense, { toValue: 0, duration: 50, useNativeDriver: true }),
        Animated.timing(fabAnimIncome, { toValue: 0, duration: 50, useNativeDriver: true }),
        Animated.timing(fabAnimDebt, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start(() => setShouldRenderFab(false));
    }
  }, [logMenuOpen]);

  return {
    logMenuOpen,
    setLogMenuOpen,
    shouldRenderFab,
    fabAnimExpense,
    fabAnimIncome,
    fabAnimDebt,
  };
}
