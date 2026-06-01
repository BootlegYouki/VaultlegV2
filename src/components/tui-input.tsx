import React, { useState } from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiText } from './tui-text';

interface TuiInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const TuiInput: React.FC<TuiInputProps> = ({
  label,
  error,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const borderColor = error
    ? colors.destructive
    : isFocused
    ? colors.primary
    : isDark
    ? colors.primary + '30'
    : '#000000';

  const backgroundColor = isDark ? '#1C1C1E' : '#FFFFFF';

  return (
    <View style={styles.container}>
      {label && (
        <TuiText size="xs" weight="bold" style={styles.label} variant="muted">
          {label.toUpperCase()}
        </TuiText>
      )}
      
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor,
          },
        ]}
      >
        <TextInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.textInput,
            {
              color: colors.foreground,
              fontFamily: 'JetBrainsMono_400Regular',
            },
            style,
          ]}
          {...props}
        />
      </View>

      {error && (
        <TuiText size="xs" style={styles.error} variant="destructive">
          * {error}
        </TuiText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  label: {
    marginBottom: 4,
    letterSpacing: 1,
  },
  inputContainer: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    height: 44,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14,
    padding: 0,
    margin: 0,
  },
  error: {
    marginTop: 4,
  },
});
