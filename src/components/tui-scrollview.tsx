import React from 'react';
import { ScrollView, ScrollViewProps, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme-provider';

interface TuiScrollViewProps extends ScrollViewProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export const TuiScrollView: React.FC<TuiScrollViewProps> = ({
  children,
  style,
  contentContainerStyle,
  refreshing,
  onRefresh,
  ...props
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={style}
      contentContainerStyle={[
        contentContainerStyle,
        { paddingBottom: 65 + insets.bottom },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={isDark ? '#1C1C1E' : '#FFFFFF'}
        />
      }
      {...props}
    >
      {children}
    </ScrollView>
  );
};
