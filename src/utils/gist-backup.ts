import { logger } from './logger';

export interface GistBackupPayload {
  transactions: any[];
  debts: any[];
  categoryLimits: Record<string, number>;
  timestamp: number;
  device?: string;
}

const GITHUB_API_URL = 'https://api.github.com';
const BACKUP_FILENAME = 'vaultleg_backup.json';

export const gistBackupService = {
  /**
   * Tests the connection and validates the Personal Access Token (PAT)
   */
  testConnection: async (pat: string): Promise<boolean> => {
    if (!pat || pat.trim() === '') return false;
    try {
      const response = await fetch(`${GITHUB_API_URL}/user`, {
        method: 'GET',
        headers: {
          Authorization: `token ${pat.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Vaultleg-App',
        },
      });
      if (response.status === 200) {
        logger.log('NETWORK', 'GIST_AUTH_TEST_SUCCESS');
        return true;
      }
      logger.log('NETWORK_ERROR', `GIST_AUTH_TEST_FAILED_STATUS_${response.status}`);
      return false;
    } catch (e: any) {
      logger.log('NETWORK_ERROR', `GIST_AUTH_TEST_EXCEPTION: ${e.message}`);
      return false;
    }
  },

  /**
   * Finds an existing Vaultleg backup Gist ID on the user's GitHub account
   */
  findExistingGist: async (pat: string): Promise<string | null> => {
    try {
      const response = await fetch(`${GITHUB_API_URL}/gists`, {
        method: 'GET',
        headers: {
          Authorization: `token ${pat.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Vaultleg-App',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub returned status ${response.status}`);
      }

      const gists = await response.json();
      if (Array.isArray(gists)) {
        const found = gists.find(g => 
          g.description === 'Vaultleg Private Auto-Backup Data' || 
          (g.files && g.files[BACKUP_FILENAME])
        );
        if (found && found.id) {
          logger.log('NETWORK', `GIST_FIND_FOUND_ID_${found.id}`);
          return found.id;
        }
      }
      logger.log('NETWORK', 'GIST_FIND_NO_EXISTING_GIST_FOUND');
      return null;
    } catch (e: any) {
      logger.log('NETWORK_ERROR', `GIST_FIND_FAILED: ${e.message}`);
      return null;
    }
  },

  /**
   * Creates a new private Gist with the backup payload
   */
  createGist: async (pat: string, payload: GistBackupPayload): Promise<string> => {
    try {
      const body = {
        description: 'Vaultleg Private Auto-Backup Data',
        public: false,
        files: {
          [BACKUP_FILENAME]: {
            content: JSON.stringify(payload, null, 2),
          },
        },
      };

      const response = await fetch(`${GITHUB_API_URL}/gists`, {
        method: 'POST',
        headers: {
          Authorization: `token ${pat.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Vaultleg-App',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`GitHub returned status ${response.status}`);
      }

      const data = await response.json();
      const gistId = data.id;
      if (!gistId) throw new Error('No Gist ID returned from GitHub');

      logger.log('NETWORK', `GIST_CREATED_SUCCESS_ID_${gistId}`);
      return gistId;
    } catch (e: any) {
      logger.log('NETWORK_ERROR', `GIST_CREATION_FAILED: ${e.message}`);
      throw e;
    }
  },

  /**
   * Overwrites the Gist content with the updated backup payload
   */
  updateGist: async (pat: string, gistId: string, payload: GistBackupPayload): Promise<boolean> => {
    if (!gistId || gistId.trim() === '') {
      throw new Error('Gist ID is missing');
    }
    try {
      const body = {
        description: 'Vaultleg Private Auto-Backup Data',
        files: {
          [BACKUP_FILENAME]: {
            content: JSON.stringify(payload, null, 2),
          },
        },
      };

      const response = await fetch(`${GITHUB_API_URL}/gists/${gistId.trim()}`, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${pat.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Vaultleg-App',
        },
        body: JSON.stringify(body),
      });

      if (response.status === 200 || response.status === 201) {
        logger.log('NETWORK', `GIST_UPDATE_SUCCESS_ID_${gistId}`);
        return true;
      }
      
      throw new Error(`GitHub returned status ${response.status}`);
    } catch (e: any) {
      logger.log('NETWORK_ERROR', `GIST_UPDATE_FAILED_ID_${gistId}: ${e.message}`);
      throw e;
    }
  },

  /**
   * Fetches and parses the backup payload from a Gist ID
   */
  fetchGist: async (pat: string, gistId: string): Promise<GistBackupPayload> => {
    if (!gistId || gistId.trim() === '') {
      throw new Error('Gist ID is missing');
    }
    try {
      const response = await fetch(`${GITHUB_API_URL}/gists/${gistId.trim()}`, {
        method: 'GET',
        headers: {
          Authorization: `token ${pat.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Vaultleg-App',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub returned status ${response.status}`);
      }

      const data = await response.json();
      const fileData = data.files?.[BACKUP_FILENAME];
      if (!fileData || !fileData.content) {
        throw new Error(`Backup file ${BACKUP_FILENAME} not found inside the selected Gist.`);
      }

      const parsed = JSON.parse(fileData.content) as GistBackupPayload;
      if (!parsed.transactions && !parsed.debts && !parsed.categoryLimits) {
        throw new Error('Invalid Gist backup file structure.');
      }

      logger.log('NETWORK', `GIST_FETCH_SUCCESS_ID_${gistId}`);
      return parsed;
    } catch (e: any) {
      logger.log('NETWORK_ERROR', `GIST_FETCH_FAILED_ID_${gistId}: ${e.message}`);
      throw e;
    }
  },
};
