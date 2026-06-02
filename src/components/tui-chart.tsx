import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiText } from './tui-text';
import { getCategoryIcon } from '../utils/category-icon';

// ----------------------------------------------------
// TELEMETRY METER: [██████░░░░] style progress bar
// ----------------------------------------------------
interface TuiProgressMeterProps {
  progress: number; // 0 to 1
  label?: string;
  style?: ViewStyle;
  totalBlocks?: number;
  color?: string;
  mode?: 'deplete' | 'grow';
}

export const TuiProgressMeter: React.FC<TuiProgressMeterProps> = ({
  progress,
  label,
  style,
  totalBlocks = 44,
  color,
  mode = 'deplete',
}) => {
  const { colors, isDark } = useTheme();
  const cappedProgress = Math.max(0, Math.min(1, progress));
  const percentage = Math.round(cappedProgress * 100);

  const activeBlocks = mode === 'grow'
    ? Math.round(cappedProgress * totalBlocks)
    : Math.round((1 - cappedProgress) * totalBlocks);
  const baseColor = color ?? colors.primary;
  const barColor = cappedProgress >= 0.9 ? colors.destructive : baseColor;

  return (
    <View style={[styles.meterContainer, style]}>
      <View style={styles.meterHeader}>
        {label && (
          <TuiText size="xs" weight="bold" style={styles.meterLabel}>
            {label}
          </TuiText>
        )}
        <TuiText size="xs" weight="bold" style={{ color: barColor }}>
          {percentage}%
        </TuiText>
      </View>

      {/* Main segmented progress bar */}
      <View style={styles.barRow}>
        {Array.from({ length: totalBlocks }).map((_, index) => {
          const isActive = index < activeBlocks;
          return (
            <View
              key={index}
              style={[
                styles.barSegment,
                {
                  backgroundColor: isActive ? barColor : (isDark ? '#27272A' : '#E4E4E7'),
                  marginRight: index === totalBlocks - 1 ? 0 : 1.5,
                  ...(isDark ? {} : { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.55)' }),
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

// ----------------------------------------------------
// SEGMENTED METER: Multi-color bar (one color per category)
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
  totalBlocks = 44,
}) => {
  const { colors, isDark } = useTheme();
  const percentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const overallProgress = totalLimit > 0 ? totalSpent / totalLimit : 0;
  const headerColor = overallProgress >= 0.9 ? colors.destructive : colors.mutedForeground;

  // Generate list of colors for each block based on segment weights
  const blockColors: string[] = [];
  segments.forEach((seg) => {
    const raw = totalLimit > 0 ? (seg.value / totalLimit) * totalBlocks : 0;
    const count = Math.round(raw);
    for (let i = 0; i < count; i++) {
      blockColors.push(seg.color);
    }
  });

  // Pad or slice to match exactly totalBlocks
  const inactiveColor = isDark ? '#27272A' : '#E4E4E7';
  while (blockColors.length < totalBlocks) {
    blockColors.push(inactiveColor);
  }
  const finalColors = blockColors.slice(0, totalBlocks);

  return (
    <View style={[styles.meterContainer, style]}>
      <View style={styles.meterHeader}>
        {label && (
          <TuiText size="xs" weight="bold" style={styles.meterLabel}>
            {label}
          </TuiText>
        )}
        <TuiText size="xs" weight="bold" style={{ color: headerColor }}>
          {percentage}%
        </TuiText>
      </View>

      {/* Multi-color segmented progress bar */}
      <View style={styles.barRow}>
        {finalColors.map((color, index) => (
          <View
            key={index}
            style={[
              styles.barSegment,
              {
                backgroundColor: color,
                marginRight: index === totalBlocks - 1 ? 0 : 1.5,
                ...(isDark ? {} : { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.55)' }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};


export interface ChartItem {
  id?: string;
  label: string;
  value: number;
  total: number; // For percentage comparison
  formattedValue: string;
  date?: string;
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
            {/* Left Box (Icon + Category Label & Date) */}
            <View style={styles.chartLeft}>
              {item.id && (
                <View
                  style={[
                    styles.iconBox,
                    {
                      borderColor: isDark ? '#3F3F46' : '#000000',
                      backgroundColor: isDark ? '#27272A' : '#FFFFFF',
                    },
                  ]}
                >
                  {getCategoryIcon(item.id, 14, isDark ? '#FAFAFA' : '#000000')}
                </View>
              )}
              <View style={styles.labelContainer}>
                <TuiText size="sm" weight="bold" style={styles.chartLabel}>
                  {item.label}
                </TuiText>
                {item.date && item.id && (
                  <TuiText size="sm" variant="muted" style={styles.chartDate}>
                    {item.date} | {item.id.toUpperCase()}
                  </TuiText>
                )}
              </View>
            </View>

            {/* Value display */}
            <TuiText size="sm" weight="bold" style={styles.chartValue}>
              {item.formattedValue}
            </TuiText>
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
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 28,
    marginVertical: 8,
  },
  barSegment: {
    flex: 1,
    height: '100%',
    borderRadius: 1,
  },

  // Bar Chart
  chartContainer: {
    width: '100%',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  chartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  chartLabel: {
    letterSpacing: 0.5,
  },
  chartDate: {
    marginTop: 1,
  },
  chartValue: {
    letterSpacing: 0.5,
  },
});

