import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, ActivityIndicator, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

import { ThemeProvider, useTheme } from './src/theme/theme-provider';
import { Wallet, PiggyBank, FileText } from 'lucide-react-native';
import { Dashboard } from './src/screens/dashboard';
import { Expenses } from './src/screens/expenses';
import { Budgets } from './src/screens/budgets';
import { Debts } from './src/screens/debts';
import { AddTransaction } from './src/screens/add-transaction';
import { TuiTabBar, ScreenType } from './src/components/tui-nav';
import { TuiText } from './src/components/tui-text';
import { TuiContainer } from './src/components/tui-container';
import { TuiButton } from './src/components/tui-button';
import { Transaction } from './src/types';
import { storage } from './src/utils/storage';
import { logger } from './src/utils/logger';

function MainApp() {
  const { colors, isDark, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeScreen, setActiveScreen] = useState<ScreenType>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [autoOpenBudgetDrawer, setAutoOpenBudgetDrawer] = useState(false);

  const budgetLimit = Object.values(categoryBudgets).reduce((sum, val) => sum + val, 0);

  const { width: screenWidth } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const isScrollingRef = useRef(false);
  const scrollTriggeredByRef = useRef<'swipe' | 'tab' | null>(null);

  const swipeableScreens: ScreenType[] = ['dashboard', 'expenses', 'budgets', 'debts'];

  const [logMenuOpen, setLogMenuOpen] = useState(false);
  const [budgetLegendWidth, setBudgetLegendWidth] = useState(0);
  const [expenseLegendWidth, setExpenseLegendWidth] = useState(0);

  const handleNavigate = (screen: ScreenType) => {
    if (screen === 'add-transaction') {
      setLogMenuOpen(prev => !prev);
      return;
    }
    setLogMenuOpen(false);
    setActiveScreen(screen);
  };

  // Sync scroll offset when activeScreen changes (e.g. from bottom nav tab taps)
  useEffect(() => {
    if (activeScreen !== 'add-transaction') {
      const idx = swipeableScreens.indexOf(activeScreen);
      if (idx !== -1) {
        if (scrollTriggeredByRef.current === 'swipe') {
          // Swipe already positioned the scroll view natively; do not clash with scrollTo
          scrollTriggeredByRef.current = null;
          return;
        }

        scrollTriggeredByRef.current = null;
        isScrollingRef.current = true;
        scrollViewRef.current?.scrollTo({ x: idx * screenWidth, animated: true });
        // Release scrolling block after animation completes
        const timer = setTimeout(() => {
          isScrollingRef.current = false;
        }, 350);
        return () => clearTimeout(timer);
      }
    }
  }, [activeScreen, screenWidth]);

  // Sync activeScreen state on swipe gestures when crossing the 50% boundary midway
  const handleScroll = (event: any) => {
    if (isScrollingRef.current) return; // Ignore programmatic scrolls
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    if (index >= 0 && index < swipeableScreens.length) {
      const targetScreen = swipeableScreens[index];
      if (activeScreen !== targetScreen) {
        scrollTriggeredByRef.current = 'swipe';
        setActiveScreen(targetScreen);
        logger.log('SWIPER', `SWIPED_TO_${targetScreen.toUpperCase()}_SCREEN`);
      }
    }
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
        const catBudgets = await storage.loadCategoryBudgets();
        setTransactions(txList);
        setCategoryBudgets(catBudgets);
        setDataLoaded(true);
        logger.log('SYSTEM', 'ALL_SYSTEM_RESOURCES_LOADED_OK');
      } catch (err: any) {
        logger.log('SYSTEM_ERROR', `RESOURCE_INIT_FAILED: ${err.message}`);
        setDataLoaded(true);
      }
    };
    initAppData();
  }, []);

  const handleUpdateCategoryBudget = async (category: string, limit: number) => {
    const updated = { ...categoryBudgets };
    if (limit <= 0) {
      delete updated[category];
    } else {
      updated[category] = limit;
    }
    setCategoryBudgets(updated);
    await storage.saveCategoryBudgets(updated);
    logger.log('SYSTEM', `UPDATED_CATEGORY_${category.toUpperCase()}_BUDGET_LIMIT_TO_₱${limit.toFixed(2)}`);
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

  // Render retro loader while assets are initializing
  if (!fontsLoaded || !dataLoaded) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: '#09090B' }]}>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <TuiText
            weight="bold"
            size="sm"
            style={{ color: '#FFFFFF', marginTop: 16, letterSpacing: 0.5 }}
          >
            [ Loading Tracker... ]
          </TuiText>
          <TuiText
            size="xs"
            style={{ color: '#71717A', marginTop: 8, letterSpacing: 0.5 }}
          >
            Setting up typography...
          </TuiText>
        </View>
      </View>
    );
  }

  const borderAccent = isDark ? colors.primary : '#000000';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Top Header Status Bar */}
      <View style={[styles.statusBarHeader, { borderColor: borderAccent, backgroundColor: colors.card }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Wallet size={13} color={colors.primary} style={{ marginRight: 6 }} />
          <TuiText size="xs" weight="bold" style={{ color: colors.primary }}>
            VaultLeg
          </TuiText>
          <TuiText size="xs" weight="bold" style={{ color: colors.mutedForeground, marginLeft: 8 }}>
            // {activeScreen === 'dashboard' ? 'home' : activeScreen === 'expenses' ? 'ledger' : activeScreen === 'add-transaction' ? 'log' : activeScreen === 'budgets' ? 'budget' : 'debts'}
          </TuiText>
        </View>

        {/* Compact Theme Toggle */}
        <Pressable
          onPress={() => {
            const nextMode = isDark ? 'light' : 'dark';
            setThemeMode(nextMode);
            logger.log('Theme', `SWAPPED_TO_${nextMode.toUpperCase()}_MODE`);
          }}
          style={[
            styles.headerThemeBtn,
            {
              borderColor: borderAccent,
              backgroundColor: isDark ? '#27272A' : '#E4E4E7',
            }
          ]}
        >
          <TuiText size="xs" weight="bold" style={{ color: colors.foreground, fontSize: 10 }}>
            {isDark ? 'LIGHT' : 'DARK'}
          </TuiText>
        </Pressable>
      </View>

      {/* Screen Router */}
      <View style={styles.appBody}>
        {activeScreen === 'add-transaction' ? (
          <AddTransaction
            onAddTransaction={handleAddTransaction}
            onNavigateBack={() => {
              setActiveScreen('dashboard');
              logger.log('NAVIGATOR', 'SHIFTED_TO_DASHBOARD_PANEL');
            }}
          />
        ) : (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={{ flex: 1 }}
            contentContainerStyle={{ width: screenWidth * swipeableScreens.length }}
          >
            {/* Page 0: Home */}
            <View style={{ width: screenWidth, height: '100%' }}>
               <Dashboard
                 transactions={transactions}
                 budgetLimit={budgetLimit}
                 categoryBudgets={categoryBudgets}
                 onNavigateToAdd={() => {
                   handleNavigate('add-transaction');
                 }}
                 onDeleteTransaction={handleDeleteTransaction}
               />
             </View>

             {/* Page 1: Ledger */}
             <View style={{ width: screenWidth, height: '100%' }}>
               <Expenses
                 transactions={transactions}
                 onDeleteTransaction={handleDeleteTransaction}
               />
             </View>

             {/* Page 2: Budget */}
             <View style={{ width: screenWidth, height: '100%' }}>
               <Budgets
                 transactions={transactions}
                 categoryBudgets={categoryBudgets}
                 onUpdateCategoryBudget={handleUpdateCategoryBudget}
                 autoOpenDrawer={autoOpenBudgetDrawer}
                 onResetAutoOpenDrawer={() => setAutoOpenBudgetDrawer(false)}
               />
            </View>

            {/* Page 3: Debts */}
            <View style={{ width: screenWidth, height: '100%' }}>
              <Debts />
            </View>
          </ScrollView>
        )}
      </View>

      {/* Floating Bottom Tab Bar Navigation */}
      <TuiTabBar currentScreen={activeScreen} onNavigate={handleNavigate} />

      {/* FAB Dropdown Backdrop covering the screen to cancel log menu */}
      {logMenuOpen && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setLogMenuOpen(false)}
        />
      )}

      {/* FAB Choices stacked directly on top of the LOG button */}
      {logMenuOpen && (
        <View style={[styles.fabMenuContainer, { bottom: 82 + insets.bottom }]}>
          
          {/* BUDGET KEY (Top) */}
          <Pressable
            onPress={() => {
              setActiveScreen('budgets');
              setAutoOpenBudgetDrawer(true);
              setLogMenuOpen(false);
              logger.log('NAVIGATOR', 'FAB_REDIRECT_TO_BUDGETS_AND_OPEN_DRAWER');
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
                  width: Math.max(0, (52 - budgetLegendWidth) / 2) 
                }
              ]} 
            />
            <View 
              style={[
                styles.fabBorderTopRight, 
                { 
                  backgroundColor: borderAccent, 
                  width: Math.max(0, (52 - budgetLegendWidth) / 2) 
                }
              ]} 
            />

            {/* Centered Legend resting on top border */}
            <View 
              onLayout={(e) => setBudgetLegendWidth(e.nativeEvent.layout.width)}
              style={[styles.fabLegendWrapper, { backgroundColor: 'transparent' }]}
            >
              <TuiText
                weight="bold"
                style={[
                  styles.fabLegendText,
                  { color: colors.primary },
                ]}
              >
                BGT
              </TuiText>
            </View>

            <View style={styles.fabContent}>
              <PiggyBank size={18} color={colors.primary} />
            </View>
          </Pressable>

          {/* EXPENSE KEY (Bottom) */}
          <Pressable
            onPress={() => {
              setActiveScreen('expenses');
              setLogMenuOpen(false);
              logger.log('NAVIGATOR', 'FAB_REDIRECT_TO_EXPENSES');
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
                EXP
              </TuiText>
            </View>

            <View style={styles.fabContent}>
              <FileText size={18} color={colors.primary} />
            </View>
          </Pressable>

        </View>
      )}
    </SafeAreaView>
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
    paddingVertical: 8,
    borderBottomWidth: 1.5,
    zIndex: 10,
  },
  appBody: {
    flex: 1,
  },
  headerThemeBtn: {
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 2,
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
});
