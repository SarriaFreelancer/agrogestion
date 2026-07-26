const fs = require('fs');
let env = fs.readFileSync('.env', 'utf8');
env = env.replace(/DATABASE_URL=".+"/, 'DATABASE_URL="mysql://root:root@localhost:3306/agrogestion_core"');
fs.writeFileSync('.env', env);
