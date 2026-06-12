import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme-provider';
import { TuiContainer } from '../components/tui-container';
import { BrandLogo } from '../components/brand-logo';
import { TuiText } from '../components/tui-text';
import { TuiButton } from '../components/tui-button';
import { logger } from '../utils/logger';
import { Transaction, Debt } from '../types';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { TuiInput } from '../components/tui-input';

interface SettingsProps {
  transactions: Transaction[];
  debts: Debt[];
  categoryLimits: Record<string, number>;
  onRestoreData: (restored: { transactions: Transaction[]; debts: Debt[]; categoryLimits: Record<string, number> }) => Promise<void>;
  onWipeAllData: () => Promise<void>;
  gistPat: string;
  gistId: string;
  syncingStatus: 'idle' | 'syncing' | 'success' | 'failed';
  onUpdateGistSettings: (settings: { pat?: string; id?: string }) => Promise<void>;
  onManualSync: () => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({
  transactions,
  debts,
  categoryLimits,
  onRestoreData,
  onWipeAllData,
  gistPat,
  gistId,
  syncingStatus,
  onUpdateGistSettings,
  onManualSync,
}) => {
  const { colors, isDark, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [showBackupSuccess, setShowBackupSuccess] = useState(false);
  const [showRestoreSuccess, setShowRestoreSuccess] = useState(false);

  // Local state for Gist credentials
  const [patVal, setPatVal] = useState(gistPat);
  const [idVal, setIdVal] = useState(gistId);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  React.useEffect(() => {
    setPatVal(gistPat);
  }, [gistPat]);

  React.useEffect(() => {
    setIdVal(gistId);
  }, [gistId]);

  // Wipes all application data
  const handleWipe = () => {
    Alert.alert(
      'Wipe Database',
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

  // Backs up the raw state string into a .vaultleg file and shares it
  const handleBackup = async () => {
    try {
      const backupData = JSON.stringify({
        transactions,
        debts,
        categoryLimits,
        timestamp: Date.now(),
      });

      const filename = `vaultleg_backup_${new Date().toISOString().split('T')[0]}.vaultleg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, backupData);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Vaultleg Backup',
          UTI: 'public.json',
        });
        setShowBackupSuccess(true);
        logger.log('SYSTEM', 'BACKUP_FILE_SHARED');
        setTimeout(() => setShowBackupSuccess(false), 2500);
      } else {
        Alert.alert('Sharing Unavailable', 'Sharing is not supported on this device.');
      }
    } catch (e: any) {
      Alert.alert('Backup Failed', `Error creating backup file: ${e.message}`);
    }
  };

  // Restores data from a selected .vaultleg file
  const handleRestore = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      const isCanceled = result.canceled === true || (result as any).type === 'cancel';
      const assets = result.assets || [];
      const uri = assets[0]?.uri || (result as any).uri;
      const name = assets[0]?.name || (result as any).name;

      if (isCanceled || !uri) {
        return;
      }

      if (!name || !name.toLowerCase().endsWith('.vaultleg')) {
        Alert.alert('Invalid File', 'Please select a valid backup file ending with .vaultleg');
        return;
      }

      const fileContent = await FileSystem.readAsStringAsync(uri);
      if (!fileContent) {
        Alert.alert('Empty File', 'The selected backup file is empty.');
        return;
      }

      const parsed = JSON.parse(fileContent);
      if (
        !parsed ||
        (!Array.isArray(parsed.transactions) && !Array.isArray(parsed.debts) && !parsed.categoryLimits)
      ) {
        Alert.alert('Invalid Backup Format', 'The file content does not match a valid backup pattern.');
        return;
      }

      Alert.alert(
        'Restore Backup',
        `Are you sure you want to overwrite your active database with the backup from "${name}"?`,
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
              Alert.alert('Restore Complete', 'Successfully restored all records from the backup file!');
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Restore Failed', `Failed to parse or restore file: ${e.message}`);
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 65 + insets.bottom }]}
      >
        {/* 00: BRAND LOGO CARD (BLANK CONTAINER) */}
        <TuiContainer label="Made by BootlegYouki">
          <View style={styles.logoContainer}>
            <BrandLogo color={colors.primary} height={80} />
          </View>
        </TuiContainer>

        {/* 01: SYSTEM PREFERENCES CARD */}
        <TuiContainer label="System Preferences">
          <TuiText size="sm" variant="muted" style={styles.preferenceLabel}>
            Select app color theme:
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


        {/* 01.7: GIST CLOUD AUTO-BACKUP CARD */}
        <TuiContainer label="Cloud Backup">
          <TuiText size="sm" variant="muted" style={styles.preferenceLabel}>
            Silently sync your data to the cloud:
          </TuiText>

          <TuiInput
            label="GitHub Token"
            placeholder="Paste your GitHub token"
            value={patVal}
            onChangeText={(text) => {
              setPatVal(text);
              onUpdateGistSettings({ pat: text, id: idVal });
            }}
            secureTextEntry={true}
            showSecureToggle={true}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            onPress={() => Linking.openURL('https://github.com/settings/tokens/new?scopes=gist&description=Vaultleg%20Auto-Backup')}
            style={{ alignSelf: 'flex-end', marginTop: -6, marginBottom: 12, paddingHorizontal: 4 }}
          >
            <TuiText size="xs" style={{ color: colors.primary, textDecorationLine: 'underline' }}>
              [Generate pre-filled GitHub Token]
            </TuiText>
          </Pressable>

          <TuiButton
            disabled={syncingStatus === 'syncing'}
            onPress={async () => {
              await onUpdateGistSettings({ pat: patVal, id: idVal });
              await onManualSync();
            }}
            variant="accent"
            style={{ width: '100%', marginTop: 8 }}
          >
            {syncingStatus === 'syncing' ? 'Syncing...' : syncingStatus === 'success' ? 'Sync OK!' : 'Sync Now'}
          </TuiButton>
        </TuiContainer>

        {/* 02: DATABASE UTILITIES CARD */}
        <TuiContainer label="Database Operations">
          <TuiText size="sm" variant="muted" style={styles.preferenceLabel}>
            Local database actions (saved directly on your phone):
          </TuiText>

          <View style={styles.actionGridRow}>
            <View style={styles.actionCol}>
              <TuiButton onPress={handleBackup} variant="accent" style={styles.databaseBtn}>
                {showBackupSuccess ? 'Saved!' : 'Export Backup'}
              </TuiButton>
            </View>
            <View style={styles.actionCol}>
              <TuiButton onPress={handleRestore} variant="outline" style={styles.databaseBtn}>
                {showRestoreSuccess ? 'Restored!' : 'Import Backup'}
              </TuiButton>
            </View>
          </View>

          <TuiButton onPress={handleWipe} variant="destructive" style={styles.wipeBtn}>
            Reset All Data
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
