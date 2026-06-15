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
  { id: 'pocket', label: 'Pocket', icon: 'wallet' },
  { id: 'salary', label: 'Salary', icon: 'briefcase' },
  { id: 'outside', label: 'Outside', icon: 'code' },
  { id: 'other_income', label: 'Other', icon: 'plus-circle' },
];

export const getCategoryLabel = (categoryId: string): string => {
  const catObj = CATEGORIES.find(c => c.id === categoryId) || INCOME_CATEGORIES.find(c => c.id === categoryId);
  return catObj ? catObj.label : categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
};


export interface Debt {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type: 'payable' | 'receivable';
}

