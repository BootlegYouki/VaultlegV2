import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiText } from './tui-text';
import { logger } from '../utils/logger';
import { Terminal } from 'lucide-react-native';

export const TuiConsole: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Subscribe to logger streams
    const unsubscribe = logger.subscribe((newLogs) => {
      setLogs(newLogs);
    });
    return unsubscribe;
  }, []);

  const borderColor = isDark ? colors.primary : '#000000';
  const consoleBg = isDark ? '#050505' : '#18181B'; // Dark CRT background regardless of theme for true terminal feel!
  const textColor = isDark ? colors.primary : colors.primary; // Always match neon accent!

  return (
    <View style={[styles.container, { borderColor }]}>
      {/* Header bar (tap to toggle) */}
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        style={[
          styles.header,
          {
            backgroundColor: isDark ? colors.card : '#FFFFFF',
            borderBottomWidth: isOpen ? 2 : 0,
            borderColor,
          },
        ]}
      >
        <View style={styles.headerInfo}>
          <Terminal size={13} color={colors.primary} style={{ marginRight: 6 }} />
          <TuiText size="xs" weight="bold" style={{ color: colors.primary }}>
            Activity Log ({logs.length})
          </TuiText>
          <View style={[styles.pulseCircle, { backgroundColor: colors.primary }]} />
        </View>
        
        <View style={styles.headerActions}>
          {isOpen && (
            <Pressable
              onPress={() => logger.clear()}
              style={[styles.clearBtn, { borderColor: colors.primary }]}
            >
              <TuiText size="xs" weight="bold" style={{ color: colors.primary }}>
                Clear
              </TuiText>
            </Pressable>
          )}
          <TuiText size="xs" weight="bold" style={{ color: colors.primary }}>
            {isOpen ? '[ Hide Logs ]' : '[ View Logs ]'}
          </TuiText>
        </View>
      </Pressable>

      {/* Log Body */}
      {isOpen && (
        <ScrollView
          style={[styles.logBody, { backgroundColor: consoleBg }]}
          contentContainerStyle={styles.logContent}
        >
          {logs.length === 0 ? (
            <TuiText size="xs" style={{ color: textColor }}>
              No recent activities.
            </TuiText>
          ) : (
            logs.map((log, index) => (
              <TuiText
                key={index}
                size="xs"
                style={{
                  color: textColor,
                  marginVertical: 2,
                  lineHeight: 16,
                }}
              >
                {log}
              </TuiText>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 2,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    height: 38,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseCircle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearBtn: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginRight: 12,
  },
  logBody: {
    height: 180,
    padding: 10,
  },
  logContent: {
    paddingBottom: 20,
  },
});
