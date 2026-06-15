import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/theme-provider';
import { TuiText } from './tui-text';
import { parseDateString } from '../utils/date';

interface TuiCalendarProps {
  value?: string; // MM-DD-YYYY format
  onChange?: (date: string) => void;
  isRangeMode?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  onRangeChange?: (start: string | null, end: string | null) => void;
}

// Month names list
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Weekdays headers
const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];



const compareDatesStr = (d1Str: string, d2Str: string): number => {
  return parseDateString(d1Str).getTime() - parseDateString(d2Str).getTime();
};

interface CalendarCellProps {
  cell: { type: 'day' | 'prev-month' | 'next-month'; day: number };
  cellIndex: number;
  currentMonth: number;
  currentYear: number;
  selectedDate: { day: number; month: number; year: number };
  isRangeMode: boolean;
  startDate: string | null;
  endDate: string | null;
  today: Date;
  colors: any;
  isDark: boolean;
  gridSeparatorColor: string;
  onSelect: (cell: { type: 'day' | 'prev-month' | 'next-month'; day: number }) => void;
}

const getCellDateString = (
  cellType: 'day' | 'prev-month' | 'next-month',
  day: number,
  currentMonth: number,
  currentYear: number
): string => {
  let cellMonth = currentMonth;
  let cellYear = currentYear;
  if (cellType === 'prev-month') {
    if (currentMonth === 0) {
      cellMonth = 11;
      cellYear = currentYear - 1;
    } else {
      cellMonth = currentMonth - 1;
    }
  } else if (cellType === 'next-month') {
    if (currentMonth === 11) {
      cellMonth = 0;
      cellYear = currentYear + 1;
    } else {
      cellMonth = currentMonth + 1;
    }
  }
  return `${String(cellMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}-${cellYear}`;
};

const getCellRangeInfo = (
  cellDateStr: string,
  isRangeMode: boolean,
  startDate: string | null,
  endDate: string | null,
  cellDay: number,
  currentMonth: number,
  currentYear: number,
  selectedDate: { day: number; month: number; year: number },
  isDimmed: boolean
) => {
  if (!isRangeMode) {
    const isSelected =
      !isDimmed &&
      selectedDate.day === cellDay &&
      selectedDate.month === currentMonth &&
      selectedDate.year === currentYear;
    return { isSelected, isStart: false, isEnd: false, isInRange: false, isBetween: false };
  }

  const isStart = !!startDate && cellDateStr === startDate;
  const isEnd = !!endDate && cellDateStr === endDate;
  let isBetween = false;

  if (startDate && endDate) {
    const cellTime = parseDateString(cellDateStr).getTime();
    const startTime = parseDateString(startDate).getTime();
    const endTime = parseDateString(endDate).getTime();
    isBetween = cellTime > startTime && cellTime < endTime;
  }

  const isInRange = isStart || isEnd || isBetween;
  const isSelected = isStart || isEnd;

  return { isSelected, isStart, isEnd, isInRange, isBetween };
};

const getTextColor = (
  isSelected: boolean,
  isRangeMode: boolean,
  isToday: boolean,
  isDark: boolean,
  colors: any
) => {
  if (isSelected) {
    return isRangeMode ? (isDark ? '#000000' : '#FFFFFF') : colors.primaryForeground;
  }
  if (isToday) return colors.primary;
  return colors.foreground;
};

const renderCellBackground = (
  isRangeMode: boolean,
  isSelected: boolean,
  isInRange: boolean,
  isStart: boolean,
  isEnd: boolean,
  isBetween: boolean,
  startDate: string | null,
  endDate: string | null,
  isDark: boolean,
  colors: any
) => {
  if (!isRangeMode) {
    return isSelected ? (
      <View style={[styles.selectedBgSingle, { backgroundColor: colors.primary }]} />
    ) : null;
  }

  if (!isInRange) return null;

  if (isStart || isEnd) {
    const hasRange = !!(startDate && endDate);
    return (
      <View style={styles.rangeEdgeWrapper}>
        {hasRange && (
          <View
            style={[
              styles.rangeCapsuleBg,
              {
                backgroundColor: isDark ? '#27272A' : '#E4E4E7',
                left: isStart ? '50%' : 0,
                right: isEnd ? '50%' : 0,
              },
            ]}
          />
        )}
        <View
          style={[
            styles.selectedBgSingle,
            {
              backgroundColor: isDark ? '#FFFFFF' : '#000000',
            },
          ]}
        />
      </View>
    );
  }

  if (isBetween) {
    return (
      <View
        style={[
          styles.rangeCapsuleBg,
          {
            backgroundColor: isDark ? '#27272A' : '#E4E4E7',
            left: 0,
            right: 0,
          },
        ]}
      />
    );
  }

  return null;
};

