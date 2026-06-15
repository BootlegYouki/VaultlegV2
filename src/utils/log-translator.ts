const translateDatabaseMessage = (message: string): string | null => {
  if (message.startsWith('LOADED_') && message.endsWith('_TRANSACTIONS_OK')) {
    const count = message.split('_')[1];
    return `Loaded ${count} transactions from database.`;
  }
  if (message === 'INITIALIZED_EMPTY_TRANSACTION_BUFFER') {
    return 'Started database with 0 transactions.';
  }
  if (message.startsWith('SAVED_') && message.endsWith('_TRANSACTIONS_OK')) {
    const count = message.split('_')[1];
    return `Saved ${count} transactions successfully.`;
  }
  if (message.startsWith('UPDATED_BUDGET_LIMIT_TO_') || message.startsWith('UPDATED_STATS_LIMIT_TO_')) {
    const amount = message.replace('UPDATED_BUDGET_LIMIT_TO_', '').replace('UPDATED_STATS_LIMIT_TO_', '');
    return `Changed monthly limit to ${amount}.`;
  }
  if (message.startsWith('INITIALIZED_DEFAULT_BUDGET_') || message.startsWith('INITIALIZED_DEFAULT_STATS_LIMIT_')) {
    const amount = message.replace('INITIALIZED_DEFAULT_BUDGET_', '').replace('INITIALIZED_DEFAULT_STATS_LIMIT_', '');
    return `Set default monthly limit to ${amount}.`;
  }
  if (message.startsWith('LOADED_BUDGET_LIMIT_') || message.startsWith('LOADED_STATS_LIMIT_')) {
    const amount = message.replace('LOADED_BUDGET_LIMIT_', '').replace('LOADED_STATS_LIMIT_', '');
    return `Loaded limit of ${amount}.`;
  }
  if (message.startsWith('MIGRATED_BUDGET_LIMIT_')) {
    const amount = message.replace('MIGRATED_BUDGET_LIMIT_', '').split('_')[0];
    return `Migrated monthly limit of ${amount} to new system.`;
  }
  return null;
};

const translateSystemMessage = (message: string): string | null => {
  if (message === 'ALL_SYSTEM_RESOURCES_LOADED_OK') {
    return 'App loaded successfully.';
  }
  return null;
};

const translateNavigationMessage = (message: string): string | null => {
  if (message === 'SHIFTED_TO_TRANSACTION_LOGGER_PANEL') {
    return 'Opened "Add Transaction" screen.';
  }
  if (message === 'SHIFTED_TO_DASHBOARD_PANEL') {
    return 'Returned to dashboard.';
  }
  return null;
};

const translateThemeMessage = (message: string): string | null => {
  if (message === 'SWAPPED_TO_LIGHT_MODE') {
    return 'Switched color scheme to Light Mode.';
  }
  if (message === 'SWAPPED_TO_DARK_MODE') {
    return 'Switched color scheme to Dark Mode.';
  }
  return null;
};

const translateOperationMessage = (message: string): string | null => {
  if (message.startsWith('LOGGED_')) {
    const isExpense = message.includes('LOGGED_EXPENSE');
    const parts = message.split(': ');
    if (parts.length > 1) {
      const details = parts[1];
      const amtPart = details.split(' [')[0];
      const catPart = details.includes('[') ? details.split('[')[1].split(']')[0] : '';
      const descPart = details.includes('"') ? details.split('"')[1] : '';
      
      const typeLabel = isExpense ? 'Expense' : 'Income';
      const descLabel = descPart ? ` for "${descPart}"` : '';
      return `Added ${typeLabel} of ${amtPart} under ${catPart.toLowerCase()}${descLabel}.`;
    }
  }
  if (message.startsWith('DELETED_TRANSACTION_ID_')) {
    return 'Removed transaction from history.';
  }
  if (message.startsWith('CONFIGURED_BUDGET_TO_') || message.startsWith('CONFIGURED_LIMIT_TO_')) {
    const amt = message.replace('CONFIGURED_BUDGET_TO_', '').replace('CONFIGURED_LIMIT_TO_', '');
    return `Changed monthly limit to ${amt}.`;
  }
  if (message === 'BUFFER_CLEARED') {
    return 'Activity logs cleared.';
  }
  return null;
};

export const translateLogMessage = (message: string): string => {
  return (
    translateDatabaseMessage(message) ??
    translateSystemMessage(message) ??
    translateNavigationMessage(message) ??
    translateThemeMessage(message) ??
    translateOperationMessage(message) ??
    message
  );
};
