export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

export interface Budget {
  limit: number;
  spent: number;
}

export const CATEGORIES = [
  { id: 'food', label: 'Food', icon: 'utensils' },
  { id: 'utilities', label: 'Utilities', icon: 'home' },
  { id: 'entertainment', label: 'Entertainment', icon: 'film' },
  { id: 'transport', label: 'Transport', icon: 'car' },
  { id: 'tech', label: 'Tech & Gear', icon: 'laptop' },
  { id: 'health', label: 'Health', icon: 'heart' },
  { id: 'other', label: 'Other', icon: 'hash' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: 'briefcase' },
  { id: 'freelance', label: 'Freelance', icon: 'code' },
  { id: 'investments', label: 'Investments', icon: 'trending-up' },
  { id: 'other_income', label: 'Other Income', icon: 'plus-circle' },
];
