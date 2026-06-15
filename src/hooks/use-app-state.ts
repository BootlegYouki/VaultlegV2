import { useState, useEffect, useRef } from 'react';
import { Animated, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../utils/storage';
import { logger } from '../utils/logger';
import { Transaction, Debt } from '../types';
import { ScreenType } from '../components/tui-nav';
import { checkForUpdates } from '../utils/update-checker';

export function useAppState() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>({});
  const [debts, setDebts] = useState<Debt[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const selectionBarAnim = useRef(new Animated.Value(0)).current;
  const [selectionBarVisible, setSelectionBarVisible] = useState(false);
  const [highlightedTransactionId, setHighlightedTransactionId] = useState<string | undefined>(undefined);
  const [animateStatsMeter, setAnimateStatsMeter] = useState(false);

  // Persistence update helper
  const updateLastLocalUpdate = async (timestamp = Date.now()) => {
    try {
      await AsyncStorage.setItem('tui_last_local_update', timestamp.toString());
    } catch (e: any) {
      logger.log('SYSTEM_ERROR', `TIMESTAMP_WRITE_FAILED: ${e.message}`);
    }
  };

  // Selection animation effect
  useEffect(() => {
    if (isSelectionMode) {
      setSelectionBarVisible(true);
      Animated.spring(selectionBarAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(selectionBarAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setSelectionBarVisible(false);
      });
    }
  }, [isSelectionMode]);

  const reloadLocalResources = async () => {
    const txList = await storage.loadTransactions();
    const catLimits = await storage.loadCategoryLimits();
    const debtList = await storage.loadDebts();
    setTransactions(txList);
    setCategoryLimits(catLimits);
    setDebts(debtList);
    return { txList, catLimits, debtList };
  };

  const handleSaveEditTransaction = async (updatedTx: Transaction) => {
    const updated = transactions.map((t) => t.id === updatedTx.id ? updatedTx : t);
    setTransactions(updated);
    await storage.saveTransactions(updated);
    await updateLastLocalUpdate();
    logger.log('OPERATION', `EDITED_TRANSACTION_ID_${updatedTx.id}`);
    return updated; // to trigger gist backup
  };

  const handleSaveEditDebt = async (updatedDebt: Debt) => {
    const updated = debts.map((d) => d.id === updatedDebt.id ? updatedDebt : d);
    setDebts(updated);
    await storage.saveDebts(updated);
    await updateLastLocalUpdate();
    logger.log('OPERATION', `EDITED_DEBT_ID_${updatedDebt.id}`);
    return updated; // to trigger gist backup
  };

  const handleUpdateCategoryLimit = async (category: string, limit: number) => {
    const updated = { ...categoryLimits };
    if (limit <= 0) {
      delete updated[category];
    } else {
      updated[category] = limit;
    }
    setCategoryLimits(updated);
    await storage.saveCategoryLimits(updated);
    await updateLastLocalUpdate();
    logger.log('SYSTEM', `UPDATED_CATEGORY_${category.toUpperCase()}_LIMIT_TO_₱${limit.toFixed(2)}`);
    return updated; // to trigger gist backup
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: Date.now().toString(),
    };
    const updated = [tx, ...transactions];
    setTransactions(updated);
    await storage.saveTransactions(updated);
    await updateLastLocalUpdate();
    return updated; // to trigger gist backup
  };

  const handleDeleteTransaction = async (id: string, onConfirm?: () => void, onCompleteDelete?: (filtered: Transaction[]) => void) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const filtered = transactions.filter((t) => t.id !== id);
            setTransactions(filtered);
            await storage.saveTransactions(filtered);
            await updateLastLocalUpdate();
            logger.log('OPERATION', `DELETED_TRANSACTION_ID_${id}`);
            onConfirm?.();
            onCompleteDelete?.(filtered);
          }
        }
      ]
    );
  };

  const handleDeleteTransactions = async (ids: string[], skipConfirm = false) => {
    const filtered = transactions.filter((t) => !ids.includes(t.id));
    const performDelete = async () => {
      setTransactions(filtered);
      await storage.saveTransactions(filtered);
      await updateLastLocalUpdate();
      logger.log('OPERATION', `DELETED_TRANSACTIONS_COUNT_${ids.length}`);
      setIsSelectionMode(false);
      setSelectedIds([]);
    };

    if (skipConfirm) {
      await performDelete();
      return filtered;
    }

    return new Promise<Transaction[] | undefined>((resolve) => {
      Alert.alert(
        'Delete Transactions',
        `Are you sure you want to delete these ${ids.length} transactions?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(undefined) },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await performDelete();
              resolve(filtered);
            }
          }
        ]
      );
    });
  };

  const handleAddDebt = async (newDebt: Omit<Debt, 'id'>) => {
    const debt: Debt = {
      ...newDebt,
      id: Date.now().toString(),
    };
    const updated = [debt, ...debts];
    setDebts(updated);
    await storage.saveDebts(updated);
    await updateLastLocalUpdate();
    return updated; // to trigger gist backup
  };

  const handleDeleteDebt = async (id: string, onConfirm?: () => void, onCompleteDelete?: (filtered: Debt[]) => void) => {
    Alert.alert(
      'Delete Debt',
      'Are you sure you want to delete this debt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const filtered = debts.filter((d) => d.id !== id);
            setDebts(filtered);
            await storage.saveDebts(filtered);
            await updateLastLocalUpdate();
            logger.log('OPERATION', `DELETED_DEBT_ID_${id}`);
            onConfirm?.();
            onCompleteDelete?.(filtered);
          }
        }
      ]
    );
  };

  const handleDeleteDebts = async (ids: string[], skipConfirm = false) => {
    const filtered = debts.filter((d) => !ids.includes(d.id));
    const performDelete = async () => {
      setDebts(filtered);
      await storage.saveDebts(filtered);
      await updateLastLocalUpdate();
      logger.log('OPERATION', `DELETED_DEBTS_COUNT_${ids.length}`);
      setIsSelectionMode(false);
      setSelectedIds([]);
    };

    if (skipConfirm) {
      await performDelete();
      return filtered;
    }

    return new Promise<Debt[] | undefined>((resolve) => {
      Alert.alert(
        'Delete Debts',
        `Are you sure you want to delete these ${ids.length} debts?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(undefined) },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await performDelete();
              resolve(filtered);
            }
          }
        ]
      );
    });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleLongPressSelect = (id: string) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedIds([id]);
    }
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handleRestoreData = async (
    restored: { transactions: Transaction[]; debts: Debt[]; categoryLimits: Record<string, number> },
    timestamp = Date.now()
  ) => {
    setTransactions(restored.transactions);
    setDebts(restored.debts);
    setCategoryLimits(restored.categoryLimits);
    await storage.saveTransactions(restored.transactions);
    await storage.saveDebts(restored.debts);
    await storage.saveCategoryLimits(restored.categoryLimits);
    await updateLastLocalUpdate(timestamp);
  };

  const handleWipeAllData = async () => {
    setTransactions([]);
    setDebts([]);
    setCategoryLimits({});
    await storage.saveTransactions([]);
    await storage.saveDebts([]);
    await storage.saveCategoryLimits({});
    await updateLastLocalUpdate();
  };

  return {
    activeScreen,
    setActiveScreen,
    transactions,
    setTransactions,
    categoryLimits,
    setCategoryLimits,
    debts,
    setDebts,
    dataLoaded,
    setDataLoaded,
    refreshing,
    setRefreshing,
    selectedIds,
    setSelectedIds,
    isSelectionMode,
    setIsSelectionMode,
    selectionBarAnim,
    selectionBarVisible,
    highlightedTransactionId,
    setHighlightedTransactionId,
    animateStatsMeter,
    setAnimateStatsMeter,
    updateLastLocalUpdate,
    reloadLocalResources,
    handleSaveEditTransaction,
    handleSaveEditDebt,
    handleUpdateCategoryLimit,
    handleAddTransaction,
    handleDeleteTransaction,
    handleDeleteTransactions,
    handleAddDebt,
    handleDeleteDebt,
    handleDeleteDebts,
    handleToggleSelect,
    handleLongPressSelect,
    handleCancelSelection,
    handleRestoreData,
    handleWipeAllData,
  };
}
