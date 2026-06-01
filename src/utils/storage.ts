import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';
import { logger } from './logger';

const KEYS = {
  TRANSACTIONS: 'tui_transactions',
  BUDGET_LIMIT: 'tui_budget_limit',
  CATEGORY_BUDGETS: 'tui_category_budgets',
};

const DEFAULT_BUDGET_LIMIT = 1000; // Default monthly budget is ₱1000

export const storage = {
  /**
   * Save transactions list to storage
   */
  async saveTransactions(transactions: Transaction[]): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(transactions);
      await AsyncStorage.setItem(KEYS.TRANSACTIONS, jsonValue);
      logger.log('DATABASE', `SAVED_${transactions.length}_TRANSACTIONS_OK`);
      return true;
    } catch (e: any) {
      logger.log('DATABASE_ERROR', `SAVE_FAILED: ${e.message}`);
      return false;
    }
  },

  /**
   * Load transactions list from storage
   */
  async loadTransactions(): Promise<Transaction[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
      if (jsonValue != null) {
        const transactions = JSON.parse(jsonValue) as Transaction[];
        logger.log('DATABASE', `LOADED_${transactions.length}_TRANSACTIONS_OK`);
        return transactions;
      }
      logger.log('DATABASE', 'INITIALIZED_EMPTY_TRANSACTION_BUFFER');
      return [];
    } catch (e: any) {
      logger.log('DATABASE_ERROR', `LOAD_FAILED: ${e.message}`);
      return [];
    }
  },

  /**
   * Save monthly budget limit
   */
  async saveBudgetLimit(limit: number): Promise<boolean> {
    try {
      await AsyncStorage.setItem(KEYS.BUDGET_LIMIT, limit.toString());
      logger.log('DATABASE', `UPDATED_BUDGET_LIMIT_TO_₱${limit.toFixed(2)}`);
      return true;
    } catch (e: any) {
      logger.log('DATABASE_ERROR', `BUDGET_SAVE_FAILED: ${e.message}`);
      return false;
    }
  },

  /**
   * Load monthly budget limit
   */
  async loadBudgetLimit(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(KEYS.BUDGET_LIMIT);
      if (val != null) {
        const limit = parseFloat(val);
        logger.log('DATABASE', `LOADED_BUDGET_LIMIT_₱${limit.toFixed(2)}`);
        return isNaN(limit) ? DEFAULT_BUDGET_LIMIT : limit;
      }
      logger.log('DATABASE', `INITIALIZED_DEFAULT_BUDGET_₱${DEFAULT_BUDGET_LIMIT.toFixed(2)}`);
      return DEFAULT_BUDGET_LIMIT;
    } catch (e: any) {
      logger.log('DATABASE_ERROR', `BUDGET_LOAD_FAILED: ${e.message}`);
      return DEFAULT_BUDGET_LIMIT;
    }
  },

  /**
   * Save category-specific budget limits dictionary to storage
   */
  async saveCategoryBudgets(budgets: Record<string, number>): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(budgets);
      await AsyncStorage.setItem(KEYS.CATEGORY_BUDGETS, jsonValue);
      logger.log('DATABASE', `SAVED_CATEGORY_BUDGETS_OK`);
      return true;
    } catch (e: any) {
      logger.log('DATABASE_ERROR', `CATEGORY_BUDGET_SAVE_FAILED: ${e.message}`);
      return false;
    }
  },

  /**
   * Load category-specific budget limits dictionary from storage
   */
  async loadCategoryBudgets(): Promise<Record<string, number>> {
    try {
      const jsonValue = await AsyncStorage.getItem(KEYS.CATEGORY_BUDGETS);
      if (jsonValue != null) {
        const budgets = JSON.parse(jsonValue) as Record<string, number>;
        logger.log('DATABASE', `LOADED_CATEGORY_BUDGETS_OK`);
        return budgets;
      }
      return {};
    } catch (e: any) {
      logger.log('DATABASE_ERROR', `CATEGORY_BUDGET_LOAD_FAILED: ${e.message}`);
      return {};
    }
  },
};

export default storage;
