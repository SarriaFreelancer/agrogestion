const fs = require('fs');
let code = fs.readFileSync('src/backend/core/constants/schemas.js', 'utf8');
code = "import sqlite3 from 'sqlite3';\nimport { open } from 'sqlite';\n" + code;
fs.writeFileSync('src/backend/core/constants/schemas.js', code);
