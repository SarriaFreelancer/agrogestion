const fs = require('fs');
const files = [
  'src/backend/modules/auth/auth.controller.js',
  'src/backend/modules/sync/sync.controller.js',
  'src/backend/modules/tenant/tenant.controller.js',
  'src/backend/modules/clients/clients.controller.js',
  'src/backend/modules/admin/admin.controller.js'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(
    /import { resolveActualEngine[^;]+;/m,
    "import { resolveActualEngine, getMySqlConnection, getSqlServerConfig, getPostgresPool, getOracleConnectString } from '../../config/database.config.js';"
  );
  content = content.replace(
    /import { baseSchemas[^;]+;/m,
    "import { baseSchemas, GLOBAL_CONFIG_COLUMNS, GLOBAL_CONFIG_VALUES, GLOBAL_CONFIG_SEED, DEFAULT_ACCESS_CATEGORIES, DEFAULT_USERS, fieldTranslations, getEngineColumns, upsertSeedRows, getHost, getGlobalDb, getTableName, getPort, mapValue } from '../../core/constants/schemas.js';"
  );
  fs.writeFileSync(f, content);
});
