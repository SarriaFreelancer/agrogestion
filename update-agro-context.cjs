const fs = require('fs');
const path = require('path');

const contextPath = path.join(__dirname, 'src', 'providers', 'AgroContext.jsx');
let content = fs.readFileSync(contextPath, 'utf8');

// The goal is to clean up AgroContext.jsx. We will replace the entire AgroContext.jsx with a new one that combines everything.
// But we still need the data state. Let's create DataProvider.jsx containing the data state.

// Actually, rewriting 1700 lines of data state manually with a regex script is hard.
// It's safer to just let AgroContext.jsx be the "DataProvider" for now, but remove the auth, theme, sync, and tenant from it.
// And create a "GlobalProvider" that wraps them all in App.jsx.

// But wait, AgroContext needs to access 'currentClient' (from TenantContext), 'currentUser' (from AuthContext), 'syncToDatabase' (from SyncContext).
// So AgroProvider can use those contexts!

const updatedAgroContext = content
  // Remove theme config
  .replace(/const THEME_CONFIG = \{[\s\S]*?\n\};\n\nconst hexToRgb[\s\S]*?\n\};\n/g, '')
  // Remove sync states
  .replace(/const \[isOnline, setIsOnline\] = useState\(navigator.onLine\);\n/g, '')
  .replace(/const \[syncQueue, setSyncQueue\] = useState\(\[\]\);\n/g, '')
  .replace(/const \[lastSync, setLastSync\] = useState\(null\);\n/g, '')
  // Remove client/tenant states
  .replace(/const \[clients, setClients\] = useState\(DEFAULT_CLIENTS\);\n/g, '')
  .replace(/const \[currentClient, setCurrentClient\] = useState\(\(\) => \{[\s\S]*?return normalizeClient\(DEFAULT_CLIENTS\['std-01'\]\);\n  \}\);\n/g, '')
  // Remove user states
  .replace(/const \[currentUser, setCurrentUser\] = useState\(\(\) => \{[\s\S]*?return null;\n  \}\);\n/g, '')
  // Remove persistence hooks for client and user
  .replace(/\/\/ Persistence hooks\n  React.useEffect\(\(\) => \{[\s\S]*?\}, \[currentUser\]\);\n\n  React.useEffect\(\(\) => \{[\s\S]*?\}, \[currentClient\]\);\n/g, '')
  
  // Add imports
  .replace(/import \{ confirmDialog, swalError, swalSuccess \} from '@\/utils\/swal';\n/, 
    "import { confirmDialog, swalError, swalSuccess } from '@/utils/swal';\n" +
    "import { useAuth } from './AuthProvider';\n" +
    "import { useTenant } from './TenantProvider';\n" +
    "import { useSync } from './SyncProvider';\n" +
    "import { useTheme } from './ThemeProvider';\n"
  )
  // Inside AgroProvider, get the context values
  .replace(/export function AgroProvider\(\{ children \}\) \{\n/, 
    "export function AgroProvider({ children }) {\n" +
    "  const { currentUser, setCurrentUser, hasPermission, logout } = useAuth();\n" +
    "  const { clients, setClients, currentClient, setCurrentClient, switchClient } = useTenant();\n" +
    "  const { isOnline, syncQueue, setSyncQueue, lastSync, setLastSync, syncToDatabase } = useSync();\n" +
    "  const { currentThemeId, applyTheme, modoOscuroGlobal, setModoOscuroGlobal } = useTheme();\n"
  )
  
  // Remove DEFAULT_CLIENTS and normalizeClient from AgroContext
  .replace(/const buildDatabaseConfig = [\s\S]*?\n\};\n\nconst normalizeClient = [\s\S]*?\n\};\n\nconst DEFAULT_CLIENTS = \{[\s\S]*?\n\};\n/g, '')
  
  // Update the value passed to AgroContext.Provider to include everything, so useAgro() still returns EVERYTHING
  // We need to inject the extracted functions and states into the value object.
  // We can just add them manually by modifying the return statement.
  
  // Oh wait, AgroContext.jsx exports things. Let's do a simple replace on the provider return.
  .replace(/return \(\n    <AgroContext.Provider value=\{\{/g, 
    "return (\n    <AgroContext.Provider value={{\n      currentUser, setCurrentUser, hasPermission, logout,\n      clients, setClients, currentClient, setCurrentClient, switchClient,\n      isOnline, syncQueue, setSyncQueue, lastSync, setLastSync, syncToDatabase,\n      currentThemeId, applyTheme, modoOscuroGlobal, setModoOscuroGlobal,\n"
  );
  
fs.writeFileSync(contextPath, updatedAgroContext);
console.log("AgroContext updated.");
