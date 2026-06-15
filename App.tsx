import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable, Platform, Animated, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

import { ThemeProvider, useTheme } from './src/theme/theme-provider';
import { Wallet, Landmark, Settings as SettingsIcon } from 'lucide-react-native';
import { Dashboard } from './src/screens/dashboard';
import { Expenses } from './src/screens/logs';
import { Stats } from './src/screens/stats';
import { Debts } from './src/screens/debts';
import { Settings } from './src/screens/settings';
import { TuiTabBar, ScreenType } from './src/components/tui-nav';
import { TuiText } from './src/components/tui-text';
import { TuiContainer } from './src/components/tui-container';
import { TuiButton } from './src/components/tui-button';
import { Transaction, Debt } from './src/types';
import { AppDrawers } from './src/components/drawers/app-drawers';

import { logger } from './src/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { useGistSync } from './src/hooks/use-gist-sync';
import { useAppState } from './src/hooks/use-app-state';
import { useFabMenu } from './src/hooks/use-fab-menu';
import { FabMenu } from './src/components/fab-menu';
import { checkForUpdates } from './src/utils/update-checker';


SplashScreen.preventAutoHideAsync().catch(() => {});

function MainApp() {
  const { colors, isDark, setThemeMode, themeLoaded } = useTheme();
  const borderAccent = colors.primary;
  const insets = useSafeAreaInsets();
  const appState = useAppState();
  const {
    activeScreen,
    setActiveScreen,
    transactions,
    categoryLimits,
    debts,
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
    handleRestoreData,
    handleWipeAllData,
    handleToggleSelect,
    handleLongPressSelect,
    handleCancelSelection,
  } = appState;

  const [autoOpenStatsDrawer, setAutoOpenStatsDrawer] = useState(false);
  const [addExpenseDrawerOpen, setAddExpenseDrawerOpen] = useState(false);
  const [addIncomeDrawerOpen, setAddIncomeDrawerOpen] = useState(false);

  const {
    logMenuOpen,
    setLogMenuOpen,
    shouldRenderFab,
    fabAnimExpense,
    fabAnimIncome,
    fabAnimDebt,
  } = useFabMenu();

  const handleRefresh = async () => {
    setRefreshing(true);
    logger.log('OPERATION', 'PULL_TO_REFRESH_TRIGGERED');
    try {
      const { txList, debtList } = await reloadLocalResources();
      logger.log('SYSTEM', 'RELOADED_RESOURCES_SUCCESS');

      if (gistPat && gistPat.trim() !== '') {
        await checkAndPromptCloudBackup(gistPat, gistId, txList, debtList, false);
      }
    } catch (err: any) {
      logger.log('SYSTEM_ERROR', `RELOAD_FAILED: ${err.message}`);
      Alert.alert('Sync Error', `Could not sync with GitHub: ${err.message}`);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 700);
    }
  };



  // Seeding states for drawers
  const [seedLogAmount, setSeedLogAmount] = useState('');
  const [seedLogDescription, setSeedLogDescription] = useState('');
  const [seedDebtAmount, setSeedDebtAmount] = useState('');
  const [seedDebtName, setSeedDebtName] = useState('');

  const [addDebtDrawerOpen, setAddDebtDrawerOpen] = useState(false);

  // Editing transaction states
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Editing debt states
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const startEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
  };

  const startEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
  };

  // Animated values for iOS-style deck transition (parallax scaleout)
  const drawerProgressAnim = useRef(new Animated.Value(0)).current;

  const screenScaleAnim = drawerProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.93],
  });
  const screenTranslateYAnim = drawerProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });
  const screenBorderRadiusAnim = drawerProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });



  const handleSaveEditTransaction = async (updatedTx: Transaction) => {
    const updated = await appState.handleSaveEditTransaction(updatedTx);
    triggerGistBackup(updated);
    setEditingTransaction(null);
  };

  const handleEditDeleteTransaction = async (id: string) => {
    await appState.handleDeleteTransaction(id, () => {
      setEditingTransaction(null);
    });
  };

  const handleSaveEditDebt = async (updatedDebt: Debt) => {
    const updated = await appState.handleSaveEditDebt(updatedDebt);
    triggerGistBackup(undefined, updated);
    setEditingDebt(null);
  };

  const handleEditDeleteDebt = async (id: string) => {
    await appState.handleDeleteDebt(id, () => {
      setEditingDebt(null);
    });
  };



  const statsLimit = Object.values(categoryLimits).reduce((sum, val) => sum + val, 0);



  const handleNavigate = (screen: ScreenType, shouldAnimateStats = false) => {
    if (screen === 'add-transaction') {
      setLogMenuOpen(prev => !prev);
      return;
    }
    setLogMenuOpen(false);
    setSelectedIds([]);
    setIsSelectionMode(false);
    setActiveScreen(screen);
    setAnimateStatsMeter(shouldAnimateStats);

    if (shouldAnimateStats) {
      setTimeout(() => {
        setAnimateStatsMeter(false);
      }, 1500);
    }
  };

  const handleLongPressAdd = () => {
    setSeedLogAmount('');
    setSeedLogDescription('');
    setAddExpenseDrawerOpen(true);
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
        const { txList, debtList } = await reloadLocalResources();

        // Load Gist Auto-Sync preferences
        const pat = await AsyncStorage.getItem('tui_gist_pat');
        const id = await AsyncStorage.getItem('tui_gist_id');

        if (pat) setGistPat(pat);
        if (id) setGistId(id);

        setDataLoaded(true);
        logger.log('SYSTEM', 'ALL_SYSTEM_RESOURCES_LOADED_OK');

        // Startup background check for newer Gist backups
        if (pat && pat.trim() !== '') {
          setTimeout(async () => {
            try {
              logger.log('SYSTEM', 'STARTUP_GIST_CHECK_TRIGGERED');
              await checkAndPromptCloudBackup(pat, id || '', txList, debtList, true);
            } catch (err: any) {
              logger.log('SYSTEM_ERROR', `STARTUP_GIST_CHECK_FAILED: ${err.message}`);
            }
          }, 1500);
        }

        // Startup check for updates on Android
        if (Platform.OS === 'android') {
          setTimeout(() => {
            checkForUpdates(false).catch(() => {});
          }, 3000);
        }
      } catch (err: any) {
        logger.log('SYSTEM_ERROR', `RESOURCE_INIT_FAILED: ${err.message}`);
        setDataLoaded(true);
      }
    };
    initAppData();
  }, []);

  const [isAppReady, setIsAppReady] = useState(false);

  // Hide splash screen once fonts, theme and data are loaded, and set app ready
  useEffect(() => {
    if (fontsLoaded && dataLoaded && themeLoaded) {
      setIsAppReady(true);
    }
  }, [fontsLoaded, dataLoaded, themeLoaded]);

  // Hide native splash screen when app is ready
  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isAppReady]);

  const handleUpdateCategoryLimit = async (category: string, limit: number) => {
    const updated = await appState.handleUpdateCategoryLimit(category, limit);
    triggerGistBackup(undefined, undefined, updated);
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const updated = await appState.handleAddTransaction(newTx);
    triggerGistBackup(updated);
  };

  const handleDeleteTransaction = async (id: string, onConfirm?: () => void) => {
    await appState.handleDeleteTransaction(id, onConfirm, (filtered) => {
      triggerGistBackup(filtered);
    });
  };

  const handleDeleteTransactions = async (ids: string[], skipConfirm = false) => {
    const filtered = await appState.handleDeleteTransactions(ids, skipConfirm);
    if (filtered) {
      triggerGistBackup(filtered);
    }
  };

  const handleAddDebt = async (newDebt: Omit<Debt, 'id'>) => {
    const updated = await appState.handleAddDebt(newDebt);
    triggerGistBackup(undefined, updated);
  };

  const handleDeleteDebt = async (id: string, onConfirm?: () => void) => {
    await appState.handleDeleteDebt(id, onConfirm, (filtered) => {
      triggerGistBackup(undefined, filtered);
    });
  };

  const handleDeleteDebts = async (ids: string[], skipConfirm = false) => {
    const filtered = await appState.handleDeleteDebts(ids, skipConfirm);
    if (filtered) {
      triggerGistBackup(undefined, filtered);
    }
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
              await handleDeleteTransactions(selectedIds, true);
            } else {
              await handleDeleteDebts(selectedIds, true);
            }
          },
        },
      ]
    );
  };

  const {
    gistPat,
    setGistPat,
    gistId,
    setGistId,
    syncingStatus,
    setSyncingStatus,
    triggerGistBackup,
    checkAndPromptCloudBackup,
    handleUpdateGistSettings,
    handleManualSync,
  } = useGistSync({
    transactions,
    debts,
    categoryLimits,
    handleRestoreData,
    updateLastLocalUpdate,
  });

  // Render initial dark/light splash screen until the app is ready
  if (!isAppReady) {
    return null;
  }

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
        <View style={[styles.safeArea, { backgroundColor: 'transparent', paddingTop: insets.top }]}>
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
                  setAddExpenseDrawerOpen(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
                onEditTransaction={startEditTransaction}
                onNavigateToStats={() => {
                   handleNavigate('stats', true);
                 }}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                editingTransactionId={editingTransaction?.id}
                onRecentTransactionPress={handleRecentTransactionPress}
                startAnimation={true}
              />
            )}

            {activeScreen === 'expenses' && (
              <Expenses
                transactions={transactions}
                onDeleteTransaction={handleDeleteTransaction}
                onDeleteTransactions={handleDeleteTransactions}
                onEditTransaction={startEditTransaction}
                onLogTransaction={(initialType) => {
                  setSeedLogAmount('');
                  setSeedLogDescription('');
                  if (initialType === 'income') {
                    setAddIncomeDrawerOpen(true);
                  } else {
                    setAddExpenseDrawerOpen(true);
                  }
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
                animateMeter={animateStatsMeter}
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
                gistPat={gistPat}
                gistId={gistId}
                syncingStatus={syncingStatus}
                onUpdateGistSettings={handleUpdateGistSettings}
                onManualSync={handleManualSync}
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
            startAnimation={true}
          />

          {/* Bottom safe-area fill — matches nav card color so home indicator strip is consistent */}
          <View style={[styles.bottomFill, { backgroundColor: colors.card }]} />

          {/* FAB Dropdown Backdrop covering the screen to cancel log menu */}
          {logMenuOpen && (
            <Pressable
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9990 }]}
              onPress={() => setLogMenuOpen(false)}
            />
          )}

          {shouldRenderFab && (
            <FabMenu
              fabAnimExpense={fabAnimExpense}
              fabAnimIncome={fabAnimIncome}
              fabAnimDebt={fabAnimDebt}
              bottomOffset={70 + insets.bottom}
              onOpenExpense={() => {
                setSeedLogAmount('');
                setSeedLogDescription('');
                setAddExpenseDrawerOpen(true);
                setTimeout(() => setLogMenuOpen(false), 60);
              }}
              onOpenIncome={() => {
                setSeedLogAmount('');
                setSeedLogDescription('');
                setAddIncomeDrawerOpen(true);
                setTimeout(() => setLogMenuOpen(false), 60);
              }}
              onOpenDebt={() => {
                setSeedDebtAmount('');
                setSeedDebtName('');
                setAddDebtDrawerOpen(true);
                setTimeout(() => setLogMenuOpen(false), 60);
              }}
            />
          )}

        </View>
      </Animated.View>

          <AppDrawers
            addExpenseDrawerOpen={addExpenseDrawerOpen}
            onCloseExpenseDrawer={() => setAddExpenseDrawerOpen(false)}
            onOpenIncomeDrawerWithData={(amount, description) => {
              setSeedLogAmount(amount);
              setSeedLogDescription(description);
              setAddIncomeDrawerOpen(true);
            }}
            addIncomeDrawerOpen={addIncomeDrawerOpen}
            onCloseIncomeDrawer={() => setAddIncomeDrawerOpen(false)}
            onOpenExpenseDrawerWithData={(amount, description) => {
              setSeedLogAmount(amount);
              setSeedLogDescription(description);
              setAddExpenseDrawerOpen(true);
            }}
            addDebtDrawerOpen={addDebtDrawerOpen}
            onCloseDebtDrawer={() => setAddDebtDrawerOpen(false)}
            onOpenTransactionDrawerWithData={(amount, description) => {
              setSeedLogAmount(amount);
              setSeedLogDescription(description);
              setAddExpenseDrawerOpen(true);
            }}
            seedLogAmount={seedLogAmount}
            seedLogDescription={seedLogDescription}
            seedDebtAmount={seedDebtAmount}
            seedDebtName={seedDebtName}
            editingTransaction={editingTransaction}
            onCloseEditTransaction={() => setEditingTransaction(null)}
            onSaveEditTransaction={handleSaveEditTransaction}
            onDeleteEditTransaction={handleEditDeleteTransaction}
            editingDebt={editingDebt}
            onCloseEditDebt={() => setEditingDebt(null)}
            onSaveEditDebt={handleSaveEditDebt}
            onDeleteEditDebt={handleEditDeleteDebt}
            onSaveTransaction={handleAddTransaction}
            onSaveDebt={handleAddDebt}
            progressAnim={drawerProgressAnim}
          />
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
    zIndex: 9998,
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
