const fs = require('fs');
const path = require('path');

const moves = [
  // Layouts
  { from: 'src/components/layout/Sidebar.jsx', to: 'src/layouts/Sidebar.jsx' },
  { from: 'src/components/layout/MainLayout.jsx', to: 'src/layouts/MainLayout.jsx' },
  
  // Providers
  { from: 'src/context/AgroContext.jsx', to: 'src/providers/AgroContext.jsx' },
  
  // Utils
  { from: 'src/lib/api.js', to: 'src/utils/api.js' },
  { from: 'src/lib/swal.js', to: 'src/utils/swal.js' },
  { from: 'src/lib/audit.js', to: 'src/utils/audit.js' },
  { from: 'src/lib/prisma.js', to: 'src/utils/prisma.js' },
  
  // Modules Presentation
  { from: 'src/components/dashboard', to: 'src/modules/core/presentation/dashboard' },
  { from: 'src/components/estructura', to: 'src/modules/farms/presentation/estructura' },
  { from: 'src/components/mapas', to: 'src/modules/farms/presentation/mapas' },
  { from: 'src/components/maestros', to: 'src/modules/core/presentation/maestros' },
  { from: 'src/components/usuarios', to: 'src/modules/users/presentation/usuarios' },
  { from: 'src/components/auth', to: 'src/modules/auth/presentation/auth' },
  { from: 'src/components/planificacion', to: 'src/modules/production/presentation/planificacion' },
  { from: 'src/components/ejecucion', to: 'src/modules/production/presentation/ejecucion' },
  { from: 'src/components/mantenimiento', to: 'src/modules/production/presentation/mantenimiento' },
  { from: 'src/components/monitoreo', to: 'src/modules/production/presentation/monitoreo' },
  { from: 'src/components/reportes', to: 'src/modules/reports/presentation/reportes' },
  { from: 'src/components/configuraciones', to: 'src/modules/configuration/presentation/configuraciones' },
  { from: 'src/components/sincronizacion', to: 'src/modules/core/presentation/sincronizacion' },
  { from: 'src/components/actividades', to: 'src/modules/production/presentation/actividades' },
  { from: 'src/components/shared', to: 'src/shared/components' },
  
  // Clean up
  { from: 'src/components/layout', to: 'src/layouts/old' },
  { from: 'src/context', to: 'src/providers/old' },
  { from: 'src/lib', to: 'src/utils/old' }
];

// 1. Move files/folders
moves.forEach(m => {
  if (fs.existsSync(m.from)) {
    const targetDir = path.dirname(m.to);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    try {
      fs.renameSync(m.from, m.to);
      console.log(`Moved ${m.from} to ${m.to}`);
    } catch (e) {
      console.error(`Error moving ${m.from} to ${m.to}`, e);
    }
  }
});

// 2. Update all @/ imports
const importReplacements = moves.map(m => ({
  from: m.from.replace('src/', '@/').replace('.jsx', '').replace('.js', ''),
  to: m.to.replace('src/', '@/').replace('.jsx', '').replace('.js', '')
}));

function updateImportsInFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  importReplacements.forEach(rep => {
    // Exact match
    const regex = new RegExp(`['"]${rep.from}['"]`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `'${rep.to}'`);
      changed = true;
    }
    
    // Prefix match
    const prefixRegex = new RegExp(`['"]${rep.from}/([^'"]+)['"]`, 'g');
    if (prefixRegex.test(content)) {
      content = content.replace(prefixRegex, (match, p1) => `'${rep.to}/${p1}'`);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${file}`);
  }
}

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('dist')) {
        processDir(fullPath);
      }
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      updateImportsInFile(fullPath);
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Done moving files and updating imports.');
