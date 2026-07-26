const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Update SimpleCrudTab import
      if (content.includes('SimpleCrudTab')) {
        content = content.replace(
          /import\s+SimpleCrudTab\s+from\s+['"][^'"]+SimpleCrudTab(\.jsx?)?['"];/g,
          (match) => {
            const targetPath = path.resolve(__dirname, 'src/shared/components/ui/SimpleCrudTab');
            let relative = path.relative(path.dirname(fullPath), targetPath).replace(/\\/g, '/');
            if (!relative.startsWith('.')) relative = './' + relative;
            changed = true;
            return "import SimpleCrudTab from '" + relative + "';";
          }
        );
      }
      
      // Update MainLayout import
      if (content.includes('MainLayout')) {
        content = content.replace(
          /import\s+MainLayout\s+from\s+['"][^'"]+MainLayout(\.jsx?)?['"];/g,
          (match) => {
            const targetPath = path.resolve(__dirname, 'src/shared/components/layout/MainLayout');
            let relative = path.relative(path.dirname(fullPath), targetPath).replace(/\\/g, '/');
            if (!relative.startsWith('.')) relative = './' + relative;
            changed = true;
            return "import MainLayout from '" + relative + "';";
          }
        );
      }
      
      // Update Sidebar import
      if (content.includes('Sidebar')) {
        content = content.replace(
          /import\s+Sidebar\s+from\s+['"][^'"]+Sidebar(\.jsx?)?['"];/g,
          (match) => {
            const targetPath = path.resolve(__dirname, 'src/shared/components/layout/Sidebar');
            let relative = path.relative(path.dirname(fullPath), targetPath).replace(/\\/g, '/');
            if (!relative.startsWith('.')) relative = './' + relative;
            changed = true;
            return "import Sidebar from '" + relative + "';";
          }
        );
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated imports in', fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src'));
