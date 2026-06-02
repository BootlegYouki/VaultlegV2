export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

export interface Limit {
  limit: number;
  spent: number;
}

export const CATEGORIES = [
  { id: 'food', label: 'Food', icon: 'utensils' },
  { id: 'utilities', label: 'Bills', icon: 'home' },
  { id: 'entertainment', label: 'Fun', icon: 'film' },
  { id: 'transport', label: 'Transit', icon: 'car' },
  { id: 'shopping', label: 'Shop', icon: 'shopping-bag' },
  { id: 'other', label: 'Other', icon: 'hash' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: 'briefcase' },
  { id: 'freelance', label: 'Freelance', icon: 'code' },
  { id: 'investments', label: 'Investments', icon: 'trending-up' },
  { id: 'other_income', label: 'Other Income', icon: 'plus-circle' },
];

export interface Debt {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type: 'payable' | 'receivable';
}

