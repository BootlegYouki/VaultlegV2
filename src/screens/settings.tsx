import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Clipboard, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ACCENT_COLORS } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { BrandLogo } from '../components/brand-logo';
import { TuiText } from '../components/tui-text';
import { TuiButton } from '../components/tui-button';
import { logger } from '../utils/logger';
import { Transaction, Debt } from '../types';

interface SettingsProps {
  transactions: Transaction[];
  debts: Debt[];
  categoryLimits: Record<string, number>;
  onRestoreData: (restored: { transactions: Transaction[]; debts: Debt[]; categoryLimits: Record<string, number> }) => Promise<void>;
  onWipeAllData: () => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({
  transactions,
  debts,
  categoryLimits,
  onRestoreData,
  onWipeAllData,
}) => {
  const { colors, isDark, setThemeMode, accentTheme, setAccentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showBackupSuccess, setShowBackupSuccess] = useState(false);
  const [showRestoreSuccess, setShowRestoreSuccess] = useState(false);

  // Wipes all application data
  const handleWipe = () => {
    Alert.alert(
      'WIPE DATABASE',
      'This will permanently delete all transactions, budgets, and debts from storage. Are you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe Clean',
          style: 'destructive',
          onPress: async () => {
            await onWipeAllData();
            logger.log('SYSTEM', 'DATABASE_WIPED_CLEAN');
            Alert.alert('Database Cleaned', 'All local data was successfully wiped clean.');
          },
        },
      ]
    );
  };

  // Backs up the raw state string into device clipboard
  const handleBackup = () => {
    try {
      const backupData = JSON.stringify({
        transactions,
        debts,
        categoryLimits,
        timestamp: Date.now(),
      });
      Clipboard.setString(backupData);
      setShowBackupSuccess(true);
      logger.log('SYSTEM', 'BACKUP_COPIED_TO_CLIPBOARD');
      setTimeout(() => setShowBackupSuccess(false), 2500);
    } catch (e: any) {
      Alert.alert('Backup Failed', `Error stringifying backup payload: ${e.message}`);
    }
  };

  // Restores data from the device clipboard string
  const handleRestore = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (!clipboardContent) {
        Alert.alert('Empty Clipboard', 'Copy a valid Vaultleg backup string to your clipboard first!');
        return;
      }

      const parsed = JSON.parse(clipboardContent);
      if (
        !parsed ||
        (!Array.isArray(parsed.transactions) && !Array.isArray(parsed.debts) && !parsed.categoryLimits)
      ) {
        Alert.alert('Invalid Backup Format', 'Clipboard content does not match a valid backup pattern.');
        return;
      }

      Alert.alert(
        'RESTORE BACKUP',
        'Are you sure you want to overwrite your active database with the backup in your clipboard?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            onPress: async () => {
              await onRestoreData({
                transactions: parsed.transactions || [],
                debts: parsed.debts || [],
                categoryLimits: parsed.categoryLimits || {},
              });
              setShowRestoreSuccess(true);
              logger.log('SYSTEM', 'RESTORED_BACKUP_SUCCESS');
              setTimeout(() => setShowRestoreSuccess(false), 2500);
              Alert.alert('Restore Complete', 'Successfully restored all records from your clipboard!');
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Restore Failed', 'Failed to parse clipboard data. Make sure you copied a valid backup string!');
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + insets.bottom }]}
      >
        {/* 00: BRAND LOGO CARD (BLANK CONTAINER) */}
        <TuiContainer label="Made by BootlegYouki">
          <View style={styles.logoContainer}>
            <BrandLogo color={colors.primary} height={80} />
          </View>
        </TuiContainer>

        {/* 01: SYSTEM PREFERENCES CARD */}
        <TuiContainer label="System Preferences" badge="Theme">
          <TuiText size="sm" variant="muted" style={styles.preferenceLabel}>
            CHOOSE ACTIVE INTERFACE ASPECT:
          </TuiText>
          <View style={styles.segmentsRow}>
            <View style={styles.segmentCol}>
              <TuiButton
                onPress={() => setThemeMode('dark')}
                variant={isDark ? 'accent' : 'outline'}
                style={styles.preferenceBtn}
              >
                Dark Mode
              </TuiButton>
            </View>
            <View style={styles.segmentCol}>
              <TuiButton
                onPress={() => setThemeMode('light')}
                variant={!isDark ? 'accent' : 'outline'}
                style={styles.preferenceBtn}
              >
                Light Mode
              </TuiButton>
            </View>
          </View>
        </TuiContainer>

        {/* 01.5: ACCENT COLOR CUSTOMIZER */}
        <TuiContainer label="Accent Customizer" badge={accentTheme.toUpperCase()}>
          <TuiText size="sm" variant="muted" style={styles.preferenceLabel}>
            CHOOSE ACTIVE BRAND COLOR HIGHLIGHT:
          </TuiText>
          <View style={styles.colorSelectorRow}>
            {(['classic', 'gray', 'amber', 'green', 'rose', 'cobalt'] as const).map((theme) => {
              const isActive = accentTheme === theme;
              
              // Get background color of the swatch dynamically from our theme provider
              const swatchBg = ACCENT_COLORS[theme][isDark ? 'dark' : 'light'];
              
              return (
                <Pressable
                  key={theme}
                  onPress={() => setAccentTheme(theme)}
                  style={styles.swatchWrapper}
                >
                  <TuiText
                    weight="bold"
                    style={[
                      styles.swatchBracket,
                      {
                        color: isActive ? colors.primary : (isDark ? '#3F3F46' : '#D4D4D8'),
                      }
                    ]}
                  >
                    [
                  </TuiText>
                  
                  <View
                    style={[
                      styles.colorSwatch,
                      {
                        backgroundColor: swatchBg,
                        borderColor: isActive ? colors.primary : (isDark ? '#3F3F46' : '#D4D4D8'),
                      }
                    ]}
                  >
                    {isActive && (
                      <TuiText
                        weight="bold"
                        style={{
                          color: theme === 'classic' ? (isDark ? '#000000' : '#FFFFFF') : '#FFFFFF',
                          fontSize: 13,
                        }}
                      >
                        X
                      </TuiText>
                    )}
                  </View>

                  <TuiText
                    weight="bold"
                    style={[
                      styles.swatchBracket,
                      {
                        color: isActive ? colors.primary : (isDark ? '#3F3F46' : '#D4D4D8'),
                      }
                    ]}
                  >
                    ]
                  </TuiText>
                </Pressable>
              );
            })}
          </View>
        </TuiContainer>

        {/* 02: DATABASE UTILITIES CARD */}
        <TuiContainer label="Database Operations" badge="Utilities">
          <TuiText size="sm" variant="muted" style={styles.preferenceLabel}>
            PERSISTENT CLOUDLESS ACTIONS:
          </TuiText>

          <View style={styles.actionGridRow}>
            <View style={styles.actionCol}>
              <TuiButton onPress={handleBackup} variant="accent" style={styles.databaseBtn}>
                {showBackupSuccess ? 'COPIED OK!' : 'BACKUP DATA'}
              </TuiButton>
            </View>
            <View style={styles.actionCol}>
              <TuiButton onPress={handleRestore} variant="outline" style={styles.databaseBtn}>
                {showRestoreSuccess ? 'RESTORED!' : 'RESTORE DATA'}
              </TuiButton>
            </View>
          </View>

          <TuiButton onPress={handleWipe} variant="destructive" style={styles.wipeBtn}>
            WIPE ALL LOCAL DATA
          </TuiButton>
        </TuiContainer>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 60,
  },
  preferenceLabel: {
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  segmentsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  segmentCol: {
    flex: 1,
    paddingHorizontal: 4,
  },
  preferenceBtn: {
    marginVertical: 4,
    height: 44,
    justifyContent: 'center',
    paddingVertical: 0,
  },
  actionGridRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 4,
  },
  actionCol: {
    flex: 1,
    paddingHorizontal: 4,
  },
  databaseBtn: {
    marginVertical: 4,
    height: 44,
    justifyContent: 'center',
    paddingVertical: 0,
  },
  wipeBtn: {
    marginVertical: 8,
    height: 44,
    justifyContent: 'center',
    paddingVertical: 0,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    width: '100%',
  },
  logoImage: {
    width: '100%',
    height: 100,
  },
  colorSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  swatchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchBracket: {
    fontSize: 20,
    marginHorizontal: 1,
  },
  colorSwatch: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