const CalendarCell: React.FC<CalendarCellProps> = ({
  cell,
  cellIndex,
  currentMonth,
  currentYear,
  selectedDate,
  isRangeMode,
  startDate,
  endDate,
  today,
  colors,
  isDark,
  gridSeparatorColor,
  onSelect,
}) => {
  const isDimmed = cell.type === 'prev-month' || cell.type === 'next-month';
  const cellDateStr = getCellDateString(cell.type, cell.day, currentMonth, currentYear);

  const { isSelected, isStart, isEnd, isInRange, isBetween } = getCellRangeInfo(
    cellDateStr,
    isRangeMode,
    startDate,
    endDate,
    cell.day,
    currentMonth,
    currentYear,
    selectedDate,
    isDimmed
  );

  const isToday =
    !isDimmed &&
    today.getDate() === cell.day &&
    today.getMonth() === currentMonth &&
    today.getFullYear() === currentYear;

  const textColor = getTextColor(isSelected, isRangeMode, isToday, isDark, colors);

  return (
    <Pressable
      onPress={() => onSelect(cell)}
      style={({ pressed }) => [
        styles.cellWrapper,
        {
          borderRightWidth: cellIndex === 6 ? 0 : 1,
          borderColor: gridSeparatorColor,
          backgroundColor: 'transparent',
        }
      ]}
    >
      {renderCellBackground(
        isRangeMode,
        isSelected,
        isInRange,
        isStart,
        isEnd,
        isBetween,
        startDate,
        endDate,
        isDark,
        colors
      )}
      <TuiText
        size="xs"
        weight={isSelected || isToday ? 'bold' : 'regular'}
        style={{
          color: textColor,
          opacity: isDimmed ? (isDark ? 0.25 : 0.35) : 1,
          textAlign: 'center',
        }}
      >
        {isToday && !isSelected
          ? `[${cell.day}]`
          : String(cell.day)}
      </TuiText>
    </Pressable>
  );
};

