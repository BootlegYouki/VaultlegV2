import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

import { ThemeProvider, useTheme } from './src/theme/theme-provider';
import { Wallet } from 'lucide-react-native';
import { Dashboard } from './src/screens/dashboard';
import { AddTransaction } from './src/screens/add-transaction';
import { TuiTabBar } from './src/components/tui-nav';
import { TuiText } from './src/components/tui-text';
import { Transaction } from './src/types';
import { storage } from './src/utils/storage';
import { logger } from './src/utils/logger';

function MainApp() {
  const { colors, isDark } = useTheme();
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'add-transaction'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetLimit, setBudgetLimit] = useState(1000);
  const [dataLoaded, setDataLoaded] = useState(false);

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
        const limit = await storage.loadBudgetLimit();
        setTransactions(txList);
        setBudgetLimit(limit);
        setDataLoaded(true);
        logger.log('SYSTEM', 'ALL_SYSTEM_RESOURCES_LOADED_OK');
      } catch (err: any) {
        logger.log('SYSTEM_ERROR', `RESOURCE_INIT_FAILED: ${err.message}`);
        setDataLoaded(true);
      }
    };
    initAppData();
  }, []);

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

  const handleUpdateBudget = async (newLimit: number) => {
    setBudgetLimit(newLimit);
    await storage.saveBudgetLimit(newLimit);
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
            Expense Tracker
          </TuiText>
        </View>
        <TuiText size="xs" weight="bold" variant="muted">
          {activeScreen === 'dashboard' ? 'Home' : 'Add Expense'}
        </TuiText>
      </View>

      {/* Screen Router */}
      <View style={styles.appBody}>
        {activeScreen === 'dashboard' ? (
          <Dashboard
            transactions={transactions}
            budgetLimit={budgetLimit}
            onNavigateToAdd={() => {
              setActiveScreen('add-transaction');
              logger.log('NAVIGATOR', 'SHIFTED_TO_TRANSACTION_LOGGER_PANEL');
            }}
            onUpdateBudget={handleUpdateBudget}
            onDeleteTransaction={handleDeleteTransaction}
          />
        ) : (
          <AddTransaction
            onAddTransaction={handleAddTransaction}
            onNavigateBack={() => {
              setActiveScreen('dashboard');
              logger.log('NAVIGATOR', 'SHIFTED_TO_DASHBOARD_PANEL');
            }}
          />
        )}
      </View>

      {/* Floating Bottom Tab Bar Navigation */}
      <TuiTabBar currentScreen={activeScreen} onNavigate={setActiveScreen} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
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
    borderBottomWidth: 2,
    zIndex: 10,
  },
  appBody: {
    flex: 1,
  },
});
