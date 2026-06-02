import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Debt } from '../types';
import { logger } from './logger';

const KEYS = {
  TRANSACTIONS: 'tui_transactions',
  BUDGET_LIMIT: 'tui_budget_limit', // Fallback key
  CATEGORY_BUDGETS: 'tui_category_budgets', // Fallback key
  STATS_LIMIT: 'tui_stats_limit',
  CATEGORY_LIMITS: 'tui_category_limits',
  DEBTS: 'tui_debts',
};

const DEFAULT_STATS_LIMIT = 1000; // Default monthly limit is ₱1000

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
   * Save monthly limit
   */
  async saveStatsLimit(limit: number): Promise<boolean> {
    try {
      await AsyncStorage.setItem(KEYS.STATS_LIMIT, limit.toString());
      logger.log('DATABASE', `UPDATED_STATS_LIMIT_TO_₱${limit.toFixed(2)}`);
      return true;
    } catch (e: any) {
      logger.log('DATABASE_ERROR', `STATS_LIMIT_SAVE_FAILED: ${e.message}`);
      return false;
    }
  },

  /**
   * Load monthly limit
   */
  async loadStatsLimit(): Promise<number> {
    try {
      // 1. Try loading from new stats limit key
      let val = await AsyncStorage.getItem(KEYS.STATS_LIMIT);
      if (val != null) {
        const limit = parseFloat(val);
        logger.log('DATABASE', `LOADED_STATS_LIMIT_₱${limit.toFixed(2)}`);
        return isNaN(limit) ? DEFAULT_STATS_LIMIT : limit;
      }

      // 2. Fall back to old budget limit key
      val = await AsyncStorage.getItem(KEYS.BUDGET_LIMIT);
      if (val != null) {
        const limit = parseFloat(val);
        logger.log('DATABASE', `MIGRATED_BUDGET_LIMIT_₱${limit.toFixed(2)}_TO_STATS`);
        // Migrate to the new key
        await AsyncStorage.setItem(KEYS.STATS_LIMIT, limit.toString());
        return isNaN(limit) ? DEFAULT_STATS_LIMIT : limit;
      }

      logger.log('DATABASE', `INITIALIZED_DEFAULT_STATS_LIMIT_₱${DEFAULT_STATS_LIMIT.toFixed(2)}`);
      return DEFAULT_STATS_LIMIT;
    } catch (e: any) {
      logger.log('DATABASE_ERROR', `STATS_LIMIT_LOAD_FAILED: ${e.message}`);
      return DEFAULT_STATS_LIMIT;
    }
  },

  /**
   * Save category-specific limits dictionary to storage
   */
  async saveCategoryLimits(limits: Record<string, number>): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(limits);
      await AsyncStorage.setItem(KEYS.CATEGORY_LIMITS, jsonValue);
      logger.log('DATABASE', `SAVED_CATEGORY_LIMITS_OK`);
      return true;
    } catch (e: any) {
      logger.log('DATABASE_ERROR', `CATEGORY_LIMITS_SAVE_FAILED: ${e.message}`);
      return false;
    }
  },

  /**
   * Load category-specific limits dictionary from storage
   */
  async loadCategoryLimits(): Promise<Record<string, number>> {
    try {
      // 1. Try loading from new limits key
      let jsonValue = await AsyncStorage.getItem(KEYS.CATEGORY_LIMITS);
      if (jsonValue != null) {
        const limits = JSON.parse(jsonValue) as Record<string, number>;
        logger.log('DATABASE', `LOADED_CATEGORY_LIMITS_OK`);
        return limits;
      }

      // 2. Fall back to old category budgets key
      jsonValue = await AsyncStorage.getItem(KEYS.CATEGORY_BUDGETS);
      if (jsonValue != null) {
        const limits = JSON.parse(jsonValue) as Record<string, number>;
        logger.log('DATABASE', `MIGRATED_CATEGORY_BUDGETS_TO_LIMITS`);
        // Migrate to the new key
        await AsyncStorage.setItem(KEYS.CATEGORY_LIMITS, jsonValue);
        return limits;
      }

      return {};
    } catch (e: any) {
      logger.log('DATABASE_ERROR', `CATEGORY_LIMITS_LOAD_FAILED: ${e.message}`);
      return {};
    }
  },

  /**
   * Save debts list to storage
   */
  async saveDebts(debts: Debt[]): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(debts);
      await AsyncStorage.setItem(KEYS.DEBTS, jsonValue);
      logger.log('DATABASE', `SAVED_${debts.length}_DEBTS_OK`);
      return true;
    } catch (e: any) {
      logger.log('DATABASE_ERROR', `SAVE_DEBTS_FAILED: ${e.message}`);
      return false;
    }
  },

  /**
   * Load debts list from storage
   */
  async loadDebts(): Promise<Debt[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(KEYS.DEBTS);
      if (jsonValue != null) {
        const debts = JSON.parse(jsonValue) as Debt[];
        logger.log('DATABASE', `LOADED_${debts.length}_DEBTS_OK`);
        return debts;
      }
      logger.log('DATABASE', 'INITIALIZED_EMPTY_DEBTS_BUFFER');
      return [];
    } catch (e: any) {
      logger.log('DATABASE_ERROR', `LOAD_DEBTS_FAILED: ${e.message}`);
      return [];
    }
  },
};

export default storage;
