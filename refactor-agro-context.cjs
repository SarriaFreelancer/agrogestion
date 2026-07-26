const fs = require('fs');
const path = require('path');

const contextPath = path.join(__dirname, 'src', 'providers', 'AgroContext.jsx');
const content = fs.readFileSync(contextPath, 'utf8');

function removeFunction(code, funcName) {
  const regex = new RegExp(`const ${funcName}\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{`);
  const match = code.match(regex);
  if (!match) return code;

  const startIndex = match.index;
  let braceCount = 0;
  let inString = false;
  let stringChar = '';
  let i = startIndex + match[0].length - 1; // start at the '{'

  for (; i < code.length; i++) {
    const char = code[i];
    const prevChar = code[i - 1];

    if (!inString && (char === '"' || char === "'" || char === '\`')) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && prevChar !== '\\\\') {
      inString = false;
    } else if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          // Found the end of the function
          const endIndex = i + 1;
          // Return code without this block
          // also remove trailing semicolon if exists
          let finalEndIndex = endIndex;
          while (finalEndIndex < code.length && (code[finalEndIndex] === ';' || code[finalEndIndex] === '\\n' || code[finalEndIndex] === '\\r')) {
            finalEndIndex++;
          }
          return code.slice(0, startIndex) + code.slice(finalEndIndex);
        }
      }
    }
  }
  return code;
}

let newContent = content;
newContent = removeFunction(newContent, 'switchClient');
newContent = removeFunction(newContent, 'hasPermission');
newContent = removeFunction(newContent, 'loginUser');
newContent = removeFunction(newContent, 'logoutUser');
newContent = removeFunction(newContent, 'syncToDatabase');
newContent = removeFunction(newContent, 'handleThemeChange');

// Strip old states using regex
newContent = newContent
  // Removed states
  .replace(/const \[currentThemeId, setCurrentThemeId\] = useState\('Tema Principal'\);\n/g, '')
  .replace(/const \[isOnline, setIsOnline\] = useState\(navigator\.onLine\);\n/g, '')
  .replace(/const \[syncQueue, setSyncQueue\] = useState\(\[\]\);\n/g, '')
  .replace(/const \[lastSync, setLastSync\] = useState\(null\);\n/g, '')
  .replace(/const \[clients, setClients\] = useState\(DEFAULT_CLIENTS\);\n/g, '')
  .replace(/const \[currentClient, setCurrentClient\] = useState\(\(\) => \{[\s\S]*?return normalizeClient\(DEFAULT_CLIENTS\['std-01'\]\);\n  \}\);\n/g, '')
  .replace(/const \[currentUser, setCurrentUser\] = useState\(\(\) => \{[\s\S]*?return null;\n  \}\);\n/g, '')
  
  // Persistence hooks removal
  .replace(/\/\/ Persistence hooks\n  React\.useEffect\(\(\) => \{[\s\S]*?\}, \[currentUser\]\);\n\n  React\.useEffect\(\(\) => \{[\s\S]*?\}, \[currentClient\]\);\n/g, '')

  // Remove theme stuff at top
  .replace(/const THEME_CONFIG = \{[\s\S]*?\n\};\n\nconst hexToRgb[\s\S]*?\n\};\n/g, '')
  
  // Inject hooks
  .replace(/export function AgroProvider\(\{ children \}\) \{\n/, 
    "export function AgroProvider({ children }) {\n" +
    "  const { currentUser, setCurrentUser, hasPermission, loginUser, logoutUser, logout } = useAuth();\n" +
    "  const { clients, setClients, currentClient, setCurrentClient, switchClient } = useTenant();\n" +
    "  const { isOnline, syncQueue, setSyncQueue, lastSync, setLastSync, syncToDatabase } = useSync();\n" +
    "  const { currentThemeId, applyTheme, modoOscuroGlobal, setModoOscuroGlobal } = useTheme();\n"
  )
  
  // Fix imports
  .replace(/import \{ confirmDialog, swalError, swalSuccess \} from '@\/utils\/swal';\n/, 
    "import { confirmDialog, swalError, swalSuccess } from '@/utils/swal';\n" +
    "import { useAuth } from './AuthProvider';\n" +
    "import { useTenant } from './TenantProvider';\n" +
    "import { useSync } from './SyncProvider';\n" +
    "import { useTheme } from './ThemeProvider';\n"
  )
  
  // Export all values
  .replace(/return \(\n    <AgroContext\.Provider value=\{\{/g, 
    "return (\n    <AgroContext.Provider value={{\n      currentUser, setCurrentUser, hasPermission, loginUser, logoutUser, logout,\n      clients, setClients, currentClient, setCurrentClient, switchClient,\n      isOnline, syncQueue, setSyncQueue, lastSync, setLastSync, syncToDatabase,\n      currentThemeId, applyTheme, modoOscuroGlobal, setModoOscuroGlobal,\n"
  );
  
fs.writeFileSync(contextPath, newContent);
console.log("AgroContext refactored safely!");
