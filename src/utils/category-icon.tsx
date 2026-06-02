import React from 'react';
import {
  Utensils,
  Zap,
  Film,
  Car,
  Laptop,
  Heart,
  HelpCircle,
  Briefcase,
  Code,
  Wallet,
  ShoppingBag,
  Plane,
  PlusCircle,
} from 'lucide-react-native';

export const getCategoryIcon = (categoryId: string, size = 16, color = '#FFFFFF') => {
  switch (categoryId) {
    case 'food':        return <Utensils size={size} color={color} />;
    case 'utilities':   return <Zap size={size} color={color} />;
    case 'entertainment': return <Film size={size} color={color} />;
    case 'transport':   return <Car size={size} color={color} />;
    case 'tech':        return <Laptop size={size} color={color} />;
    case 'health':      return <Heart size={size} color={color} />;
    case 'shopping':    return <ShoppingBag size={size} color={color} />;
    case 'travel':      return <Plane size={size} color={color} />;
    case 'salary':      return <Briefcase size={size} color={color} />;
    case 'freelance':   return <Code size={size} color={color} />;
    case 'allowance':   return <Wallet size={size} color={color} />;
    case 'other_income': return <PlusCircle size={size} color={color} />;
    default:            return <HelpCircle size={size} color={color} />;
  }
};
