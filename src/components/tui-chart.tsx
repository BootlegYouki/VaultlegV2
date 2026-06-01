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
  totalBlocks?: number;
  color?: string;
}

export const TuiProgressMeter: React.FC<TuiProgressMeterProps> = ({
  progress,
  label,
  style,
  totalBlocks = 32,
  color,
}) => {
  const { colors, isDark } = useTheme();
  const cappedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(cappedProgress * 100);

  const activeBlocks = Math.round((1 - cappedProgress) * totalBlocks);
  const inactiveBlocks = totalBlocks - activeBlocks;
  const asciiBar = '█'.repeat(activeBlocks) + '░'.repeat(inactiveBlocks);

  const baseColor = color ?? colors.primary;
  const barColor = cappedProgress >= 0.9 ? colors.destructive : baseColor;

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

      {/* Main ASCII progress bar */}
      <TuiText style={[styles.asciiProgressText, { color: barColor }]}>
        {asciiBar}
      </TuiText>
    </View>
  );
};

// ----------------------------------------------------
// SEGMENTED METER: Multi-color ASCII bar (one color per category)
// ----------------------------------------------------
export interface MeterSegment {
  color: string;
  value: number; // amount this segment contributes (limit or spent)
}

interface TuiSegmentedMeterProps {
  segments: MeterSegment[];
  totalLimit: number;   // sum of all category limits
  totalSpent: number;   // sum of all spending
  label?: string;
  style?: ViewStyle;
  totalBlocks?: number;
}

export const TuiSegmentedMeter: React.FC<TuiSegmentedMeterProps> = ({
  segments,
  totalLimit,
  totalSpent,
  label,
  style,
  totalBlocks = 32,
}) => {
  const { colors } = useTheme();
  const percentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const overallProgress = totalLimit > 0 ? totalSpent / totalLimit : 0;
  const headerColor = overallProgress >= 0.9 ? colors.destructive : colors.mutedForeground;

  // Calculate how many filled blocks each segment gets
  // Each block = 1/totalBlocks of totalLimit spent
  let blocksUsed = 0;
  const segmentBlocks: { color: string; count: number }[] = segments.map((seg) => {
    const raw = totalLimit > 0 ? (seg.value / totalLimit) * totalBlocks : 0;
    const count = Math.round(raw);
    blocksUsed += count;
    return { color: seg.color, count };
  });

  // Clamp total so we never exceed totalBlocks
  const emptyBlocks = Math.max(0, totalBlocks - blocksUsed);

  return (
    <View style={[styles.meterContainer, style]}>
      <View style={styles.meterHeader}>
        {label && (
          <TuiText size="xs" weight="bold" style={styles.meterLabel}>
            {label.toUpperCase()}
          </TuiText>
        )}
        <TuiText size="xs" weight="bold" style={{ color: headerColor }}>
          {percentage}%
        </TuiText>
      </View>

      {/* Multi-color ASCII bar rendered as inline TuiText segments */}
      <View style={styles.segmentedBarRow}>
        {segmentBlocks.map((seg, i) =>
          seg.count > 0 ? (
            <TuiText key={i} style={[styles.asciiProgressText, { color: seg.color }]}>
              {'█'.repeat(seg.count)}
            </TuiText>
          ) : null
        )}
        {emptyBlocks > 0 && (
          <TuiText style={[styles.asciiProgressText, { color: colors.mutedForeground }]}>
            {'░'.repeat(emptyBlocks)}
          </TuiText>
        )}
      </View>
    </View>
  );
};


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
                {asciiBar}
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
  asciiProgressText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 1.5,
    marginVertical: 6,
    textAlign: 'center',
  },
  segmentedBarRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
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
