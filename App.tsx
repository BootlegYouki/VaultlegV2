import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable, Platform, TextInput, Keyboard, Animated, Image, Alert } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => { });
import {
  useFonts,
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

import { ThemeProvider, useTheme } from './src/theme/theme-provider';
import { Wallet, PiggyBank, FileText, TrendingUp, TrendingDown, Calendar, Landmark, Settings as SettingsIcon, ArrowUpCircle, ArrowDownCircle } from 'lucide-react-native';
import { Dashboard } from './src/screens/dashboard';
import { getCategoryIcon } from './src/utils/category-icon';
import { Expenses } from './src/screens/expenses';
import { Stats } from './src/screens/stats';
import { Debts } from './src/screens/debts';
import { Settings } from './src/screens/settings';
import { TuiTabBar, ScreenType } from './src/components/tui-nav';
import { TuiText } from './src/components/tui-text';
import { TuiContainer } from './src/components/tui-container';
import { TuiButton } from './src/components/tui-button';
import { TuiDrawer } from './src/components/tui-drawer';
import { TuiSkeletonLoader } from './src/components/tui-skeleton';
import { TuiCalendar } from './src/components/tui-calendar';
import { TuiInput } from './src/components/tui-input';
import { Transaction, CATEGORIES, INCOME_CATEGORIES, Debt } from './src/types';
import { storage } from './src/utils/storage';
import { logger } from './src/utils/logger';
import { SplashIcon } from './src/components/splash-icon';

function MainApp() {
  const { colors, isDark, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeScreen, setActiveScreen] = useState<ScreenType>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>({});
  const [debts, setDebts] = useState<Debt[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [autoOpenStatsDrawer, setAutoOpenStatsDrawer] = useState(false);
  const [addTransactionDrawerOpen, setAddTransactionDrawerOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const selectionBarAnim = useRef(new Animated.Value(0)).current;
  const [selectionBarVisible, setSelectionBarVisible] = useState(false);
  const [highlightedTransactionId, setHighlightedTransactionId] = useState<string | undefined>(undefined);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    logger.log('OPERATION', 'PULL_TO_REFRESH_TRIGGERED');
    try {
      const txList = await storage.loadTransactions();
      const catLimits = await storage.loadCategoryLimits();
      const debtList = await storage.loadDebts();
      setTransactions(txList);
      setCategoryLimits(catLimits);
      setDebts(debtList);
      logger.log('SYSTEM', 'RELOADED_RESOURCES_SUCCESS');
    } catch (err: any) {
      logger.log('SYSTEM_ERROR', `RELOAD_FAILED: ${err.message}`);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 700);
    }
  };

  // Helper to compute today's date in MM-DD-YYYY format
  const getTodayDateString = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const y = d.getFullYear();
    return `${m}-${day}-${y}`;
  };

  // Form states for transaction logging in drawer
  const [logType, setLogType] = useState<'expense' | 'income'>('expense');
  const [logAmount, setLogAmount] = useState('');
  const [logDescription, setLogDescription] = useState('');
  const [logCategory, setLogCategory] = useState(CATEGORIES[0].id);
  const [logDate, setLogDate] = useState(getTodayDateString());
  const [showLogDatePicker, setShowLogDatePicker] = useState(false);
  const [dateLegendWidth, setDateLegendWidth] = useState(0);
  const [categoryLegendWidth, setCategoryLegendWidth] = useState(0);
  const [catBtnWidths, setCatBtnWidths] = useState<Record<string, number>>({});
  const [catLabelWidths, setCatLabelWidths] = useState<Record<string, number>>({});

  // Form states for debt logging in drawer
  const [addDebtDrawerOpen, setAddDebtDrawerOpen] = useState(false);
  const [debtName, setDebtName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtType, setDebtType] = useState<'payable' | 'receivable'>('payable');
  const [debtDueDate, setDebtDueDate] = useState(getTodayDateString());
  const [showDebtDatePicker, setShowDebtDatePicker] = useState(false);

  const [debtLegendWidth, setDebtLegendWidth] = useState(0);
  const [debtTypeLegendWidth, setDebtTypeLegendWidth] = useState(0);
  const [debtDateLegendWidth, setDebtDateLegendWidth] = useState(0);
  const [debtTypeBtnWidths, setDebtTypeBtnWidths] = useState<Record<string, number>>({});
  const [debtTypeLabelWidths, setDebtTypeLabelWidths] = useState<Record<string, number>>({});

  const resetDebtForm = () => {
    setDebtName('');
    setDebtAmount('');
    setDebtType('payable');
    setDebtDueDate(getTodayDateString());
    setShowDebtDatePicker(false);
  };

  // Editing transaction states
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editTxAmount, setEditTxAmount] = useState('');
  const [editTxDescription, setEditTxDescription] = useState('');
  const [editTxCategory, setEditTxCategory] = useState('');
  const [editTxDate, setEditTxDate] = useState('');
  const [editTxType, setEditTxType] = useState<'expense' | 'income'>('expense');
  const [showEditTxDatePicker, setShowEditTxDatePicker] = useState(false);
  const [editTxCategoryLegendWidth, setEditTxCategoryLegendWidth] = useState(0);
  const [editTxDateLegendWidth, setEditTxDateLegendWidth] = useState(0);

  // Editing debt states
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [editDebtName, setEditDebtName] = useState('');
  const [editDebtAmount, setEditDebtAmount] = useState('');
  const [editDebtType, setEditDebtType] = useState<'payable' | 'receivable'>('payable');
  const [editDebtDueDate, setEditDebtDueDate] = useState('');
  const [showEditDebtDatePicker, setShowEditDebtDatePicker] = useState(false);
  const [editDebtTypeLegendWidth, setEditDebtTypeLegendWidth] = useState(0);
  const [editDebtDateLegendWidth, setEditDebtDateLegendWidth] = useState(0);

  const startEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setEditTxAmount(tx.amount.toString());
    setEditTxDescription(tx.description);
    setEditTxCategory(tx.category);
    setEditTxDate(tx.date);
    setEditTxType(tx.type);
    setShowEditTxDatePicker(false);
  };

  const startEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
    setEditDebtName(debt.name);
    setEditDebtAmount(debt.amount.toString());
    setEditDebtType(debt.type);
    setEditDebtDueDate(debt.dueDate);
    setShowEditDebtDatePicker(false);
  };

  // Animated values for iOS-style deck transition
  const screenScaleAnim = useRef(new Animated.Value(1)).current;
  const screenTranslateYAnim = useRef(new Animated.Value(0)).current;
  const screenBorderRadiusAnim = useRef(new Animated.Value(0)).current;

  const isDrawerOpen = addTransactionDrawerOpen || addDebtDrawerOpen || editingTransaction !== null || editingDebt !== null;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(screenScaleAnim, {
        toValue: isDrawerOpen ? 0.93 : 1,
        friction: 8,
        tension: 50,
        useNativeDriver: false,
      }),
      Animated.spring(screenTranslateYAnim, {
        toValue: isDrawerOpen ? 12 : 0,
        friction: 8,
        tension: 50,
        useNativeDriver: false,
      }),
      Animated.spring(screenBorderRadiusAnim, {
        toValue: isDrawerOpen ? 16 : 0,
        friction: 8,
        tension: 50,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isDrawerOpen]);

  const handleSaveEditTransaction = async () => {
    if (!editingTransaction) return;
    const parsedAmt = parseFloat(editTxAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) return;

    const finalDescription = editTxDescription.trim() ||
      (editTxType === 'expense'
        ? CATEGORIES.find(c => c.id === editTxCategory)?.label
        : INCOME_CATEGORIES.find(c => c.id === editTxCategory)?.label) ||
      'Transaction';

    const updated = transactions.map((t) =>
      t.id === editingTransaction.id
        ? {
          ...t,
          amount: parsedAmt,
          description: finalDescription,
          category: editTxCategory,
          date: editTxDate,
          type: editTxType,
        }
        : t
    );
    setTransactions(updated);
    await storage.saveTransactions(updated);
    logger.log('OPERATION', `EDITED_TRANSACTION_ID_${editingTransaction.id}`);
    setEditingTransaction(null);
  };

  const handleEditDeleteTransaction = async () => {
    if (!editingTransaction) return;
    await handleDeleteTransaction(editingTransaction.id);
    setEditingTransaction(null);
  };

  const handleSaveEditDebt = async () => {
    if (!editingDebt) return;
    const parsedAmt = parseFloat(editDebtAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) return;

    const finalName = editDebtName.trim() || (editDebtType === 'payable' ? 'Payable' : 'Receivable');

    const updated = debts.map((d) =>
      d.id === editingDebt.id
        ? {
          ...d,
          name: finalName,
          amount: parsedAmt,
          type: editDebtType,
          dueDate: editDebtDueDate,
        }
        : d
    );
    setDebts(updated);
    await storage.saveDebts(updated);
    logger.log('OPERATION', `EDITED_DEBT_ID_${editingDebt.id}`);
    setEditingDebt(null);
  };

  const handleEditDeleteDebt = async () => {
    if (!editingDebt) return;
    await handleDeleteDebt(editingDebt.id);
    setEditingDebt(null);
  };

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleLogTypeChange = (newType: 'expense' | 'income') => {
    setLogType(newType);
    setLogCategory(newType === 'expense' ? CATEGORIES[0].id : INCOME_CATEGORIES[0].id);
  };

  const statsLimit = Object.values(categoryLimits).reduce((sum, val) => sum + val, 0);

  const [logMenuOpen, setLogMenuOpen] = useState(false);
  const [statsLegendWidth, setStatsLegendWidth] = useState(0);
  const [incomeLegendWidth, setIncomeLegendWidth] = useState(0);
  const [expenseLegendWidth, setExpenseLegendWidth] = useState(0);

  const handleNavigate = (screen: ScreenType) => {
    if (screen === 'add-transaction') {
      setLogMenuOpen(prev => !prev);
      return;
    }
    setLogMenuOpen(false);
    setSelectedIds([]);
    setIsSelectionMode(false);
    setActiveScreen(screen);
  };

  const handleLongPressAdd = () => {
    setLogType('expense');
    setLogCategory(CATEGORIES[0].id);
    setAddTransactionDrawerOpen(true);
    setLogMenuOpen(false);
    logger.log('NAVIGATOR', 'FAB_LONG_PRESS_OPEN_EXPENSE_DRAWER');
  };

  const handleRecentTransactionPress = (tx: Transaction) => {
    setActiveScreen('expenses');
    setHighlightedTransactionId(tx.id);
    setTimeout(() => {
      setHighlightedTransactionId(undefined);
    }, 1500);
    logger.log('NAVIGATOR', `RECENT_TX_PRESS_REDIRECT_AND_HIGHLIGHT_ID_${tx.id}`);
  };

  // Load custom fonts using expo-font / expo-google-fonts
  const [fontsLoaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  // Load persistence data on boot
  useEffect(() => {
    const initAppData = async () => {
      try {
        const txList = await storage.loadTransactions();
        const catLimits = await storage.loadCategoryLimits();
        const debtList = await storage.loadDebts();
        setTransactions(txList);
        setCategoryLimits(catLimits);
        setDebts(debtList);
        setDataLoaded(true);
        logger.log('SYSTEM', 'ALL_SYSTEM_RESOURCES_LOADED_OK');
      } catch (err: any) {
        logger.log('SYSTEM_ERROR', `RESOURCE_INIT_FAILED: ${err.message}`);
        setDataLoaded(true);
      }
    };
    initAppData();
  }, []);

  const [splashVisible, setSplashVisible] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const splashOpacity = useRef(new Animated.Value(1)).current;

  // Hide splash screen once fonts and data are loaded, and set app ready
  useEffect(() => {
    if (fontsLoaded && dataLoaded) {
      SplashScreen.hideAsync().catch(() => { });
      setIsAppReady(true);
    }
  }, [fontsLoaded, dataLoaded]);

  // Fade out splash screen when app is ready (stay visible for 1.2 seconds first)
  useEffect(() => {
    if (isAppReady) {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 200,
        delay: 1000,
        useNativeDriver: true,
      }).start(() => {
        setSplashVisible(false);
      });
    }
  }, [isAppReady]);

  const handleUpdateCategoryLimit = async (category: string, limit: number) => {
    const updated = { ...categoryLimits };
    if (limit <= 0) {
      delete updated[category];
    } else {
      updated[category] = limit;
    }
    setCategoryLimits(updated);
    await storage.saveCategoryLimits(updated);
    logger.log('SYSTEM', `UPDATED_CATEGORY_${category.toUpperCase()}_LIMIT_TO_₱${limit.toFixed(2)}`);
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: Date.now().toString(),
    };
    const updated = [tx, ...transactions];
    setTransactions(updated);
    await storage.saveTransactions(updated);
  };

  const handleDeleteTransaction = async (id: string) => {
    const filtered = transactions.filter((t) => t.id !== id);
    setTransactions(filtered);
    await storage.saveTransactions(filtered);
    logger.log('OPERATION', `DELETED_TRANSACTION_ID_${id}`);
  };

  const handleDeleteTransactions = async (ids: string[]) => {
    const filtered = transactions.filter((t) => !ids.includes(t.id));
    setTransactions(filtered);
    await storage.saveTransactions(filtered);
    logger.log('OPERATION', `DELETED_TRANSACTIONS_COUNT_${ids.length}`);
  };

  const handleAddDebt = async (newDebt: Omit<Debt, 'id'>) => {
    const debt: Debt = {
      ...newDebt,
      id: Date.now().toString(),
    };
    const updated = [debt, ...debts];
    setDebts(updated);
    await storage.saveDebts(updated);
  };

  const handleDeleteDebt = async (id: string) => {
    const filtered = debts.filter((d) => d.id !== id);
    setDebts(filtered);
    await storage.saveDebts(filtered);
    logger.log('OPERATION', `DELETED_DEBT_ID_${id}`);
  };

  const handleDeleteDebts = async (ids: string[]) => {
    const filtered = debts.filter((d) => !ids.includes(d.id));
    setDebts(filtered);
    await storage.saveDebts(filtered);
    logger.log('OPERATION', `DELETED_DEBTS_COUNT_${ids.length}`);
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

  const handleDeleteSelection = () => {
    if (selectedIds.length === 0) return;
    const isExpenses = activeScreen === 'expenses';
    Alert.alert(
      isExpenses ? 'Delete selected logs?' : 'Delete selected accounts?',
      `Are you sure you want to delete ${selectedIds.length} entry(ies)? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (isExpenses) {
              await handleDeleteTransactions(selectedIds);
            } else {
              await handleDeleteDebts(selectedIds);
            }
            setSelectedIds([]);
            setIsSelectionMode(false);
          },
        },
      ]
    );
  };

  const handleRestoreData = async (restored: { transactions: Transaction[]; debts: Debt[]; categoryLimits: Record<string, number> }) => {
    setTransactions(restored.transactions);
    setDebts(restored.debts);
    setCategoryLimits(restored.categoryLimits);
    await storage.saveTransactions(restored.transactions);
    await storage.saveDebts(restored.debts);
    await storage.saveCategoryLimits(restored.categoryLimits);
  };

  const handleWipeAllData = async () => {
    setTransactions([]);
    setDebts([]);
    setCategoryLimits({});
    await storage.saveTransactions([]);
    await storage.saveDebts([]);
    await storage.saveCategoryLimits({});
  };

  // Render initial dark/light splash screen until the app is ready
  if (!isAppReady) {
    const splashBg = isDark ? '#09090B' : '#FAFAFA';
    return (
      <View style={{ flex: 1, backgroundColor: splashBg, justifyContent: 'center', alignItems: 'center' }}>
        <SplashIcon color={colors.primary} size={160} />
      </View>
    );
  }

  const borderAccent = colors.primary;
  const logBorderColor = isDark ? colors.primary + '40' : colors.primary + '30';
  const splashBg = isDark ? '#09090B' : '#FAFAFA';

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: colors.card,
          transform: [
            { scale: screenScaleAnim },
            { translateY: screenTranslateYAnim },
          ],
          borderRadius: screenBorderRadiusAnim,
          overflow: 'hidden',
        }}
      >
        <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]}>
          <StatusBar style={isDark ? 'light' : 'dark'} />

          {/* Top Header Status Bar */}
          <View style={[styles.statusBarHeader, { borderColor: borderAccent, backgroundColor: colors.card }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Wallet size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <TuiText size="md" weight="bold" style={{ color: colors.primary }}>
                VaultLeg
              </TuiText>
              <TuiText size="md" weight="bold" style={{ color: colors.mutedForeground, marginLeft: 8 }}>
            // {activeScreen === 'dashboard' ? 'home' : activeScreen === 'expenses' ? 'logs' : activeScreen === 'add-transaction' ? 'log' : activeScreen === 'stats' ? 'stats' : activeScreen === 'debts' ? 'debts' : 'settings'}
              </TuiText>
            </View>

            {/* Settings button icon only */}
            <Pressable
              onPress={() => {
                handleNavigate('settings');
              }}
              style={[
                styles.headerThemeBtn,
                {
                  borderColor: borderAccent,
                  backgroundColor: activeScreen === 'settings' ? (isDark ? '#27272A' : '#E4E4E7') : colors.card,
                  width: 38,
                  height: 38,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 0,
                }
              ]}
            >
              <SettingsIcon size={16} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Screen Router */}
          <View style={styles.appBody}>
            {activeScreen === 'dashboard' && (
              <Dashboard
                transactions={transactions}
                statsLimit={statsLimit}
                categoryLimits={categoryLimits}
                debts={debts}
                onNavigateToAdd={() => {
                  setAddTransactionDrawerOpen(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
                onEditTransaction={startEditTransaction}
                onNavigateToStats={() => handleNavigate('stats')}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                editingTransactionId={editingTransaction?.id}
                onRecentTransactionPress={handleRecentTransactionPress}
              />
            )}

            {activeScreen === 'expenses' && (
              <Expenses
                transactions={transactions}
                onDeleteTransaction={handleDeleteTransaction}
                onDeleteTransactions={handleDeleteTransactions}
                onEditTransaction={startEditTransaction}
                onLogTransaction={(initialType) => {
                  if (initialType) {
                    handleLogTypeChange(initialType);
                  }
                  setAddTransactionDrawerOpen(true);
                }}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                selectedIds={selectedIds}
                isSelectionMode={isSelectionMode}
                onToggleSelect={handleToggleSelect}
                onLongPressSelect={handleLongPressSelect}
                editingTransactionId={editingTransaction?.id}
                highlightedTransactionId={highlightedTransactionId}
              />
            )}

            {activeScreen === 'stats' && (
              <Stats
                transactions={transactions}
                categoryLimits={categoryLimits}
                onUpdateCategoryLimit={handleUpdateCategoryLimit}
                onEditTransaction={startEditTransaction}
                onTransactionPress={handleRecentTransactionPress}
                autoOpenDrawer={autoOpenStatsDrawer}
                onResetAutoOpenDrawer={() => setAutoOpenStatsDrawer(false)}
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            )}

            {activeScreen === 'debts' && (
              <Debts
                debts={debts}
                onAddDebtPress={() => setAddDebtDrawerOpen(true)}
                onDeleteDebt={handleDeleteDebt}
                onDeleteDebts={handleDeleteDebts}
                onEditDebt={startEditDebt}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                selectedIds={selectedIds}
                isSelectionMode={isSelectionMode}
                onToggleSelect={handleToggleSelect}
                onLongPressSelect={handleLongPressSelect}
                editingDebtId={editingDebt?.id}
              />
            )}

            {activeScreen === 'settings' && (
              <Settings
                transactions={transactions}
                debts={debts}
                categoryLimits={categoryLimits}
                onRestoreData={handleRestoreData}
                onWipeAllData={handleWipeAllData}
              />
            )}
          </View>

          {selectionBarVisible && (
            <Animated.View
              style={[
                styles.floatingSelectionWrapper,
                {
                  bottom: insets.bottom - 10,
                  opacity: selectionBarAnim,
                  transform: [
                    {
                      translateY: selectionBarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [120, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TuiContainer label={`Selected: ${selectedIds.length}`} accentBorder style={{ marginTop: 0, marginBottom: 0 }} labelSize="sm">
                <View style={styles.floatingSelectionBar}>
                  <TuiButton
                    onPress={handleCancelSelection}
                    variant="outline"
                    style={styles.actionButtonCompact}
                  >
                    Cancel
                  </TuiButton>
                  <TuiButton
                    onPress={handleDeleteSelection}
                    variant="destructive"
                    style={styles.actionButtonCompact}
                  >
                    Delete
                  </TuiButton>
                </View>
              </TuiContainer>
            </Animated.View>
          )}

          {/* Floating Bottom Tab Bar Navigation */}
          <TuiTabBar
            currentScreen={activeScreen}
            onNavigate={handleNavigate}
            onLongPressAdd={handleLongPressAdd}
          />

          {/* Bottom safe-area fill — matches nav card color so home indicator strip is consistent */}
          <View style={[styles.bottomFill, { backgroundColor: colors.card }]} />

          {/* FAB Dropdown Backdrop covering the screen to cancel log menu */}
          {logMenuOpen && (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setLogMenuOpen(false)}
            />
          )}

          {/* FAB Choices stacked directly on top of the LOG button */}
          {logMenuOpen && (
            <View style={[styles.fabMenuContainer, { bottom: 70 + insets.bottom }]}>

              {/* DEBT KEY (Top) */}
              <Pressable
                onPress={() => {
                  setAddDebtDrawerOpen(true);
                  setTimeout(() => {
                    setLogMenuOpen(false);
                  }, 60);
                  logger.log('NAVIGATOR', 'FAB_OPEN_ADD_DEBT_DRAWER');
                }}
                style={({ pressed }) => [
                  styles.fabKey,
                  {
                    backgroundColor: pressed ? (isDark ? '#27272A' : '#E4E4E7') : colors.card,
                  }
                ]}
              >
                {/* Dynamic Segmented Borders */}
                <View style={[styles.fabBorderLeft, { backgroundColor: borderAccent }]} />
                <View style={[styles.fabBorderRight, { backgroundColor: borderAccent }]} />
                <View style={[styles.fabBorderBottom, { backgroundColor: borderAccent }]} />
                <View
                  style={[
                    styles.fabBorderTopLeft,
                    {
                      backgroundColor: borderAccent,
                      width: Math.max(0, (52 - debtLegendWidth) / 2)
                    }
                  ]}
                />
                <View
                  style={[
                    styles.fabBorderTopRight,
                    {
                      backgroundColor: borderAccent,
                      width: Math.max(0, (52 - debtLegendWidth) / 2)
                    }
                  ]}
                />

                {/* Centered Legend resting on top border */}
                <View
                  onLayout={(e) => setDebtLegendWidth(e.nativeEvent.layout.width)}
                  style={[styles.fabLegendWrapper, { backgroundColor: 'transparent' }]}
                >
                  <TuiText
                    weight="bold"
                    style={[
                      styles.fabLegendText,
                      { color: colors.primary },
                    ]}
                  >
                    Debt
                  </TuiText>
                </View>

                <View style={styles.fabContent} pointerEvents="none">
                  <Landmark size={18} color={colors.primary} />
                </View>
              </Pressable>

              {/* INCOME KEY (Middle) */}
              <Pressable
                onPress={() => {
                  setLogType('income');
                  setLogCategory(INCOME_CATEGORIES[0].id);
                  setAddTransactionDrawerOpen(true);
                  setTimeout(() => {
                    setLogMenuOpen(false);
                  }, 60);
                  logger.log('NAVIGATOR', 'FAB_OPEN_ADD_INCOME_DRAWER');
                }}
                style={({ pressed }) => [
                  styles.fabKey,
                  {
                    backgroundColor: pressed ? (isDark ? '#27272A' : '#E4E4E7') : colors.card,
                  }
                ]}
              >
                {/* Dynamic Segmented Borders */}
                <View style={[styles.fabBorderLeft, { backgroundColor: borderAccent }]} />
                <View style={[styles.fabBorderRight, { backgroundColor: borderAccent }]} />
                <View style={[styles.fabBorderBottom, { backgroundColor: borderAccent }]} />
                <View
                  style={[
                    styles.fabBorderTopLeft,
                    {
                      backgroundColor: borderAccent,
                      width: Math.max(0, (52 - incomeLegendWidth) / 2)
                    }
                  ]}
                />
                <View
                  style={[
                    styles.fabBorderTopRight,
                    {
                      backgroundColor: borderAccent,
                      width: Math.max(0, (52 - incomeLegendWidth) / 2)
                    }
                  ]}
                />

                {/* Centered Legend resting on top border */}
                <View
                  onLayout={(e) => setIncomeLegendWidth(e.nativeEvent.layout.width)}
                  style={[styles.fabLegendWrapper, { backgroundColor: 'transparent' }]}
                >
                  <TuiText
                    weight="bold"
                    style={[
                      styles.fabLegendText,
                      { color: colors.primary },
                    ]}
                  >
                    Inc
                  </TuiText>
                </View>

                <View style={styles.fabContent} pointerEvents="none">
                  <TrendingUp size={18} color={colors.primary} />
                </View>
              </Pressable>

              {/* EXPENSE KEY (Bottom) */}
              <Pressable
                onPress={() => {
                  setLogType('expense');
                  setLogCategory(CATEGORIES[0].id);
                  setAddTransactionDrawerOpen(true);
                  setTimeout(() => {
                    setLogMenuOpen(false);
                  }, 60);
                  logger.log('NAVIGATOR', 'FAB_OPEN_ADD_TRANSACTION_DRAWER');
                }}
                style={({ pressed }) => [
                  styles.fabKey,
                  {
                    backgroundColor: pressed ? (isDark ? '#27272A' : '#E4E4E7') : colors.card,
                    marginBottom: 0, // Sits closest to the bottom nav LOG button
                  }
                ]}
              >
                {/* Dynamic Segmented Borders */}
                <View style={[styles.fabBorderLeft, { backgroundColor: borderAccent }]} />
                <View style={[styles.fabBorderRight, { backgroundColor: borderAccent }]} />
                <View style={[styles.fabBorderBottom, { backgroundColor: borderAccent }]} />
                <View
                  style={[
                    styles.fabBorderTopLeft,
                    {
                      backgroundColor: borderAccent,
                      width: Math.max(0, (52 - expenseLegendWidth) / 2)
                    }
                  ]}
                />
                <View
                  style={[
                    styles.fabBorderTopRight,
                    {
                      backgroundColor: borderAccent,
                      width: Math.max(0, (52 - expenseLegendWidth) / 2)
                    }
                  ]}
                />

                {/* Centered Legend resting on top border */}
                <View
                  onLayout={(e) => setExpenseLegendWidth(e.nativeEvent.layout.width)}
                  style={[styles.fabLegendWrapper, { backgroundColor: 'transparent' }]}
                >
                  <TuiText
                    weight="bold"
                    style={[
                      styles.fabLegendText,
                      { color: colors.primary },
                    ]}
                  >
                    Exp
                  </TuiText>
                </View>

                <View style={styles.fabContent} pointerEvents="none">
                  <FileText size={18} color={colors.primary} />
                </View>
              </Pressable>

            </View>
          )}

          {/* Drawer for logging expense */}
          <TuiDrawer
            visible={addTransactionDrawerOpen}
            onClose={() => {
              setAddTransactionDrawerOpen(false);
              setTimeout(() => {
                setLogType('expense');
                setLogAmount('');
                setLogDescription('');
                setLogCategory(CATEGORIES[0].id);
                setLogDate(getTodayDateString());
                setShowLogDatePicker(false);
              }, 250);
            }}
            title="Log Transaction"
          >
            {/* 01: AMOUNT INPUT */}
            <TuiInput
              label="Amount (₱)"
              value={logAmount}
              onChangeText={setLogAmount}
              keyboardType="default"
              placeholder="0.00"
              containerStyle={{ height: 68 }}
              style={{ fontSize: 32, fontFamily: 'JetBrainsMono_700Bold', height: 48 }}
            />

            {/* 02: DESCRIPTION INPUT */}
            <TuiInput
              label="Description"
              value={logDescription}
              onChangeText={setLogDescription}
              placeholder="Enter description (e.g. Rent, Salary)"
            />

            {/* 03: CATEGORY CONTAINER WITH 3x3 GRID */}
            <View
              style={[
                styles.logCategoryContainer,
                {
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                }
              ]}
            >
              {/* Custom Segmented Borders */}
              <View style={[styles.logBorderLeft, { backgroundColor: isDark ? colors.primary + '40' : '#000000' }]} />
              <View style={[styles.logBorderRight, { backgroundColor: isDark ? colors.primary + '40' : '#000000' }]} />
              <View style={[styles.logBorderBottom, { backgroundColor: isDark ? colors.primary + '40' : '#000000' }]} />
              <View style={[styles.logBorderTopLeft, { backgroundColor: isDark ? colors.primary + '40' : '#000000' }]} />
              <View
                style={[
                  styles.logBorderTopRight,
                  {
                    backgroundColor: isDark ? colors.primary + '40' : '#000000',
                    left: 12 + categoryLegendWidth,
                  }
                ]}
              />

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

              {/* 3x3 Grid */}
              <View style={styles.logCategoryGrid}>
                {(logType === 'expense' ? CATEGORIES : INCOME_CATEGORIES).map((cat) => {
                  const isSelected = logCategory === cat.id;
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
                        setLogCategory(cat.id);
                      }}
                      onLayout={(e) => {
                        const width = e.nativeEvent.layout.width;
                        setCatBtnWidths(prev => ({ ...prev, [cat.id]: width }));
                      }}
                      style={[
                        styles.logCategoryGridBtn,
                        {
                          backgroundColor: isSelected ? (isDark ? '#27272A' : '#E4E4E7') : colors.card,
                          width: logType === 'income' ? '23%' : '30%',
                        }
                      ]}
                    >
                      {/* Dynamic Segmented Borders */}
                      <View style={[styles.catBtnBorderLeft, { backgroundColor: catBorderColor }]} />
                      <View style={[styles.catBtnBorderRight, { backgroundColor: catBorderColor }]} />
                      <View style={[styles.catBtnBorderBottom, { backgroundColor: catBorderColor }]} />
                      <View style={[styles.catBtnBorderTopLeft, { backgroundColor: catBorderColor, width: topSegmentWidth }]} />
                      <View style={[styles.catBtnBorderTopRight, { backgroundColor: catBorderColor, width: topSegmentWidth }]} />

                      {/* Legend Label resting on top border */}
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

            {/* 04: RETRO BRUTALIST CALENDAR DATE PICKER (LEGEND CONTAINER STYLE) */}
            <View style={{ marginVertical: 10, width: '100%', position: 'relative', zIndex: 100 }}>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setShowLogDatePicker(prev => !prev);
                }}
                style={({ pressed }) => [
                  styles.logDateSelectorRow,
                  {
                    backgroundColor: pressed ? colors.primary + '15' : (isDark ? '#18181B' : '#FFFFFF'),
                    marginBottom: 0, // Reset bottom margin since parent View handles layout
                  }
                ]}
              >
                {/* Custom Segmented Borders */}
                <View style={[styles.logBorderLeft, { backgroundColor: showLogDatePicker ? colors.primary : (isDark ? colors.primary + '40' : '#000000') }]} />
                <View style={[styles.logBorderRight, { backgroundColor: showLogDatePicker ? colors.primary : (isDark ? colors.primary + '40' : '#000000') }]} />
                <View style={[styles.logBorderBottom, { backgroundColor: showLogDatePicker ? colors.primary : (isDark ? colors.primary + '40' : '#000000') }]} />
                <View style={[styles.logBorderTopLeft, { backgroundColor: showLogDatePicker ? colors.primary : (isDark ? colors.primary + '40' : '#000000') }]} />
                <View
                  style={[
                    styles.logBorderTopRight,
                    {
                      backgroundColor: showLogDatePicker ? colors.primary : (isDark ? colors.primary + '40' : '#000000'),
                      left: 12 + dateLegendWidth,
                    }
                  ]}
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
                      color: showLogDatePicker ? colors.primary : colors.mutedForeground,
                      letterSpacing: 0.5,
                    }}
                  >
                    Date
                  </TuiText>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <TuiText size="sm" style={{ color: colors.foreground }}>
                    {logDate || 'Select Date'}
                  </TuiText>
                  <Calendar size={16} color={colors.primary} />
                </View>
              </Pressable>

              {showLogDatePicker && (
                <>
                  {/* Absolute backdrop to capture click-outside dismissal */}
                  <Pressable
                    style={{
                      position: 'absolute',
                      top: -600,
                      bottom: -600,
                      left: -600,
                      right: -600,
                      zIndex: 99,
                    }}
                    onPress={() => setShowLogDatePicker(false)}
                  />
                  <View
                    style={[
                      styles.floatingCalendarContainer,
                      {
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        zIndex: 100,
                      }
                    ]}
                  >
                    <TuiCalendar
                      value={logDate}
                      onChange={(selectedDate) => {
                        setLogDate(selectedDate);
                        setShowLogDatePicker(false);
                      }}
                    />
                  </View>
                </>
              )}
            </View>

            {/* 05: DRAWER ACTIONS */}
            <View style={styles.logDrawerActions}>
              <TuiButton
                onPress={() => {
                  setAddTransactionDrawerOpen(false);
                  // Reset states
                  setTimeout(() => {
                    setLogType('expense');
                    setLogAmount('');
                    setLogDescription('');
                    setLogCategory(CATEGORIES[0].id);
                    setLogDate(getTodayDateString());
                    setShowLogDatePicker(false);
                  }, 250);
                }}
                variant="outline"
                style={{ flex: 1, marginRight: 8, height: 44, justifyContent: 'center', paddingVertical: 0 }}
              >
                Cancel
              </TuiButton>
              <TuiButton
                disabled={isNaN(parseFloat(logAmount)) || parseFloat(logAmount) <= 0}
                onPress={() => {
                  const parsedAmt = parseFloat(logAmount);
                  const finalDescription = logDescription.trim() ||
                    (logType === 'expense'
                      ? CATEGORIES.find(c => c.id === logCategory)?.label
                      : INCOME_CATEGORIES.find(c => c.id === logCategory)?.label) ||
                    'Transaction';
                  handleAddTransaction({
                    amount: parsedAmt,
                    type: logType,
                    category: logCategory,
                    description: finalDescription,
                    date: logDate,
                  });

                  logger.log(
                    'Operation',
                    `LOGGED_EXPENSE: ₱${parsedAmt.toFixed(2)} [${logCategory.toUpperCase()}] "${finalDescription}"`
                  );

                  setAddTransactionDrawerOpen(false);
                  // Reset states
                  setTimeout(() => {
                    setLogType('expense');
                    setLogAmount('');
                    setLogDescription('');
                    setLogCategory(CATEGORIES[0].id);
                    setLogDate(getTodayDateString());
                    setShowLogDatePicker(false);
                  }, 250);
                }}
                variant="accent"
                style={{ flex: 1, height: 44, justifyContent: 'center', paddingVertical: 0 }}
              >
                Save Log
              </TuiButton>
            </View>

            {isKeyboardVisible && <View style={{ height: Platform.OS === 'ios' ? 50 : 70 }} />}
          </TuiDrawer>

          {/* Drawer for logging debt */}
          <TuiDrawer
            visible={addDebtDrawerOpen}
            onClose={() => {
              setAddDebtDrawerOpen(false);
              setTimeout(() => {
                resetDebtForm();
              }, 250);
            }}
            title="Add Debt"
          >
            {/* Name Input */}
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
                  borderColor: logBorderColor,
                }
              ]}
            >
              {/* Custom Segmented Borders */}
              <View style={[styles.logBorderLeft, { backgroundColor: logBorderColor }]} />
              <View style={[styles.logBorderRight, { backgroundColor: logBorderColor }]} />
              <View style={[styles.logBorderBottom, { backgroundColor: logBorderColor }]} />
              <View style={[styles.logBorderTopLeft, { backgroundColor: logBorderColor }]} />
              <View
                style={[
                  styles.logBorderTopRight,
                  {
                    backgroundColor: logBorderColor,
                    left: 12 + debtTypeLegendWidth,
                  }
                ]}
              />

              {/* Legend Label */}
              <View
                onLayout={(e) => setDebtTypeLegendWidth(e.nativeEvent.layout.width)}
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

            {/* Due Date Selector */}
            <View style={{ marginVertical: 10, width: '100%', position: 'relative', zIndex: 100 }}>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setShowDebtDatePicker(prev => !prev);
                }}
                style={({ pressed }) => [
                  styles.logDateSelectorRow,
                  {
                    backgroundColor: pressed ? colors.primary + '15' : (isDark ? '#18181B' : '#FFFFFF'),
                    height: 56,
                  }
                ]}
              >
                {/* Custom Segmented Borders */}
                <View style={[styles.logBorderLeft, { backgroundColor: showDebtDatePicker ? colors.primary : logBorderColor }]} />
                <View style={[styles.logBorderRight, { backgroundColor: showDebtDatePicker ? colors.primary : logBorderColor }]} />
                <View style={[styles.logBorderBottom, { backgroundColor: showDebtDatePicker ? colors.primary : logBorderColor }]} />
                <View style={[styles.logBorderTopLeft, { backgroundColor: showDebtDatePicker ? colors.primary : logBorderColor }]} />
                <View
                  style={[
                    styles.logBorderTopRight,
                    {
                      backgroundColor: showDebtDatePicker ? colors.primary : logBorderColor,
                      left: 12 + debtDateLegendWidth,
                    }
                  ]}
                />

                {/* Legend Label */}
                <View
                  onLayout={(e) => setDebtDateLegendWidth(e.nativeEvent.layout.width)}
                  style={styles.logLegendWrapper}
                >
                  <TuiText
                    weight="bold"
                    size="sm"
                    style={{
                      color: showDebtDatePicker ? colors.primary : colors.mutedForeground,
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

              {showDebtDatePicker && (
                <>
                  {/* Absolute backdrop to capture click-outside dismissal */}
                  <Pressable
                    style={{
                      position: 'absolute',
                      top: -600,
                      bottom: -600,
                      left: -600,
                      right: -600,
                      zIndex: 99,
                    }}
                    onPress={() => setShowDebtDatePicker(false)}
                  />
                  <View
                    style={[
                      styles.floatingCalendarContainer,
                      {
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        zIndex: 100,
                        borderColor: logBorderColor,
                        bottom: 90,
                      }
                    ]}
                  >
                    <TuiCalendar
                      value={debtDueDate}
                      onChange={(selectedDate) => {
                        setDebtDueDate(selectedDate);
                        setShowDebtDatePicker(false);
                      }}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Drawer Actions */}
            <View style={styles.logDrawerActions}>
              <TuiButton
                onPress={() => {
                  setAddDebtDrawerOpen(false);
                  setTimeout(() => {
                    resetDebtForm();
                  }, 250);
                }}
                variant="outline"
                style={{ flex: 1, marginRight: 8, height: 44, justifyContent: 'center', paddingVertical: 0 }}
              >
                Cancel
              </TuiButton>
              <TuiButton
                disabled={isNaN(parseFloat(debtAmount)) || parseFloat(debtAmount) <= 0}
                onPress={() => {
                  const parsedAmt = parseFloat(debtAmount);
                  const finalName = debtName.trim() || (debtType === 'payable' ? 'Payable' : 'Receivable');
                  handleAddDebt({
                    name: finalName,
                    amount: parsedAmt,
                    type: debtType,
                    dueDate: debtDueDate,
                  });
                  setAddDebtDrawerOpen(false);
                  setTimeout(() => {
                    resetDebtForm();
                  }, 250);
                }}
                variant="accent"
                style={{ flex: 1, height: 44, justifyContent: 'center', paddingVertical: 0 }}
              >
                Save Debt
              </TuiButton>
            </View>

            {isKeyboardVisible && <View style={{ height: Platform.OS === 'ios' ? 50 : 70 }} />}
          </TuiDrawer>

          {/* Drawer for editing transaction */}
          <TuiDrawer
            visible={editingTransaction !== null}
            onClose={() => {
              setEditingTransaction(null);
              setShowEditTxDatePicker(false);
            }}
            title="Edit Transaction"
          >
            {/* 01: AMOUNT INPUT */}
            <TuiInput
              label="Amount (₱)"
              value={editTxAmount}
              onChangeText={setEditTxAmount}
              keyboardType="default"
              placeholder="0.00"
              containerStyle={{ height: 68 }}
              style={{ fontSize: 32, fontFamily: 'JetBrainsMono_700Bold', height: 48 }}
            />

            {/* 02: DESCRIPTION INPUT */}
            <TuiInput
              label="Description"
              value={editTxDescription}
              onChangeText={setEditTxDescription}
              placeholder="Enter description"
            />

            {/* 03: CATEGORY CONTAINER WITH 3x3 GRID */}
            <View
              style={[
                styles.logCategoryContainer,
                {
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                }
              ]}
            >
              {/* Custom Segmented Borders */}
              <View style={[styles.logBorderLeft, { backgroundColor: isDark ? colors.primary + '40' : '#000000' }]} />
              <View style={[styles.logBorderRight, { backgroundColor: isDark ? colors.primary + '40' : '#000000' }]} />
              <View style={[styles.logBorderBottom, { backgroundColor: isDark ? colors.primary + '40' : '#000000' }]} />
              <View style={[styles.logBorderTopLeft, { backgroundColor: isDark ? colors.primary + '40' : '#000000' }]} />
              <View
                style={[
                  styles.logBorderTopRight,
                  {
                    backgroundColor: isDark ? colors.primary + '40' : '#000000',
                    left: 12 + editTxCategoryLegendWidth,
                  }
                ]}
              />

              {/* Legend Label */}
              <View
                onLayout={(e) => setEditTxCategoryLegendWidth(e.nativeEvent.layout.width)}
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

              {/* 3x3 Grid */}
              <View style={styles.logCategoryGrid}>
                {(editTxType === 'expense' ? CATEGORIES : INCOME_CATEGORIES).map((cat) => {
                  const isSelected = editTxCategory === cat.id;
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
                        setEditTxCategory(cat.id);
                      }}
                      style={[
                        styles.logCategoryGridBtn,
                        {
                          backgroundColor: isSelected ? (isDark ? '#27272A' : '#E4E4E7') : colors.card,
                          width: editTxType === 'income' ? '23%' : '30%',
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
                      <View style={styles.catBtnLegendWrapper}>
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

            {/* 04: DATE SELECTOR */}
            <View style={{ marginVertical: 10, width: '100%', position: 'relative', zIndex: 100 }}>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setShowEditTxDatePicker(prev => !prev);
                }}
                style={({ pressed }) => [
                  styles.logDateSelectorRow,
                  {
                    backgroundColor: pressed ? colors.primary + '15' : (isDark ? '#18181B' : '#FFFFFF'),
                    marginBottom: 0,
                  }
                ]}
              >
                {/* Custom Segmented Borders */}
                <View style={[styles.logBorderLeft, { backgroundColor: showEditTxDatePicker ? colors.primary : (isDark ? colors.primary + '40' : '#000000') }]} />
                <View style={[styles.logBorderRight, { backgroundColor: showEditTxDatePicker ? colors.primary : (isDark ? colors.primary + '40' : '#000000') }]} />
                <View style={[styles.logBorderBottom, { backgroundColor: showEditTxDatePicker ? colors.primary : (isDark ? colors.primary + '40' : '#000000') }]} />
                <View style={[styles.logBorderTopLeft, { backgroundColor: showEditTxDatePicker ? colors.primary : (isDark ? colors.primary + '40' : '#000000') }]} />
                <View
                  style={[
                    styles.logBorderTopRight,
                    {
                      backgroundColor: showEditTxDatePicker ? colors.primary : (isDark ? colors.primary + '40' : '#000000'),
                      left: 12 + editTxDateLegendWidth,
                    }
                  ]}
                />

                {/* Legend Label */}
                <View
                  onLayout={(e) => setEditTxDateLegendWidth(e.nativeEvent.layout.width)}
                  style={styles.logLegendWrapper}
                >
                  <TuiText
                    weight="bold"
                    size="sm"
                    style={{
                      color: showEditTxDatePicker ? colors.primary : colors.mutedForeground,
                      letterSpacing: 0.5,
                    }}
                  >
                    Date
                  </TuiText>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <TuiText size="sm" style={{ color: colors.foreground }}>
                    {editTxDate || 'Select Date'}
                  </TuiText>
                  <Calendar size={16} color={colors.primary} />
                </View>
              </Pressable>

              {showEditTxDatePicker && (
                <>
                  <Pressable
                    style={{
                      position: 'absolute',
                      top: -600,
                      bottom: -600,
                      left: -600,
                      right: -600,
                      zIndex: 99,
                    }}
                    onPress={() => setShowEditTxDatePicker(false)}
                  />
                  <View
                    style={[
                      styles.floatingCalendarContainer,
                      {
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        zIndex: 100,
                      }
                    ]}
                  >
                    <TuiCalendar
                      value={editTxDate}
                      onChange={(selectedDate) => {
                        setEditTxDate(selectedDate);
                        setShowEditTxDatePicker(false);
                      }}
                    />
                  </View>
                </>
              )}
            </View>

            {/* 05: DRAWER ACTIONS */}
            <View style={styles.logDrawerActions}>
              <TuiButton
                onPress={handleEditDeleteTransaction}
                variant="destructive"
                style={{ flex: 1, marginRight: 8, height: 44, justifyContent: 'center', paddingVertical: 0 }}
              >
                Delete
              </TuiButton>
              <TuiButton
                disabled={isNaN(parseFloat(editTxAmount)) || parseFloat(editTxAmount) <= 0}
                onPress={handleSaveEditTransaction}
                variant="accent"
                style={{ flex: 1, height: 44, justifyContent: 'center', paddingVertical: 0 }}
              >
                Save Changes
              </TuiButton>
            </View>

            {isKeyboardVisible && <View style={{ height: Platform.OS === 'ios' ? 50 : 70 }} />}
          </TuiDrawer>

          {/* Drawer for editing debt */}
          <TuiDrawer
            visible={editingDebt !== null}
            onClose={() => {
              setEditingDebt(null);
              setShowEditDebtDatePicker(false);
            }}
            title="Edit Debt"
          >
            {/* Name Input */}
            <TuiInput
              label="Debt Name / Person"
              value={editDebtName}
              onChangeText={setEditDebtName}
              placeholder="e.g. Bank Loan, Friend Alex"
            />

            {/* Amount Input */}
            <TuiInput
              label="Amount (₱)"
              value={editDebtAmount}
              onChangeText={setEditDebtAmount}
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
                  borderColor: logBorderColor,
                }
              ]}
            >
              {/* Custom Segmented Borders */}
              <View style={[styles.logBorderLeft, { backgroundColor: logBorderColor }]} />
              <View style={[styles.logBorderRight, { backgroundColor: logBorderColor }]} />
              <View style={[styles.logBorderBottom, { backgroundColor: logBorderColor }]} />
              <View style={[styles.logBorderTopLeft, { backgroundColor: logBorderColor }]} />
              <View
                style={[
                  styles.logBorderTopRight,
                  {
                    backgroundColor: logBorderColor,
                    left: 12 + editDebtTypeLegendWidth,
                  }
                ]}
              />

              {/* Legend Label */}
              <View
                onLayout={(e) => setEditDebtTypeLegendWidth(e.nativeEvent.layout.width)}
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
                  const isSelected = editDebtType === option.id;
                  const bWidth = debtTypeBtnWidths[option.id] || 100;
                  const lWidth = debtTypeLabelWidths[option.id] || 28;
                  const topSegmentWidth = Math.max(0, (bWidth - lWidth) / 2);
                  const btnBorderColor = isSelected ? colors.primary : logBorderColor;

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => {
                        Keyboard.dismiss();
                        setEditDebtType(option.id as 'payable' | 'receivable');
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
                      <View style={styles.catBtnLegendWrapper}>
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

            {/* Due Date Selector */}
            <View style={{ marginVertical: 10, width: '100%', position: 'relative', zIndex: 100 }}>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setShowEditDebtDatePicker(prev => !prev);
                }}
                style={({ pressed }) => [
                  styles.logDateSelectorRow,
                  {
                    backgroundColor: pressed ? colors.primary + '15' : (isDark ? '#18181B' : '#FFFFFF'),
                    height: 56,
                  }
                ]}
              >
                {/* Custom Segmented Borders */}
                <View style={[styles.logBorderLeft, { backgroundColor: showEditDebtDatePicker ? colors.primary : logBorderColor }]} />
                <View style={[styles.logBorderRight, { backgroundColor: showEditDebtDatePicker ? colors.primary : logBorderColor }]} />
                <View style={[styles.logBorderBottom, { backgroundColor: showEditDebtDatePicker ? colors.primary : logBorderColor }]} />
                <View style={[styles.logBorderTopLeft, { backgroundColor: showEditDebtDatePicker ? colors.primary : logBorderColor }]} />
                <View
                  style={[
                    styles.logBorderTopRight,
                    {
                      backgroundColor: showEditDebtDatePicker ? colors.primary : logBorderColor,
                      left: 12 + editDebtDateLegendWidth,
                    }
                  ]}
                />

                {/* Legend Label */}
                <View
                  onLayout={(e) => setEditDebtDateLegendWidth(e.nativeEvent.layout.width)}
                  style={styles.logLegendWrapper}
                >
                  <TuiText
                    weight="bold"
                    size="sm"
                    style={{
                      color: showEditDebtDatePicker ? colors.primary : colors.mutedForeground,
                      letterSpacing: 0.5,
                    }}
                  >
                    Due Date
                  </TuiText>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <TuiText size="sm" style={{ color: colors.foreground }}>
                    {editDebtDueDate || 'Select Due Date'}
                  </TuiText>
                  <Calendar size={16} color={colors.primary} />
                </View>
              </Pressable>

              {showEditDebtDatePicker && (
                <>
                  <Pressable
                    style={{
                      position: 'absolute',
                      top: -600,
                      bottom: -600,
                      left: -600,
                      right: -600,
                      zIndex: 99,
                    }}
                    onPress={() => setShowEditDebtDatePicker(false)}
                  />
                  <View
                    style={[
                      styles.floatingCalendarContainer,
                      {
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        zIndex: 100,
                        borderColor: logBorderColor,
                        bottom: 90,
                      }
                    ]}
                  >
                    <TuiCalendar
                      value={editDebtDueDate}
                      onChange={(selectedDate) => {
                        setEditDebtDueDate(selectedDate);
                        setShowEditDebtDatePicker(false);
                      }}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Drawer Actions */}
            <View style={styles.logDrawerActions}>
              <TuiButton
                onPress={handleEditDeleteDebt}
                variant="destructive"
                style={{ flex: 1, marginRight: 8, height: 44, justifyContent: 'center', paddingVertical: 0 }}
              >
                Delete
              </TuiButton>
              <TuiButton
                disabled={isNaN(parseFloat(editDebtAmount)) || parseFloat(editDebtAmount) <= 0}
                onPress={handleSaveEditDebt}
                variant="accent"
                style={{ flex: 1, height: 44, justifyContent: 'center', paddingVertical: 0 }}
              >
                Save Changes
              </TuiButton>
            </View>

            {isKeyboardVisible && <View style={{ height: Platform.OS === 'ios' ? 50 : 70 }} />}
          </TuiDrawer>
        </SafeAreaView>
      </Animated.View>

      {splashVisible && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: splashBg,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: splashOpacity,
              zIndex: 99999,
            },
          ]}
          pointerEvents="none"
        >
          <SplashIcon color={colors.primary} size={160} />
        </Animated.View>
      )}
    </View>
  );
}

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderBox: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
  },
  safeArea: {
    flex: 1,
  },
  statusBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    zIndex: 10,
  },
  appBody: {
    flex: 1,
  },
  bottomFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40, // Covers the home indicator safe area on iPhone
    zIndex: 50, // Above screen content, below nav (99)
  },
  headerThemeBtn: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMenuContainer: {
    position: 'absolute',
    bottom: 82, // Sits exactly 14px above the tab bar top edge (68px)
    right: 20, // Aligns perfectly with the standalone Plus LOG button's right boundary
    width: 52, // Exact same 52px width
    zIndex: 9999,
  },
  fabKey: {
    height: 52,
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 14, // Identical 14px vertical gap spacing
  },
  fabBorderLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  fabBorderRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  fabBorderBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1.5,
    zIndex: 5,
  },
  fabBorderTopLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 1.5,
    zIndex: 5,
  },
  fabBorderTopRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: 1.5,
    zIndex: 5,
  },
  fabLegendWrapper: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    paddingHorizontal: 2,
    zIndex: 10,
  },
  fabLegendText: {
    fontSize: 14, // Exact same size as the navigation menu tab bar legends!
    letterSpacing: 0.2,
    fontFamily: 'JetBrainsMono_700Bold',
  },
  fabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 8,
  },
  logToggleButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  logInlineButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logCategoryContainer: {
    width: '100%',
    position: 'relative',
    paddingHorizontal: 12,
    paddingTop: 22,
    paddingBottom: 18,
    marginTop: 4,
    marginBottom: 4,
  },
  logCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    rowGap: 16,
  },
  logCategoryGridBtn: {
    height: 64,
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  catBtnBorderLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  catBtnBorderRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  catBtnBorderBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1.5,
    zIndex: 5,
  },
  catBtnBorderTopLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 1.5,
    zIndex: 5,
  },
  catBtnBorderTopRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: 1.5,
    zIndex: 5,
  },
  catBtnLegendWrapper: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    paddingHorizontal: 2,
    zIndex: 10,
  },
  catBtnContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logTextInput: {
    height: 44,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  logDateSelectorRow: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 12,
    position: 'relative',
    marginBottom: 16,
  },
  logBorderLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  logBorderRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  logBorderBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1.5,
    zIndex: 5,
  },
  logBorderTopLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 12,
    height: 1.5,
    zIndex: 5,
  },
  logBorderTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 1.5,
    zIndex: 5,
  },
  logLegendWrapper: {
    position: 'absolute',
    top: -10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  logIosPickerWrapper: {
    alignSelf: 'flex-start',
  },
  logDatePressableBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  logDrawerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  floatingCalendarContainer: {
    position: 'absolute',
    bottom: 54,
    left: '7%',
    right: '7%',
    maxWidth: 400,
    alignSelf: 'center',
    zIndex: 1000,
    elevation: 5,
  },
  floatingSelectionWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 101,
  },
  floatingSelectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 12,
  },
  actionButtonCompact: {
    flex: 1,
    marginVertical: 0,
    paddingVertical: 0,
    paddingHorizontal: 12,
    height: 38,
    justifyContent: 'center',
  },
});
