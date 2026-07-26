const fs = require('fs');

let code = fs.readFileSync('src/providers/AgroContext.jsx', 'utf8');

// Replace hydrateFromDatabase fetch
code = code.replace(/const response = await fetch\(apiUrl\('\/api\/load-data'\), \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{\s*engine: client\.databaseEngine,\s*connectionData,\s*model\s*\}\)\s*\}\);\s*const result = await response\.json\(\);/, 'const result = await apiService.loadData(client.databaseEngine, connectionData, model);');

// Replace loadConfiguracionesFromDatabase fetch
code = code.replace(/const res = await fetch\(apiUrl\('\/api\/load-data'\), \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{\s*engine: currentClient\.databaseEngine,\s*connectionData,\s*model: 'ConfiguracionGlobal'\s*\}\)\s*\}\);\s*const result = await res\.json\(\);/, 'const result = await apiService.loadData(currentClient.databaseEngine, connectionData, \'ConfiguracionGlobal\');');

// Add import apiService at the top
code = code.replace(/import \{ useTheme \} from '\.\/ThemeProvider';/, "import { useTheme } from './ThemeProvider';\nimport { apiService } from '@/shared/services/api.service';");

fs.writeFileSync('src/providers/AgroContext.jsx', code);
console.log('AgroContext.jsx fetch replaced');
