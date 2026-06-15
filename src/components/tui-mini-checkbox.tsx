import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/theme-provider';

interface TuiMiniCheckboxProps {
  checked: boolean;
}

export const TuiMiniCheckbox: React.FC<TuiMiniCheckboxProps> = ({ checked }) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        width: 18,
        height: 18,
        borderWidth: 1.5,
        borderColor: checked ? colors.primary : (isDark ? '#3F3F46' : '#A1A1AA'),
        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
      }}
    >
      {checked && (
        <View
          style={{
            width: 8,
            height: 8,
            backgroundColor: colors.primary,
          }}
        />
      )}
    </View>
  );
};
