import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const APP_TSX_PATH = path.join(ROOT_DIR, 'src', 'App.tsx');
const TEMPLATE_DIR_PATH = path.join(ROOT_DIR, 'src', 'components', 'tui-template');

console.log('\x1b[35m%s\x1b[0m', '=== TEMPLATE-TUI INITIALIZE/RESTORE SYSTEM ===');

try {
  // Check if we are in a git repository
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore', cwd: ROOT_DIR });
  
  console.log('Restoring showcase files from Git...');
  // Restore tui-template folder, App.tsx, and index.html
  execSync('git checkout HEAD -- src/components/tui-template src/App.tsx index.html', { stdio: 'inherit', cwd: ROOT_DIR });
  
  console.log('\x1b[32m%s\x1b[0m', '✔ Successfully restored tui-template folder, App.tsx, and index.html.');
  
  // Re-run graphify to ensure the restored code is indexed
  try {
    console.log('Rebuilding Graphify code graph...');
    execSync('graphify update .', { stdio: 'inherit', cwd: ROOT_DIR });
  } catch (graphifyErr) {
    console.log('ℹ Could not automatically run graphify update, you can run it manually.');
  }

} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', `✘ Failed to restore template. Make sure you are in a Git repository. Error: ${error.message}`);
}

console.log('\x1b[36m%s\x1b[0m', '\nInitialization complete! Run "pnpm run dev" to see the showcase.');
