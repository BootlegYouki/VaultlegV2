type LogListener = (logs: string[]) => void;

class TuiLogger {
  private logs: string[] = [];
  private listeners: Set<LogListener> = new Set();
  private maxLogs = 30;

  constructor() {
    this.log('System', 'App started successfully.');
  }

  log(category: string, message: string) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Clean and de-jargonize log output format
    let cleanMessage = message;
    
    // Database loads mapping
    if (message.startsWith('LOADED_') && message.endsWith('_TRANSACTIONS_OK')) {
      const count = message.split('_')[1];
      cleanMessage = `Loaded ${count} transactions from database.`;
    } else if (message === 'INITIALIZED_EMPTY_TRANSACTION_BUFFER') {
      cleanMessage = 'Started database with 0 transactions.';
    } else if (message.startsWith('SAVED_') && message.endsWith('_TRANSACTIONS_OK')) {
      const count = message.split('_')[1];
      cleanMessage = `Saved ${count} transactions successfully.`;
    } else if (message.startsWith('UPDATED_BUDGET_LIMIT_TO_')) {
      const amount = message.replace('UPDATED_BUDGET_LIMIT_TO_', '');
      cleanMessage = `Changed monthly budget limit to ${amount}.`;
    } else if (message.startsWith('INITIALIZED_DEFAULT_BUDGET_')) {
      const amount = message.replace('INITIALIZED_DEFAULT_BUDGET_', '');
      cleanMessage = `Set default monthly budget limit to ${amount}.`;
    } else if (message.startsWith('LOADED_BUDGET_LIMIT_')) {
      const amount = message.replace('LOADED_BUDGET_LIMIT_', '');
      cleanMessage = `Loaded budget limit of ${amount}.`;
    }
    
    // System boot mapping
    else if (message === 'ALL_SYSTEM_RESOURCES_LOADED_OK') {
      cleanMessage = 'App loaded successfully.';
    }
    
    // Navigation mapping
    else if (message === 'SHIFTED_TO_TRANSACTION_LOGGER_PANEL') {
      cleanMessage = 'Opened "Add Transaction" screen.';
    } else if (message === 'SHIFTED_TO_DASHBOARD_PANEL') {
      cleanMessage = 'Returned to dashboard.';
    }
    
    // Theme mappings
    else if (message === 'SWAPPED_TO_LIGHT_MODE') {
      cleanMessage = 'Switched color scheme to Light Mode.';
    } else if (message === 'SWAPPED_TO_DARK_MODE') {
      cleanMessage = 'Switched color scheme to Dark Mode.';
    }
    
    // Operation logs mappings
    else if (message.startsWith('LOGGED_')) {
      // e.g. LOGGED_EXPENSE: $12.00 [FOOD] "lunch" -> Added Expense: $12.00 (Food - lunch)
      const isExpense = message.includes('LOGGED_EXPENSE');
      const parts = message.split(': ');
      if (parts.length > 1) {
        const details = parts[1]; // e.g. $12.00 [FOOD] "lunch"
        const amtPart = details.split(' [')[0];
        const catPart = details.includes('[') ? details.split('[')[1].split(']')[0] : '';
        const descPart = details.includes('"') ? details.split('"')[1] : '';
        
        const typeLabel = isExpense ? 'Expense' : 'Income';
        const descLabel = descPart ? ` for "${descPart}"` : '';
        cleanMessage = `Added ${typeLabel} of ${amtPart} under ${catPart.toLowerCase()}${descLabel}.`;
      }
    } else if (message.startsWith('DELETED_TRANSACTION_ID_')) {
      cleanMessage = 'Removed transaction from history.';
    } else if (message.startsWith('CONFIGURED_BUDGET_TO_')) {
      const amt = message.replace('CONFIGURED_BUDGET_TO_', '');
      cleanMessage = `Changed monthly budget limit to ${amt}.`;
    } else if (message === 'BUFFER_CLEARED') {
      cleanMessage = 'Activity logs cleared.';
    }

    const logEntry = `[${time}] ${category}: ${cleanMessage}`;
    this.logs = [logEntry, ...this.logs].slice(0, this.maxLogs);
    this.notify();
  }

  getLogs() {
    return this.logs;
  }

  subscribe(listener: LogListener) {
    this.listeners.add(listener);
    listener(this.logs);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.logs));
  }

  clear() {
    this.logs = [];
    this.log('System', 'Logs cleared.');
  }
}

export const logger = new TuiLogger();
export default logger;
