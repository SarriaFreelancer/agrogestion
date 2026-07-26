const fs = require('fs');

let code = fs.readFileSync('src/modules/configuration/presentation/configuraciones/DatabaseConnectionConfig.jsx', 'utf8');

// Add import apiService at the top
code = code.replace(/import \{ Play, Database, Check, AlertCircle \} from 'lucide-react';/, "import { Play, Database, Check, AlertCircle } from 'lucide-react';\nimport { apiService } from '@/shared/services/api.service';");

// Replace test connection fetch
code = code.replace(/const response = await fetch\(apiUrl\('\/api\/test-connection'\), \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{ engine: engineToTest, connectionData \}\)\s*\}\);\s*const data = await response\.json\(\);/, 'const data = await apiService.testConnection(engineToTest, connectionData);');

// Replace init-db fetch
code = code.replace(/const initRes = await fetch\(apiUrl\('\/api\/init-db'\), \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{ engine: engineToTest, connectionData \}\)\s*\}\);\s*const initData = await initRes\.json\(\);/, 'const initData = await apiService.initDatabase(engineToTest, connectionData);');

fs.writeFileSync('src/modules/configuration/presentation/configuraciones/DatabaseConnectionConfig.jsx', code);
console.log('DatabaseConnectionConfig.jsx fetch replaced');
