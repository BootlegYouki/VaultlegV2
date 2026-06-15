import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gistBackupService, GistBackupPayload } from '../utils/gist-backup';
import { logger } from '../utils/logger';
import { Transaction, Debt } from '../types';

interface UseGistSyncProps {
  transactions: Transaction[];
  debts: Debt[];
  categoryLimits: Record<string, number>;
  handleRestoreData: (
    restored: { transactions: Transaction[]; debts: Debt[]; categoryLimits: Record<string, number> },
    timestamp?: number
  ) => Promise<void>;
  updateLastLocalUpdate: (timestamp?: number) => Promise<void>;
}

export function useGistSync({
  transactions,
  debts,
  categoryLimits,
  handleRestoreData,
  updateLastLocalUpdate,
}: UseGistSyncProps) {
  const [gistPat, setGistPat] = useState('');
  const [gistId, setGistId] = useState('');
  const [syncingStatus, setSyncingStatus] = useState<'idle' | 'syncing' | 'success' | 'failed'>('idle');

  const backupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerGistBackup = (
    currentTxs = transactions,
    currentDebts = debts,
    currentLimits = categoryLimits
  ) => {
    if (!gistPat || gistPat.trim() === '') {
      return;
    }

    if (backupTimeoutRef.current) {
      clearTimeout(backupTimeoutRef.current);
    }

    backupTimeoutRef.current = setTimeout(async () => {
      logger.log('SYSTEM', 'AUTO_GIST_SYNC_TRIGGERED');
      try {
        const localUpdateStr = await AsyncStorage.getItem('tui_last_local_update');
        const localUpdate = localUpdateStr ? parseInt(localUpdateStr, 10) : Date.now();

        const payload: GistBackupPayload = {
          transactions: currentTxs,
          debts: currentDebts,
          categoryLimits: currentLimits,
          timestamp: localUpdate,
        };

        if (gistId && gistId.trim() !== '') {
          await gistBackupService.updateGist(gistPat, gistId, payload);
          logger.log('SYSTEM', 'AUTO_GIST_SYNC_SUCCESS');
        } else {
          const newId = await gistBackupService.createGist(gistPat, payload);
          setGistId(newId);
          await AsyncStorage.setItem('tui_gist_id', newId);
          logger.log('SYSTEM', `AUTO_GIST_SYNC_SUCCESS_GIST_CREATED_ID_${newId}`);
        }
      } catch (err: any) {
        logger.log('SYSTEM_ERROR', `AUTO_GIST_SYNC_FAILED: ${err.message}`);
      }
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (backupTimeoutRef.current) {
        clearTimeout(backupTimeoutRef.current);
      }
    };
  }, []);

  const checkAndPromptCloudBackup = async (
    pat: string,
    currentId: string,
    currentTxs: Transaction[],
    currentDebts: Debt[],
    isStartup: boolean
  ) => {
    let resolvedId = currentId;
    if (!resolvedId || resolvedId.trim() === '') {
      resolvedId = (await gistBackupService.findExistingGist(pat)) || '';
      if (resolvedId) {
        setGistId(resolvedId);
        await AsyncStorage.setItem('tui_gist_id', resolvedId);
      }
    }

    if (resolvedId && resolvedId.trim() !== '') {
      const remoteBackup = await gistBackupService.fetchGist(pat, resolvedId);
      if (remoteBackup && remoteBackup.timestamp) {
        const localUpdateStr = await AsyncStorage.getItem('tui_last_local_update');
        const localUpdate = localUpdateStr ? parseInt(localUpdateStr, 10) : 0;

        const localIsEmpty = currentTxs.length === 0 && currentDebts.length === 0;
        const remoteHasData =
          (remoteBackup.transactions && remoteBackup.transactions.length > 0) ||
          (remoteBackup.debts && remoteBackup.debts.length > 0);

        const shouldPrompt = isStartup
          ? remoteBackup.timestamp > localUpdate
          : remoteBackup.timestamp > localUpdate || (localIsEmpty && remoteHasData);

        if (shouldPrompt) {
          if (isStartup) {
            logger.log('SYSTEM', 'STARTUP_GIST_CHECK_NEWER_BACKUP_FOUND');
          }
          const remoteDate = new Date(remoteBackup.timestamp).toLocaleString();
          Alert.alert(
            'Cloud Backup Found',
            `A newer cloud backup from ${remoteDate} was found on GitHub.\n\nWould you like to restore it and overwrite your local data?`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: isStartup
                  ? async () => {
                      await AsyncStorage.setItem('tui_last_local_update', remoteBackup.timestamp.toString());
                    }
                  : undefined,
              },
              {
                text: 'Restore',
                style: 'default',
                onPress: async () => {
                  await handleRestoreData(remoteBackup, remoteBackup.timestamp);
                  Alert.alert('Restore Success', 'Cloud backup has been restored successfully.');
                },
              },
            ]
          );
        }
      }
    }
  };

  const handleUpdateGistSettings = async (settings: { pat?: string; id?: string }) => {
    try {
      if (settings.pat !== undefined) {
        setGistPat(settings.pat);
        await AsyncStorage.setItem('tui_gist_pat', settings.pat);
      }
      if (settings.id !== undefined) {
        setGistId(settings.id);
        await AsyncStorage.setItem('tui_gist_id', settings.id);
      }
    } catch (e: any) {
      logger.log('SYSTEM_ERROR', `SAVE_GIST_SETTINGS_FAILED: ${e.message}`);
    }
  };

  const handleManualSync = async () => {
    if (!gistPat || gistPat.trim() === '') {
      Alert.alert('Missing Token', 'Please provide a valid GitHub Personal Access Token (PAT).');
      return;
    }

    setSyncingStatus('syncing');
    logger.log('SYSTEM', 'MANUAL_GIST_SYNC_TRIGGERED');

    const syncTime = Date.now();

    try {
      const payload: GistBackupPayload = {
        transactions,
        debts,
        categoryLimits,
        timestamp: syncTime,
      };

      let activeGistId = gistId;

      const isConnected = await gistBackupService.testConnection(gistPat);
      if (!isConnected) {
        throw new Error('Connection failed. Please verify your Personal Access Token.');
      }

      // Automatically search for existing Gist if ID is empty
      if (!activeGistId || activeGistId.trim() === '') {
        const foundId = await gistBackupService.findExistingGist(gistPat);
        if (foundId) {
          activeGistId = foundId;
          setGistId(foundId);
          await AsyncStorage.setItem('tui_gist_id', foundId);
          logger.log('SYSTEM', `MANUAL_SYNC_FOUND_EXISTING_GIST_ID_${foundId}`);
        }
      }

      if (!activeGistId || activeGistId.trim() === '') {
        const newId = await gistBackupService.createGist(gistPat, payload);
        activeGistId = newId;
        setGistId(newId);
        await AsyncStorage.setItem('tui_gist_id', newId);
        logger.log('SYSTEM', `GIST_AUTO_CREATED_ID_${newId}`);
        setSyncingStatus('success');
        setTimeout(() => setSyncingStatus('idle'), 3000);
        Alert.alert('Sync Successful', 'Your active database was successfully backed up to your private GitHub Gist!');
      } else {
        // Fetch the remote Gist to verify if we should upload or download
        try {
          const remoteBackup = await gistBackupService.fetchGist(gistPat, activeGistId);
          if (remoteBackup && remoteBackup.timestamp) {
            const localUpdateStr = await AsyncStorage.getItem('tui_last_local_update');
            const localUpdate = localUpdateStr ? parseInt(localUpdateStr, 10) : 0;

            const localIsEmpty = transactions.length === 0 && debts.length === 0;
            const remoteHasData =
              (remoteBackup.transactions && remoteBackup.transactions.length > 0) ||
              (remoteBackup.debts && remoteBackup.debts.length > 0);

            if (remoteBackup.timestamp > localUpdate || (localIsEmpty && remoteHasData)) {
              setSyncingStatus('idle');
              const remoteDate = new Date(remoteBackup.timestamp).toLocaleString();
              Alert.alert(
                'Cloud Backup Found',
                `A newer cloud backup from ${remoteDate} was found on GitHub.\n\nWould you like to RESTORE it to this device, or OVERWRITE it with your local data?`,
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Overwrite Cloud',
                    style: 'destructive',
                    onPress: async () => {
                      setSyncingStatus('syncing');
                      try {
                        await gistBackupService.updateGist(gistPat, activeGistId, payload);
                        await updateLastLocalUpdate(syncTime);
                        setSyncingStatus('success');
                        setTimeout(() => setSyncingStatus('idle'), 3000);
                        Alert.alert('Sync Successful', 'Your local database successfully overwrote the cloud Gist.');
                      } catch (err: any) {
                        setSyncingStatus('failed');
                        setTimeout(() => setSyncingStatus('idle'), 3000);
                        Alert.alert('Sync Failed', err.message || 'An error occurred.');
                      }
                    },
                  },
                  {
                    text: 'Restore to Device',
                    style: 'default',
                    onPress: async () => {
                      setSyncingStatus('syncing');
                      try {
                        await handleRestoreData(remoteBackup, remoteBackup.timestamp);
                        setSyncingStatus('success');
                        setTimeout(() => setSyncingStatus('idle'), 3000);
                        Alert.alert('Restore Successful', 'Your device was successfully updated with the cloud backup!');
                      } catch (err: any) {
                        setSyncingStatus('failed');
                        setTimeout(() => setSyncingStatus('idle'), 3000);
                        Alert.alert('Restore Failed', err.message || 'An error occurred.');
                      }
                    },
                  },
                ]
              );
              return;
            }
          }
        } catch (fetchErr) {
          logger.log('SYSTEM', `MANUAL_SYNC_FETCH_SKIPPED: ${fetchErr}`);
        }

        // Default path: local data is newer, so overwrite remote Gist
        await gistBackupService.updateGist(gistPat, activeGistId, payload);
        await updateLastLocalUpdate(syncTime);
        setSyncingStatus('success');
        setTimeout(() => setSyncingStatus('idle'), 3000);
        Alert.alert('Sync Successful', 'Your active database was successfully backed up to your private GitHub Gist!');
      }
    } catch (err: any) {
      setSyncingStatus('failed');
      setTimeout(() => setSyncingStatus('idle'), 3000);
      Alert.alert('Sync Failed', err.message || 'An error occurred during synchronization.');
    }
  };

  return {
    gistPat,
    setGistPat,
    gistId,
    setGistId,
    syncingStatus,
    setSyncingStatus,
    triggerGistBackup,
    checkAndPromptCloudBackup,
    handleUpdateGistSettings,
    handleManualSync,
  };
}
