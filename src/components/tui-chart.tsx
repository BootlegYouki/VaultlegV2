import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiText } from './tui-text';

// ----------------------------------------------------
// TELEMETRY METER: [██████░░░░] style progress bar
// ----------------------------------------------------
interface TuiProgressMeterProps {
  progress: number; // 0 to 1
  label?: string;
  style?: ViewStyle;
}

export const TuiProgressMeter: React.FC<TuiProgressMeterProps> = ({
  progress,
  label,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const cappedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(cappedProgress * 100);

  // Generate ASCII progress bar e.g. [████░░░░]
  const totalBlocks = 10;
  const activeBlocks = Math.round(cappedProgress * totalBlocks);
  const inactiveBlocks = totalBlocks - activeBlocks;
  const asciiBar = '█'.repeat(activeBlocks) + '░'.repeat(inactiveBlocks);

  const barColor = cappedProgress >= 0.9 ? colors.destructive : colors.primary;

  return (
    <View style={[styles.meterContainer, style]}>
      <View style={styles.meterHeader}>
        {label && (
          <TuiText size="xs" weight="bold" style={styles.meterLabel}>
            {label.toUpperCase()}
          </TuiText>
        )}
        <TuiText size="xs" weight="bold" style={{ color: barColor }}>
          {percentage}%
        </TuiText>
      </View>

      {/* Brutalist filled bar */}
      <View
        style={[
          styles.barWrapper,
          {
            borderColor: isDark ? colors.primary + '30' : '#000000',
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          },
        ]}
      >
        <View
          style={[
            styles.barFill,
            {
              width: `${percentage}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      {/* ASCII bracketed indicator */}
      <TuiText size="xs" style={[styles.asciiIndicator, { color: colors.mutedForeground }]}>
        [{asciiBar}]
      </TuiText>
    </View>
  );
};

// ----------------------------------------------------
// HORIZONTAL BAR CHART: Spending breakdown by Category
// ----------------------------------------------------
export interface ChartItem {
  label: string;
  value: number;
  total: number; // For percentage comparison
  formattedValue: string;
}

interface TuiBarChartProps {
  data: ChartItem[];
  style?: ViewStyle;
}

export const TuiBarChart: React.FC<TuiBarChartProps> = ({ data, style }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.chartContainer, style]}>
      {data.map((item, index) => {
        const percentage = item.total > 0 ? (item.value / item.total) : 0;
        const cappedProgress = Math.max(0, Math.min(1, percentage));
        const activeBlocks = Math.round(cappedProgress * 8);
        const inactiveBlocks = 8 - activeBlocks;
        const asciiBar = '█'.repeat(activeBlocks) + '░'.repeat(inactiveBlocks);

        return (
          <View
            key={index}
            style={[
              styles.chartRow,
              {
                borderBottomWidth: index === data.length - 1 ? 0 : 1,
                borderColor: isDark ? '#27272A' : '#E4E4E7',
              },
            ]}
          >
            {/* Category label */}
            <View style={styles.rowLabelCell}>
              <TuiText size="xs" weight="bold">
                {item.label.toUpperCase().padEnd(10)}
              </TuiText>
            </View>

            {/* Visual ASCII bar */}
            <View style={styles.rowBarCell}>
              <TuiText size="xs" style={{ color: colors.primary, letterSpacing: 1 }}>
                [{asciiBar}]
              </TuiText>
            </View>

            {/* Value display */}
            <View style={styles.rowValueCell}>
              <TuiText size="xs" weight="bold" style={{ textAlign: 'right' }}>
                {item.formattedValue}
              </TuiText>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // Progress Meter
  meterContainer: {
    marginVertical: 6,
    width: '100%',
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  meterLabel: {
    letterSpacing: 0.5,
  },
  barWrapper: {
    height: 14,
    borderWidth: 2,
    padding: 1,
    width: '100%',
  },
  barFill: {
    height: '100%',
  },
  asciiIndicator: {
    marginTop: 2,
    fontSize: 10,
    letterSpacing: 1.5,
  },

  // Bar Chart
  chartContainer: {
    width: '100%',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLabelCell: {
    width: '30%',
  },
  rowBarCell: {
    width: '45%',
    alignItems: 'center',
  },
  rowValueCell: {
    width: '25%',
  },
});