export const TuiCalendar: React.FC<TuiCalendarProps> = ({
  value = '',
  onChange,
  isRangeMode = false,
  startDate = null,
  endDate = null,
  onRangeChange,
}) => {
  const { colors, isDark } = useTheme();

  // Parse MM-DD-YYYY into year, month, day state
  const parseDate = (dateStr: string) => {
    const dt = parseDateString(dateStr);
    return { day: dt.getDate(), month: dt.getMonth(), year: dt.getFullYear() };
  };

  const initialDate = parseDate(value || startDate || '');
  
  // Navigation states
  const [currentMonth, setCurrentMonth] = useState(initialDate.month);
  const [currentYear, setCurrentYear] = useState(initialDate.year);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // Sync state if value prop changes
  useEffect(() => {
    const parsed = parseDate(value || startDate || '');
    setSelectedDate(parsed);
    setCurrentMonth(parsed.month);
    setCurrentYear(parsed.year);
  }, [value, startDate]);

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectCell = (cell: { type: 'day' | 'prev-month' | 'next-month'; day: number }) => {
    let targetMonth = currentMonth;
    let targetYear = currentYear;

    if (cell.type === 'prev-month') {
      if (currentMonth === 0) {
        targetMonth = 11;
        targetYear = currentYear - 1;
      } else {
        targetMonth = currentMonth - 1;
      }
      setCurrentMonth(targetMonth);
      setCurrentYear(targetYear);
    } else if (cell.type === 'next-month') {
      if (currentMonth === 11) {
        targetMonth = 0;
        targetYear = currentYear + 1;
      } else {
        targetMonth = currentMonth + 1;
      }
      setCurrentMonth(targetMonth);
      setCurrentYear(targetYear);
    }

    const mStr = String(targetMonth + 1).padStart(2, '0');
    const dStr = String(cell.day).padStart(2, '0');
    const clickedDateStr = `${mStr}-${dStr}-${targetYear}`;

    if (isRangeMode && onRangeChange) {
      if (!startDate || (startDate && endDate)) {
        onRangeChange(clickedDateStr, null);
      } else {
        if (compareDatesStr(clickedDateStr, startDate) >= 0) {
          onRangeChange(startDate, clickedDateStr);
        } else {
          onRangeChange(clickedDateStr, null);
        }
      }
    } else {
      onChange?.(clickedDateStr);
    }
  };

  // Generate grid cells
  const cells: { type: 'day' | 'prev-month' | 'next-month'; day: number }[] = [];

  // Padding cells for starting offset of the month (previous month dates)
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = 0; i < firstDayIndex; i++) {
    const dayNum = prevMonthDays - firstDayIndex + 1 + i;
    cells.push({ type: 'prev-month', day: dayNum });
  }

  // Active days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ type: 'day', day: i });
  }

  // Fill up grid with next month dates (until we hit 42 cells)
  let nextMonthDay = 1;
  while (cells.length < 42) {
    cells.push({ type: 'next-month', day: nextMonthDay });
    nextMonthDay++;
  }

  const borderAccent = isDark ? colors.primary + '40' : '#000000';
  const gridSeparatorColor = isDark ? '#27272A' : '#E4E4E7';
  const today = new Date();

  return (
    <View style={[styles.calendarBox, { borderColor: borderAccent }]}>
      
      {/* 01: MONTH NAVIGATION HEADER */}
      <View style={[styles.navHeader, { borderBottomWidth: 1.5, borderColor: borderAccent }]}>
        <Pressable
          onPress={handlePrevMonth}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          style={({ pressed }) => [
            styles.navBtn,
            {
              borderColor: borderAccent,
              backgroundColor: pressed ? (isDark ? '#27272A' : '#E4E4E7') : 'transparent',
            }
          ]}
        >
          <ChevronLeft size={22} color={colors.primary} />
        </Pressable>

        <TuiText weight="bold" size="sm" style={[styles.monthYearText, { color: colors.primary }]}>
          {MONTHS[currentMonth]} {currentYear}
        </TuiText>

        <Pressable
          onPress={handleNextMonth}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          style={({ pressed }) => [
            styles.navBtn,
            {
              borderColor: borderAccent,
              backgroundColor: pressed ? (isDark ? '#27272A' : '#E4E4E7') : 'transparent',
            }
          ]}
        >
          <ChevronRight size={22} color={colors.primary} />
        </Pressable>
      </View>

      {/* 02: WEEKDAY HEADER ROW */}
      <View style={[styles.weekdaysRow, { borderBottomWidth: 1.5, borderColor: borderAccent, backgroundColor: isDark ? '#1F1F23' : '#F4F4F5' }]}>
        {WEEKDAYS.map((day, idx) => (
          <View key={day} style={[styles.cellWrapper, { borderRightWidth: idx === 6 ? 0 : 1, borderColor: gridSeparatorColor }]}>
            <TuiText size="xs" weight="bold" style={{ color: colors.mutedForeground, textAlign: 'center' }}>
              {day}
            </TuiText>
          </View>
        ))}
      </View>

      {/* 03: DAYS GRID */}
      <View style={styles.gridBody}>
        {/* Render rows in groups of 7 */}
        {Array.from({ length: cells.length / 7 }).map((_, rowIndex) => (
          <View
            key={rowIndex}
            style={[
              styles.gridRow,
              {
                borderBottomWidth: rowIndex === (cells.length / 7) - 1 ? 0 : 1,
                borderColor: gridSeparatorColor,
              }
            ]}
          >
            {cells.slice(rowIndex * 7, (rowIndex + 1) * 7).map((cell, cellIndex) => (
              <CalendarCell
                key={cellIndex}
                cell={cell}
                cellIndex={cellIndex}
                currentMonth={currentMonth}
                currentYear={currentYear}
                selectedDate={selectedDate}
                isRangeMode={isRangeMode}
                startDate={startDate}
                endDate={endDate}
                today={today}
                colors={colors}
                isDark={isDark}
                gridSeparatorColor={gridSeparatorColor}
                onSelect={handleSelectCell}
              />
            ))}
          </View>
        ))}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  calendarBox: {
    borderWidth: 1.5,
    width: '100%',
    alignSelf: 'center',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 48,
  },
  navBtn: {
    borderWidth: 1.5,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearText: {
    letterSpacing: 0.5,
  },
  weekdaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
  },
  gridBody: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  cellWrapper: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBgSingle: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  rangeEdgeWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeCapsuleBg: {
    position: 'absolute',
    top: 7,
    bottom: 7,
  },
});
