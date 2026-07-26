const fs = require('fs');

let code = fs.readFileSync('src/providers/SyncProvider.jsx', 'utf8');

// Add import apiService at the top
code = code.replace(/import React, \{ createContext, useContext, useState \} from 'react';/, "import React, { createContext, useContext, useState } from 'react';\nimport { apiService } from '@/shared/services/api.service';");

// Replace fetch in syncToDatabase
code = code.replace(/const response = await fetch\(apiUrl\('\/api\/sync-data'\), \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/json' \},\s*body: JSON\.stringify\(\{ engine, connectionData, payload \}\)\s*\}\);\s*const result = await response\.json\(\);/, 'const result = await apiService.syncData(engine, connectionData, payload);');

fs.writeFileSync('src/providers/SyncProvider.jsx', code);
console.log('SyncProvider.jsx fetch replaced');
