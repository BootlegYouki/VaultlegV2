import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const APP_TSX_PATH = path.join(ROOT_DIR, 'src', 'App.tsx');
const TEMPLATE_DIR_PATH = path.join(ROOT_DIR, 'src', 'components', 'tui-template');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');

console.log('\x1b[35m%s\x1b[0m', '=== TEMPLATE-TUI CLEANUP SYSTEM ===');

// 1. Remove tui-template directory
if (fs.existsSync(TEMPLATE_DIR_PATH)) {
  console.log(`Removing directory: ${TEMPLATE_DIR_PATH}...`);
  try {
    fs.rmSync(TEMPLATE_DIR_PATH, { recursive: true, force: true });
    console.log('\x1b[32m%s\x1b[0m', '✔ Successfully deleted tui-template folder.');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `✘ Failed to delete tui-template folder: ${error.message}`);
  }
} else {
  console.log('ℹ tui-template folder already removed or does not exist.');
}

// 2. Clean src/App.tsx
const cleanAppContent = `export function App() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-background text-foreground font-mono">
      <div className="border-4 border-foreground p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-card max-w-md text-center">
        <h1 className="text-3xl font-extrabold mb-4 uppercase tracking-wider">template-tui</h1>
        <p className="mb-6">The template is cleared and ready for your custom code.</p>
        <div className="text-sm border-t-2 border-foreground pt-4 text-muted-foreground">
          Edit <code className="bg-muted px-1.5 py-0.5 text-foreground border border-foreground">src/App.tsx</code> to get started.
        </div>
      </div>
    </div>
  )
}

export default App;
`;

try {
  fs.writeFileSync(APP_TSX_PATH, cleanAppContent, 'utf8');
  console.log('\x1b[32m%s\x1b[0m', '✔ Successfully cleaned src/App.tsx and set up minimal starter page.');
} catch (error) {
  console.error('\x1b[31m%s\x1b[0m', `✘ Failed to clean src/App.tsx: ${error.message}`);
}

// 3. Update title in index.html
if (fs.existsSync(INDEX_HTML_PATH)) {
  try {
    let indexContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
    indexContent = indexContent.replace(/<title>TEMPLATE-TUI<\/title>/i, '<title>TUI App</title>');
    fs.writeFileSync(INDEX_HTML_PATH, indexContent, 'utf8');
    console.log('\x1b[32m%s\x1b[0m', '✔ Successfully updated title in index.html to "TUI App".');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `✘ Failed to update index.html title: ${error.message}`);
  }
}

console.log('\x1b[36m%s\x1b[0m', '\nCleanup complete! Your custom retro-brutalist App is ready to be built.');
